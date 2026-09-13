import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Footer } from './Footer'

/**
 * ST-092 — enforces the OjasaMirai attribution badge (requirements.md §13).
 * This test is deliberately strict and asserts the exact values, not just
 * "something renders": removing or editing the logo src, link href, or
 * tagline text should fail this test and block the PR check (Epic 8), not
 * just change what the page looks like.
 */
describe('OjasaMirai attribution badge (ST-089, ST-090, ST-092)', () => {
  it('renders the exact logo, link, and tagline — do not edit these values', () => {
    render(<Footer />)

    // Exact tagline text, verbatim (questionnaire F1 — locked, CI-tested).
    expect(
      screen.getByText('Trained at OjasaMirai — training industry-ready professionals'),
    ).toBeInTheDocument()

    // The link's accessible name includes the logo's alt text ("OjasaMirai")
    // ahead of the visible tagline span, so match on the tagline substring.
    const link = screen.getByRole('link', {
      name: /Trained at OjasaMirai — training industry-ready professionals/,
    })
    expect(link).toHaveAttribute('href', 'https://ojasamirai.com')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'))
    expect(link).toHaveAttribute('rel', expect.stringContaining('noreferrer'))

    const logo = screen.getByRole('img', { name: 'OjasaMirai' })
    expect(logo).toHaveAttribute('src', 'https://images.ojasamirai.com/ojasa/common/logo.png')
  })
})
