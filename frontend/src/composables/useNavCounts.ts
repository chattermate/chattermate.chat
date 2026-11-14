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

import { onBeforeUnmount, onMounted, ref } from 'vue'
import type { AxiosError } from 'axios'
import { chatService } from '@/services/chat'
import type { InboxCounts } from '@/types/chat'
import { ticketService } from '@/services/tickets'
import { canAccessPath } from '@/router/routePermissions'
import { isEmbeddedShopify } from '@/utils/shopifyEmbed'
import emitter from '@/utils/emitter'

/** How often the badges refresh while the tab is visible. */
export const NAV_COUNTS_POLL_MS = 60_000

/** Responses that mean "this will never work for you": stop asking. */
const PERMANENT_REFUSALS = new Set([403, 404])

const isPermanentRefusal = (error: unknown) =>
  PERMANENT_REFUSALS.has((error as AxiosError)?.response?.status ?? 0)

/**
 * Counts for the navigation badges: conversations waiting for a human (Inbox)
 * and open tickets (Tickets).
 *
 * Fetched on mount, every NAV_COUNTS_POLL_MS while the tab is visible, as soon
 * as a hidden tab comes back, and right after this agent takes, hands over,
 * reassigns or closes a chat ('inbox-changed'). Org-wide handovers reach no
 * socket room this user is in, so polling is what keeps "waiting" honest.
 *
 * A count the user may not see stays null (no badge); a refusal stops that
 * request for good, so an org without ticketing is not asked every minute.
 */
export function useNavCounts() {
  const waitingForHuman = ref<number | null>(null)
  const openTickets = ref<number | null>(null)

  let inboxEnabled = canAccessPath('/conversations') && !isEmbeddedShopify()
  let ticketsEnabled = canAccessPath('/tickets') && !isEmbeddedShopify()
  let timer: ReturnType<typeof setInterval> | null = null

  // When the inbox (or anything) last fetched the counts: a poll that soon
  // after would only ask again
  let inboxCountsAt = 0
  const onInboxCounts = (counts: InboxCounts) => {
    inboxCountsAt = Date.now()
    waitingForHuman.value = counts.waiting_for_human
  }

  const refreshInbox = async ({ ifStale = false } = {}) => {
    if (!inboxEnabled) return
    if (ifStale && Date.now() - inboxCountsAt < NAV_COUNTS_POLL_MS / 2) return
    try {
      waitingForHuman.value = (await chatService.getInboxCounts()).waiting_for_human
    } catch (error) {
      if (isPermanentRefusal(error)) {
        inboxEnabled = false
        waitingForHuman.value = null
      }
      // Anything else is transient: keep the last count until the next poll.
    }
  }

  const refreshTickets = async () => {
    if (!ticketsEnabled) return
    try {
      openTickets.value = (await ticketService.getCounts()).open
    } catch (error) {
      if (isPermanentRefusal(error)) {
        ticketsEnabled = false
        openTickets.value = null
      }
    }
  }

  const refresh = () => Promise.all([refreshInbox(), refreshTickets()])

  const stopPolling = () => {
    if (timer) clearInterval(timer)
    timer = null
  }

  const startPolling = () => {
    stopPolling()
    if (inboxEnabled || ticketsEnabled) {
      timer = setInterval(() => Promise.all([refreshInbox({ ifStale: true }), refreshTickets()]), NAV_COUNTS_POLL_MS)
    }
  }

  const onVisibilityChange = () => {
    if (document.hidden) {
      stopPolling()
    } else {
      refresh()
      startPolling()
    }
  }

  onMounted(() => {
    refresh()
    startPolling()
    document.addEventListener('visibilitychange', onVisibilityChange)
    emitter.on('inbox-changed', refresh)
    emitter.on('inbox-counts', onInboxCounts)
  })

  onBeforeUnmount(() => {
    stopPolling()
    document.removeEventListener('visibilitychange', onVisibilityChange)
    emitter.off('inbox-changed', refresh)
    emitter.off('inbox-counts', onInboxCounts)
  })

  return { waitingForHuman, openTickets, refresh }
}
