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

import type { KnowledgeContentChunk, KnowledgeSubPage } from '@/types/knowledge'

/**
 * Map a chunk id back to its page id by stripping a trailing `_<number>` chunk
 * suffix (agno splits a page into `<page>_1`, `<page>_2` … chunks).
 *
 * Only a numeric suffix is stripped, so real underscores in a page name (e.g.
 * `getting_started`) are preserved. Mirrors the backend `PAGE_ID_EXPR`
 * (app/knowledge/page_editor.py) exactly, so the id derived here is the same
 * `page_id` the backend expects for edit/delete and the `subpage` value it
 * returns when listing sources — keep the two in sync.
 */
export function basePageId(id: string): string {
  return id.replace(/_\d+$/, '')
}

function countWords(text: string): number {
  const trimmed = text.trim()
  return trimmed ? trimmed.split(/\s+/).length : 0
}

function laterIso(a: string | null, b: string | null): string | null {
  if (!a) return b
  if (!b) return a
  return a > b ? a : b
}

/**
 * Group a source's content chunks into sub-pages. Chunks are concatenated in
 * their existing order (the backend returns them ordered by `created_at`), and
 * page-level url/title/updated_at are taken from the chunk metadata.
 */
export function groupChunksIntoPages(chunks: KnowledgeContentChunk[]): KnowledgeSubPage[] {
  const byPage = new Map<string, KnowledgeSubPage>()
  const order: string[] = []

  for (const chunk of chunks) {
    const pageId = basePageId(chunk.id)
    const meta = chunk.metadata || {}
    const content = chunk.content || ''

    let page = byPage.get(pageId)
    if (!page) {
      page = {
        page_id: pageId,
        url: typeof meta.url === 'string' && meta.url ? meta.url : pageId,
        title: typeof meta.title === 'string' && meta.title ? meta.title : titleFromId(pageId),
        content: '',
        word_count: 0,
        chunk_count: 0,
        updated_at: chunk.created_at ?? null,
        chunk_ids: [],
      }
      byPage.set(pageId, page)
      order.push(pageId)
    }

    page.content = page.content ? `${page.content}\n\n${content}` : content
    page.chunk_count += 1
    page.chunk_ids.push(chunk.id)
    page.updated_at = laterIso(page.updated_at, chunk.created_at ?? null)
  }

  for (const pageId of order) {
    const page = byPage.get(pageId)!
    page.word_count = countWords(page.content)
  }

  return order.map((pageId) => byPage.get(pageId)!)
}

/** Human-ish title fallback: last non-empty URL/path segment of the page id. */
export function titleFromId(pageId: string): string {
  const cleaned = pageId.replace(/[#?].*$/, '').replace(/\/+$/, '')
  const segment = cleaned.split('/').filter(Boolean).pop()
  return segment || pageId
}
