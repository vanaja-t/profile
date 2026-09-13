import type { z } from 'zod'
import { siteConfigSchema } from './site-config'
import { personalSchema } from './personal'
import { experienceFileSchema } from './experience'
import { educationFileSchema } from './education'
import { skillsFileSchema } from './skills'
import { certificationsFileSchema } from './certifications'
import { awardsFileSchema } from './awards'
import { projectsFileSchema } from './projects'
import { hobbiesFileSchema } from './hobbies'
import { testimonialsFileSchema } from './testimonials'
import { socialsFileSchema } from './socials'
import { galleryFileSchema } from './gallery'

/**
 * Maps each editable `src/data/*.json` file to the exact schema its own
 * loader (`src/lib/content/*.ts`) already validates against (ST-107) — no
 * new schemas are defined here, just referenced. Only imported by the
 * dev-only content editor page, never by the main app.
 */
export const editableFileSchemas: Record<string, z.ZodType> = {
  'site.config.json': siteConfigSchema,
  'personal.json': personalSchema,
  'experience.json': experienceFileSchema,
  'education.json': educationFileSchema,
  'skills.json': skillsFileSchema,
  'certifications.json': certificationsFileSchema,
  'awards.json': awardsFileSchema,
  'projects.json': projectsFileSchema,
  'hobbies.json': hobbiesFileSchema,
  'testimonials.json': testimonialsFileSchema,
  'socials.json': socialsFileSchema,
  'gallery.json': galleryFileSchema,
}
