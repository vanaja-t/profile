import { z } from 'zod'
import { validateData } from '@/lib/validate-data'
import raw from '@/data/personal.json'

export const personalSchema = z.object({
  name: z.string(),
  title: z.string(),
  tagline: z.string(),
  location: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  avatarUrl: z.string(),
  bio: z.string(),
  resumePdfUrl: z.string().optional(),
})

export type Personal = z.infer<typeof personalSchema>

export const personal: Personal = validateData(personalSchema, raw, 'src/data/personal.json')
