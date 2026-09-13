import type { Plugin } from 'vite'

const VIRTUAL_ID = 'virtual:dev-routes'
const RESOLVED_ID = `\0${VIRTUAL_ID}`

/**
 * Provides the local-dev-only routes (Epic 13's JSON editor, Epic 14's blog
 * editor) as a virtual module whose CONTENT differs by build command — not
 * just a runtime `import.meta.env.DEV` check.
 *
 * A runtime check alone (`{import.meta.env.DEV && <Route .../>}` with a
 * `React.lazy(() => import(...))`) still leaves the dynamic import visible
 * to Rollup's module-graph scan, which emits a chunk for it regardless of
 * whether the surrounding branch is ever reachable — verified empirically,
 * `dist/assets/ContentEditorPage-*.js` existed even with that guard. Here,
 * during `vite build` this module resolves to an empty array with no
 * import() in its source at all, so the dev pages are never discovered as
 * reachable modules and their chunks are never emitted (ST-109) — not just
 * unreferenced, actually absent from `dist/`.
 */
export function devRoutes(): Plugin {
  let isBuild = false

  return {
    name: 'dev-routes',
    configResolved(config) {
      isBuild = config.command === 'build'
    },
    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_ID
    },
    load(id) {
      if (id !== RESOLVED_ID) return

      if (isBuild) {
        return 'export const devRoutes = []'
      }

      return `
import { lazy } from 'react'
const ContentEditorPage = lazy(() => import('@/pages/ContentEditorPage'))
const BlogEditorPage = lazy(() => import('@/pages/BlogEditorPage'))
export const devRoutes = [
  { path: '/dev/content', Component: ContentEditorPage },
  { path: '/dev/blog', Component: BlogEditorPage },
]
`
    },
  }
}
