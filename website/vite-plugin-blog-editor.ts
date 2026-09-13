import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import type { Plugin } from 'vite'

const BLOG_DIR = 'content/blog'
const API_PREFIX = '/__blog-editor'

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
 * Local-only backend for the blog post editor (ST-116, Epic 14): lists and
 * reads/writes files under content/blog/*.md — same pattern as
 * vite-plugin-content-editor.ts (Epic 13), separate endpoint/directory
 * since posts are user-named files, not a fixed list. Registered via
 * `configureServer`, so it exists ONLY while `vite dev` is running — never
 * invoked during `vite build`, ships in no production bundle (ST-117).
 *
 * Frontmatter parsing/serialization (gray-matter) happens HERE, not in the
 * browser: gray-matter depends on Node's Buffer, which doesn't exist in a
 * browser runtime — this bit the client-side blog list once already (Epic
 * 5/6, fixed by moving parsing into vite-plugin-blog-posts.ts) and would
 * have bitten BlogEditorPage the same way if it called `matter()` itself.
 * The client only ever sees/sends already-split `{ data, content }`.
 * Frontmatter validation (against blog.ts's frontmatterSchema) still
 * happens client-side before a save reaches this endpoint; this middleware
 * just serializes and writes.
 */
export function blogEditor(): Plugin {
  let root = process.cwd()

  return {
    name: 'blog-editor',
    apply: 'serve',
    configResolved(config) {
      root = config.root
    },
    configureServer(server) {
      const blogDir = path.resolve(root, BLOG_DIR)

      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith(API_PREFIX)) return next()

        const url = new URL(req.url, 'http://localhost')

        try {
          if (url.pathname === `${API_PREFIX}/posts` && req.method === 'GET') {
            if (!fs.existsSync(blogDir)) {
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ posts: [] }))
              return
            }
            const posts = fs
              .readdirSync(blogDir)
              .filter((file) => file.endsWith('.md'))
              .sort()
              .reverse()
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ posts }))
            return
          }

          if (url.pathname === `${API_PREFIX}/post` && req.method === 'GET') {
            const name = url.searchParams.get('name') ?? ''
            const filePath = resolvePostFile(blogDir, name)
            const raw = fs.readFileSync(filePath, 'utf-8')
            const { data, content } = matter(raw)
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ data, content }))
            return
          }

          if (url.pathname === `${API_PREFIX}/post` && req.method === 'POST') {
            const body = JSON.parse(await readBody(req)) as {
              name: string
              data: Record<string, unknown>
              content: string
            }
            const filePath = resolvePostFile(blogDir, body.name)
            fs.mkdirSync(blogDir, { recursive: true })
            fs.writeFileSync(filePath, matter.stringify(body.content, body.data), 'utf-8')
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

/** Resolves a post file name safely — rejects anything trying to escape content/blog/. */
function resolvePostFile(blogDir: string, name: string): string {
  if (!name || !name.endsWith('.md') || name.includes('/') || name.includes('\\')) {
    throw new Error(`Invalid file name: ${name}`)
  }
  return path.join(blogDir, name)
}
