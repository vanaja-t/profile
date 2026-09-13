import { z } from 'zod'
import { validateData } from '@/lib/validate-data'
import { withBase } from '@/lib/base-path'
import raw from '@/data/gallery.json'

const galleryEntrySchema = z.object({
  id: z.string(),
  title: z.string(),
  imageFile: z.string(),
})

export type GalleryEntry = z.infer<typeof galleryEntrySchema>

export const galleryFileSchema = z.array(galleryEntrySchema)

export const gallery: GalleryEntry[] = validateData(galleryFileSchema, raw, 'src/data/gallery.json')

/** Base-aware URL for a gallery image (files live under `public/gallery/`). */
export function galleryImageSrc(imageFile: string): string {
  return withBase(`/gallery/${imageFile}`)
}
