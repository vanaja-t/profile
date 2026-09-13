import { z } from 'zod'
import { validateData } from '@/lib/validate-data'
import raw from '@/data/certifications.json'

const certificationSchema = z.object({
  id: z.string(),
  name: z.string(),
  issuer: z.string(),
  date: z.string(),
  credentialUrl: z.string().url().optional(),
})

export type Certification = z.infer<typeof certificationSchema>

export const certificationsFileSchema = z.array(certificationSchema)

export const certifications: Certification[] = validateData(
  certificationsFileSchema,
  raw,
  'src/data/certifications.json',
)
