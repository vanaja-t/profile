import { z } from 'zod'
import { validateData } from '@/lib/validate-data'
import raw from '@/data/site.config.json'

// Deliberately a plain string, not a hardcoded enum of the 4 shipped themes:
// the set of *valid* theme ids is owned by the theme registry
// (`src/themes/index.ts`), so a forker can add a 5th theme purely by adding
// a token file + a config entry here, with no schema change (ST-035).
const themeIdSchema = z.string()

const navItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  enabled: z.boolean(),
  order: z.number(),
})

const siteConfigSchema = z.object({
  siteTitle: z.string(),
  tagline: z.string(),
  basePath: z.string(),
  defaultTheme: themeIdSchema,
  availableThemes: z.array(themeIdSchema),
  favicon: z.string(),
  seo: z.object({
    description: z.string(),
    ogImage: z.string(),
  }),
  navigation: z.array(navItemSchema),
  contactForm: z
    .object({
      provider: z.literal('formspree'),
      endpoint: z.string().url(),
    })
    .optional(),
  analytics: z
    .object({
      provider: z.literal('ga4'),
      measurementId: z.string(),
    })
    .optional(),
  showCustomizeGuide: z.boolean(),
})

export type SiteConfig = z.infer<typeof siteConfigSchema>

const parsedConfig = validateData(siteConfigSchema, raw, 'src/data/site.config.json')

// __BASE_PATH__ (vite.config.ts) overrides the JSON file's basePath when
// resolved from GitHub Actions' GITHUB_REPOSITORY env var — see
// resolveBasePath() there for why: it's what makes a renamed fork deploy
// correctly without hand-editing this file.
export const siteConfig: SiteConfig = {
  ...parsedConfig,
  basePath: __BASE_PATH__,
}
