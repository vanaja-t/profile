import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { EventEmitter } from 'node:events'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { contentEditor } from './vite-plugin-content-editor.ts'
import type { Connect, ViteDevServer } from 'vite'

let root: string
let dataDir: string
let middleware: Connect.NextHandleFunction

class FakeRequest extends EventEmitter {
  url: string
  method: string
  private body?: string

  constructor(url: string, method: string, body?: string) {
    super()
    this.url = url
    this.method = method
    this.body = body
  }

  send() {
    if (this.body !== undefined) this.emit('data', this.body)
    this.emit('end')
  }
}

class FakeResponse {
  statusCode = 200
  headers: Record<string, string> = {}
  body = ''

  setHeader(key: string, value: string) {
    this.headers[key] = value
  }

  end(chunk?: string) {
    if (chunk) this.body = chunk
  }

  json(): unknown {
    return JSON.parse(this.body)
  }
}

function setupPlugin() {
  const plugin = contentEditor()
  ;(plugin.configResolved as (config: unknown) => void)({ root })
  const fakeServer = {
    middlewares: {
      use: (fn: Connect.NextHandleFunction) => {
        middleware = fn
      },
    },
  } as unknown as ViteDevServer
  ;(plugin.configureServer as (server: ViteDevServer) => void)(fakeServer)
}

beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), 'content-editor-test-'))
  dataDir = path.join(root, 'src', 'data')
  fs.mkdirSync(dataDir, { recursive: true })
  fs.writeFileSync(path.join(dataDir, 'sample.json'), '{"a":1}\n', 'utf-8')
  setupPlugin()
})

afterEach(() => {
  fs.rmSync(root, { recursive: true, force: true })
})

/** Invokes the middleware and waits for it to settle, whether it's sync or async. */
async function invoke(req: FakeRequest, res: FakeResponse): Promise<void> {
  await middleware(req as never, res as never, (() => {}) as never)
}

describe('contentEditor dev middleware (ST-108)', () => {
  it('lists json files under src/data', async () => {
    const req = new FakeRequest('/__content-editor/files', 'GET')
    const res = new FakeResponse()
    await invoke(req, res)
    expect(res.json()).toEqual({ files: ['sample.json'] })
  })

  it('reads a file by name', async () => {
    const req = new FakeRequest('/__content-editor/file?name=sample.json', 'GET')
    const res = new FakeResponse()
    await invoke(req, res)
    expect(res.json()).toEqual({ content: '{"a":1}\n' })
  })

  it('writes valid content back to disk on POST', async () => {
    const req = new FakeRequest(
      '/__content-editor/file',
      'POST',
      JSON.stringify({ name: 'sample.json', content: '{"a":2}' }),
    )
    const res = new FakeResponse()
    const pending = invoke(req, res)
    req.send()
    await pending

    expect(res.json()).toEqual({ ok: true })
    expect(fs.readFileSync(path.join(dataDir, 'sample.json'), 'utf-8')).toBe('{\n  "a": 2\n}\n')
  })

  it('rejects a file name that tries to escape src/data (path traversal)', async () => {
    const req = new FakeRequest('/__content-editor/file?name=..%2F..%2Fetc%2Fpasswd', 'GET')
    const res = new FakeResponse()
    await invoke(req, res)
    expect(res.statusCode).toBe(400)
  })

  it('passes non-editor requests through to next()', async () => {
    const req = new FakeRequest('/some-other-path', 'GET')
    const res = new FakeResponse()
    let calledNext = false
    const next = () => {
      calledNext = true
    }
    await middleware(req as never, res as never, next as never)
    expect(calledNext).toBe(true)
  })
})
