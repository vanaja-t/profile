import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { SchemaForm } from '@/components/SchemaForm'
import { PageTransition } from '@/components/motion/PageTransition'
import { validateData } from '@/lib/validate-data'
import { frontmatterSchema } from '@/lib/content/blog'
import { cn } from '@/lib/utils'

type SaveStatus = 'idle' | 'saving' | 'success' | 'error'

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init)
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null
    throw new Error(body?.error ?? `Request failed: ${response.status}`)
  }
  return response.json() as Promise<T>
}

function slugify(title: string): string {
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return slug || 'untitled'
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

/**
 * Local-only blog post editor (ST-112–ST-117, Epic 14). Frontmatter
 * (title/date/tags/excerpt) reuses Epic 13's SchemaForm, driven by the
 * same frontmatterSchema blog.ts already validates against; the Markdown
 * body is a plain textarea, not schema-driven — prose isn't something a
 * form can usefully split into fields.
 *
 * Frontmatter parsing/serialization (gray-matter) happens entirely on the
 * dev-server side (vite-plugin-blog-editor.ts) — this component only ever
 * sends/receives already-split `{ data, content }`. gray-matter depends on
 * Node's Buffer, which doesn't exist in a browser; calling it here would
 * crash even in dev (this page, unlike the middleware, DOES run in a real
 * browser during `npm run dev` — being excluded from the *production*
 * build via virtual:dev-routes doesn't help with that).
 *
 * Default export: loaded via the dev-only virtual:dev-routes module
 * (vite-plugin-dev-routes.ts), so it's excluded from the production
 * bundle entirely (ST-117).
 */
export default function BlogEditorPage() {
  const [posts, setPosts] = useState<string[]>([])
  const [selectedPost, setSelectedPost] = useState<string | null>(null)
  const [frontmatter, setFrontmatter] = useState<unknown>(null)
  const [body, setBody] = useState('')
  const [originalFrontmatter, setOriginalFrontmatter] = useState<unknown>(null)
  const [originalBody, setOriginalBody] = useState('')
  const [showNewPostForm, setShowNewPostForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [saveError, setSaveError] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  const isDirty =
    JSON.stringify(frontmatter) !== JSON.stringify(originalFrontmatter) || body !== originalBody

  // vite-plugin-blog-posts.ts (Epic 5) force-reloads the page whenever any
  // content/blog/*.md file changes, so the live Blog list/detail pages pick
  // up edits without a manual refresh. That's exactly what NOT to do while
  // this editor is open and its own save just wrote one of those files —
  // it would wipe the "Saved" message and any other unsaved field. Vite's
  // documented escape hatch: call preventDefault() on 'vite:beforeFullReload'.
  useEffect(() => {
    function preventReload(event: Event) {
      event.preventDefault()
    }
    window.addEventListener('vite:beforeFullReload', preventReload)
    return () => window.removeEventListener('vite:beforeFullReload', preventReload)
  }, [])

  useEffect(() => {
    fetchJson<{ posts: string[] }>('/__blog-editor/posts')
      .then((data) => setPosts(data.posts))
      .catch((error: unknown) =>
        setLoadError(error instanceof Error ? error.message : String(error)),
      )
  }, [])

  function loadPost(name: string) {
    fetchJson<{ data: unknown; content: string }>(
      `/__blog-editor/post?name=${encodeURIComponent(name)}`,
    )
      .then(({ data, content }) => {
        setSelectedPost(name)
        setFrontmatter(data)
        setBody(content)
        setOriginalFrontmatter(data)
        setOriginalBody(content)
        setValidationError(null)
        setSaveStatus('idle')
        setSaveError(null)
      })
      .catch((error: unknown) =>
        setLoadError(error instanceof Error ? error.message : String(error)),
      )
  }

  function selectPost(name: string) {
    if (isDirty && !window.confirm('Discard unsaved changes?')) return
    setShowNewPostForm(false)
    loadPost(name)
  }

  async function createPost() {
    const filename = `${todayIso()}-${slugify(newTitle)}.md`
    const initialFrontmatter = { title: newTitle, date: todayIso(), tags: [], excerpt: '' }
    const initialBody = 'Write your post here.\n'

    setSaveStatus('saving')
    try {
      await fetchJson('/__blog-editor/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: filename, data: initialFrontmatter, content: initialBody }),
      })
      setPosts((current) => [filename, ...current])
      setShowNewPostForm(false)
      setNewTitle('')
      setSaveStatus('idle')
      loadPost(filename)
    } catch (error) {
      setSaveStatus('error')
      setSaveError(error instanceof Error ? error.message : String(error))
    }
  }

  async function handleSave() {
    if (!selectedPost) return
    setValidationError(null)
    setSaveStatus('idle')
    setSaveError(null)

    let validatedFrontmatter: unknown
    try {
      validatedFrontmatter = validateData(frontmatterSchema, frontmatter, selectedPost)
    } catch (error) {
      setValidationError(error instanceof Error ? error.message : String(error))
      return
    }

    setSaveStatus('saving')
    try {
      await fetchJson('/__blog-editor/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: selectedPost, data: validatedFrontmatter, content: body }),
      })
      setFrontmatter(validatedFrontmatter)
      setOriginalFrontmatter(validatedFrontmatter)
      setOriginalBody(body)
      setSaveStatus('success')
    } catch (error) {
      setSaveStatus('error')
      setSaveError(error instanceof Error ? error.message : String(error))
    }
  }

  return (
    <PageTransition>
      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-16">
        <div className="flex flex-col gap-2">
          <Link to="/customize" className="text-sm text-muted-foreground hover:text-foreground">
            &larr; Back to Developer Tools
          </Link>
          <h1 className="font-heading text-3xl font-bold text-foreground">Blog Post Editor</h1>
          <p className="text-muted-foreground">
            Edits save directly to <code>content/blog/</code>. Local-only — this page does nothing
            on a deployed site.
          </p>
        </div>

        {loadError && (
          <p role="alert" className="text-sm text-destructive">
            {loadError}
          </p>
        )}

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Posts</span>
            {!showNewPostForm && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setShowNewPostForm(true)}
              >
                + New Post
              </Button>
            )}
          </div>

          <div className="flex flex-col gap-1 rounded-[var(--radius)] border border-border">
            {posts.map((post) => (
              <button
                key={post}
                type="button"
                onClick={() => selectPost(post)}
                className={cn(
                  'px-3 py-2 text-left text-sm hover:bg-muted',
                  post === selectedPost ? 'bg-muted text-foreground' : 'text-muted-foreground',
                )}
              >
                {post}
              </button>
            ))}
            {posts.length === 0 && (
              <p className="px-3 py-2 text-sm text-muted-foreground">No posts yet.</p>
            )}
          </div>

          {showNewPostForm && (
            <div className="flex flex-col gap-2 rounded-[var(--radius)] border border-border p-3">
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-foreground">New post title</span>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(event) => setNewTitle(event.target.value)}
                  className="rounded-[var(--radius)] border border-border bg-background px-3 py-1.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </label>
              <p className="text-xs text-muted-foreground">
                Filename preview: {todayIso()}-{slugify(newTitle || '')}.md
              </p>
              <div className="flex gap-2">
                <Button type="button" size="sm" onClick={createPost} disabled={!newTitle.trim()}>
                  Create
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setShowNewPostForm(false)
                    setNewTitle('')
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>

        {selectedPost && frontmatter !== null && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">File: {selectedPost}</span>
              {isDirty && <span className="text-xs text-muted-foreground">Unsaved changes</span>}
            </div>

            <SchemaForm schema={frontmatterSchema} value={frontmatter} onChange={setFrontmatter} />

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-foreground">Body (Markdown)</span>
              <textarea
                value={body}
                onChange={(event) => setBody(event.target.value)}
                spellCheck={false}
                rows={16}
                className="w-full rounded-[var(--radius)] border border-border bg-background p-4 font-mono text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>

            <div className="flex items-center gap-3">
              <Button onClick={handleSave} disabled={saveStatus === 'saving' || !isDirty}>
                {saveStatus === 'saving' ? 'Saving…' : 'Save'}
              </Button>
              {saveStatus === 'success' && (
                <p role="status" className="text-sm text-primary">
                  Saved to {selectedPost}.
                </p>
              )}
              {saveStatus === 'error' && (
                <p role="alert" className="text-sm text-destructive">
                  {saveError}
                </p>
              )}
            </div>

            {validationError && (
              <pre
                role="alert"
                className="overflow-x-auto rounded-[var(--radius)] bg-destructive/10 p-4 text-sm whitespace-pre-wrap text-destructive"
              >
                {validationError}
              </pre>
            )}
          </div>
        )}
      </div>
    </PageTransition>
  )
}
