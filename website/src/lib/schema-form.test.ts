import { z } from 'zod'
import { describe, expect, it } from 'vitest'
import {
  classifyField,
  getArrayElementSchema,
  getDefaultValue,
  getObjectShape,
  humanizeLabel,
  isOptional,
  unwrap,
} from './schema-form'

describe('humanizeLabel', () => {
  it('converts camelCase to Title Case', () => {
    expect(humanizeLabel('avatarUrl')).toBe('Avatar Url')
    expect(humanizeLabel('startDate')).toBe('Start Date')
    expect(humanizeLabel('name')).toBe('Name')
  })
})

describe('unwrap / isOptional', () => {
  it('unwraps optional schemas to their inner type', () => {
    const schema = z.string().optional()
    expect(isOptional(schema)).toBe(true)
    expect(unwrap(schema)).toBeInstanceOf(z.ZodString)
  })

  it('treats a plain schema as not optional', () => {
    expect(isOptional(z.string())).toBe(false)
  })
})

describe('classifyField', () => {
  it('classifies primitive and long-text string fields', () => {
    expect(classifyField(z.string(), 'title')).toBe('string')
    expect(classifyField(z.string(), 'bio')).toBe('longText')
    expect(classifyField(z.string(), 'description')).toBe('longText')
  })

  it('classifies number, boolean, array, object, and literal', () => {
    expect(classifyField(z.number(), 'x')).toBe('number')
    expect(classifyField(z.boolean(), 'x')).toBe('boolean')
    expect(classifyField(z.array(z.string()), 'x')).toBe('array')
    expect(classifyField(z.object({ a: z.string() }), 'x')).toBe('object')
    expect(classifyField(z.literal('formspree'), 'x')).toBe('literal')
  })

  it('classifies through an optional wrapper', () => {
    expect(classifyField(z.number().optional(), 'x')).toBe('number')
  })
})

describe('getDefaultValue', () => {
  it('produces sensible empty defaults per type', () => {
    expect(getDefaultValue(z.string())).toBe('')
    expect(getDefaultValue(z.number())).toBe(0)
    expect(getDefaultValue(z.boolean())).toBe(false)
    expect(getDefaultValue(z.array(z.string()))).toEqual([])
    expect(getDefaultValue(z.literal('ga4'))).toBe('ga4')
  })

  it('builds a default object from an object schema, skipping optional fields', () => {
    const schema = z.object({
      id: z.string(),
      count: z.number(),
      nickname: z.string().optional(),
    })
    expect(getDefaultValue(schema)).toEqual({ id: '', count: 0 })
  })
})

describe('getObjectShape / getArrayElementSchema', () => {
  it("returns an object schema's shape", () => {
    const schema = z.object({ id: z.string(), name: z.string() })
    expect(Object.keys(getObjectShape(schema))).toEqual(['id', 'name'])
  })

  it("returns an array schema's element schema", () => {
    const elementSchema = z.object({ id: z.string() })
    const schema = z.array(elementSchema)
    expect(getArrayElementSchema(schema)).toBe(elementSchema)
  })
})
