import { z } from 'zod'

/** camelCase/snake_case key -> "Camel Case" label. */
export function humanizeLabel(key: string): string {
  const spaced = key.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/[_-]/g, ' ')
  return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}

/** Field names that should render as a <textarea> rather than a single-line input. */
export function isLongTextField(key: string): boolean {
  return /bio|description|content|quote|summary|highlight/i.test(key)
}

type ZodDef = {
  type: string
  shape?: Record<string, z.ZodType>
  element?: z.ZodType
  values?: unknown[]
}

function getDef(schema: z.ZodType): ZodDef {
  return (schema as unknown as { def: ZodDef }).def
}

/** Unwraps ZodOptional/ZodNullable to their inner schema. */
export function unwrap(schema: z.ZodType): z.ZodType {
  const def = getDef(schema)
  if (def.type === 'optional' || def.type === 'nullable') {
    return unwrap((schema as unknown as { unwrap: () => z.ZodType }).unwrap())
  }
  return schema
}

export function isOptional(schema: z.ZodType): boolean {
  return getDef(schema).type === 'optional' || getDef(schema).type === 'nullable'
}

/** A reasonable empty value to seed a new array item / a newly-enabled optional field. */
export function getDefaultValue(schema: z.ZodType): unknown {
  const inner = unwrap(schema)
  const def = getDef(inner)

  switch (def.type) {
    case 'string':
      return ''
    case 'number':
      return 0
    case 'boolean':
      return false
    case 'literal':
      return def.values?.[0]
    case 'array':
      return []
    case 'object': {
      const shape = def.shape ?? {}
      return Object.fromEntries(
        Object.entries(shape)
          .filter(([, fieldSchema]) => !isOptional(fieldSchema))
          .map(([key, fieldSchema]) => [key, getDefaultValue(fieldSchema)]),
      )
    }
    default:
      return null
  }
}

export type FieldKind =
  'string' | 'longText' | 'number' | 'boolean' | 'literal' | 'array' | 'object' | 'unknown'

/** Classifies a (possibly optional-wrapped) schema for the form renderer. */
export function classifyField(schema: z.ZodType, key: string): FieldKind {
  const inner = unwrap(schema)
  const def = getDef(inner)
  switch (def.type) {
    case 'string':
      return isLongTextField(key) ? 'longText' : 'string'
    case 'number':
      return 'number'
    case 'boolean':
      return 'boolean'
    case 'literal':
      return 'literal'
    case 'array':
      return 'array'
    case 'object':
      return 'object'
    default:
      return 'unknown'
  }
}

export function getObjectShape(schema: z.ZodType): Record<string, z.ZodType> {
  return getDef(unwrap(schema)).shape ?? {}
}

export function getArrayElementSchema(schema: z.ZodType): z.ZodType {
  const element = getDef(unwrap(schema)).element
  if (!element) throw new Error('Expected an array schema')
  return element
}
