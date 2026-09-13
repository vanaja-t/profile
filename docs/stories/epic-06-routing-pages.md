# Epic 6 — Routing & GitHub Pages Compatibility

**Goal**: the app deploys correctly as a GitHub Pages project page, for this repo and any fork.

## Locked decisions
- Router: `BrowserRouter` with `basename` from `site.config.json.basePath`.
- This deployment's values: GitHub account `roopesht`, repo `mirai-launchpad` (public), branch `main`, `basePath = "/mirai-launchpad/"`, live URL `https://roopesht.github.io/mirai-launchpad/`, no custom domain for now.
- `404.html` copy trick for deep-link refresh support (distinct from the in-app Not Found page).
- New: in-app catch-all **Not Found page** (ST-099) for genuinely invalid routes.
- **Updated 2026-09-13 (ST-118)**: `basePath` is auto-computed from GitHub Actions' `GITHUB_REPOSITORY` env var when building there, falling back to `site.config.json.basePath` otherwise (local dev, or a build run outside GitHub Actions). The JSON field is no longer the authoritative value in the common case — see Status below for why.

## Stories
| ID | Story | Priority |
|---|---|---|
| ST-061 | Router `basename` from config | Must |
| ST-062 | Vite `base` wired to same value | Must |
| ST-063 | `404.html` deep-link fallback | Must |
| ST-064 | Relative/base-aware asset paths | Must |
| ST-065 | Optional `CNAME` support (not used now) | Could |
| ST-099 | In-app Not Found page | Should |
| ST-118 *(added 2026-09-13)* | Auto-compute `basePath` from `GITHUB_REPOSITORY` | Must |

Full acceptance criteria: `docs/stories.md` Epic 6.

## Status

`site.config.json.basePath` is the single source of truth, consumed in two places that each need a slightly different shape of it: `vite.config.ts` reads the JSON directly (via `fs.readFileSync`, same pattern as the favicon/blog-posts plugins) and passes it straight to Vite's `base`, which requires a trailing slash; `App.tsx` passes it through `getRouterBasename()` (`src/lib/base-path.ts`) to react-router's `basename`, which doesn't want one — this mismatch would have silently blanked every route in tests (and in a real deploy) had it gone unnoticed. `vite-plugin-spa-fallback.ts` copies the built `index.html` to `404.html` via a `closeBundle` hook.

**ST-064 turned out to be the epic's real substance.** Vite's `base` only rewrites paths it can see statically (JS imports, `index.html`) — a path read at runtime from content JSON (`project.imageUrl`, `testimonial.avatar`, `personal.avatarUrl`, `personal.resumePdfUrl`, `gallery.json`'s images, even `site.config.json.favicon` inside `index.html`) is just a string and needs explicit prefixing. Added `withBase()` (`src/lib/base-path.ts`) and applied it everywhere one of these renders; external URLs (the real avatar photo is now a full `https://` URL) pass through unchanged. `gallery.ts`'s existing `galleryImageSrc()` helper was refactored to delegate to it.

Verified two ways: the full route tree matches correctly under a non-root `basename` in tests (this exposed a real gap — the existing `App.test.tsx` rendered a blank page until it was updated to navigate to `siteConfig.basePath` first, matching how the app is actually served); and by running `vite preview` against the real production build at `http://localhost:4173/mirai-launchpad/` with Playwright — home page, a direct deep-link visit to `/projects`, and a genuinely invalid route all loaded with zero console or network errors.

**ST-118, added after a real fork failure**: a fork (`vanaja-t/profile`) was renamed after forking and deployed via GitHub's web UI. Every asset 404'd, because `site.config.json.basePath` still read `/mirai-launchpad/` — nobody had updated it to `/profile/` to match. This is exactly the gap flagged when Epic 7's setup CLI (which would have computed this) was dropped in favor of Epic 13's manual JSON editor.

Fix: `vite.config.ts` now derives `basePath` from `GITHUB_REPOSITORY` (`owner/repo`, automatically set by GitHub Actions for every workflow run — no configuration needed) instead of trusting the static JSON value: a project page gets `/repo-name/`, a repo literally named `<owner>.github.io` gets `/` (a user/org page has no path segment). The computed value is injected as a build-time `__BASE_PATH__` constant and overrides `siteConfig.basePath` after schema validation, so the router's `basename` and Vite's `base` stay in sync automatically. Falls back to reading the JSON field when `GITHUB_REPOSITORY` isn't set (local dev, or a build run outside GitHub Actions/deployed elsewhere) — `site.config.json.basePath` still exists and still matters for that case. Verified: local `npm run build` (no `GITHUB_REPOSITORY`) still produces `/mirai-launchpad/`-prefixed output as before; all 85 existing tests pass unchanged since they already read `siteConfig.basePath`/`import.meta.env.BASE_URL` dynamically rather than hardcoding the string.
