import { z } from 'zod'
import { validateData } from '@/lib/validate-data'
import raw from '@/data/testimonials.json'

const testimonialSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.string(),
  company: z.string(),
  quote: z.string(),
  avatar: z.string(),
})

export type Testimonial = z.infer<typeof testimonialSchema>

export const testimonialsFileSchema = z.array(testimonialSchema)

export const testimonials: Testimonial[] = validateData(
  testimonialsFileSchema,
  raw,
  'src/data/testimonials.json',
)
