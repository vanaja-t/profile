# Epic 14 — Local Development Blog Editor

**Goal**: Epic 13's counterpart for `content/blog/*.md` — write and edit blog posts locally without hand-editing Markdown files, launched from the same `/customize` dev-tools hub.

## Why a separate epic from Epic 13

The `src/data/*.json` files Epic 13 edits are a **fixed, known list** — 12 files, always present, always the same names. Blog posts are **user-named files** (`YYYY-MM-DD-slug.md`) that get created over time. That difference drives real UI differences (a "new post" flow that derives a filename from a title; a growing/shrinking file list instead of a fixed one), so this stays its own epic rather than a case inside Epic 13's file picker — but it reuses Epic 13's patterns throughout: schema-driven field editing, schema validation before save, a dev-server middleware for the write-back, and the same `import.meta.env.DEV`-plus-`virtual:dev-routes` production-safety guarantee.

## Locked decisions

- **Launched from `/customize`**: same hub as the JSON editor (Epic 13's ST-111), not a separately-discovered tool.
- **New post flow**: enter a title → filename is derived as `YYYY-MM-DD-slug.md` (today's date + a slugified title) → opens pre-filled with the required frontmatter (`title`, `date`, `tags`, `excerpt`) and an empty body.
- **Editing surface — revised, following Epic 13's own revision**: Epic 13 was originally scoped as raw JSON text, then rebuilt as a schema-driven field-by-field form after user feedback (see `epic-13-local-content-editor.md`). This epic was built afterward, so it started from the revised pattern rather than repeating the raw-text detour: frontmatter (`title`, `date`, `tags`, `excerpt`) renders as `SchemaForm` fields (Epic 13's generic renderer, reused verbatim against `blog.ts`'s exported `frontmatterSchema`), and only the Markdown body — which a form can't usefully decompose — is a plain textarea.
  - ~~Original decision, superseded before implementation began~~: "one raw text editor per post covering frontmatter + body together." Kept here for the record; this epic's own doc never shipped this version.
- **Validation**: reuses the existing frontmatter zod schema, now exported as `frontmatterSchema` from `src/lib/content/blog.ts` specifically so this editor and `vite-plugin-blog-posts.ts` share one definition — parsed the same way every post is validated at build time.
- **Persistence**: a separate `vite-plugin-blog-editor.ts` middleware (not a literal extension of Epic 13's — different directory, different file shape), scoped to `content/blog/`. A save either creates a new file or overwrites an existing one. Frontmatter parsing/serialization (`gray-matter`) happens entirely inside this Node-side middleware — see Status below for why that boundary is load-bearing, not incidental.
- **Production safety**: identical guarantee to Epic 13 (ST-109/ST-117) — dev-only route via `virtual:dev-routes`, dev-only middleware (`apply: 'serve'`), no code path that runs against a deployed site.

## Stories

| ID | Story | Priority |
|---|---|---|
| ST-112 | Local-only blog editor route, lists existing posts | Must |
| ST-113 | "New post" flow derives filename from a title | Must |
| ST-114 | Edit an existing post's frontmatter + body as one raw text block | Must |
| ST-115 | Validate frontmatter against the existing schema before saving | Must |
| ST-116 | Save writes to `content/blog/` (create or overwrite) | Must |
| ST-117 | Completely absent from the production build/deployed site | Must |

Full acceptance criteria: `docs/stories.md` Epic 14.

## Status

Fully implemented: `src/pages/BlogEditorPage.tsx` (`/dev/blog`, default-exported for `React.lazy`, wired into `virtual:dev-routes` alongside Epic 13's `ContentEditorPage`), and `vite-plugin-blog-editor.ts` (the dev-server-only list/read/write middleware for `content/blog/*.md`). Frontmatter fields reuse Epic 13's `SchemaForm` unchanged, driven by `frontmatterSchema` (now exported from `src/lib/content/blog.ts`); the body is a plain `<textarea>`.

Two real bugs were found and fixed during this build, both worth recording since they weren't obvious from the design:

- **`ReferenceError: Can't find variable: Buffer`, user-reported while testing.** The first version imported `gray-matter` directly into `BlogEditorPage.tsx` so the client could parse/stringify frontmatter itself. `gray-matter` depends on Node's `Buffer` global, which doesn't exist in a real browser — and this page, unlike the dev-server middleware, actually runs in a real browser during `npm run dev` (excluding it from the *production* bundle via `virtual:dev-routes` doesn't help with that; the dev server serves the real component to a real tab). This is the same class of bug already fixed once before, client-side, for the blog list in Epic 5/6. Fixed by moving every `matter()`/`matter.stringify()` call into `vite-plugin-blog-editor.ts` (pure Node, dev-server-only); the client now only ever exchanges an already-split `{ data, content }` shape over `fetch`.
- **Full-page reload wiped the editor's own unsaved state on every save**, found via Playwright verification rather than user report. `vite-plugin-blog-posts.ts` (Epic 5) force-reloads the page on any change under `content/blog/`, so the live Blog list/detail pages pick up edits — but that includes writes made by this editor's own save, which then wiped the just-shown "Saved" message and any other in-progress field. Fixed with a `useEffect` in `BlogEditorPage.tsx` that listens for Vite's documented `'vite:beforeFullReload'` window event and calls `event.preventDefault()` while the editor is mounted.

Test coverage: `vite-plugin-blog-editor.test.ts` (the middleware — list/read/create/overwrite/path-traversal-rejection/passthrough, using fake `req`/`res` objects against a real temp directory) and `BlogEditorPage.test.tsx` (list → load → fields+body populate, validation blocks an invalid save, and the new-post title → filename-preview → create flow, all with mocked `fetch`). Verified visually via Playwright, reproducing both the create-new-post and edit-existing-post-and-save flows end to end: no full-page reload, correct "Saved to `<name>`" feedback, scroll position preserved, zero console errors. Confirmed absent from production: `dist/assets/` contains no `BlogEditorPage` chunk after `npm run build`.
