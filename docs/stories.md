# Delivery Backlog — User Stories

Derived from `docs/requirements.md`. Covers the entire delivery: scaffolding, data layer, theming, sections, routing, CI/CD, non-functional requirements, and documentation. Nothing here is implemented yet unless marked **Done**.

Roles used: **Visitor** (views the deployed site), **Forker** (clones the template to make their own site), **Maintainer** (owns content/updates after setup).

Priority: **Must** (v1 blocker) · **Should** (v1, not blocking) · **Could** (nice-to-have).

> **Validation pass (2026-09-09):** reviewed every story for contradictions/gaps. Fixed: ST-071 now runs tests (not just build), so it actually covers the ST-092 attribution test; ST-067 now explicitly writes `basePath`; ST-082 clarifies the OjasaMirai badge (Epic 11) is an intentional, documented exception, not a violation. Added two missing stories: ST-098 (favicon config) and ST-099 (in-app 404 page, distinct from the GitHub Pages redirect trick). Remaining open decisions — things no story fixes because they're genuinely your call — are collected in `docs/questionnaire.md`.

## Epic 1 — Project Scaffolding & Tooling

| ID | User Story | Acceptance Criteria | Priority | Status |
|---|---|---|---|---|
| ST-001 | As a Maintainer, I want a Vite + React + TypeScript project scaffolded, so I have a working dev/build baseline. | `npm run dev` and `npm run build` succeed on a clean clone. | Must | **Done** |
| ST-002 | As a Maintainer, I want Node 22 pinned, so local and CI environments match. | `engines.node` set in `package.json`; workflow uses `node-version: 22`. | Must | **Done** *(engines.node set; CI `node-version` lands with Epic 8)* |
| ST-003 | As a Maintainer, I want Tailwind CSS configured, so components can be styled and themed via CSS variables. | `tailwind.config`, PostCSS, base styles wired in. | Must | **Done** *(Tailwind v4 CSS-first config via `@tailwindcss/vite`, no separate `tailwind.config`/PostCSS file needed)* |
| ST-004 | As a Maintainer, I want shadcn/ui installed and configured, so I have accessible, theme-aware component primitives. | `components.json` configured; Button, Card, Dialog, NavigationMenu generated and rendering. | Must | **Done** *(Radix base, not the newer Base UI default — matches requirements §3)* |
| ST-005 | As a Maintainer, I want React Router installed with a route tree, so navigation between sections works as real routes. | Routes defined for every section/page in §4 of requirements. | Must | **Done** *(stub pages; content lands with Epic 5, `basename` lands with Epic 6)* |
| ST-006 | As a Maintainer, I want Framer Motion installed, so section/page transitions are possible. | Library installed; at least one transition wired as proof. | Should | **Done** *(`PageTransition` wrapper, respects `prefers-reduced-motion`)* |
| ST-007 | As a Maintainer, I want lucide-react installed, so icons are available across components. | Library installed; used in nav/theme switcher. | Should | Pending *(installed; nav/theme switcher usage lands with Epic 3/4)* |
| ST-008 | As a Maintainer, I want zod installed with a shared validation utility, so JSON content can be runtime-validated. | Utility function exists and is reused by every data loader. | Must | **Done** *(`validateData()`; reuse by loaders lands with Epic 2)* |
| ST-009 | As a Maintainer, I want ESLint + Prettier configured, so code style stays consistent across contributions/forks. | Lint script passes on a clean checkout. | Should | **Done** |
| ST-010 | As a Maintainer, I want a sensible `.gitignore` (node_modules, dist, .env), so build artifacts and secrets aren't committed. | File present and effective. | Must | **Done** |
| ST-104 *(added in second validation pass)* | As a Maintainer, I want Vitest + React Testing Library installed and configured with an `npm test` script, so ST-071 (PR checks) and ST-092 (OjasaMirai badge test) have something to actually run. | `npm test` runs successfully on a clean clone, even with zero tests written yet. | Must | **Done** |

## Epic 2 — Data Layer & Schemas

