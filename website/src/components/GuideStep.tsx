import type { ReactNode } from 'react'

/** Shared building blocks for the /customize guide dialogs (SetupGuideDialog, PublishGuideDialog). */
export function Code({ children }: { children: string }) {
  return (
    <code className="rounded-[calc(var(--radius)-0.25rem)] bg-muted px-1 py-0.5 font-mono text-xs text-foreground">
      {children}
    </code>
  )
}

export function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
        {n}
      </span>
      <div className="flex flex-col gap-1 pt-0.5">
        <p className="font-medium text-foreground">{title}</p>
        <div className="text-sm text-muted-foreground [&_code]:mx-0.5">{children}</div>
      </div>
    </li>
  )
}
