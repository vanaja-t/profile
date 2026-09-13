import { z } from 'zod'
import { validateData } from '@/lib/validate-data'
import rawPosts from 'virtual:blog-posts'

export const frontmatterSchema = z.object({
  title: z.string(),
  date: z.string(),
  tags: z.array(z.string()),
  excerpt: z.string(),
})

export interface BlogPost {
  slug: string
  title: string
  date: string
  tags: string[]
  excerpt: string
  content: string
}

// Frontmatter is already parsed at build/dev time by vite-plugin-blog-posts
// (Node-side, via gray-matter) — this file only validates the shape.
const posts: BlogPost[] = rawPosts.map(({ slug, data, content }) => {
  const frontmatter = validateData(frontmatterSchema, data, `content/blog/${slug}.md`)
  return { slug, ...frontmatter, content }
})

// Newest first (ST-054).
export const blogPosts: BlogPost[] = [...posts].sort(
  (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
)

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug)
}