| ID | User Story | Acceptance Criteria | Priority | Status |
|---|---|---|---|---|
| ST-011 | As a Forker, I want `site.config.json` with a typed schema and loader, so site-wide settings are structured and validated. | Interface + zod schema + loader implemented per §5. | Must | **Done** |
| ST-012 | As a Forker, I want `personal.json` with a typed schema and loader, so my identity/bio content is structured and validated. | Same as above for `Personal`. | Must | **Done** *(real content adapted from roopesht.github.io)* |
| ST-013 | As a Forker, I want `experience.json` with a typed schema and loader, so my work history is structured and validated. | Schema covers company/role/dates/highlights[]. | Must | **Done** *(real content)* |
| ST-014 | As a Forker, I want `education.json` with a typed schema and loader, so my education history is structured and validated. | Schema covers institution/degree/field/dates. | Must | **Done** *(real content)* |
| ST-015 | As a Forker, I want `skills.json` with a typed schema and loader, so skills render by category with proficiency. | Schema covers category → items with proficiency. | Must | **Done** *(real content; rendering as bars lands with Epic 5)* |
| ST-016 | As a Forker, I want `certifications.json` with a typed schema and loader, so certifications appear on the Resume page. | Schema + loader implemented. | Must | **Done** *(placeholder data; no real source)* |
| ST-017 | As a Forker, I want `awards.json` with a typed schema and loader, so awards/achievements appear on the Resume page. | Schema + loader implemented. | Must | **Done** *(placeholder data; no real source)* |
| ST-018 | As a Forker, I want `projects.json` with a typed schema and loader, so my projects render as cards. | Schema matches `Project` interface in §5. | Must | **Done** *(placeholder data)* |
| ST-019 | As a Forker, I want `hobbies.json` with a typed schema and loader, so my hobbies render as a section. | Schema + loader implemented. | Must | **Done** *(placeholder data)* |
| ST-020 | As a Forker, I want `testimonials.json` with a typed schema and loader, so quotes render as a section. | Schema covers name/role/company/quote/avatar. | Must | **Done** *(placeholder data)* |
| ST-021 | As a Forker, I want `socials.json` with a typed schema and loader, so social links render in header/footer/contact. | Schema covers platform/url/icon. | Must | **Done** *(real GitHub + website links)* |
| ST-022 | As a Maintainer, I want blog posts authored as Markdown files with frontmatter, parsed at build time, so I can write posts without a CMS. | `content/blog/*.md` parsed for title/date/tags/excerpt + body. | Must | **Done** |
| ST-023 | As a Forker, I want every JSON file to ship with realistic placeholder data, so the app looks complete immediately after cloning. | Fresh clone renders every section fully populated before any edits. | Must | **Done** *(data loads and validates cleanly; actual section rendering lands with Epic 5)* |
| ST-024 | As a Forker, I want a clear validation error at dev/build time when a data file doesn't match its schema, so I know exactly what to fix instead of seeing a blank page. | Malformed JSON produces a readable error naming file + field. | Should | **Done** |
| ST-098 *(added in validation pass)* | As a Forker, I want to set a custom favicon via `site.config.json.favicon`, so the browser tab icon reflects my brand instead of a generic default. | Changing the config value changes the built `<link rel="icon">`. | Should | **Done** *(custom Vite plugin injects it into `index.html` at build/dev time)* |
| ST-103 *(added after questionnaire)* | As a Forker, I want `gallery.json` with a typed schema and loader (image path + title per entry), so my Gallery section (ST-060) is structured and validated like every other content type. | Schema + loader implemented; images referenced live under `public/gallery/`. | Must | **Done** |

## Epic 3 — Theming System

> Target audience is Gen Z (20–28, see requirements §1). 3 of the 4 themes lean into current Gen Z visual trends; Blue Professional is the deliberate, non-Gen-Z "safe" exception.

| ID | User Story | Acceptance Criteria | Priority | Status |
|---|---|---|---|---|
| ST-025 | As a Maintainer, I want a defined theme token contract (CSS variables for background/foreground/primary/accent/radius/font/etc.), so every theme implements the same interface. | Token list documented and enforced by a type/shape. | Must | **Done** *(`ThemeTokens` interface in `src/themes/types.ts`; a test asserts all 4 themes implement every key)* |
| ST-026 | As a Gen Z Visitor, I want a "Modern Minimal" theme with bold oversized type and soft-brutalist touches (thick borders, chunky rounded shapes, one loud accent), so it feels clean but still current, not sterile/corporate. | Token file implemented; visually matches the Gen-Z-leaning description in §6. | Must | **Done** |
| ST-027 | As a Gen Z Visitor, I want a "Dark Tech" theme with neon glow and a cyberpunk/synthwave edge, so dark mode feels current rather than generic. | Token file implemented; visually matches the Gen-Z-leaning description in §6. | Must | **Done** |
| ST-028 | As a Gen Z Visitor, I want a "Vibrant Creative" theme with gradient mesh backgrounds, glassmorphism, and playful shapes, so it's the most maximalist, trend-forward option. | Token file implemented; visually matches the Gen-Z-leaning description in §6. | Must | **Done** *(the gradient mesh background layer itself is a decorative Epic 5 component, not a token — see epic-03 doc)* |
| ST-029 | As a Visitor who wants a conservative look, I want a "Blue Professional" theme that stays corporate-safe (not Gen-Z-styled), so there's a safer default available for more formal contexts. | Token file implemented; intentionally excluded from the Gen-Z redesign pass. | Must | **Done** *(accent darkened from #2D7DD2 to #256DBF to clear WCAG AA for normal text — see epic-03 doc)* |
| ST-030 | As a Visitor, I want a visible theme switcher control, so I can change the site's look. | Control present in header on every page. | Must | **Done** *(native `<select>` dropdown in a minimal Header; full header polish lands with Epic 4)* |
| ST-031 | As a Visitor, I want my theme choice applied instantly across the whole site, so the switch feels immediate. | Selecting a theme updates all CSS variables without reload. | Must | **Done** |
| ST-032 | As a Visitor, I want my theme choice remembered on return visits, so I don't have to reselect it every time. | Choice persisted in `localStorage`, restored on load, falls back to `defaultTheme`. | Must | **Done** |
| ST-033 | As a Visitor using a keyboard/screen reader, I want the theme switcher to be operable and labeled, so I can use it without a mouse. | Switcher is keyboard-reachable, has ARIA label/role. | Must | **Done** *(native `<select>` + associated `<label>` — inherently keyboard/screen-reader operable)* |
| ST-034 | As a Visitor, I want sufficient text/background contrast in every theme, so content stays readable. | All 4 themes pass WCAG AA contrast checks. | Must | **Done** *(automated contrast test, not just a manual check — `src/themes/contrast.test.ts`)* |
| ST-035 | As a Forker, I want new themes discoverable purely via `site.config.json.availableThemes`, so I can add a 5th theme without touching component code. | Adding a token file + config entry is sufficient; verified with a test 5th theme. | Should | **Done** *(registry pattern + string-typed schema; a test proves `applyTheme` works against a fabricated, unregistered 5th theme)* |

