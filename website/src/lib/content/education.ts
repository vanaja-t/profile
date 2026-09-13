import { z } from 'zod'
import { validateData } from '@/lib/validate-data'
import raw from '@/data/education.json'

const educationEntrySchema = z.object({
  id: z.string(),
  institution: z.string(),
  degree: z.string(),
  field: z.string(),
  startDate: z.string().optional(),
  endDate: z.string(),
})

export type EducationEntry = z.infer<typeof educationEntrySchema>

export const educationFileSchema = z.array(educationEntrySchema)

export const education: EducationEntry[] = validateData(
  educationFileSchema,
  raw,
  'src/data/education.json',
)
