import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { CustomizePage } from './CustomizePage'

function renderPage() {
  return render(
    <MemoryRouter>
      <CustomizePage />
    </MemoryRouter>,
  )
}

describe('CustomizePage (ST-111)', () => {
  it('lists every dev tool, including a placeholder for future ones', () => {
    renderPage()
    expect(screen.getByText('JSON Content Editor')).toBeInTheDocument()
    expect(screen.getByText('Blog Post Editor')).toBeInTheDocument()
    expect(screen.getByText('More tools')).toBeInTheDocument()
  })

  it('shows a prominent, always-visible localhost-only notice', () => {
    renderPage()
    expect(screen.getByRole('alert')).toHaveTextContent(/npm run dev/i)
  })

  it('enables the JSON Content Editor and Blog Post Editor (Epics 13, 14), but not "More tools"', () => {
    // vitest runs with import.meta.env.DEV === true, so this specifically
    // proves the *unimplemented* tool stays disabled even in a dev build —
    // not just "disabled because not running locally".
    renderPage()
    const openLinks = screen.getAllByRole('link', { name: 'Open' })
    expect(openLinks.map((link) => link.getAttribute('href'))).toEqual([
      '/dev/content',
      '/dev/blog',
    ])

    const disabledButtons = screen.getAllByRole('button', { name: /Coming soon/i })
    expect(disabledButtons).toHaveLength(1) // More tools
    expect(disabledButtons[0]).toBeDisabled()
  })

  it('has a setup guide trigger (ST-083)', () => {
    renderPage()
    expect(screen.getByRole('button', { name: /Setup your profile/i })).toBeInTheDocument()
  })
})
