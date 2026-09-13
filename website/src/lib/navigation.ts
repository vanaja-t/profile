import { BookOpen, FileText, FolderKanban, Home, Settings2, Sparkles } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { siteConfig } from '@/lib/content/site-config'

/**
 * Maps each `site.config.json.navigation` entry id to its route and icon.
 * The forker-editable part of nav (label/enabled/order) lives in config
 * (ST-037); the route/icon are presentation details for this fixed site IA,
 * not something a fork is expected to repoint.
 */
const NAV_ROUTES: Record<string, { path: string; icon: LucideIcon }> = {
  home: { path: '/', icon: Home },
  resume: { path: '/resume', icon: FileText },
  projects: { path: '/projects', icon: FolderKanban },
  others: { path: '/others', icon: Sparkles },
  blog: { path: '/blog', icon: BookOpen },
}

export interface NavLinkItem {
  id: string
  label: string
  path: string
  icon: LucideIcon
}

/** Enabled nav items from config, sorted by `order`, resolved to real routes. */
export function getPrimaryNavItems(): NavLinkItem[] {
  return siteConfig.navigation
    .filter((item) => item.enabled && item.id in NAV_ROUTES)
    .sort((a, b) => a.order - b.order)
    .map((item) => ({
      id: item.id,
      label: item.label,
      path: NAV_ROUTES[item.id].path,
      icon: NAV_ROUTES[item.id].icon,
    }))
}

export const CUSTOMIZE_NAV_ITEM: NavLinkItem = {
  id: 'customize',
  label: 'Customize',
  path: '/customize',
  icon: Settings2,
}