## Epic 4 — Navigation & Layout Shell

| ID | User Story | Acceptance Criteria | Priority | Status |
|---|---|---|---|---|
| ST-036 | As a Visitor, I want a global header showing the site owner's name/title (text wordmark) and navigation, that condenses/shrinks as I scroll down, so I can orient, move around the site, and get more screen space while reading. | Header present on every route, pulls from `personal.json`; visibly shrinks (height/padding) past a scroll threshold. | Must | **Done** *(wordmark pulls from `site.config.json.siteTitle`, not `personal.json` — that field exists precisely for site-wide branding text; see epic-04 doc)* |
| ST-037 | As a Forker, I want nav items rendered from `site.config.json.navigation` (respecting `enabled`/`order`), so I can turn sections on/off or reorder them without editing components. | Disabling/reordering an entry changes rendered nav and available routes. | Must | **Done** *(nav rendering respects enabled/order; the routes themselves aren't conditionally registered/unregistered — visiting a disabled section's URL directly still works, matching the ST-096 "hidden from nav, not 404'd" pattern used elsewhere)* |
| ST-038 | As a Visitor on mobile, I want a bottom tab bar for primary navigation, so moving between sections feels app-like and thumb-reachable. | A fixed bottom tab bar renders below a defined breakpoint, replacing the desktop header nav, and is usable. | Must | **Done** |
| ST-039 | As a Visitor, I want a footer with social links and copyright, so I can find contact info from any page. | Footer present on every route, pulls from `socials.json`/`personal.json`. | Should | **Done** |
| ST-040 | As a Visitor using assistive tech, I want a skip-to-content link and landmark regions, so I can navigate efficiently. | Skip link present; `header`/`nav`/`main`/`footer` landmarks used. | Should | **Done** |

## Epic 5 — Content Sections

