import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import BlogEditorPage from './BlogEditorPage'

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
      <BlogEditorPage />
    </MemoryRouter>,
  )
}

// The dev-server middleware parses frontmatter (gray-matter runs there, not
// in the browser — see BlogEditorPage's top comment) — so mocked responses
// are already-split { data, content }, matching what the real endpoint
// returns, not raw Markdown-with-frontmatter text.
const SAMPLE_POST_RESPONSE = {
  data: {
    title: 'Going From Architect to AI Engineer',
    date: '2026-01-15',
    tags: ['career', 'ai'],
    excerpt: 'Notes on the transition.',
  },
  content: 'This is the body.\n',
}

describe('BlogEditorPage (ST-112, ST-114, ST-115)', () => {
  it('lists posts and loads one into frontmatter fields + a body textarea', async () => {
    const user = userEvent.setup()
    mockFetchSequence([
      { ok: true, json: { posts: ['2026-01-15-going-from-architect-to-ai-engineer.md'] } },
      { ok: true, json: SAMPLE_POST_RESPONSE },
    ])
    renderPage()

    const postButton = await screen.findByRole('button', {
      name: '2026-01-15-going-from-architect-to-ai-engineer.md',
    })
    await user.click(postButton)

    expect(await screen.findByLabelText('Title')).toHaveValue('Going From Architect to AI Engineer')
    expect(screen.getByLabelText('Body (Markdown)')).toHaveValue('This is the body.\n')
  })

  it('blocks save and shows an error when frontmatter fails validation', async () => {
    const user = userEvent.setup()
    mockFetchSequence([
      { ok: true, json: { posts: ['2026-01-15-post.md'] } },
      { ok: true, json: SAMPLE_POST_RESPONSE },
    ])
    renderPage()

    await user.click(await screen.findByRole('button', { name: '2026-01-15-post.md' }))
    await screen.findByLabelText('Title')

    // Clear the title, which is required — should fail validation, not save.
    await user.clear(screen.getByLabelText('Title'))
    await user.type(screen.getByLabelText('Body (Markdown)'), ' edited')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(await screen.findByRole('alert')).toBeInTheDocument()
  })
})

describe('BlogEditorPage — new post flow (ST-113)', () => {
  it('derives a filename from the title and creates the post', async () => {
    const user = userEvent.setup()
    const fetchMock = mockFetchSequence([
      { ok: true, json: { posts: [] } },
      { ok: true, json: { ok: true } },
      {
        ok: true,
        json: {
          data: { title: 'My Brand New Post', date: '2026-09-14', tags: [], excerpt: '' },
          content: 'Write your post here.\n',
        },
      },
    ])
    renderPage()

    await user.click(await screen.findByRole('button', { name: '+ New Post' }))
    await user.type(screen.getByLabelText('New post title'), 'My Brand New Post')
    expect(screen.getByText(/my-brand-new-post\.md/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Create' }))

    const createCall = fetchMock.mock.calls.find(([, init]) => init?.method === 'POST')
    const body = JSON.parse((createCall?.[1] as RequestInit).body as string)
    expect(body.name).toMatch(/-my-brand-new-post\.md$/)
    expect(body.data.title).toBe('My Brand New Post')

    expect(await screen.findByLabelText('Title')).toHaveValue('My Brand New Post')
  })
})
