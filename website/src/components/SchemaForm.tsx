import type { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  classifyField,
  getArrayElementSchema,
  getDefaultValue,
  getObjectShape,
  humanizeLabel,
  isOptional,
  unwrap,
} from '@/lib/schema-form'

const inputClass =
  'w-full rounded-[var(--radius)] border border-border bg-background px-3 py-1.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-sm font-medium text-foreground">{children}</span>
}

interface FieldProps {
  schema: z.ZodType
  value: unknown
  onChange: (value: unknown) => void
  label: string
}

/** One field: dispatches to the right input based on the (unwrapped) schema type. */
function SchemaField({ schema, value, onChange, label }: FieldProps) {
  if (isOptional(schema)) {
    const inner = unwrap(schema)
    const isSet = value !== undefined && value !== null

    if (!isSet) {
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{label} — not set</span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => onChange(getDefaultValue(inner))}
          >
            + Add
          </Button>
        </div>
      )
    }

    return (
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <FieldLabel>{label}</FieldLabel>
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="text-xs text-muted-foreground hover:text-destructive"
          >
            Remove
          </button>
        </div>
        <SchemaField schema={inner} value={value} onChange={onChange} label={label} />
      </div>
    )
  }

  const kind = classifyField(schema, label)

  switch (kind) {
    case 'string':
      return (
        <label className="flex flex-col gap-1.5">
          <FieldLabel>{label}</FieldLabel>
          <input
            type="text"
            value={(value as string) ?? ''}
            onChange={(event) => onChange(event.target.value)}
            className={inputClass}
          />
        </label>
      )

    case 'longText':
      return (
        <label className="flex flex-col gap-1.5">
          <FieldLabel>{label}</FieldLabel>
          <textarea
            value={(value as string) ?? ''}
            onChange={(event) => onChange(event.target.value)}
            rows={4}
            className={inputClass}
          />
        </label>
      )

    case 'number':
      return (
        <label className="flex flex-col gap-1.5">
          <FieldLabel>{label}</FieldLabel>
          <input
            type="number"
            value={Number.isFinite(value) ? (value as number) : 0}
            onChange={(event) => onChange(Number(event.target.value))}
            className={inputClass}
          />
        </label>
      )

    case 'boolean':
      return (
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(event) => onChange(event.target.checked)}
            className="size-4 rounded border-border"
          />
          <FieldLabel>{label}</FieldLabel>
        </label>
      )

    case 'literal':
      // A fixed value (e.g. contactForm.provider: "formspree") — nothing to edit.
      return null

    case 'array':
      return <ArrayField schema={schema} value={value} onChange={onChange} label={label} />

    case 'object':
      return <ObjectFields schema={schema} value={value} onChange={onChange} label={label} />

    default:
      // Unrecognized schema shape — fall back to a raw-JSON escape hatch
      // for just this one field, rather than breaking the whole form.
      return (
        <label className="flex flex-col gap-1.5">
          <FieldLabel>{label} (raw JSON)</FieldLabel>
          <textarea
            value={JSON.stringify(value, null, 2)}
            onChange={(event) => {
              try {
                onChange(JSON.parse(event.target.value))
              } catch {
                // Ignore invalid intermediate JSON while typing; the last
                // valid parse stays in state until this resolves.
              }
            }}
            rows={3}
            className={`${inputClass} font-mono`}
          />
        </label>
      )
  }
}

function ObjectFields({
  schema,
  value,
  onChange,
  label,
  bare = false,
}: FieldProps & { bare?: boolean }) {
  const shape = getObjectShape(schema)
  const objectValue = (value as Record<string, unknown>) ?? {}

  const fields = Object.entries(shape).map(([key, fieldSchema]) => (
    <SchemaField
      key={key}
      schema={fieldSchema}
      value={objectValue[key]}
      onChange={(fieldValue) => onChange({ ...objectValue, [key]: fieldValue })}
      label={humanizeLabel(key)}
    />
  ))

  if (bare) {
    return <div className="flex flex-col gap-4">{fields}</div>
  }

  return (
    <fieldset className="flex flex-col gap-4 rounded-[var(--radius)] border border-border p-4">
      <legend className="px-1 text-sm font-medium text-foreground">{label}</legend>
      {fields}
    </fieldset>
  )
}

function ArrayField({ schema, value, onChange, label }: FieldProps) {
  const elementSchema = getArrayElementSchema(schema)
  const elementKind = classifyField(elementSchema, label)
  // Guards against a file's on-disk content not actually matching its
  // schema shape (e.g. hand-edited outside this tool) — degrade to an
  // empty list rather than crash the whole editor.
  const items = Array.isArray(value) ? value : []

  function updateItem(index: number, itemValue: unknown) {
    const next = [...items]
    next[index] = itemValue
    onChange(next)
  }

  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index))
  }

  function addItem() {
    onChange([...items, getDefaultValue(elementSchema)])
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <FieldLabel>{label}</FieldLabel>
        <Button type="button" size="sm" variant="outline" onClick={addItem}>
          + Add
        </Button>
      </div>

      {items.length === 0 && <p className="text-xs text-muted-foreground">No entries yet.</p>}

      {items.map((item, index) => (
        <div
          key={index}
          className="flex items-start gap-3 rounded-[var(--radius)] border border-border bg-muted/30 p-3"
        >
          <div className="flex-1">
            {elementKind === 'object' ? (
              <ObjectFields
                schema={elementSchema}
                value={item}
                onChange={(v) => updateItem(index, v)}
                label={`Entry ${index + 1}`}
                bare
              />
            ) : (
              <SchemaField
                schema={elementSchema}
                value={item}
                onChange={(v) => updateItem(index, v)}
                label={`Item ${index + 1}`}
              />
            )}
          </div>
          <button
            type="button"
            onClick={() => removeItem(index)}
            className="text-xs text-muted-foreground hover:text-destructive"
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  )
}

/**
 * Renders a whole file's content as field-by-field inputs, driven entirely
 * by that file's existing zod schema — no per-file form code (Epic 13).
 * Top-level arrays (experience.json, projects.json, ...) and top-level
 * objects (site.config.json, personal.json) are both supported.
 */
export function SchemaForm({
  schema,
  value,
  onChange,
}: {
  schema: z.ZodType
  value: unknown
  onChange: (value: unknown) => void
}) {
  const kind = classifyField(schema, '')

  if (kind === 'array') {
    return <ArrayField schema={schema} value={value} onChange={onChange} label="Entries" />
  }

  if (kind === 'object') {
    return <ObjectFields schema={schema} value={value} onChange={onChange} label="" bare />
  }

  return <p className="text-sm text-destructive">Unsupported top-level schema for this file.</p>
}