| ID | User Story | Acceptance Criteria | Priority | Status |
|---|---|---|---|---|
| ST-041 | As a Visitor, I want an About/Story section, so I understand who the site owner is and what drives them. | Renders `personal.bio` with heading/layout, markdown supported. | Must | **Done** *(rendered via `react-markdown`)* |
| ST-042 | As a Visitor, I want a Skills section with categorized visuals, so I can quickly see technical vs. other skills. | Renders `skills.json` grouped by category with a visual indicator (grid/bars). | Must | **Done** *(shared `ProficiencyBar` component, `role="progressbar"`)* |
| ST-043 | As a Visitor, I want a Resume page showing contact info, so I know how to reach the site owner. | Renders email/phone/location from `personal.json`. | Must | **Done** |
| ST-044 | As a Visitor, I want the Resume page to show a professional summary, so I get a quick overview. | Renders summary text. | Must | **Done** *(reuses `personal.bio` — no separate summary field in the schema)* |
| ST-045 | As a Visitor, I want the Resume page to list work experience, so I can review the career history. | Renders `experience.json` chronologically with highlights. | Must | **Done** *(loader sorts by `startDate` descending, independent of JSON file order)* |
| ST-046 | As a Visitor, I want the Resume page to list education, so I can review academic background. | Renders `education.json`. | Must | **Done** |
| ST-047 | As a Visitor, I want the Resume page to list certifications, so I can see verified credentials. | Renders `certifications.json`. | Should | **Done** |
| ST-048 | As a Visitor, I want the Resume page to list awards/achievements, so I can see recognitions. | Renders `awards.json`. | Should | **Done** |
| ST-049 | As a Visitor, I want a "Download PDF" button on the Resume page, so I can save/print an offline copy. | Button links to `personal.resumePdfUrl`, opens/downloads correctly; button is **hidden entirely** (not shown disabled) when `resumePdfUrl` is unset — relevant for the placeholder-data case. | Must | **Done** *(tested explicitly — placeholder data has no `resumePdfUrl`)* |
| ST-100 *(added after questionnaire)* | As a Visitor, I want a full-height Hero section at the top of the home page (name, tagline, CTA buttons: "View Resume" / "See Projects" / "Let's talk"), so I immediately understand who the site belongs to and where to go next. | Hero renders above About on the home page; each CTA navigates to its target route. | Must | **Done** |
| ST-050 | As a Visitor, I want a Projects section showing a grid of project cards, so I can browse the site owner's work. | Renders `projects.json` as a responsive card grid. | Must | **Done** *(home preview shows 3, full grid at `/projects`; shared `ProjectCard` component)* |
| ST-051 | As a Visitor, I want each project card to show title, description, tech tags, links, and optional image, so I can evaluate a project at a glance. | Card renders all populated `Project` fields; missing optional fields degrade gracefully. | Must | **Done** *(only the title links to the detail page — repo/live are separate sibling links, not nested inside it, to keep the HTML valid)* |
| ST-052 | As a Visitor, I want featured projects shown first, so I see the most important work without scrolling. | `featured: true` projects are sorted before non-featured ones; no separate visual badge. | Should | **Done** |
| ST-053 | As a Visitor, I want a Hobbies section with icon/image + short blurb per hobby, so I get a personal, human view of the site owner. | Renders `hobbies.json` as a visual list/grid. | Must | **Done** |
| ST-054 | As a Visitor, I want a Blog list page showing post title/date/tags/excerpt, so I can browse available writing. | Renders all parsed posts sorted by date descending. | Must | **Done** |
| ST-055 | As a Visitor, I want a Blog post detail page rendering full content, so I can read a full article. | Markdown body rendered with correct formatting at `/blog/:slug`. | Must | **Done** |
| ST-056 | As a Visitor, I want a Testimonials section showing quotes with name/role/company/avatar, so I can see third-party endorsement. | Renders `testimonials.json` as a static grid of cards (no carousel/auto-rotation). | Should | **Done** |
| ST-057 | As a Visitor, I want a Contact section showing email and social links, so I know how to get in touch. | Renders `personal.email` + `socials.json`. | Must | **Done** |
| ST-058 | As a Visitor, I want a working contact form, so I can send a message directly from the site. | Form has name + email + message fields (no subject field); submits to the configured Formspree endpoint from `site.config.json.contactForm`. | Should | **Done** *(caught and fixed a real bug: `event.currentTarget` goes null after the `await fetch` gap, so every successful submission was silently landing in the error branch — fixed by capturing the form reference before the async call)* |
| ST-059 | As a Visitor, I want clear success/error feedback after submitting the contact form, so I know whether my message went through. | UI shows a distinct success state and a distinct error state. | Should | **Done** *(`role="status"` for success, `role="alert"` for error)* |
| ST-060 | As a Visitor, I want a titled photo Gallery section near Contact, so I can see images the site owner has chosen to share, each with a caption. | Renders `gallery.json` entries (image + title) as a grid; images committed under `public/gallery/`. | Must | **Done** *(placed directly above Contact in the home scroll)* |

## Epic 6 — Routing & GitHub Pages Compatibility

