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

import { computed, onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue'
import { toast } from 'vue-sonner'
import { ticketService } from '@/services/tickets'
import { useTicketSocket } from '@/composables/useTicketSocket'
import type {
  InvestigationDetail,
  Ticket,
  TicketActivity,
  TicketDetail,
  TicketPriority,
  TicketStatus,
  TicketUpdatePayload,
} from '@/types/ticket'

// Poll fallback cadence: brisk while an AI run is active, relaxed otherwise.
const ACTIVE_POLL_MS = 3000
const IDLE_POLL_MS = 15000

export function useTicketDetail(ticketId: Ref<string>) {
  const detail = ref<TicketDetail | null>(null)
  const investigation = ref<InvestigationDetail | null>(null)
  const isLoading = ref(true)
  const error = ref<string | null>(null)
  const isSavingComment = ref(false)

  const ticket = computed<Ticket | null>(() => detail.value?.ticket ?? null)
  const activities = computed<TicketActivity[]>(() => detail.value?.activities ?? [])
  const hasActiveRun = computed(() =>
    (detail.value?.runs ?? []).some((r) => r.status === 'pending' || r.status === 'running'),
  )

  async function refresh(silent = false) {
    if (!ticketId.value) return
    if (!silent) isLoading.value = true
    try {
      // The glass box loads alongside the ticket; its failure (e.g. plan
      // gate) must never take the whole page down.
      const [detailData, investigationData] = await Promise.all([
        ticketService.getTicket(ticketId.value),
        ticketService.getInvestigation(ticketId.value).catch(() => null),
      ])
      detail.value = detailData
      investigation.value = investigationData
      error.value = null
    } catch (e: any) {
      if (!silent) error.value = e?.message || 'Failed to load the ticket'
    } finally {
      isLoading.value = false
    }
  }

  async function patch(patchPayload: TicketUpdatePayload, failureMessage: string) {
    if (!detail.value) return
    const previous = { ...detail.value.ticket }
    Object.assign(detail.value.ticket, patchPayload)
    try {
      await ticketService.updateTicket(previous.id, patchPayload)
      await refresh(true)
    } catch (e: any) {
      detail.value.ticket = previous
      toast.error(e?.message || failureMessage)
    }
  }

  const setStatus = (status: TicketStatus) => patch({ status }, 'Failed to change the status')
  const setPriority = (priority: TicketPriority) => patch({ priority }, 'Failed to change the priority')
  const setSeverity = (severity: number) => patch({ severity }, 'Failed to change the severity')
  const setTitle = (title: string) => patch({ title }, 'Failed to rename the ticket')
  const setDescription = (description: string) =>
    patch({ description }, 'Failed to update the description')
  const setAssignee = (assignee_user_id: string | null) =>
    patch({ assignee_user_id }, 'Failed to assign the ticket')

  async function setCustomer(email: string, name?: string) {
    if (!detail.value || !email.trim()) return
    try {
      await ticketService.updateTicket(detail.value.ticket.id, {
        customer_email: email.trim(),
        customer_name: name?.trim() || undefined,
      })
      await refresh(true)
      toast.success('Customer linked')
    } catch (e: any) {
      toast.error(e?.message || 'Failed to link the customer')
    }
  }

  async function addComment(body: string, isInternal = true) {
    if (!detail.value || !body.trim()) return
    isSavingComment.value = true
    try {
      await ticketService.addComment(detail.value.ticket.id, body.trim(), isInternal)
      await refresh(true)
    } catch (e: any) {
      toast.error(e?.message || 'Failed to post the comment')
    } finally {
      isSavingComment.value = false
    }
  }

  async function resolve(payload: { outcome?: string; resolution_summary?: string; customer_message?: string }) {
    if (!detail.value) return
    try {
      await ticketService.resolveTicket(detail.value.ticket.id, payload)
      await refresh(true)
      toast.success('Ticket resolved — customer notified')
    } catch (e: any) {
      toast.error(e?.message || 'Failed to resolve the ticket')
    }
  }

  async function reopen(reason?: string) {
    if (!detail.value) return
    try {
      await ticketService.reopenTicket(detail.value.ticket.id, reason)
      await refresh(true)
    } catch (e: any) {
      toast.error(e?.message || 'Failed to reopen the ticket')
    }
  }

  async function investigate(contextNote?: string) {
    if (!detail.value) return
    try {
      await ticketService.investigate(detail.value.ticket.id, {
        run_type: 'investigation',
        context_note: contextNote,
      })
      await refresh(true)
      toast.success('AI investigation queued')
    } catch (e: any) {
      toast.error(e?.message || 'Failed to start the AI run')
    }
  }

  async function saveRcaDraft(customerSummary: string) {
    if (!detail.value) return
    try {
      await ticketService.updateRca(detail.value.ticket.id, {
        customer_summary: customerSummary,
        mark_reviewed: true,
      })
      await refresh(true)
      toast.success('Draft saved')
    } catch (e: any) {
      toast.error(e?.message || 'Failed to save the draft')
    }
  }

  async function sendRcaToCustomer(customerSummary?: string) {
    if (!detail.value) return
    try {
      // Persist any unsaved edit first so what's sent is what's shown.
      if (customerSummary !== undefined) {
        await ticketService.updateRca(detail.value.ticket.id, {
          customer_summary: customerSummary,
          mark_reviewed: true,
        })
      }
      await ticketService.sendRcaToCustomer(detail.value.ticket.id)
      await refresh(true)
      toast.success('Summary sent to the customer')
    } catch (e: any) {
      toast.error(e?.message || 'Failed to send the summary')
    }
  }

  useTicketSocket((event) => {
    if (event.ticket_id === ticketId.value) refresh(true)
  })

  let pollTimer: ReturnType<typeof setTimeout> | null = null
  function scheduleNextPoll() {
    pollTimer = setTimeout(async () => {
      await refresh(true)
      scheduleNextPoll()
    }, hasActiveRun.value ? ACTIVE_POLL_MS : IDLE_POLL_MS)
  }

  onMounted(async () => {
    await refresh()
    scheduleNextPoll()
  })
  onBeforeUnmount(() => {
    if (pollTimer) clearTimeout(pollTimer)
  })
  watch(ticketId, () => refresh())

  return {
    detail,
    investigation,
    ticket,
    activities,
    hasActiveRun,
    isLoading,
    isSavingComment,
    error,
    refresh,
    setStatus,
    setPriority,
    setSeverity,
    setTitle,
    setDescription,
    setAssignee,
    setCustomer,
    addComment,
    resolve,
    reopen,
    investigate,
    saveRcaDraft,
    sendRcaToCustomer,
  }
}
