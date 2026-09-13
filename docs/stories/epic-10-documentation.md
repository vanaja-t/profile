# Epic 10 — Documentation Deliverables

**Goal**: a forker (or future maintainer) never has to ask a person how this works.

## Locked decisions
- `LICENSE`: MIT, copyright line **"Copyright (c) 2026 OjasaMirai"**.
- **`README.md`/`MAINTAINER-GUIDE.md` — revised 2026-09-13, before either was written**: dropped in favor of an in-app "Setup your profile" dialog (`SetupGuideDialog`, ST-083) opened from `/customize` — the same page a forker already lands on for Epic 13/14's dev tools. Reasoning: a static file describing "edit `experience.json`" or "run the JSON editor" would immediately drift from, and duplicate, what Epic 13/14 already do interactively; a modal on the same page that links straight into `/dev/content` and `/dev/blog` reaches the same audience with less to keep in sync. `MAINTAINER-GUIDE.md` (ST-084) is dropped outright for the same reason, not just merged in — everything it would have covered except "add a wholly new component," which no doc substitutes well for, is already covered by the setup dialog or the dev tools themselves.
  - ~~Original decision, superseded before implementation began~~: a `README.md` covering fork/setup/customize/deploy, and a separately-delivered `MAINTAINER-GUIDE.md` written after implementation. Kept here for the record; neither file was ever created.

## Stories
| ID | Story | Priority | Status |
|---|---|---|---|
| ST-083 | ~~README.md~~ In-app setup guide dialog | Must | Done |
| ST-084 | ~~MAINTAINER-GUIDE.md (post-implementation)~~ | Must | Not needed |
| ST-085 | LICENSE (MIT, OjasaMirai copyright) | Must | Done |
| ST-086 | requirements.md | Must | Done |
| ST-087 | assumptions.md | Must | Done |
| ST-088 | stories.md | Must | Done |

Full acceptance criteria: `docs/stories.md` Epic 10.

## Status

`LICENSE` is a standard MIT file at the repo root with the locked copyright line.

`ST-083` shipped as `src/components/SetupGuideDialog.tsx`, a shadcn `Dialog` opened by a "Setup your profile" link on `CustomizePage.tsx` (`/customize`) — visible on both the deployed site and locally, unlike the dev tools themselves. Nine numbered steps, each real HTML rather than a markdown render: forking/renaming the repo (calling out that `basePath` is auto-computed regardless of the repo's name — ST-118 — so renaming is safe), setting identity and adding content (each linking directly to `/dev/content` or `/dev/blog` rather than describing the file paths in prose), setting up the Formspree contact form (an external link to formspree.io, plus what leaving `contactForm` unset does), picking or registering a theme, toggling sections via `navigation`, local preview, deploying, and a final note on the OjasaMirai footer badge — carrying forward what ST-093 would have put in a README.

`ST-084` (Maintainer Guide) was dropped rather than built: everything in its intended scope (updating data, adding a blog post, adding a theme, toggling sections) is covered by the setup dialog or by Epic 13/14's interactive editors directly; the one item unique to it, "adding a wholly new component/section," isn't something a static doc does well for a codebase this size. `ST-093` (README/Maintainer Guide explaining the badge) is consequently invalidated as written — both named documents are gone — but its intent is preserved in the setup dialog's last step.

Test coverage: `SetupGuideDialog.test.tsx` (opens on trigger click, links resolve to `/dev/content`/`/dev/blog`/formspree.io) and `CustomizePage.test.tsx` (trigger is present on the hub page). Verified visually via Playwright: dialog renders correctly in the active theme, scrolls to show all nine steps, zero console errors.
