import { z } from 'zod'
import { validateData } from '@/lib/validate-data'
import raw from '@/data/projects.json'

const projectSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  tech: z.array(z.string()),
  repoUrl: z.string().url().optional(),
  liveUrl: z.string().url().optional(),
  imageUrl: z.string().optional(),
  featured: z.boolean(),
})

export type Project = z.infer<typeof projectSchema>

export const projectsFileSchema = z.array(projectSchema)

const parsedProjects: Project[] = validateData(projectsFileSchema, raw, 'src/data/projects.json')

// Featured projects sort first, original order preserved otherwise (ST-052).
export const projects: Project[] = [...parsedProjects].sort(
  (a, b) => Number(b.featured) - Number(a.featured),
)

export function getProjectById(id: string): Project | undefined {
  return projects.find((project) => project.id === id)
}
