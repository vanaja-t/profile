import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import ContentEditorPage from './ContentEditorPage'

function mockFetchSequence(responses: Array<{ ok: boolean; json: unknown }>) {
  const fn = vi.fn()
  for (const response of responses) {
    fn.mockImplementationOnce(() =>
      Promise.resolve({ ok: response.ok, json: () => Promise.resolve(response.json) }),
    )
  }
  vi.stubGlobal('fetch', fn)
  return fn
}

afterEach(() => {
  vi.unstubAllGlobals()
})

function renderPage() {
  return render(
    <MemoryRouter>
      <ContentEditorPage />
    </MemoryRouter>,
  )
}

describe('ContentEditorPage (ST-105, ST-106, ST-107, ST-108, ST-110)', () => {
  it('lists files from the dev-server endpoint and loads one into the form', async () => {
    const user = userEvent.setup()
    const socialsContent = JSON.stringify([
      { platform: 'GitHub', url: 'https://github.com/example', icon: 'Code2' },
    ])
    mockFetchSequence([
      { ok: true, json: { files: ['personal.json', 'socials.json'] } },
      { ok: true, json: { content: socialsContent } },
    ])
    renderPage()

    const select = await screen.findByLabelText('File')
    expect(screen.getByRole('option', { name: 'personal.json' })).toBeInTheDocument()

    await user.selectOptions(select, 'socials.json')

    expect(await screen.findByDisplayValue('GitHub')).toBeInTheDocument()
  })

  it('shows a validation error and blocks save when the schema rejects the edit', async () => {
    const user = userEvent.setup()
    mockFetchSequence([
      { ok: true, json: { files: ['socials.json'] } },
      { ok: true, json: { content: '[]' } },
    ])
    renderPage()

    const select = await screen.findByLabelText('File')
    await user.selectOptions(select, 'socials.json')
    await screen.findByText('No entries yet.')

    await user.click(screen.getByRole('button', { name: '+ Add' }))
    await user.click(screen.getByRole('button', { name: 'Save' }))

    // The new entry's url defaults to '', which fails socials.json's
    // z.string().url() check — save should be blocked with a visible error.
    expect(await screen.findByRole('alert')).toBeInTheDocument()
  })

  it('saves successfully when the edited content is valid', async () => {
    const user = userEvent.setup()
    const fetchMock = mockFetchSequence([
      { ok: true, json: { files: ['socials.json'] } },
      { ok: true, json: { content: '[]' } },
      { ok: true, json: { ok: true } },
    ])
    renderPage()

    const select = await screen.findByLabelText('File')
    await user.selectOptions(select, 'socials.json')
    await screen.findByText('No entries yet.')

    await user.click(screen.getByRole('button', { name: '+ Add' }))
    await user.type(screen.getByLabelText('Platform'), 'GitHub')
    await user.type(screen.getByLabelText('Url'), 'https://github.com/example')
    await user.type(screen.getByLabelText('Icon'), 'Code2')

    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(await screen.findByRole('status')).toHaveTextContent('Saved to socials.json.')
    const postCall = fetchMock.mock.calls.find(([, init]) => init?.method === 'POST')
    expect(postCall?.[0]).toBe('/__content-editor/file')
    const body = JSON.parse((postCall?.[1] as RequestInit).body as string)
    expect(body.name).toBe('socials.json')
    expect(body.content).toContain('https://github.com/example')
  })
})
