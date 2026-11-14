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

import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { chatService, localDayStart } from '@/services/chat'
import type { Conversation, InboxCounts, InboxSort } from '@/types/chat'
import type { InboxFilterValues } from '@/components/inbox/InboxFilters.vue'
import emitter from '@/utils/emitter'
import { patchQuery } from '@/utils/patchQuery'
import {
  DEFAULT_SELECTION,
  defaultSort,
  inboxViewGroups,
  parseSelection,
  sameListState,
  selectedViewItem,
  selectionId,
  type InboxListState,
  type InboxPresetItem,
  type InboxSelection,
} from '@/components/inbox/inboxViews'

export const INBOX_PAGE_SIZE = 25
/** How long typing pauses before the list searches */
export const SEARCH_DEBOUNCE_MS = 250
/** How often an open inbox refreshes its counts by itself */
export const INBOX_POLL_MS = 30_000
/** The first page is the costly query: re-read it on a poll only when the
 * counts moved, and at least every this many polls (a row's latest message) */
export const LIST_REFRESH_EVERY = 4

/**
 * The inbox's list pane: which view is selected (kept in ?view= so a reload
 * or a shared link lands on it), its sort and search, the paged list, and
 * every view's count for the views pane.
 *
 * New conversations are not pushed over the socket, so the counts refresh
 * every INBOX_POLL_MS while the tab is visible, and the first page with them
 * when they moved (or every LIST_REFRESH_EVERY polls). Both refresh at once
 * whenever a chat changes hands or gets a note ('inbox-changed').
 *
 * Presets (the enterprise module's saved views) bring back a whole list state
 * at once; one stays selected while the list still shows what it saved.
 */
