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
import {
  DEFAULT_SELECTION,
  defaultSort,
  inboxViewGroups,
  parseSelection,
  selectedViewItem,
  selectionId,
  type InboxSelection,
} from '@/components/inbox/inboxViews'

export const INBOX_PAGE_SIZE = 25
/** How long typing pauses before the list searches */
export const SEARCH_DEBOUNCE_MS = 250
/** How often an open inbox refreshes its counts (and first page) by itself */
export const INBOX_POLL_MS = 30_000

/**
 * The inbox's list pane: which view is selected (kept in ?view= so a reload
 * or a shared link lands on it), its sort and search, the paged list, and
 * every view's count for the views pane.
 *
 * New conversations are not pushed over the socket, so the counts and the
 * first page refresh every INBOX_POLL_MS while the tab is visible, and at
 * once whenever this tab changes who holds a chat ('inbox-changed').
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

  const viewGroups = computed(() => inboxViewGroups(counts.value, selection.value))
  const currentView = computed(() => selectedViewItem(viewGroups.value, selection.value))

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

  async function loadCounts(): Promise<void> {
    try {
      counts.value = await chatService.getInboxCounts()
    } catch (err) {
      // The views still work without numbers
      console.error('Failed to load inbox counts:', err)
    }
  }

  /** Counts and the first page, without a loading state: the background refresh. */
  function refresh(): void {
    void loadCounts()
    // Past the first page a reload would drop what was scrolled into view
    if (conversations.value.length <= INBOX_PAGE_SIZE) void load({ quiet: true })
  }

  function select(next: InboxSelection): void {
    selection.value = next
    sort.value = defaultSort(next)
    const id = selectionId(next)
    const view = id === selectionId(DEFAULT_SELECTION) ? undefined : id
    void router.replace({ query: { ...route.query, view } })
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
      if (!document.hidden) refresh()
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
    select,
    load,
    loadMore,
    refresh,
    patchConversation,
  }
}