| ID | User Story | Acceptance Criteria | Priority | Status |
|---|---|---|---|---|
| ST-061 | As a Forker, I want the router's `basename` driven from `site.config.json.basePath`, so the app works at any deployment path without code changes. | Changing `basePath` alone relocates all routes correctly. | Must | **Done** *(`getRouterBasename()` normalizes the trailing slash `basePath` has, which react-router's `basename` doesn't expect. Superseded 2026-09-13, see below: `basePath` itself is now usually auto-computed, not something the forker sets.)* |
| ST-062 | As a Forker, I want Vite's `base` build config wired to the same `basePath` value, so I only change one setting, not two. | Single value drives both router and build config. | Must | **Done** *(`vite.config.ts` reads `site.config.json` directly at config-load time)* |
| ST-063 | As a Visitor, I want deep links (e.g. `/projects`) to work on refresh/direct visit, so shared URLs don't 404. | Build step copies `index.html` to `404.html`; verified on a deployed project-page URL. | Must | **Done** *(`vite-plugin-spa-fallback.ts`; verified byte-identical `dist/404.html` after build)* |
| ST-064 | As a Forker, I want all asset references to be relative/base-aware, so the same build works unmodified at `/` or `/repo-name/`. | No hardcoded root-relative asset paths in source; verified in both deployment shapes. | Must | **Done** *(`withBase()` helper applied to every JSON-sourced asset path — avatar, project images, testimonial avatars, gallery, resume PDF, favicon; verified via `vite preview` serving the build at `/mirai-launchpad/` with zero failed requests)* |
| ST-118 *(added 2026-09-13)* | As a Forker, I want `basePath` computed automatically from the repo I actually deployed to, so forking (and renaming the fork) just works without editing `site.config.json`. | `vite.config.ts` derives `basePath` from GitHub Actions' `GITHUB_REPOSITORY` env var when present (`/repo-name/`, or `/` for a `<owner>.github.io` user/org page); falls back to `site.config.json.basePath` when that env var isn't set (local dev, non-GitHub-Actions builds). | Must | **Done** *(fixes a real fork failure — a fork renamed to `profile` 404'd on every asset because `basePath` still said `/mirai-launchpad/`; see epic-06 doc)* |
| ST-065 | As a Forker, I want optional custom-domain support via a `CNAME` file, so I can use my own domain if I want one. | `CNAME` absent by default; documented how to add it. | Could | Pending *(no `CNAME` file shipped, as intended — the "documented" half is a README task, Epic 10)* |
| ST-099 *(added in validation pass)* | As a Visitor who follows a dead/invalid link, I want a real in-app "page not found" view (distinct from the GitHub Pages 404.html redirect trick in ST-063), so a genuinely bad URL gets a helpful page instead of a blank screen. | A catch-all React Router route renders a styled Not Found page with a link back home. | Should | **Done** *(restyled to match the theme system — was a plain-text stub since Epic 1)* |

## Epic 7 — Fork & Setup Workflow

> **Superseded 2026-09-13**: the entire epic is dropped in favor of Epic 13's local JSON editor — once that exists, a forker configures `site.config.json`/`personal.json`/`socials.json` by editing fields directly instead of answering CLI prompts that write the same files. **Real consequence, not a wash**: the CLI would have *computed* `basePath` (from the entered repo name) and `package.json`'s `homepage` (from username + repo name) for you. Without it, a forker must construct `basePath: "/<repo-name>/"` and `homepage: "https://<username>.github.io/<repo-name>/"` by hand. This needs to be spelled out explicitly (with a worked example) in the README/Maintainer Guide (Epic 10) to not just quietly become a harder fork experience.

| ID | User Story | Acceptance Criteria | Priority | Status |
|---|---|---|---|---|
| ST-066 | As a Forker, I want an interactive `npm run setup` CLI, so I can enter my details once instead of hand-editing multiple JSON files. | Script prompts for site title, name/title/tagline, **GitHub username**, repo name, email, socials, default theme. | Must | **Should not be implemented** — see epic note above |
| ST-067 | As a Forker, I want the setup script to write my answers into `site.config.json` (including a `basePath` computed from my repo name)/`personal.json`/`socials.json`, so my inputs take effect immediately. | Files updated correctly after running the script; `basePath` matches the entered repo name. | Must | **Should not be implemented** — see epic note above |
| ST-068 | As a Forker, I want the setup script to update `package.json` `name`/`homepage` (`homepage` built from my GitHub username + repo name, e.g. `https://<username>.github.io/<repo>/`), so packaging metadata and the live-URL link in README are correct. | Fields updated to match provided username/repo/site info. | Should | **Should not be implemented** — see epic note above |
| ST-069 | As a Forker, I want the setup script to be safely re-runnable, so I can correct earlier answers without corrupting my data. | Running it twice doesn't duplicate/corrupt entries; existing values shown as defaults. | Should | **Should not be implemented** *(moot once ST-066/067/068 are also dropped — nothing left to re-run)* |

## Epic 8 — CI/CD & Deployment

> Kept intentionally: GitHub Pages only auto-builds plain Jekyll sites, not a Vite/React app — a build step (here, GitHub Actions) is still required for anything to deploy. Considered deleting this epic on 2026-09-09; decision was to keep it.

| ID | User Story | Acceptance Criteria | Priority | Status |
|---|---|---|---|---|
| ST-070 | As a Forker, I want a GitHub Actions workflow that builds and deploys to GitHub Pages on push to `main`, so publishing is automatic. | `.github/workflows/deploy.yml` runs `npm ci && npm run build` then deploys `dist/` via `actions/upload-pages-artifact` + `actions/deploy-pages`. | Must | **Done** *(`working-directory: website` throughout, since the app isn't at repo root; `cache-dependency-path` points at `website/package-lock.json` so npm's dependency cache actually works; artifact path is `website/dist`)* |
| ST-071 | As a Forker, I want pull requests to run a build + test CI check, so broken content/config or a failed attribution test (ST-092) is caught before merge. | PR workflow runs `npm run build` and `npm test` without deploying; fails PR on either error. | Should | **Done** *(`.github/workflows/pr-checks.yml`; same `website/` path handling as the deploy workflow; no `pages`/`id-token` permissions requested since it never deploys)* |
| ST-072 | As a Forker, I want the deploy workflow to require no committed build artifacts, so `dist/`, `gh-pages` branch, etc. never need manual upkeep. | No build output committed to the repo; verified `.gitignore` excludes `dist/`. | Must | **Done** *(already true since Epic 1 — verified `git ls-files` finds nothing under `website/dist/`)* |
| ST-073 | As a Maintainer, I want the legacy empty `docs/` build-folder usage removed/clarified now that it holds planning docs instead, so there's no confusion about which deploy method is active. | README/workflow make clear `docs/` is documentation-only, not a Pages source. | Should | **Done** *(`docs/README.md` added now; the workflow itself never references `docs/` at all, so there's no ambiguity to begin with — the top-level project README, Epic 10, should still restate this for anyone who hasn't found `docs/README.md`)* |

## Epic 9 — Non-Functional Requirements

| ID | User Story | Acceptance Criteria | Priority | Status |
|---|---|---|---|---|
| ST-074 | As a Visitor on any device, I want a responsive layout, so the site is usable on mobile, tablet, and desktop. | Verified at standard breakpoints with no broken/overflowing layout. | Must | Pending |
| ST-075 | As a Visitor with motion sensitivity, I want animations reduced/disabled when `prefers-reduced-motion` is set, so the site doesn't cause discomfort. | All Framer Motion animations check and respect the media query. | Must | Pending |
| ST-076 | As a Visitor, I want images lazy-loaded and appropriately sized, so pages load quickly. | `loading="lazy"` (or equivalent) applied; images sized for their display context. | Should | Pending |
| ST-077 | As a Maintainer, I want the built site to score ≥90 on Lighthouse performance, so visitors get a fast experience. | Verified on the production build. | Should | Pending |
| ST-078 | As a Maintainer, I want SEO meta tags/OpenGraph tags driven by `site.config.json.seo`, so link previews and search results look correct. | Title/description/og:image render per route via `react-helmet-async`. | Should | Pending |
| ST-079 | As a Maintainer, I want a generated `sitemap.xml`, so search engines can discover all pages. | Generated at build time, includes all routes. | Could | Pending |
| ST-080 | As a Maintainer, I want a `robots.txt`, so crawler behavior is explicit. | Included in build output. | Could | Pending |
| ST-081 | As a Visitor, I want a print-friendly Resume view, so I can print or export it cleanly. | Dedicated print stylesheet (or print-optimized view) produces a clean printed page. | Should | Pending |
| ST-082 | As a Forker, I want a fresh clone with only placeholder data to build and deploy with zero errors, and no *personal* data hardcoded outside `src/data`/`content`, so forking is safe and reliable. | Clean clone → setup skipped → `npm run build` succeeds; grep confirms no PII outside those directories. (The OjasaMirai badge, Epic 11, is an intentional, documented exception — it's institutional attribution, not personal data, and is deliberately hardcoded outside `src/data`.) | Must | Pending |
| ST-101 *(added after questionnaire)* | As a Maintainer, I want an optional GA4 page-view tracking snippet driven by `site.config.json.analytics` (provider + measurement ID), so I can see visit counts without adding any other tracking. | Snippet loads only when a measurement ID is configured; tracks page views only, no events/e-commerce. | Should | Pending |
| ST-102 *(added after questionnaire)* | As a Forker, I want the in-app Customize page (Epic 12) to document how to get and set a GA4 measurement ID, so enabling analytics doesn't require reading external docs. | Customize page content includes a short GA4 setup walkthrough. | Should | Pending |

## Epic 10 — Documentation Deliverables

| ID | User Story | Acceptance Criteria | Priority | Status |
|---|---|---|---|---|
| ST-083 | As a Forker, I want a `README.md` covering fork/setup/customize/deploy steps, so I can get a working site without asking anyone. | Covers all steps in requirements §8, plus adding a theme and toggling sections. | Must | Pending |
| ST-084 | As a Maintainer, I want a `MAINTAINER-GUIDE.md` delivered after implementation, so I know how to update data, add a blog post, add a theme, toggle sections, and add a new component. | Matches scope in requirements §11; written against the app as actually built. | Must | Pending |
| ST-085 | As a Forker, I want an MIT `LICENSE` file, so reuse/modification rights are explicit. | `LICENSE` file present at repo root. | Must | Pending |
| ST-086 | As a stakeholder, I want the requirements captured in `docs/requirements.md`. | File present and current. | Must | **Done** |
| ST-087 | As a stakeholder, I want open assumptions captured in `docs/assumptions.md`. | File present and current. | Must | **Done** |
| ST-088 | As a stakeholder, I want the full delivery backlog captured in `docs/stories.md`. | This file. | Must | **Done** |

## Epic 11 — Sponsor Attribution (OjasaMirai)

See requirements.md §13. Intentionally outside the normal fork-customization path.

| ID | User Story | Acceptance Criteria | Priority | Status |
|---|---|---|---|---|
| ST-089 | As the Publisher, I want a permanent footer badge promoting OjasaMirai (logo + tagline + link), so every fork carries attribution to the training institute by default. | Footer renders `https://images.ojasamirai.com/ojasa/common/logo.png`, tagline "Trained at OjasaMirai — training industry-ready professionals", and a link to `https://ojasamirai.com` (`target="_blank" rel="noopener noreferrer"`) on every page. | Must | **Done** |
| ST-090 | As the Publisher, I want the badge hardcoded into the core `Footer` component rather than sourced from any `src/data/*.json` file, so it isn't exposed on the normal content-editing path a forker uses. | Badge markup/content lives directly in the component; no `site.config.json`/other JSON field controls or disables it. | Must | **Done** *(logo/URL/tagline are inline constants in `Footer.tsx`, not read from any `src/data/*.json` file)* |
| ST-091 | As a Visitor, I want the badge to visually adapt to whichever of the 4 themes is active, so it reads as a native part of the design rather than a bolted-on ad. | Badge uses the active theme's CSS-variable tokens (colors/radius/font); verified across all 4 themes. | Must | **Done** *(uses `text-muted-foreground`/`hover:text-foreground`, same theme tokens as the rest of the footer; the logo image itself is a fixed brand asset and doesn't recolor — only its surrounding text/context adapts, which is the correct read of "native part of the design" for a third-party logo. Verified visually across all 4 themes via Playwright screenshots.)* |
| ST-092 | As the Publisher, I want an automated test that fails the build if the badge's logo, link, or text is removed or altered, so casual removal is caught by CI, not silently shipped. | A Vitest + React Testing Library test asserts the exact logo `src`, link `href`, and link text render in `Footer`; wired into the PR build-check workflow (Epic 8) and must pass for CI to go green. | Must | **Done** *(`Footer.attribution.test.tsx`, kept in its own file so it's unmistakably the CI-gate test; already covered by `pr-checks.yml` since that runs the whole `npm test` suite — no separate workflow wiring needed)* |
| ST-093 | As a Forker, I want the README/Maintainer Guide to explicitly explain the OjasaMirai badge and that it's CI-enforced, so I understand it upfront rather than hitting a surprise failed build. | README and `MAINTAINER-GUIDE.md` each contain a short, clearly-labeled section on this badge and why it's protected. | Must | Pending *(blocked on Epic 10 — neither document exists yet; revisit when Epic 10 is built)* |

