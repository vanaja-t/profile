import fs from 'node:fs'
import path from 'node:path'
import type { Plugin } from 'vite'

const DATA_DIR = 'src/data'
const API_PREFIX = '/__content-editor'

function readBody(req: import('node:http').IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', (chunk) => {
      body += chunk
    })
    req.on('end', () => resolve(body))
    req.on('error', reject)
  })
}

/**
 * Local-only backend for the JSON content editor (ST-108, Epic 13): lists
 * and reads/writes files under src/data/*.json. Registered via
 * `configureServer`, so it exists ONLY while `vite dev` is running — it is
 * never invoked during `vite build` and ships in no production bundle
 * (ST-109). Validation happens client-side (reusing each file's existing
 * zod schema, ST-107) before a save ever reaches this endpoint; this
 * middleware still re-parses as JSON as a last-resort sanity check before
 * writing to disk.
 */
export function contentEditor(): Plugin {
  let root = process.cwd()

  return {
    name: 'content-editor',
    apply: 'serve',
    configResolved(config) {
      root = config.root
    },
    configureServer(server) {
      const dataDir = path.resolve(root, DATA_DIR)

      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith(API_PREFIX)) return next()

        const url = new URL(req.url, 'http://localhost')

        try {
          if (url.pathname === `${API_PREFIX}/files` && req.method === 'GET') {
            const files = fs
              .readdirSync(dataDir)
              .filter((file) => file.endsWith('.json'))
              .sort()
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ files }))
            return
          }

          if (url.pathname === `${API_PREFIX}/file` && req.method === 'GET') {
            const name = url.searchParams.get('name') ?? ''
            const filePath = resolveDataFile(dataDir, name)
            const content = fs.readFileSync(filePath, 'utf-8')
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ content }))
            return
          }

          if (url.pathname === `${API_PREFIX}/file` && req.method === 'POST') {
            const body = JSON.parse(await readBody(req)) as { name: string; content: string }
            const filePath = resolveDataFile(dataDir, body.name)
            // Sanity check — the editor UI already validated against the
            // file's real schema; this only guards against writing broken
            // JSON if that check were ever bypassed.
            const parsed = JSON.parse(body.content)
            fs.writeFileSync(filePath, `${JSON.stringify(parsed, null, 2)}\n`, 'utf-8')
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ ok: true }))
            return
          }

          res.statusCode = 404
          res.end(JSON.stringify({ error: 'Not found' }))
        } catch (error) {
          res.statusCode = 400
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }))
        }
      })
    },
  }
}

/** Resolves a data-file name safely — rejects anything trying to escape src/data/. */
function resolveDataFile(dataDir: string, name: string): string {
  if (!name || !name.endsWith('.json') || name.includes('/') || name.includes('\\')) {
    throw new Error(`Invalid file name: ${name}`)
  }
  return path.join(dataDir, name)
}
