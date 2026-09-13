import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { OthersPage } from './OthersPage'

describe('OthersPage', () => {
  it('renders Hobbies and Gallery, moved off the Home scroll', () => {
    render(
      <MemoryRouter>
        <OthersPage />
      </MemoryRouter>,
    )

    const headingTexts = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)
    expect(headingTexts).toEqual(['Hobbies', 'Gallery'])
  })
})