## Epic 12 — In-App Customize Guide Page

See requirements.md §14. Unlike the OjasaMirai badge, this is fully forker-controlled and meant to be turned off.

> **Superseded 2026-09-13**: after building this, the decision was made to repurpose the `/customize` route entirely — instead of a static text guide, it now hosts the Epic 13/14 local dev tools (JSON content editor, blog post editor). The guide-content implementation (ST-095) was removed; ST-094/096/097's route/nav mechanics were kept and repointed at the new page content, since those mechanics are unaffected by what the page contains. See Epic 13/14 for what replaced it.

| ID | User Story | Acceptance Criteria | Priority | Status |
|---|---|---|---|---|
| ST-094 | As a Forker, I want an in-app "Customize" page reachable at a real route (e.g. `/customize`) and linked from the main header nav, so I get oriented on how to personalize the site without leaving the browser or reading the README first. | Page renders at its route with the same layout/theme system as other pages; linked from the main nav (not just footer) when enabled. | Must | **Should not be implemented** *(the route/nav mechanics survive, repointed at Epic 13/14's dev-tools hub instead — see note above)* |
| ST-095 | As a Forker, I want the Customize page to explain which JSON file to edit per section, how to add a blog post, how to add/register a theme, how to toggle sections via `site.config.json.navigation`, how to run `npm run setup`, and how to configure GA4 analytics (ST-102), so I have one place that covers the essentials. | Page content covers all six items listed. | Must | **Should not be implemented** *(the text-guide concept itself is superseded — replaced by interactive dev tools rather than documentation; code removed)* |
| ST-096 | As a Forker, I want to hide the Customize page's nav/footer link via a `site.config.json.showCustomizeGuide` flag, so I can stop advertising it once I'm done customizing and ready to share the live link. | Setting the flag to `false` removes the nav/footer link; the `/customize` route itself still works if visited directly (not a 404) — it's just no longer advertised. | Must | **Should not be implemented** *(mechanically still true of the repointed page, but this is now a secondary property of Epic 13/14, not a standalone deliverable)* |
| ST-097 | As a Forker on a fresh clone, I want `showCustomizeGuide` to default to `true`, so the guide is visible out of the box without extra setup. | Default value in shipped `site.config.json` is `true`. | Must | **Done** *(set since Epic 2)* |

## Epic 13 — Local Development Content Editor

*(added 2026-09-13, not in the original requirements.md)* A convenience tool for editing `src/data/*.json` content while running `npm run dev` locally — **not** a CMS for the deployed site. requirements.md §12 explicitly puts a "CMS / admin UI for editing content" out of scope for v1, since the deployed site is static (GitHub Pages, no backend) and has nothing to persist a save to. This epic doesn't reopen that decision: the editor only exists inside the local dev server process, is unreachable in the production build, and edits the same JSON files a forker would otherwise hand-edit — it's a nicer way to do the thing already in scope, not a new deployed feature.

Scope is deliberately narrow (raw JSON text per file, not a per-field form for each of the 12 different data shapes) to keep this a small, low-risk addition rather than a second content-modeling effort.

| ID | User Story | Acceptance Criteria | Priority | Status |
|---|---|---|---|---|
| ST-105 | As a Maintainer, I want a local-only content editor screen, so I can edit JSON content files without leaving the browser or hand-editing files in an external editor. | A route (e.g. `/dev/content`) lists every editable file under `src/data/*.json`. | Must | Pending |
| ST-106 | As a Maintainer, I want to select a content file and see/edit its raw JSON in one place, so I don't have to hunt for it in the file tree. | Selecting a file loads its current on-disk contents into a text editor; switching files preserves unsaved-change warnings. | Must | Pending |
| ST-107 | As a Maintainer, I want my edits validated against that file's existing zod schema before saving, so I can't save something the app will fail to load. | Save re-uses the same schema each `src/lib/content/*.ts` loader already validates against; validation errors are shown inline and block the save. | Must | Pending |
| ST-108 | As a Maintainer, I want a valid save to write back to the real file on disk, so the change takes effect without a manual copy-paste. | A small Vite dev-server middleware (registered via `configureServer`, not shipped in the build) accepts the edited JSON and writes it to `src/data/<file>.json`, pretty-printed. | Must | Pending |
| ST-109 | As a Maintainer, I want this editor completely absent from the production build and deployed site, so it never becomes a security surface or an accidental "CMS" contradicting requirements.md §12. | The route only renders when `import.meta.env.DEV` is true; the write-back middleware is only ever registered on the dev server, never present in `dist/`. | Must | Pending |
| ST-110 | As a Maintainer, I want clear success/error feedback after saving, so I know whether my change actually took effect. | UI shows a distinct success state and a distinct error state (validation failure or write failure). | Should | Pending |
| ST-111 *(added 2026-09-13)* | As a Maintainer, I want the `/customize` route repurposed as a dev-tools hub with a button per tool (JSON editor, blog editor from Epic 14, and room for more later), so I have one obvious place to find them. | `/customize` shows a card/button per tool; a tool with no route yet (or not epic-13/14-complete) shows a disabled "Coming soon" state instead of a dead link. A prominent, always-visible notice states these tools only work locally (`npm run dev`) and are unavailable on the deployed site — not a small-print footnote. Outside a dev build (`import.meta.env.DEV` false), every tool button is disabled regardless of whether its route exists. | Must | Pending |

Full acceptance criteria: this table. Explicitly out of scope for this epic: editing `content/blog/*.md` (different structure/parsing pipeline — see Epic 14).

## Epic 14 — Local Development Blog Editor

*(added 2026-09-13)* Epic 13's counterpart for `content/blog/*.md`, launched from the same `/customize` dev-tools hub (ST-111). Kept as its own epic rather than folded into Epic 13, since blog posts differ from the fixed `src/data/*.json` files in a way that matters for the UI: they're user-named files (`YYYY-MM-DD-slug.md`), so this needs a "create new post" flow, not just "pick from a fixed list."

| ID | User Story | Acceptance Criteria | Priority | Status |
|---|---|---|---|---|
| ST-112 | As a Maintainer, I want a local-only blog editor screen, so I can write and edit posts without hand-editing Markdown files in an external editor. | A route (e.g. `/dev/blog`) lists every file under `content/blog/*.md`, reachable via the `/customize` hub (ST-111). | Must | Pending |
| ST-113 | As a Maintainer, I want to create a new post by entering a title, so I don't have to hand-construct the filename/frontmatter. | A "New post" action asks for a title, derives a `YYYY-MM-DD-slug.md` filename from it (today's date + a slugified title), and opens it pre-filled with the required frontmatter fields (`title`, `date`, `tags`, `excerpt`) plus an empty body. | Must | Pending |
| ST-114 | As a Maintainer, I want to edit an existing post's frontmatter and body in one place, so I can revise a post without juggling two mental models of the file. | Selecting a post loads its full raw content (frontmatter + body) into a single text editor, consistent with Epic 13's raw-text approach. | Must | Pending |
| ST-115 | As a Maintainer, I want my frontmatter validated before saving, so I can't save a post the blog list/detail pages will fail to parse. | Save parses the frontmatter block with the same logic `vite-plugin-blog-posts.ts`/`blog.ts` already use and validates it against the existing frontmatter zod schema; errors are shown inline and block the save. | Must | Pending |
| ST-116 | As a Maintainer, I want a valid save to write the file to `content/blog/`, so new/edited posts appear on the site immediately. | Reuses (or extends) Epic 13's dev-server write-back middleware for this directory; a genuinely new post creates the file, an edit overwrites it. | Must | Pending |
| ST-117 | As a Maintainer, I want this editor completely absent from the production build and deployed site, so it's never reachable outside local development. | Same guarantee as ST-109: route gated on `import.meta.env.DEV`, middleware only ever registered on the dev server. | Must | Pending |

Full acceptance criteria: this table.
