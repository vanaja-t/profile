import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { EventEmitter } from 'node:events'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { blogEditor } from './vite-plugin-blog-editor.ts'
import type { Connect, ViteDevServer } from 'vite'

let root: string
let blogDir: string
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
  const plugin = blogEditor()
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
  root = fs.mkdtempSync(path.join(os.tmpdir(), 'blog-editor-test-'))
  blogDir = path.join(root, 'content', 'blog')
  fs.mkdirSync(blogDir, { recursive: true })
  fs.writeFileSync(path.join(blogDir, '2026-01-01-a.md'), '---\ntitle: A\n---\nBody', 'utf-8')
  setupPlugin()
})

afterEach(() => {
  fs.rmSync(root, { recursive: true, force: true })
})

async function invoke(req: FakeRequest, res: FakeResponse): Promise<void> {
  await middleware(req as never, res as never, (() => {}) as never)
}

describe('blogEditor dev middleware (ST-116)', () => {
  it('lists markdown files under content/blog, newest first', async () => {
    fs.writeFileSync(path.join(blogDir, '2026-02-01-b.md'), '---\ntitle: B\n---\nBody', 'utf-8')
    const req = new FakeRequest('/__blog-editor/posts', 'GET')
    const res = new FakeResponse()
    await invoke(req, res)
    expect(res.json()).toEqual({ posts: ['2026-02-01-b.md', '2026-01-01-a.md'] })
  })

  it('reads a post by name, already split into frontmatter data + body', async () => {
    const req = new FakeRequest('/__blog-editor/post?name=2026-01-01-a.md', 'GET')
    const res = new FakeResponse()
    await invoke(req, res)
    expect(res.json()).toEqual({ data: { title: 'A' }, content: 'Body' })
  })

  it('creates a new post file on POST from structured data + content', async () => {
    const req = new FakeRequest(
      '/__blog-editor/post',
      'POST',
      JSON.stringify({ name: '2026-03-01-new-post.md', data: { title: 'New' }, content: 'Hi' }),
    )
    const res = new FakeResponse()
    const pending = invoke(req, res)
    req.send()
    await pending

    expect(res.json()).toEqual({ ok: true })
    const written = fs.readFileSync(path.join(blogDir, '2026-03-01-new-post.md'), 'utf-8')
    expect(written).toContain('title: New')
    expect(written).toContain('Hi')
  })

  it('overwrites an existing post file on POST', async () => {
    const req = new FakeRequest(
      '/__blog-editor/post',
      'POST',
      JSON.stringify({
        name: '2026-01-01-a.md',
        data: { title: 'Updated' },
        content: 'New body',
      }),
    )
    const res = new FakeResponse()
    const pending = invoke(req, res)
    req.send()
    await pending

    const written = fs.readFileSync(path.join(blogDir, '2026-01-01-a.md'), 'utf-8')
    expect(written).toContain('title: Updated')
    expect(written).toContain('New body')
  })

  it('rejects a file name that tries to escape content/blog (path traversal)', async () => {
    const req = new FakeRequest('/__blog-editor/post?name=..%2F..%2Fetc%2Fpasswd', 'GET')
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
