import { z } from 'zod'
import { validateData } from '@/lib/validate-data'
import raw from '@/data/socials.json'

const socialSchema = z.object({
  platform: z.string(),
  url: z.string().url(),
  icon: z.string(),
})

export type Social = z.infer<typeof socialSchema>

export const socialsFileSchema = z.array(socialSchema)

export const socials: Social[] = validateData(socialsFileSchema, raw, 'src/data/socials.json')
