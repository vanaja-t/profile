import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { z } from 'zod'
import { describe, expect, it, vi } from 'vitest'
import { SchemaForm } from './SchemaForm'

const personSchema = z.object({
  name: z.string(),
  bio: z.string(),
  phone: z.string().optional(),
})

const entriesSchema = z.array(
  z.object({
    id: z.string(),
    highlights: z.array(z.string()),
  }),
)

describe('SchemaForm — object schema', () => {
  it('renders an input per field, pre-filled with the current value', () => {
    render(
      <SchemaForm
        schema={personSchema}
        value={{ name: 'Ada', bio: 'Mathematician' }}
        onChange={vi.fn()}
      />,
    )

    expect(screen.getByLabelText('Name')).toHaveValue('Ada')
    expect(screen.getByLabelText('Bio')).toHaveValue('Mathematician')
  })

  it('calls onChange with an updated object when a field changes', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <SchemaForm schema={personSchema} value={{ name: 'Ada', bio: '' }} onChange={onChange} />,
    )

    await user.type(screen.getByLabelText('Name'), '!')

    expect(onChange).toHaveBeenLastCalledWith({ name: 'Ada!', bio: '' })
  })

  it('shows optional fields as unset with an Add control, then reveals an input', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <SchemaForm schema={personSchema} value={{ name: 'Ada', bio: '' }} onChange={onChange} />,
    )

    expect(screen.getByText(/Phone — not set/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '+ Add' }))

    expect(onChange).toHaveBeenLastCalledWith({ name: 'Ada', bio: '', phone: '' })
  })
})

describe('SchemaForm — top-level array of objects', () => {
  it('renders one entry per array item, and supports adding/removing entries', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <SchemaForm
        schema={entriesSchema}
        value={[{ id: 'a', highlights: ['first'] }]}
        onChange={onChange}
      />,
    )

    expect(screen.getByDisplayValue('a')).toBeInTheDocument()
    expect(screen.getByDisplayValue('first')).toBeInTheDocument()

    await user.click(screen.getAllByRole('button', { name: '+ Add' })[0])
    expect(onChange).toHaveBeenLastCalledWith([
      { id: 'a', highlights: ['first'] },
      { id: '', highlights: [] },
    ])
  })

  it('removes an entry when its Remove button is clicked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <SchemaForm
        schema={entriesSchema}
        value={[
          { id: 'a', highlights: [] },
          { id: 'b', highlights: [] },
        ]}
        onChange={onChange}
      />,
    )

    const removeButtons = screen.getAllByRole('button', { name: 'Remove' })
    await user.click(removeButtons[0])

    expect(onChange).toHaveBeenLastCalledWith([{ id: 'b', highlights: [] }])
  })
})
