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
import { toast } from 'vue-sonner'
import type { KnowledgeItem, KnowledgePage, KnowledgeSubPage, QueueItem } from '@/types/knowledge'
import { knowledgeService } from '@/services/knowledge'
import { groupChunksIntoPages, titleFromId } from '@/utils/knowledgePages'

export type ExplorerMode = 'agent' | 'org'
export type SourceStatus = 'queued' | 'crawling' | 'synced' | 'error'

// What the add-source modal submits; discriminated by `type`.
export type AddSourcePayload =
  | { type: 'website'; url: string; followLinks: boolean }
  | { type: 'sitemap'; url: string }
  | { type: 'pdf'; files: File[] }
  | { type: 'text'; title: string; content: string }

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
  // True for a placeholder built from an in-flight queue item that has not yet
  // produced a real Knowledge source (id is the negated queue-item id).
  queued?: boolean
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
  // Queue-item ids seen on the previous tick, so we detect a crawl finishing
  // (an item leaving the queue) even if it was never observed as active.
  let lastQueueIds = new Set<number>()

  const queueIds = () => new Set(queueItems.value.map((q) => q.id))
  const activeCrawlNames = () =>
    new Set(
      queueItems.value
        .filter((q) => q.status === 'pending' || q.status === 'processing')
        .map((q) => q.source),
    )
  const setsDiffer = (a: Set<number>, b: Set<number>) =>
    a.size !== b.size || [...a].some((id) => !b.has(id))

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
    try {
      const response =
        mode === 'agent' && agentId
          ? await knowledgeService.getAgentQueueItems(agentId)
          : await knowledgeService.getOrgQueueItems(organizationId)
      queueItems.value = response.queue_items || []
    } catch (err) {
      console.error('Failed to load knowledge queue:', err)
    }
  }

  // A queue item's source_type ('website' | 'pdf_url' | 'pdf_file') mapped to the
  // tree's source-kind glyph.
  const queueKind = (sourceType: string): string => {
    if (sourceType.includes('pdf')) return 'pdf'
    if (sourceType.includes('web')) return 'web'
    return 'custom'
  }

  // Placeholder source for an in-flight queue item (negative id = queue-item id).
  const toSyntheticSource = (item: QueueItem): ExplorerSource => ({
    id: -item.id,
    name: item.source,
    type: queueKind(item.source_type),
    pageStubs: [],
    expanded: false,
    loadingContent: false,
    contentError: null,
    pages: [],
    queued: true,
  })

  // Real sources plus a placeholder for every in-flight queue item that has not
  // yet produced a real source — so a just-queued crawl shows immediately and is
  // replaced by the real source once indexing completes and the poll refetches.
  const allSources = computed<ExplorerSource[]>(() => {
    const realNames = new Set(sources.value.map((s) => s.name))
    const seen = new Set<string>()
    const placeholders: ExplorerSource[] = []
    for (const item of queueItems.value) {
      if (realNames.has(item.source) || seen.has(item.source)) continue
      seen.add(item.source)
      placeholders.push(toSyntheticSource(item))
    }
    return [...placeholders, ...sources.value]
  })

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
    if (item?.status === 'processing') return 'crawling'
    if (item?.status === 'pending') return 'queued'
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
    if (!q) return allSources.value
    return allSources.value.filter((source) => {
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
      // A queued placeholder isn't a real source yet — cancel its queue item.
      if (source.queued) {
        await knowledgeService.deleteQueueItem(-source.id)
      } else {
        await knowledgeService.deleteKnowledge(source.id)
      }
      if (selectedSourceId.value === source.id) {
        selectedSourceId.value = null
        selectedPageId.value = null
      }
      await Promise.all([fetchSources(), fetchQueue()])
    } catch (err: unknown) {
      console.error('Failed to delete source:', err)
      error.value = err instanceof Error ? err.message : 'Failed to delete source'
    } finally {
      isDeleting.value = false
    }
  }

  const linkedAgentId = mode === 'agent' ? agentId : undefined

  // Handle add/urls responses that report duplicates instead of throwing.
  const throwIfError = (res: { error?: string } | undefined) => {
    if (res?.error) throw new Error(res.error)
  }

  // Submit a new source from the add-source modal. Resolves true on success.
  // Crawl sources (website/sitemap/pdf) are queued and indexed in the
  // background; text is indexed immediately. Toasts announce the outcome.
  const submitSource = async (payload: AddSourcePayload): Promise<boolean> => {
    error.value = null
    try {
      if (payload.type === 'website') {
        throwIfError(
          await knowledgeService.addUrls(
            organizationId,
            [payload.url],
            linkedAgentId,
            undefined,
            payload.followLinks ? undefined : 1,
          ),
        )
        toast.success('Queued for crawling', {
          description: `${payload.url} — we’ll notify you when indexing is done.`,
        })
      } else if (payload.type === 'sitemap') {
        throwIfError(await knowledgeService.addUrls(organizationId, [payload.url], linkedAgentId))
        toast.success('Queued for crawling', {
          description: `${payload.url} — pages are being discovered and indexed.`,
        })
      } else if (payload.type === 'pdf') {
        await knowledgeService.uploadPdfFiles(payload.files, organizationId, linkedAgentId)
        toast.success('Queued for crawling', {
          description: 'Your document is being parsed and indexed.',
        })
      } else {
        await knowledgeService.addText(organizationId, payload.title, payload.content, linkedAgentId)
        toast.success('Page added', {
          description: `${payload.title} is now in your knowledge base.`,
        })
      }
      await Promise.all([fetchSources(), fetchQueue()])
      return true
    } catch (err: unknown) {
      // Surface add-source failures via toast only (the inline error banner is
      // reserved for the read/edit pane), so the user doesn't see it twice.
      const msg = err instanceof Error ? err.message : 'Failed to add source'
      console.error('Failed to add source:', err)
      toast.error('Could not add source', { description: msg })
      return false
    }
  }

  const refresh = async () => {
    await Promise.all([fetchSources(), fetchQueue()])
    // Baseline the queue snapshot so the first poll can detect a crawl that
    // finishes before it is ever observed as active.
    lastQueueIds = queueIds()
    crawlingNames = activeCrawlNames()
  }

  const startPolling = () => {
    if (pollTimer) return
    pollTimer = setInterval(async () => {
      await fetchQueue()
      const active = activeCrawlNames()
      const currentIds = queueIds()
      // Reconcile when a crawl is in flight OR the queue changed since the last
      // tick (an item was added or finished/removed) — the latter catches a
      // crawl that completed within a single poll window.
      if (active.size || setsDiffer(currentIds, lastQueueIds)) {
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
      lastQueueIds = currentIds
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
    submitSource,
    startPolling,
    stopPolling,
  }
}
