import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { personal } from '@/lib/content/personal'
import { HomePage } from './HomePage'

describe('HomePage (ST-100, Epic 5)', () => {
  it('renders every section in order: Hero, About, Skills, Projects, Testimonials, Contact', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: personal.name, level: 1 })).toBeInTheDocument()

    const headingTexts = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)
    expect(headingTexts).toEqual(['About', 'Skills', 'Projects', 'Testimonials', 'Get in touch'])
  })

  it("wires the hero's CTAs to their target routes/anchor", () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'View Resume' })).toHaveAttribute('href', '/resume')
    expect(screen.getByRole('link', { name: 'See Projects' })).toHaveAttribute('href', '/projects')
    expect(screen.getByRole('link', { name: /let.s talk/i })).toHaveAttribute('href', '#contact')
  })
})
