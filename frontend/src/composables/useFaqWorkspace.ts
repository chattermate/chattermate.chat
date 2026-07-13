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

import { faqService } from '@/services/faq'
import { knowledgeService } from '@/services/knowledge'
import type { FaqGenerationJob, FaqImportMode, FaqItem, FaqStatus, GenerateEstimate, HelpCenterSettings } from '@/types/faq'

export type WorkspacePhase = 'loading' | 'empty' | 'generating' | 'populated'

// Fast tick while a job is running; relaxed tick while a domain/SSL state is
// pending. Idle = no requests at all.
const ACTIVE_POLL_MS = 3000
const IDLE_POLL_MS = 10000

export function useFaqWorkspace(organizationId: () => string | undefined) {
  const faqs = ref<FaqItem[]>([])
  const job = ref<FaqGenerationJob | null>(null)
  const settings = ref<HelpCenterSettings | null>(null)
  const estimate = ref<GenerateEstimate | null>(null)
  const sourceCount = ref(0)
  const pageCount = ref(0)
  const isLoading = ref(false)
  const loadedOnce = ref(false)

  // Multi-select state for bulk publish/unpublish/delete.
  const selectedIds = ref<Set<string>>(new Set())
  const selectionActive = computed(() => selectedIds.value.size > 0)

  function toggleSelect(id: string): void {
    const next = new Set(selectedIds.value)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    selectedIds.value = next
  }

  function setSelected(items: FaqItem[], on: boolean): void {
    const next = new Set(selectedIds.value)
    for (const item of items) {
      if (on) next.add(item.id)
      else next.delete(item.id)
    }
    selectedIds.value = next
  }

  function clearSelection(): void {
    selectedIds.value = new Set()
  }

  async function bulkSetStatus(status: FaqStatus): Promise<void> {
    const ids = [...selectedIds.value]
    if (!ids.length) return
    try {
      const updated = await faqService.setStatus(ids, status)
      faqs.value = faqs.value.map((f) => (selectedIds.value.has(f.id) ? { ...f, status } : f))
      clearSelection()
      toast.success(`${updated} FAQ${updated === 1 ? '' : 's'} ${status === 'published' ? 'published' : 'moved to draft'}`)
    } catch (error: any) {
      toast.error(error.message)
      // A batch may have partially applied server-side (>200 selection splits
      // into requests) — refetch so the list matches the backend.
      await refresh()
    }
  }

  async function bulkDelete(): Promise<void> {
    const ids = [...selectedIds.value]
    if (!ids.length) return
    try {
      const deleted = await faqService.bulkDelete(ids)
      faqs.value = faqs.value.filter((f) => !selectedIds.value.has(f.id))
      clearSelection()
      toast.success(`${deleted} FAQ${deleted === 1 ? '' : 's'} deleted`)
      // Deleting a source's FAQs makes it eligible for generation again — the
      // Generate button's new-source count must not stay stale/disabled.
      void fetchEstimate()
    } catch (error: any) {
      toast.error(error.message)
      await refresh() // partial batch may have deleted server-side; resync
    }
  }

  // Inline edit state (one card at a time).
  const editingId = ref<string | null>(null)
  const isNewFaq = ref(false)
  const draftQuestion = ref('')
  const draftAnswer = ref('')
  const isSaving = ref(false)

  let pollTimer: ReturnType<typeof setInterval> | null = null
  let lastPollAt = 0

  const isJobActive = computed(
    () => job.value?.status === 'pending' || job.value?.status === 'processing',
  )

  const phase = computed<WorkspacePhase>(() => {
    if (isLoading.value && !loadedOnce.value) return 'loading'
    // Regenerating with existing FAQs keeps the list visible — only the
    // generate bar flips; the full progress card is for first-run only.
    if (isJobActive.value && faqs.value.length === 0) return 'generating'
    return faqs.value.length > 0 ? 'populated' : 'empty'
  })

  const barPhase = computed<'idle' | 'generating' | 'ready'>(() => {
    if (isJobActive.value) return 'generating'
    return faqs.value.length > 0 ? 'ready' : 'idle'
  })

  const publishedCount = computed(() => faqs.value.filter((f) => f.status === 'published').length)

  // ---- search + filter + collapse (all client-side over the loaded set) ----
  const searchQuery = ref('')
  const categoryFilter = ref<string | null>(null)
  const statusFilter = ref<'all' | FaqStatus>('all')
  const collapsedCategories = ref<Set<string>>(new Set())

  const categories = computed(() =>
    [...new Set(faqs.value.map((f) => f.category))].sort((a, b) => a.localeCompare(b)),
  )

  const hasActiveFilters = computed(
    () =>
      searchQuery.value.trim() !== '' ||
      categoryFilter.value !== null ||
      statusFilter.value !== 'all',
  )

  const filteredFaqs = computed(() => {
    // Tokenized: every term must appear somewhere (question/answer/category),
    // so "close my" matches "How to close my account".
    const terms = searchQuery.value.trim().toLowerCase().split(/\s+/).filter(Boolean)
    return faqs.value.filter((f) => {
      if (categoryFilter.value && f.category !== categoryFilter.value) return false
      if (statusFilter.value !== 'all' && f.status !== statusFilter.value) return false
      if (terms.length) {
        const haystack = `${f.question} ${f.answer} ${f.category}`.toLowerCase()
        if (!terms.every((t) => haystack.includes(t))) return false
      }
      return true
    })
  })

  const filteredCount = computed(() => filteredFaqs.value.length)

  const groupedFaqs = computed(() => {
    const groups = new Map<string, FaqItem[]>()
    for (const faq of filteredFaqs.value) {
      const list = groups.get(faq.category) || []
      list.push(faq)
      groups.set(faq.category, list)
    }
    return groups
  })

  function resetFilters(): void {
    searchQuery.value = ''
    categoryFilter.value = null
    statusFilter.value = 'all'
  }

  function toggleCategory(category: string): void {
    const next = new Set(collapsedCategories.value)
    if (next.has(category)) next.delete(category)
    else next.add(category)
    collapsedCategories.value = next
  }

  // While filtering/searching, always show matches regardless of collapse state.
  function isCategoryOpen(category: string): boolean {
    return hasActiveFilters.value || !collapsedCategories.value.has(category)
  }

  const domainPending = computed(() => {
    const domain = settings.value?.domain
    if (!domain?.custom_domain) return false
    return domain.domain_status !== 'verified' || domain.ssl_status === 'pending'
  })

  // Bounded safety cap; a curated FAQ list should never approach this.
  const MAX_FAQ_PAGES = 10

  async function fetchFaqs(): Promise<void> {
    const all: FaqItem[] = []
    let page = 1
    for (;;) {
      const response = await faqService.getFaqs({ page })
      all.push(...response.faqs)
      if (page >= response.pagination.total_pages || page >= MAX_FAQ_PAGES) break
      page += 1
    }
    faqs.value = all
  }

  async function fetchJob(): Promise<void> {
    job.value = await faqService.getJob(true)
  }

  async function fetchSettings(): Promise<void> {
    settings.value = await faqService.getSettings()
  }

  async function fetchEstimate(includePages = false): Promise<void> {
    // Background fetches (page load, deletes, job completion) skip the
    // per-source page scan — the button label only needs new_sources. The
    // confirm dialog passes includePages=true for the full call estimate.
    // Non-fatal: locked plans 403 here; the generate button then just says
    // "Generate" without the new-source count.
    try {
      estimate.value = await faqService.getGenerateEstimate(includePages)
    } catch {
      estimate.value = null
    }
  }

  async function fetchCounts(): Promise<void> {
    const orgId = organizationId()
    if (!orgId) return
    const response = await knowledgeService.getKnowledgeByOrganization(orgId, 1, 100)
    const items = response.knowledge || []
    sourceCount.value = response.pagination?.total ?? response.pagination?.total_count ?? items.length
    pageCount.value = items.reduce(
      (sum: number, item: { pages?: unknown[] }) => sum + (item.pages?.length || 1),
      0,
    )
  }

  async function refresh(): Promise<void> {
    isLoading.value = true
    clearSelection()
    try {
      await Promise.all([fetchFaqs(), fetchJob(), fetchSettings(), fetchCounts(), fetchEstimate()])
      loadedOnce.value = true
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      isLoading.value = false
    }
  }

  async function pollTick(): Promise<void> {
    const interval = isJobActive.value ? ACTIVE_POLL_MS : IDLE_POLL_MS
    if (!isJobActive.value && !domainPending.value) return
    const now = Date.now()
    if (now - lastPollAt < interval - 100) return
    lastPollAt = now
    try {
      if (isJobActive.value) {
        const wasActive = job.value?.id
        await fetchJob()
        const stillActive = job.value?.status === 'pending' || job.value?.status === 'processing'
        if (wasActive && !stillActive) {
          await Promise.all([fetchFaqs(), fetchSettings(), fetchEstimate()])
          const finished = await faqService.getJob(false)
          if (finished?.status === 'failed') {
            toast.error(finished.error || 'FAQ generation failed')
          } else if (finished) {
            toast.success(
              finished.faqs_created
                ? `${finished.faqs_created} draft FAQ${finished.faqs_created === 1 ? '' : 's'} ready to review`
                : 'No new FAQs found — existing FAQs already cover this content',
            )
          }
        }
      } else if (domainPending.value) {
        await fetchSettings()
      }
    } catch {
      // Transient polling errors are silent; the next tick retries.
    }
  }

  function startPolling(): void {
    stopPolling()
    pollTimer = setInterval(pollTick, ACTIVE_POLL_MS)
  }

  function stopPolling(): void {
    if (pollTimer) {
      clearInterval(pollTimer)
      pollTimer = null
    }
  }

  async function startGeneration(knowledgeIds?: number[]): Promise<boolean> {
    try {
      job.value = await faqService.startGeneration(knowledgeIds)
      return true
    } catch (error: any) {
      toast.error(error.message)
      return false
    }
  }

  async function submitImport(url: string, mode: FaqImportMode = 'qa'): Promise<boolean> {
    try {
      job.value = await faqService.importFaq(url, mode)
      toast.success('Import started — drafts will appear when it finishes')
      return true
    } catch (error: any) {
      toast.error(error.message)
      return false
    }
  }

  async function submitPdfImport(file: File): Promise<boolean> {
    try {
      job.value = await faqService.importPdf(file)
      toast.success('Import started — drafts will appear when it finishes')
      return true
    } catch (error: any) {
      toast.error(error.message)
      return false
    }
  }

  async function togglePublish(faq: FaqItem): Promise<void> {
    const nextStatus = faq.status === 'published' ? 'draft' : 'published'
    const previous = faq.status
    faq.status = nextStatus // optimistic
    try {
      await faqService.setStatus([faq.id], nextStatus)
    } catch (error: any) {
      faq.status = previous
      toast.error(error.message)
    }
  }

  function startEdit(faq: FaqItem): void {
    editingId.value = faq.id
    isNewFaq.value = false
    draftQuestion.value = faq.question
    draftAnswer.value = faq.answer
  }

  function startAdd(): void {
    editingId.value = 'new'
    isNewFaq.value = true
    draftQuestion.value = ''
    draftAnswer.value = ''
  }

  function cancelEdit(): void {
    editingId.value = null
    isNewFaq.value = false
    draftQuestion.value = ''
    draftAnswer.value = ''
  }

  async function saveEdit(): Promise<void> {
    const question = draftQuestion.value.trim()
    const answer = draftAnswer.value.trim()
    if (!question || !answer) {
      toast.error('Both a question and an answer are required')
      return
    }
    isSaving.value = true
    try {
      if (isNewFaq.value) {
        const created = await faqService.createFaq({ question, answer })
        faqs.value = [...faqs.value, created]
      } else if (editingId.value) {
        const updated = await faqService.updateFaq(editingId.value, { question, answer })
        faqs.value = faqs.value.map((f) => (f.id === updated.id ? updated : f))
      }
      cancelEdit()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      isSaving.value = false
    }
  }

  async function deleteFaq(faq: FaqItem): Promise<void> {
    try {
      await faqService.deleteFaq(faq.id)
      faqs.value = faqs.value.filter((f) => f.id !== faq.id)
      if (editingId.value === faq.id) cancelEdit()
      // Keep the Generate button's new-source count fresh (see bulkDelete).
      void fetchEstimate()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  return {
    faqs,
    job,
    settings,
    estimate,
    fetchEstimate,
    sourceCount,
    pageCount,
    isLoading,
    phase,
    barPhase,
    publishedCount,
    groupedFaqs,
    searchQuery,
    categoryFilter,
    statusFilter,
    categories,
    hasActiveFilters,
    filteredCount,
    resetFilters,
    toggleCategory,
    isCategoryOpen,
    isJobActive,
    selectedIds,
    selectionActive,
    toggleSelect,
    setSelected,
    clearSelection,
    bulkSetStatus,
    bulkDelete,
    editingId,
    isNewFaq,
    draftQuestion,
    draftAnswer,
    isSaving,
    refresh,
    fetchSettings,
    startPolling,
    stopPolling,
    pollTick,
    startGeneration,
    submitImport,
    submitPdfImport,
    togglePublish,
    startEdit,
    startAdd,
    cancelEdit,
    saveEdit,
    deleteFaq,
  }
}
