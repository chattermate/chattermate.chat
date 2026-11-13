import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'

vi.mock('@/services/api', () => ({ default: { put: vi.fn(), delete: vi.fn() } }))

import api from '@/services/api'
import { knowledgeService } from '@/services/knowledge'

// Website chunk/page ids are URLs. In a path segment, proxies (nginx by default)
// decode %2F and merge "//", so the id must travel in the query string.
const CHUNK_ID = 'https://chattermate.chat/pricing::1'
const PAGE_ID = 'https://docs.chattermate.chat/features/lead-capture'

describe('knowledgeService chunk and page edits', () => {
  beforeEach(() => {
    vi.mocked(api.put).mockReset().mockResolvedValue({ data: { message: 'ok' } })
    vi.mocked(api.delete).mockReset().mockResolvedValue({ data: { message: 'ok' } })
  })

  it('updates a chunk with its id in the query, not the path', async () => {
    await knowledgeService.updateChunkContent(7, CHUNK_ID, 'new text')

    expect(api.put).toHaveBeenCalledWith('/knowledge/7/chunk', { content: 'new text' }, {
      params: { chunk_id: CHUNK_ID },
    })
  })

  it('deletes a chunk with its id in the query', async () => {
    await knowledgeService.deleteChunk(7, CHUNK_ID)

    expect(api.delete).toHaveBeenCalledWith('/knowledge/7/chunk', { params: { chunk_id: CHUNK_ID } })
  })

  it('updates a page with its id in the query', async () => {
    await knowledgeService.updatePage(7, PAGE_ID, 'body', 'Lead capture')

    expect(api.put).toHaveBeenCalledWith(
      '/knowledge/7/page',
      { content: 'body', title: 'Lead capture' },
      { params: { page_id: PAGE_ID } },
    )
  })

  it('deletes a page with its id in the query', async () => {
    await knowledgeService.deletePage(7, PAGE_ID)

    expect(api.delete).toHaveBeenCalledWith('/knowledge/7/page', { params: { page_id: PAGE_ID } })
  })

  it('returns the response body', async () => {
    vi.mocked(api.delete).mockResolvedValue({ data: { removed_chunks: 3 } })

    await expect(knowledgeService.deletePage(7, PAGE_ID)).resolves.toEqual({ removed_chunks: 3 })
  })
})

describe('the request axios builds from those params', () => {
  it.each([
    CHUNK_ID,
    'https://site.com//double//slash::2',
    'https://site.com/a b?x=1&y=2#frag::3',
    'https://site.com/c++/über::4',
  ])('keeps a slash-free path and round-trips %s exactly', (id) => {
    const built = new URL(axios.getUri({ baseURL: 'https://app.test/api/v1', url: '/knowledge/7/chunk', params: { chunk_id: id } }))

    expect(built.pathname).toBe('/api/v1/knowledge/7/chunk')
    expect(built.searchParams.get('chunk_id')).toBe(id)
  })
})
