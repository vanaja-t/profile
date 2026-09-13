import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { PublishGuideDialog } from './PublishGuideDialog'

describe('PublishGuideDialog', () => {
  it('opens on trigger click and covers the GitHub Pages settings step', async () => {
    const user = userEvent.setup()
    render(<PublishGuideDialog />)

    await user.click(screen.getByRole('button', { name: /Publish to GitHub Pages/i }))

    expect(screen.getByRole('heading', { name: 'Publishing your site' })).toBeInTheDocument()
    expect(screen.getAllByText(/Settings → Pages/).length).toBeGreaterThan(0)
    expect(screen.getByText(/Run workflow/)).toBeInTheDocument()
  })
})
