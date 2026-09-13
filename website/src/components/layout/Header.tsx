import { NavLink } from 'react-router-dom'
import { siteConfig } from '@/lib/content/site-config'
import { getPrimaryNavItems, CUSTOMIZE_NAV_ITEM } from '@/lib/navigation'
import { useScrolled } from '@/hooks/useScrolled'
import { ThemeSwitcher } from '@/components/ThemeSwitcher'
import { cn } from '@/lib/utils'

/**
 * Global header (ST-036): text wordmark + nav, condenses past a scroll
 * threshold (stays visible, doesn't hide). Hidden below the `sm` breakpoint,
 * where MobileTabBar (ST-038) takes over primary navigation.
 */
export function Header() {
  const scrolled = useScrolled()
  const navItems = getPrimaryNavItems()
  const items = siteConfig.showCustomizeGuide ? [...navItems, CUSTOMIZE_NAV_ITEM] : navItems

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div
        className={cn(
          'mx-auto flex max-w-5xl items-center justify-between px-4 transition-[padding] duration-200',
          scrolled ? 'py-2' : 'py-4',
        )}
      >
        <NavLink to="/" className="font-heading text-[12px] font-semibold text-foreground">
          {siteConfig.siteTitle}
        </NavLink>

        <nav aria-label="Primary" className="hidden items-center gap-6 sm:flex">
          {items.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                cn(
                  'text-sm font-medium transition-colors hover:text-foreground',
                  isActive ? 'text-foreground' : 'text-muted-foreground',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <ThemeSwitcher />
      </div>
    </header>
  )
}
