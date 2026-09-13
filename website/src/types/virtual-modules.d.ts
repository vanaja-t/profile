declare module 'virtual:blog-posts' {
  interface RawBlogPost {
    slug: string
    data: Record<string, unknown>
    content: string
  }

  const posts: RawBlogPost[]
  export default posts
}

declare module 'virtual:dev-routes' {
  import type { ComponentType } from 'react'

  interface DevRoute {
    path: string
    Component: ComponentType
  }

  export const devRoutes: DevRoute[]
}
