import { z } from 'zod'
import { validateData } from '@/lib/validate-data'
import raw from '@/data/awards.json'

const awardSchema = z.object({
  id: z.string(),
  name: z.string(),
  issuer: z.string(),
  date: z.string(),
  description: z.string().optional(),
})

export type Award = z.infer<typeof awardSchema>

export const awardsFileSchema = z.array(awardSchema)

export const awards: Award[] = validateData(awardsFileSchema, raw, 'src/data/awards.json')
