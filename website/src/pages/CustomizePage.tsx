import { Braces, FileText, Sparkles, TriangleAlert, type LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PageTransition } from '@/components/motion/PageTransition'
import { SetupGuideDialog } from '@/components/SetupGuideDialog'
import { PublishGuideDialog } from '@/components/PublishGuideDialog'
import { cn } from '@/lib/utils'

interface DevTool {
  title: string
  description: string
  icon: LucideIcon
  href?: string
  implemented: boolean
}

const tools: DevTool[] = [
  {
    title: 'JSON Content Editor',
    description: 'Edit src/data/*.json files, with schema validation before every save.',
    icon: Braces,
    href: '/dev/content',
    implemented: true, // Epic 13
  },
  {
    title: 'Blog Post Editor',
    description: 'Create and edit posts under content/blog/, frontmatter included.',
    icon: FileText,
    href: '/dev/blog',
    implemented: true, // Epic 14
  },
  {
    title: 'More tools',
    description: 'Additional local dev tools land here over time.',
    icon: Sparkles,
    implemented: false,
  },
]

/**
 * Dev-tools hub (ST-111) — what used to be a static "how to customize"
 * guide (Epic 12, superseded) is now the launch point for local-only
 * editing tools (Epic 13/14). This page itself still renders on the
 * deployed site (same as Epic 12 did), but every tool button is disabled
 * there — only `npm run dev` locally can actually use them.
 */
export function CustomizePage() {
  const isLocalDev = import.meta.env.DEV

  return (
    <PageTransition>
      <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-16">
        <div className="flex flex-col gap-2">
          <h1 className="font-heading text-3xl font-bold text-foreground">Developer Tools</h1>
          <p className="text-muted-foreground">
            Local-only tools for editing this site&rsquo;s content — nothing here touches the
            deployed site.
          </p>
          <div className="flex flex-wrap gap-4">
            <SetupGuideDialog />
            <PublishGuideDialog />
          </div>
        </div>

        <div
          role="alert"
          className="flex items-start gap-3 rounded-[var(--radius)] border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          <TriangleAlert className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <p>
            These tools only work while running <code>npm run dev</code> on your own machine.{' '}
            {isLocalDev
              ? "You're running locally right now, so they're active below."
              : "You're viewing a deployed build, so every tool below is disabled."}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {tools.map((tool) => {
            const available = isLocalDev && tool.implemented
            return (
              <Card key={tool.title} className={cn(!available && 'opacity-60')}>
                <CardHeader>
                  <tool.icon className="size-6 text-muted-foreground" aria-hidden="true" />
                  <CardTitle className="text-base">{tool.title}</CardTitle>
                  <CardDescription>{tool.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  {available && tool.href ? (
                    <Button size="sm" asChild>
                      <Link to={tool.href}>Open</Link>
                    </Button>
                  ) : (
                    <Button size="sm" disabled>
                      {tool.implemented ? 'Unavailable here' : 'Coming soon'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </PageTransition>
  )
}
