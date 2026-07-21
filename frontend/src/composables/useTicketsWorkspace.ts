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

import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ticketService } from '@/services/tickets'
import { useTicketSocket } from '@/composables/useTicketSocket'
import type { Pagination, TicketListFilters, TicketListItem, TicketStats } from '@/types/ticket'

// Server-side filter mapping for the status pills. "breaching" is a virtual
// filter (SLA), approximated client-side over the loaded page.
const OPEN_STATUSES = 'open,triaging,investigating,awaiting_approval,in_progress,reopened,resolved_pending_confirmation'
const SEARCH_DEBOUNCE_MS = 350
// Poll fallback so a missed socket frame never strands the list.
const LIST_REFRESH_MS = 30000

const DEFAULT_FILTERS: TicketListFilters = {
  status: 'all',
  priority: 'all',
  assignee: 'all',
  ai: 'all',
  search: '',
  sort: 'updated',
}

export function useTicketsWorkspace() {
  const route = useRoute()
  const router = useRouter()

  const tickets = ref<TicketListItem[]>([])
  const stats = ref<TicketStats | null>(null)
  const pagination = ref<Pagination | null>(null)
  const page = ref(1)
  const isLoading = ref(true)
  const error = ref<string | null>(null)
  const planGated = ref(false)

  const filters = reactive<TicketListFilters>({
    ...DEFAULT_FILTERS,
    ...pickFiltersFromQuery(route.query),
  })

  const phase = computed(() => {
    if (isLoading.value && tickets.value.length === 0) return 'loading'
    if (tickets.value.length === 0) return 'empty'
    return 'populated'
  })

  const hasActiveFilters = computed(() =>
    Object.keys(DEFAULT_FILTERS).some(
      (key) => filters[key as keyof TicketListFilters] !== DEFAULT_FILTERS[key as keyof TicketListFilters],
    ),
  )

  function pickFiltersFromQuery(query: Record<string, any>): Partial<TicketListFilters> {
    const picked: Partial<TicketListFilters> = {}
    for (const key of Object.keys(DEFAULT_FILTERS) as (keyof TicketListFilters)[]) {
      if (typeof query[key] === 'string' && query[key]) picked[key] = query[key]
    }
    return picked
  }

  function filtersToQuery(): Record<string, string> {
    const query: Record<string, string> = {}
    for (const key of Object.keys(DEFAULT_FILTERS) as (keyof TicketListFilters)[]) {
      if (filters[key] !== DEFAULT_FILTERS[key]) query[key] = filters[key]
    }
    return query
  }

  function buildParams() {
    const params: Record<string, any> = { page: page.value, sort: filters.sort }
    if (filters.status === 'open') params.status = OPEN_STATUSES
    else if (filters.status === 'awaiting') params.status = 'awaiting_approval'
    else if (filters.status === 'resolved') params.status = 'resolved,closed'
    else if (filters.status === 'breaching') params.status = OPEN_STATUSES
    if (filters.priority !== 'all') params.priority = filters.priority
    if (filters.assignee === 'unassigned') params.unassigned = true
    else if (filters.assignee !== 'all') params.assignee_id = filters.assignee
    if (filters.ai !== 'all') params.ai_state = filters.ai
    if (filters.search.trim()) params.search = filters.search.trim()
    return params
  }

  const visibleTickets = computed(() => {
    if (filters.status !== 'breaching') return tickets.value
    const soon = Date.now() + 30 * 60000
    return tickets.value.filter(
      (t) => t.sla_due_at && !t.resolved_at && new Date(t.sla_due_at).getTime() <= soon,
    )
  })

  async function refresh(silent = false) {
    if (!silent) isLoading.value = true
    try {
      const [listResponse, statsResponse] = await Promise.all([
        ticketService.listTickets(buildParams()),
        ticketService.getStats(),
      ])
      tickets.value = listResponse.tickets
      pagination.value = listResponse.pagination
      stats.value = statsResponse
      error.value = null
      planGated.value = false
    } catch (e: any) {
      if (!silent) {
        planGated.value = /plan/i.test(e?.message || '')
        error.value = e?.message || 'Failed to load tickets'
      }
    } finally {
      isLoading.value = false
    }
  }

  function clearFilters() {
    Object.assign(filters, DEFAULT_FILTERS)
    page.value = 1
  }

  // Filters -> URL (shareable) + reload. Search is debounced.
  let searchTimer: ReturnType<typeof setTimeout> | null = null
  watch(
    () => ({ ...filters }),
    (next, prev) => {
      router.replace({ query: filtersToQuery() })
      if (next.search !== prev?.search) {
        if (searchTimer) clearTimeout(searchTimer)
        searchTimer = setTimeout(() => {
          page.value = 1
          refresh()
        }, SEARCH_DEBOUNCE_MS)
        return
      }
      page.value = 1
      refresh()
    },
  )
  watch(page, () => refresh())

  useTicketSocket(() => refresh(true))

  let refreshTimer: ReturnType<typeof setInterval> | null = null
  onMounted(() => {
    refresh()
    refreshTimer = setInterval(() => refresh(true), LIST_REFRESH_MS)
  })
  onBeforeUnmount(() => {
    if (refreshTimer) clearInterval(refreshTimer)
    if (searchTimer) clearTimeout(searchTimer)
  })

  return {
    tickets: visibleTickets,
    stats,
    pagination,
    page,
    filters,
    phase,
    isLoading,
    error,
    planGated,
    hasActiveFilters,
    refresh,
    clearFilters,
  }
}
