import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { SetupGuideDialog } from './SetupGuideDialog'

function renderDialog() {
  return render(
    <MemoryRouter>
      <SetupGuideDialog />
    </MemoryRouter>,
  )
}

describe('SetupGuideDialog (ST-083)', () => {
  it('opens on trigger click and links to the in-app editors', async () => {
    const user = userEvent.setup()
    renderDialog()

    await user.click(screen.getByRole('button', { name: /Setup your profile/i }))

    expect(screen.getByRole('heading', { name: 'Setting up your fork' })).toBeInTheDocument()
    const contentEditorLinks = screen.getAllByRole('link', { name: 'JSON Content Editor' })
    expect(contentEditorLinks.length).toBeGreaterThan(0)
    for (const link of contentEditorLinks) {
      expect(link).toHaveAttribute('href', '/dev/content')
    }
    expect(screen.getByRole('link', { name: 'Blog Post Editor' })).toHaveAttribute(
      'href',
      '/dev/blog',
    )
    expect(screen.getByRole('link', { name: 'Formspree' })).toHaveAttribute(
      'href',
      'https://formspree.io',
    )
  })
})
