/*
Copyright 2024-2026 ChatterMate

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import { describe, it, expect } from 'vitest'
import { basePageId, groupChunksIntoPages, titleFromId } from '../../utils/knowledgePages'
import type { KnowledgeContentChunk } from '../../types/knowledge'

describe('basePageId', () => {
  // These MUST stay aligned with the backend PAGE_ID_EXPR
  // (backend/app/knowledge/page_editor.py): strip only a trailing `_<number>`
  // chunk suffix, never a real underscore in the page name.
  it('strips a trailing numeric chunk suffix', () => {
    expect(basePageId('https://site.com/docs_1')).toBe('https://site.com/docs')
    expect(basePageId('https://site.com/docs_12')).toBe('https://site.com/docs')
  })

  it('keeps a bare page id with no chunk suffix', () => {
    expect(basePageId('https://site.com/docs')).toBe('https://site.com/docs')
  })

  it('preserves real underscores in the page name', () => {
    expect(basePageId('getting_started')).toBe('getting_started')
    expect(basePageId('getting_started_2')).toBe('getting_started')
  })

  it('strips only the last numeric group', () => {
    expect(basePageId('x_10_3')).toBe('x_10')
  })
})

describe('titleFromId', () => {
  it('uses the last non-empty url/path segment', () => {
    expect(titleFromId('https://site.com/docs/getting-started')).toBe('getting-started')
    expect(titleFromId('https://site.com/docs/')).toBe('docs')
    expect(titleFromId('Product Handbook.pdf#billing')).toBe('Product Handbook.pdf')
  })
})

describe('groupChunksIntoPages', () => {
  const chunk = (
    id: string,
    content: string,
    metadata: Record<string, unknown> = {},
    created_at: string | null = null,
  ): KnowledgeContentChunk => ({ id, content, metadata, created_at: created_at ?? undefined })

  it('groups multi-chunk pages and concatenates content in order', () => {
    const pages = groupChunksIntoPages([
      chunk('p/a', 'first', { url: 'https://x/a', title: 'Alpha' }, '2024-01-01T00:00:00Z'),
      chunk('p/a_1', 'second', {}, '2024-01-02T00:00:00Z'),
      chunk('p/b', 'other', {}, '2024-01-01T00:00:00Z'),
    ])
    expect(pages).toHaveLength(2)
    const a = pages[0]
    expect(a.page_id).toBe('p/a')
    expect(a.url).toBe('https://x/a')
    expect(a.title).toBe('Alpha')
    expect(a.content).toBe('first\n\nsecond')
    expect(a.chunk_count).toBe(2)
    expect(a.word_count).toBe(2)
    expect(a.chunk_ids).toEqual(['p/a', 'p/a_1'])
    // updated_at is the latest of the group's chunk timestamps
    expect(a.updated_at).toBe('2024-01-02T00:00:00Z')
  })

  it('falls back to id-derived url/title when metadata is missing', () => {
    const [page] = groupChunksIntoPages([chunk('https://site.com/docs/help', 'body')])
    expect(page.url).toBe('https://site.com/docs/help')
    expect(page.title).toBe('help')
  })

  it('returns an empty array for no chunks', () => {
    expect(groupChunksIntoPages([])).toEqual([])
  })
})
