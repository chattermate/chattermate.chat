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

import { computed, ref } from 'vue'
import type { KnowledgeItem, KnowledgePage, KnowledgeSubPage, QueueItem } from '@/types/knowledge'
import { knowledgeService } from '@/services/knowledge'
import { groupChunksIntoPages, titleFromId } from '@/utils/knowledgePages'

export type ExplorerMode = 'agent' | 'org'
export type SourceStatus = 'synced' | 'crawling' | 'error'

/** A knowledge source enriched with lazily-loaded, grouped sub-page content. */
export interface ExplorerSource {
  id: number
  name: string
  type: string
  pageStubs: KnowledgePage[]
  expanded: boolean
  loadingContent: boolean
  contentError: string | null
  pages: KnowledgeSubPage[] | null
}

const POLL_INTERVAL_MS = 10000

/**
 * State engine for the master-detail knowledge explorer, shared by the
 * agent-editor tab (`mode: 'agent'`) and the dedicated knowledge page
 * (`mode: 'org'`). Source list is fetched eagerly; each source's sub-page
 * content is grouped from its chunks lazily on first expand/selection.
 */
export function useKnowledgeExplorer(
  mode: ExplorerMode,
  agentId: string | undefined,
  organizationId: string,
) {
  const sources = ref<ExplorerSource[]>([])
  const queueItems = ref<QueueItem[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const query = ref('')

  const selectedSourceId = ref<number | null>(null)
  const selectedPageId = ref<string | null>(null)

  const editing = ref(false)
  const draftTitle = ref('')
  const draftContent = ref('')
  const isSaving = ref(false)
  const isDeleting = ref(false)

  let pollTimer: ReturnType<typeof setInterval> | null = null
  // Source names that were crawling on the previous poll tick, so we can force a
  // final content refresh once a crawl finishes.
  let crawlingNames = new Set<string>()

  const findSource = (id: number) => sources.value.find((s) => s.id === id)

  const toExplorerSource = (item: KnowledgeItem): ExplorerSource => ({
    id: item.id,
    name: item.name,
    type: item.type,
    pageStubs: item.pages || [],
    expanded: false,
    loadingContent: false,
    contentError: null,
    pages: null,
  })

  // `background` refetches (from the crawl poll) skip the loading flag so any
  // bound spinner doesn't flicker every tick.
  const fetchSources = async (background = false) => {
    if (!background) isLoading.value = true
    error.value = null
    try {
      const response =
        mode === 'agent' && agentId
          ? await knowledgeService.getKnowledgeByAgent(agentId, 1, 100)
          : await knowledgeService.getKnowledgeByOrganization(organizationId, 1, 100)

      const items: KnowledgeItem[] = response.knowledge || []
      // Preserve expand/loaded state across refreshes so a running crawl poll
      // does not collapse the tree or drop already-fetched content.
      const previous = new Map(sources.value.map((s) => [s.id, s]))
      sources.value = items.map((item) => {
        const prev = previous.get(item.id)
        const next = toExplorerSource(item)
        if (prev) {
          next.expanded = prev.expanded
          next.pages = prev.pages
        }
        return next
      })
    } catch (err) {
      console.error('Failed to load knowledge sources:', err)
      error.value = 'Failed to load knowledge sources'
    } finally {
      if (!background) isLoading.value = false
    }
  }

  const fetchQueue = async () => {
    if (mode !== 'agent' || !agentId) return
    try {
      const response = await knowledgeService.getAgentQueueItems(agentId)
      queueItems.value = response.queue_items || []
    } catch (err) {
      console.error('Failed to load knowledge queue:', err)
    }
  }

  // Resolve the source by id on every mutation. A concurrent (poll-driven)
  // fetchSources() replaces the objects in `sources.value`, so writing to the
  // originally-captured `source` would be lost — always re-find the live one.
  const loadSourceContent = async (sourceId: number, force = false) => {
    const source = findSource(sourceId)
    if (!source || source.loadingContent) return
    if (source.pages && !force) return
    source.loadingContent = true
    source.contentError = null
    try {
      const content = await knowledgeService.getKnowledgeContent(sourceId)
      const pages = groupChunksIntoPages(content.chunks || [])
      const live = findSource(sourceId)
      if (live) live.pages = pages
    } catch (err) {
      console.error(`Failed to load content for source ${sourceId}:`, err)
      const live = findSource(sourceId)
      if (live) {
        live.contentError = 'Failed to load pages'
        live.pages = []
      }
    } finally {
      const live = findSource(sourceId)
      if (live) live.loadingContent = false
    }
  }

  const toggleSource = async (source: ExplorerSource) => {
    source.expanded = !source.expanded
    if (source.expanded && source.pages === null) {
      await loadSourceContent(source.id)
    }
  }

  const selectPage = async (source: ExplorerSource, pageId: string) => {
    selectedSourceId.value = source.id
    selectedPageId.value = pageId
    editing.value = false
    if (source.pages === null) {
      await loadSourceContent(source.id)
    }
  }

  const selectedSource = computed(
    () => sources.value.find((s) => s.id === selectedSourceId.value) ?? null,
  )

  const selectedPage = computed<KnowledgeSubPage | null>(() => {
    const source = selectedSource.value
    if (!source || !source.pages || selectedPageId.value === null) return null
    return source.pages.find((p) => p.page_id === selectedPageId.value) ?? null
  })

  const sourceStatus = (source: ExplorerSource): SourceStatus => {
    const item = queueItems.value.find((q) => q.source === source.name)
    if (item?.status === 'failed') return 'error'
    if (item && (item.status === 'pending' || item.status === 'processing')) return 'crawling'
    return 'synced'
  }

  // Page rows for the tree: grouped pages once loaded, else lightweight stubs.
  const pageRows = (source: ExplorerSource) => {
    if (source.pages) {
      return source.pages.map((p) => ({
        page_id: p.page_id,
        title: p.title,
        words: p.word_count,
      }))
    }
    return source.pageStubs.map((stub: KnowledgePage) => ({
      page_id: stub.subpage,
      title: titleFromId(stub.subpage),
      words: null as number | null,
    }))
  }

  const normalizedQuery = computed(() => query.value.trim().toLowerCase())

  const filteredSources = computed(() => {
    const q = normalizedQuery.value
    if (!q) return sources.value
    return sources.value.filter((source) => {
      if (source.name.toLowerCase().includes(q)) return true
      const rows = pageRows(source)
      return rows.some((r) => r.title.toLowerCase().includes(q) || r.page_id.toLowerCase().includes(q))
    })
  })

  const startEdit = () => {
    const page = selectedPage.value
    if (!page) return
    draftTitle.value = page.title
    draftContent.value = page.content
    editing.value = true
  }

  const cancelEdit = () => {
    editing.value = false
  }

  const savePage = async () => {
    const source = selectedSource.value
    const page = selectedPage.value
    if (!source || !page) return
    const content = draftContent.value.trim()
    if (!content) {
      error.value = 'Page content cannot be empty'
      return
    }
    isSaving.value = true
    error.value = null
    try {
      await knowledgeService.updatePage(source.id, page.page_id, content, draftTitle.value.trim())
      await loadSourceContent(source.id, true)
      editing.value = false
    } catch (err: unknown) {
      console.error('Failed to save page:', err)
      error.value = err instanceof Error ? err.message : 'Failed to save page'
    } finally {
      isSaving.value = false
    }
  }

  const deletePage = async () => {
    const source = selectedSource.value
    const page = selectedPage.value
    if (!source || !page) return
    isDeleting.value = true
    error.value = null
    try {
      await knowledgeService.deletePage(source.id, page.page_id)
      selectedPageId.value = null
      await loadSourceContent(source.id, true)
    } catch (err: unknown) {
      console.error('Failed to delete page:', err)
      error.value = err instanceof Error ? err.message : 'Failed to delete page'
    } finally {
      isDeleting.value = false
    }
  }

  const deleteSource = async (source: ExplorerSource) => {
    isDeleting.value = true
    error.value = null
    try {
      await knowledgeService.deleteKnowledge(source.id)
      if (selectedSourceId.value === source.id) {
        selectedSourceId.value = null
        selectedPageId.value = null
      }
      await fetchSources()
    } catch (err: unknown) {
      console.error('Failed to delete source:', err)
      error.value = err instanceof Error ? err.message : 'Failed to delete source'
    } finally {
      isDeleting.value = false
    }
  }

  const addSource = async (rawUrl: string) => {
    const url = rawUrl.trim()
    if (!url) return
    error.value = null
    try {
      await knowledgeService.addUrls(organizationId, [url], mode === 'agent' ? agentId : undefined)
      await Promise.all([fetchSources(), fetchQueue()])
    } catch (err: unknown) {
      console.error('Failed to add source:', err)
      error.value = err instanceof Error ? err.message : 'Failed to add source'
      throw err
    }
  }

  const refresh = async () => {
    await Promise.all([fetchSources(), fetchQueue()])
  }

  const startPolling = () => {
    if (pollTimer || mode !== 'agent') return
    pollTimer = setInterval(async () => {
      await fetchQueue()
      const active = new Set(
        queueItems.value
          .filter((q) => q.status === 'pending' || q.status === 'processing')
          .map((q) => q.source),
      )
      // Reconcile only while a crawl is in flight, or on the tick a crawl just
      // finished, to avoid needless refetches when the tab sits idle.
      if (active.size || crawlingNames.size) {
        await fetchSources(true)
        // Force-refresh the content of any expanded source that is (or just was)
        // crawling, so newly-extracted pages appear without a manual re-expand.
        const touched = new Set<string>([...active, ...crawlingNames])
        for (const source of sources.value) {
          if (source.expanded && touched.has(source.name)) {
            await loadSourceContent(source.id, true)
          }
        }
      }
      crawlingNames = active
    }, POLL_INTERVAL_MS)
  }

  const stopPolling = () => {
    if (pollTimer) {
      clearInterval(pollTimer)
      pollTimer = null
    }
  }

  return {
    // state
    sources,
    queueItems,
    isLoading,
    error,
    query,
    selectedSourceId,
    selectedPageId,
    editing,
    draftTitle,
    draftContent,
    isSaving,
    isDeleting,
    // computed
    selectedSource,
    selectedPage,
    filteredSources,
    // helpers for the view
    sourceStatus,
    pageRows,
    // actions
    fetchSources,
    fetchQueue,
    refresh,
    toggleSource,
    selectPage,
    startEdit,
    cancelEdit,
    savePage,
    deletePage,
    deleteSource,
    addSource,
    startPolling,
    stopPolling,
  }
}