export function useInboxList() {
  const route = useRoute()
  const router = useRouter()

  // ?status=closed: the older deep link (analytics) into closed conversations
  const selection = ref<InboxSelection>(
    parseSelection(route.query.view ?? (route.query.status === 'closed' ? 'closed' : undefined))
  )
  const sort = ref<InboxSort>(defaultSort(selection.value))
  const search = ref('')
  const filters = ref<InboxFilterValues>({ agentId: '', assigneeId: '' })
  const conversations = ref<Conversation[]>([])
  const counts = ref<InboxCounts | null>(null)
  const loading = ref(true)
  const loadingMore = ref(false)
  const error = ref('')
  const hasMore = ref(false)

  const presets = ref<InboxPresetItem[]>([])
  const activePresetId = ref<string | null>(null)
  // A ?view= that names no built-in view: a preset, once the presets arrive
  const linked = typeof route.query.view === 'string' ? route.query.view : null
  let pendingPresetId = linked && selectionId(parseSelection(linked)) !== linked ? linked : null

  const state = computed<InboxListState>(() => ({
    selection: selection.value,
    sort: sort.value,
    search: search.value,
    agentId: filters.value.agentId,
    assigneeId: filters.value.assigneeId,
  }))
  /** The preset applied last, while the list still shows what it saved */
  const activePreset = computed(() => {
    const preset = presets.value.find((p) => p.id === activePresetId.value)
    return preset && sameListState(preset.preset, state.value) ? preset : null
  })

  const viewGroups = computed(() => inboxViewGroups(counts.value, selection.value, presets.value))
  const currentView = computed(() => activePreset.value ?? selectedViewItem(viewGroups.value, selection.value))
  /** The views pane's selected item */
  const selectedId = computed(() => activePreset.value?.id ?? selectionId(selection.value))

  // Each load bumps this; a response for an older one is dropped, so a slow
  // answer for the view you just left can't overwrite the one you're on.
  let latestLoad = 0

  function listParams(skip: number) {
    const query = search.value.trim()
    return {
      view: selection.value.view,
      channel: selection.value.channel ?? undefined,
      q: query || undefined,
      agent_id: filters.value.agentId || undefined,
      user_id: filters.value.assigneeId || undefined,
      sort: sort.value,
      today_start: localDayStart(),
      skip,
      limit: INBOX_PAGE_SIZE,
    }
  }

  /** The first page again. `quiet` keeps the rows on screen while it loads. */
  async function load({ quiet = false } = {}): Promise<void> {
    const loadId = ++latestLoad
    if (!quiet) loading.value = true
    error.value = ''
    try {
      const rows = await chatService.getRecentChats(listParams(0))
      if (loadId !== latestLoad) return
      conversations.value = rows
      hasMore.value = rows.length === INBOX_PAGE_SIZE
    } catch (err) {
      if (loadId !== latestLoad) return
      console.error('Failed to load conversations:', err)
      error.value = 'Conversations could not be loaded.'
    } finally {
      if (loadId === latestLoad) loading.value = false
    }
  }

  async function loadMore(): Promise<void> {
    if (loading.value || loadingMore.value || !hasMore.value) return
    const loadId = latestLoad
    loadingMore.value = true
    try {
      const rows = await chatService.getRecentChats(listParams(conversations.value.length))
      if (loadId !== latestLoad) return
      const known = new Set(conversations.value.map((c) => c.session_id))
      conversations.value = [...conversations.value, ...rows.filter((r) => !known.has(r.session_id))]
      hasMore.value = rows.length === INBOX_PAGE_SIZE
    } catch (err) {
      console.error('Failed to load more conversations:', err)
    } finally {
      loadingMore.value = false
    }
  }

  /** Reads the counts; true when they differ from the ones on screen. */
  async function loadCounts(): Promise<boolean> {
    try {
      const next = await chatService.getInboxCounts()
      const moved = JSON.stringify(next) !== JSON.stringify(counts.value)
      counts.value = next
      return moved
    } catch (err) {
      // The views still work without numbers
      console.error('Failed to load inbox counts:', err)
      return false
    }
  }

  /** The first page without a loading state. Past the first page a reload
   * would drop what was scrolled into view, so then it waits. */
  function reloadQuietly(): void {
    if (conversations.value.length <= INBOX_PAGE_SIZE) void load({ quiet: true })
  }

  /** Counts and the first page: something changed (a chat moved, a note, back to the tab). */
  function refresh(): void {
    void loadCounts()
    reloadQuietly()
  }

  let pollsSinceList = 0
  async function poll(): Promise<void> {
    const moved = await loadCounts()
    pollsSinceList += 1
    if (moved || pollsSinceList >= LIST_REFRESH_EVERY) {
      pollsSinceList = 0
      reloadQuietly()
    }
  }

  function linkView(id: string): void {
    const view = id === selectionId(DEFAULT_SELECTION) ? undefined : id
    void patchQuery(router, { view })
  }

  function select(next: InboxSelection): void {
    activePresetId.value = null
    // A search left over from the last view would show "No conversations
    // match" beside the new view's count
    search.value = ''
    selection.value = next
    sort.value = defaultSort(next)
    linkView(selectionId(next))
  }

  /** The list exactly as a preset saved it */
  function applyPreset(item: InboxPresetItem): void {
    const { preset } = item
    selection.value = preset.selection
    sort.value = preset.sort
    search.value = preset.search
    filters.value = { agentId: preset.agentId, assigneeId: preset.assigneeId }
    activePresetId.value = item.id
    linkView(item.id)
  }

  /** A preset that matches what the list shows now (one just saved from it) */
  function markPreset(id: string): void {
    activePresetId.value = id
    linkView(id)
  }

  /** The presets to offer; a link to one (?view=) applies it once they arrive */
  function setPresets(items: InboxPresetItem[]): void {
    presets.value = items
    const linkedPreset = pendingPresetId ? items.find((p) => p.id === pendingPresetId) : undefined
    if (linkedPreset) {
      pendingPresetId = null
      applyPreset(linkedPreset)
    }
  }

  /** A row's fields changed in the open thread (who holds it, its status). */
  function patchConversation(sessionId: string, fields: Partial<Conversation>): void {
    const index = conversations.value.findIndex((c) => c.session_id === sessionId)
    if (index === -1) return
    const next = [...conversations.value]
    next[index] = { ...next[index], ...fields }
    conversations.value = next
  }

  watch([selection, sort, filters], () => void load())

  /** A search or a filter narrows the view: its count no longer describes the list */
  const narrowed = computed(() => !!search.value.trim() || !!filters.value.agentId || !!filters.value.assigneeId)

  let searchTimer: ReturnType<typeof setTimeout> | null = null
  watch(search, () => {
    if (searchTimer) clearTimeout(searchTimer)
    searchTimer = setTimeout(() => void load(), SEARCH_DEBOUNCE_MS)
  })

  let pollTimer: ReturnType<typeof setInterval> | null = null
  const onVisibility = () => {
    if (!document.hidden) refresh()
  }

  onMounted(() => {
    void load()
    void loadCounts()
    emitter.on('inbox-changed', refresh)
    document.addEventListener('visibilitychange', onVisibility)
    pollTimer = setInterval(() => {
      if (!document.hidden) void poll()
    }, INBOX_POLL_MS)
  })

  onBeforeUnmount(() => {
    emitter.off('inbox-changed', refresh)
    document.removeEventListener('visibilitychange', onVisibility)
    if (pollTimer) clearInterval(pollTimer)
    if (searchTimer) clearTimeout(searchTimer)
  })

  return {
    selection,
    sort,
    search,
    filters,
    narrowed,
    conversations,
    counts,
    loading,
    loadingMore,
    error,
    hasMore,
    viewGroups,
    currentView,
    state,
    selectedId,
    select,
    applyPreset,
    markPreset,
    setPresets,
    load,
    loadMore,
    refresh,
    patchConversation,
  }
}
