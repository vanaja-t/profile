import { z } from 'zod'
import { validateData } from '@/lib/validate-data'
import raw from '@/data/skills.json'

const skillItemSchema = z.object({
  name: z.string(),
  proficiency: z.number().min(1).max(5),
})

const skillCategorySchema = z.object({
  category: z.string(),
  items: z.array(skillItemSchema),
})

export type SkillItem = z.infer<typeof skillItemSchema>
export type SkillCategory = z.infer<typeof skillCategorySchema>

export const skillsFileSchema = z.array(skillCategorySchema)

export const skills: SkillCategory[] = validateData(skillsFileSchema, raw, 'src/data/skills.json')
