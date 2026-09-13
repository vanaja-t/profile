import { z } from 'zod'
import { validateData } from '@/lib/validate-data'
import raw from '@/data/experience.json'

const experienceEntrySchema = z.object({
  id: z.string(),
  company: z.string(),
  role: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  highlights: z.array(z.string()),
})

export type ExperienceEntry = z.infer<typeof experienceEntrySchema>

export const experienceFileSchema = z.array(experienceEntrySchema)

const parsedExperience: ExperienceEntry[] = validateData(
  experienceFileSchema,
  raw,
  'src/data/experience.json',
)

// Most recent first (ST-045), regardless of entry order in the JSON file.
export const experience: ExperienceEntry[] = [...parsedExperience].sort(
  (a, b) => Number.parseInt(b.startDate, 10) - Number.parseInt(a.startDate, 10),
)
