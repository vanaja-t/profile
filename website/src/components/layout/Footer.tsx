import { personal } from '@/lib/content/personal'
import { socials } from '@/lib/content/socials'
import { DynamicIcon } from '@/lib/icons'

// OjasaMirai sponsor attribution (Epic 11, requirements.md §13). Hardcoded
// here deliberately — NOT sourced from any src/data/*.json file (ST-090),
// so it isn't exposed on the normal content-editing path a forker uses.
// The exact logo src, link href, and tagline text are enforced by
// Footer.attribution.test.tsx, wired into the PR check workflow (ST-092) —
// removing/altering any of the three breaks that test, not just "looks
// different." See README/MAINTAINER-GUIDE.md for why this exists (ST-093).
const OJASAMIRAI_LOGO_SRC = 'https://images.ojasamirai.com/ojasa/common/logo.png'
const OJASAMIRAI_URL = 'https://ojasamirai.com'
const OJASAMIRAI_TAGLINE = 'Trained at OjasaMirai — training industry-ready professionals'

/**
 * Global footer (ST-039): social links + copyright + the OjasaMirai badge.
 * Every page renders this, plus a fixed MobileTabBar below `sm` — bottom
 * padding on <main> (see App.tsx) keeps the tab bar from covering footer
 * content there.
 */
export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-4 py-8 text-sm text-muted-foreground">
        <div className="flex gap-4">
          {socials.map((social) => (
            <a
              key={social.platform}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.platform}
              className="transition-colors hover:text-foreground"
            >
              <DynamicIcon name={social.icon} className="size-5" />
            </a>
          ))}
        </div>
        <p>
          &copy; {year} {personal.name}
        </p>
        <a
          href={OJASAMIRAI_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <img src={OJASAMIRAI_LOGO_SRC} alt="OjasaMirai" className="h-5 w-auto" />
          <span>{OJASAMIRAI_TAGLINE}</span>
        </a>
      </div>
    </footer>
  )
}
