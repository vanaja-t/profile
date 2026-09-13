# Epic 11 — Sponsor Attribution (OjasaMirai)

**Goal**: every fork carries OjasaMirai attribution by default, outside the normal customization path.

## Locked decisions
- **Tagline (final, CI-tested, verbatim)**: `"Trained at OjasaMirai — training industry-ready professionals"`.
- Logo: `https://images.ojasamirai.com/ojasa/common/logo.png`. Link: `https://ojasamirai.com` (`target="_blank" rel="noopener noreferrer"`).
- **Visual weight**: compact — logo + tagline inline, single line, in the footer.
- Styling adapts to the active theme (uses theme CSS-variable tokens).
- Hardcoded in the `Footer` component — not in any `src/data/*.json`.
- Enforced by a Vitest + React Testing Library test asserting the exact logo `src`, link `href`, and link text; wired into the PR workflow (Epic 8, ST-071) so a failing check blocks merge.
- README/Maintainer Guide disclose this badge and its CI enforcement upfront.

## Stories
| ID | Story | Priority |
|---|---|---|
| ST-089 | Footer badge (logo + tagline + link) | Must |
| ST-090 | Hardcoded in `Footer`, not data-driven | Must |
| ST-091 | Adapts per active theme | Must |
| ST-092 | CI test enforces presence/exact content | Must |
| ST-093 | Documented in README/Maintainer Guide | Must |

Full acceptance criteria: `docs/stories.md` Epic 11.

## Status

Implemented in `Footer.tsx` as three inline constants (logo src, OjasaMirai URL, tagline) rendered as one compact `<a>` (logo + tagline inline) — never touching `src/data/*.json`, so there's no config path that disables or edits it (ST-090). Styling reuses `text-muted-foreground`/`hover:text-foreground`, the same theme tokens the rest of the footer uses, so it re-colors correctly across all 4 themes automatically — verified visually via Playwright screenshots of all 4, not just asserted.

`Footer.attribution.test.tsx` is a dedicated test file (kept separate from the general `Footer.test.tsx`) asserting the exact logo `src`, link `href`/`target`/`rel`, and the exact tagline text — a comment at the top of both `Footer.tsx` and the test file cross-references the other, so anyone editing one is pointed at the other. No new CI wiring was needed for ST-092: `pr-checks.yml` (Epic 8) already runs the full `npm test` suite, so this test is already a merge-blocking check.

**ST-093 (README/Maintainer Guide disclosure) is blocked on Epic 10** — neither document exists yet. Revisit this story specifically when Epic 10 is built; don't let Epic 10 ship without it, since an undisclosed CI-enforced badge is exactly the "surprise failed build" ST-093 exists to prevent.
