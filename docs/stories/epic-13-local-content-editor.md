# Epic 13 — Local Development Content Editor

**Goal**: a nicer way to edit `src/data/*.json` while running `npm run dev` locally — not a CMS for the deployed site.

## Why this doesn't reopen the "no CMS" decision

requirements.md §12 puts a "CMS / admin UI for editing content" out of scope for v1: the JSON files themselves are the content model, and the deployed site is static (GitHub Pages, no backend) with nothing to persist a save to. This epic doesn't change that — the editor:

- Only exists inside the local Vite dev server process (a small `configureServer` middleware), never in the production build.
- Edits the exact same `src/data/*.json` files a forker would otherwise open in a text editor — same content model, same schemas, same result.
- Is unreachable on the deployed site: the route itself only renders when `import.meta.env.DEV` is true.

It's a convenience layer over the existing edit-the-JSON-files workflow, not a second one.

## Locked decisions

- **Scope**: `src/data/*.json` only. `content/blog/*.md` is its own epic (14) — different structure/parsing pipeline (see Epic 2's `vite-plugin-blog-posts.ts`) and user-named files rather than a fixed list, which bundling in here would have made a much bigger addition.
- **Entry point**: launched from `/customize`, repurposed as a dev-tools hub (ST-111) rather than the Epic 12 text guide it replaced — see `epic-12-customize-guide.md`'s superseded note.
- **Editing surface — revised 2026-09-13**: originally scoped as raw JSON text per file (below), then explicitly overturned mid-build: the user reviewed the raw-text version and asked for real field-by-field inputs instead. Rather than hand-writing 12 bespoke forms (the original "500+ lines" estimate for that path), built one generic `SchemaForm` component that introspects each file's existing zod schema (`.def.type`, `.def.shape`, `.def.element`, `.unwrap()`) and renders the right input per field — text/textarea/number/checkbox, with add/remove for arrays (including arrays of objects, and arrays nested inside array items) and an explicit set/unset toggle for optional fields. ~250 lines total (`src/lib/schema-form.ts` + `src/components/SchemaForm.tsx`), reused across all 12 files with zero per-file code. A field a schema doesn't recognize falls back to a raw-JSON textarea for just that one field, rather than breaking the whole form.
  - ~~Original decision, superseded~~: raw JSON text per file, not a per-field form, on the reasoning that a form editor for 12 differently-shaped files would be a much bigger job (500+ lines) for the same practical benefit. Kept here for the record of what changed and why.
- **Validation**: reuses each file's existing zod schema from `src/lib/content/*.ts` — no new schemas, no new validation logic. A save that doesn't parse is rejected with the same kind of error `validateData()` already produces elsewhere.
- **Persistence**: a Vite dev-server middleware (registered via `configureServer`) that writes the validated JSON back to `src/data/<file>.json`, pretty-printed to match the existing files' formatting.
- **Production safety**: exceeded the original "route is dev-only" plan after verifying it empirically. A runtime `import.meta.env.DEV` guard around a `React.lazy(() => import('@/pages/ContentEditorPage'))` still left `dist/assets/ContentEditorPage-*.js` present after a production build — Rollup emits a chunk for any syntactically-present dynamic `import()` regardless of whether the surrounding branch is ever reachable at runtime; it doesn't trace that far. Fixed with `vite-plugin-dev-routes.ts`: a virtual module (`virtual:dev-routes`) whose *content* differs by build command — `[]` during `vite build`, the real route list during `vite dev` — so the dynamic import never exists in the module graph a production build sees, and no chunk is ever emitted. Verified: `dist/assets/` contains no `ContentEditorPage` file at all. The write-back middleware (`apply: 'serve'`) was already fully excluded this way from the start.

## Stories

| ID | Story | Priority |
|---|---|---|
| ST-105 | Local-only content editor route, lists editable files | Must |
| ST-106 | Select a file, edit its raw JSON | Must |
| ST-107 | Validate edits against the file's existing zod schema before saving | Must |
| ST-108 | Save writes back to the real file on disk (dev-server middleware) | Must |
| ST-109 | Completely absent from the production build/deployed site | Must |
| ST-110 | Distinct success/error feedback after saving | Should |
| ST-111 | `/customize` repurposed as a dev-tools hub (button per tool, prominent localhost-only notice) | Must |

Full acceptance criteria: `docs/stories.md` Epic 13.

## Status

Fully implemented: `src/pages/ContentEditorPage.tsx` (`/dev/content`, default-exported for `React.lazy`), `src/components/SchemaForm.tsx` + `src/lib/schema-form.ts` (the generic field renderer and its zod-introspection helpers), `vite-plugin-content-editor.ts` (the dev-server-only read/write middleware), `vite-plugin-dev-routes.ts` (the build-command-aware virtual module that keeps dev-only pages out of production entirely), and `src/lib/content/editor-schemas.ts` (maps each of the 12 `src/data/*.json` files to the exact schema its own loader validates against — no new schemas defined).

Test coverage: `schema-form.test.ts` (introspection helpers), `SchemaForm.test.tsx` (rendering + edit/add/remove behavior for both object and array-of-object schemas), `ContentEditorPage.test.tsx` (file list/load/validate/save flow, with mocked `fetch`), and `vite-plugin-content-editor.test.ts` (the middleware itself, using fake `req`/`res` objects against a real temp directory — list/read/write/path-traversal-rejection/passthrough). Verified visually via Playwright screenshots of `personal.json` (flat object) and `experience.json` (array of objects with a nested array of strings), both rendering correctly with zero code written specific to either file.
