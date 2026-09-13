import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { SchemaForm } from '@/components/SchemaForm'
import { PageTransition } from '@/components/motion/PageTransition'
import { validateData } from '@/lib/validate-data'
import { editableFileSchemas } from '@/lib/content/editor-schemas'

type SaveStatus = 'idle' | 'saving' | 'success' | 'error'

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init)
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null
    throw new Error(body?.error ?? `Request failed: ${response.status}`)
  }
  return response.json() as Promise<T>
}

/**
 * Local-only JSON content editor (ST-105–ST-110, Epic 13) — field-by-field,
 * generated from each file's existing zod schema (see SchemaForm), not raw
 * JSON text. Talks to the dev-server-only middleware in
 * vite-plugin-content-editor.ts — those endpoints don't exist outside
 * `npm run dev`, so this page is harmless (if unreachable) in any other
 * context. Default export: loaded via React.lazy() from App.tsx so it's
 * excluded from the production bundle entirely, not just hidden behind a
 * flag (ST-109).
 */
export default function ContentEditorPage() {
  const [files, setFiles] = useState<string[]>([])
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [value, setValue] = useState<unknown>(null)
  const [originalValue, setOriginalValue] = useState<unknown>(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [saveError, setSaveError] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  const isDirty = JSON.stringify(value) !== JSON.stringify(originalValue)

  useEffect(() => {
    fetchJson<{ files: string[] }>('/__content-editor/files')
      .then((data) => setFiles(data.files))
      .catch((error: unknown) =>
        setLoadError(error instanceof Error ? error.message : String(error)),
      )
  }, [])

  function selectFile(file: string) {
    if (isDirty && !window.confirm('Discard unsaved changes?')) return

    setSelectedFile(file)
    setValidationError(null)
    setSaveStatus('idle')
    setSaveError(null)
    fetchJson<{ content: string }>(`/__content-editor/file?name=${encodeURIComponent(file)}`)
      .then((data) => {
        const parsed: unknown = JSON.parse(data.content)
        setValue(parsed)
        setOriginalValue(parsed)
      })
      .catch((error: unknown) =>
        setLoadError(error instanceof Error ? error.message : String(error)),
      )
  }

  async function handleSave() {
    if (!selectedFile) return
    setValidationError(null)
    setSaveStatus('idle')
    setSaveError(null)

    const schema = editableFileSchemas[selectedFile]
    let validated: unknown
    try {
      validated = validateData(schema, value, selectedFile)
    } catch (error) {
      setValidationError(error instanceof Error ? error.message : String(error))
      return
    }

    setSaveStatus('saving')
    const normalized = `${JSON.stringify(validated, null, 2)}\n`
    try {
      await fetchJson('/__content-editor/file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: selectedFile, content: normalized }),
      })
      setValue(validated)
      setOriginalValue(validated)
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
          <h1 className="font-heading text-3xl font-bold text-foreground">JSON Content Editor</h1>
          <p className="text-muted-foreground">
            Edits save directly to the file on disk. Local-only — this page does nothing on a
            deployed site.
          </p>
        </div>

        {loadError && (
          <p role="alert" className="text-sm text-destructive">
            {loadError}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="content-editor-file" className="text-sm font-medium text-foreground">
            File
          </label>
          <select
            id="content-editor-file"
            value={selectedFile ?? ''}
            onChange={(event) => selectFile(event.target.value)}
            className="rounded-[var(--radius)] border border-border bg-background px-3 py-1.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="" disabled>
              Choose a file…
            </option>
            {files.map((file) => (
              <option key={file} value={file}>
                {file}
              </option>
            ))}
          </select>
          {isDirty && <span className="text-xs text-muted-foreground">Unsaved changes</span>}
        </div>

        {selectedFile && value !== null && (
          <div className="flex flex-col gap-4">
            <SchemaForm
              schema={editableFileSchemas[selectedFile]}
              value={value}
              onChange={setValue}
            />

            <div className="flex items-center gap-3">
              <Button onClick={handleSave} disabled={saveStatus === 'saving' || !isDirty}>
                {saveStatus === 'saving' ? 'Saving…' : 'Save'}
              </Button>
              {saveStatus === 'success' && (
                <p role="status" className="text-sm text-primary">
                  Saved to {selectedFile}.
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
