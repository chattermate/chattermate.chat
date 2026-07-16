<!--
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
-->

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ticketService } from '@/services/tickets'
import { useTicketSocket } from '@/composables/useTicketSocket'
import TicketStatusBadge from './TicketStatusBadge.vue'
import TicketAiStateChip from './TicketAiStateChip.vue'
import type { Ticket } from '@/types/ticket'

const props = defineProps<{ sessionId: string }>()
const router = useRouter()
const ticket = ref<Ticket | null>(null)

async function load() {
  ticket.value = props.sessionId
    ? await ticketService.getTicketBySession(props.sessionId)
    : null
}

useTicketSocket((event) => {
  if (ticket.value && event.ticket_id === ticket.value.id) load()
})

// Gentle refresh keeps the card honest if the ticket was just created by the
// chat AI mid-conversation.
let timer: ReturnType<typeof setInterval> | null = null
onMounted(() => {
  load()
  timer = setInterval(load, 20000)
})
onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
watch(() => props.sessionId, load)
</script>

<template>
  <div v-if="ticket" class="linked-ticket-card">
    <div class="card-header">
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="var(--accent-ink)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 9a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2 2 2 0 0 0 0 4 2 2 0 0 1-2 2H6a2 2 0 0 1-2-2 2 2 0 0 0 0-4z"></path>
      </svg>
      <span class="card-title">Linked ticket</span>
    </div>
    <div class="card-body">
      <div class="chip-row">
        <span class="ticket-number">{{ ticket.display_number }}</span>
        <TicketStatusBadge :status="ticket.status" />
      </div>
      <div class="ticket-title">{{ ticket.title }}</div>
      <TicketAiStateChip :state="ticket.ai_state" class="ai-line" />
      <button class="view-btn" @click="router.push(`/tickets/${ticket.id}`)">
        View ticket →
      </button>
    </div>
  </div>
</template>

<style scoped>
.linked-ticket-card {
  background: var(--surface);
  border: 1px solid var(--accent-border);
  border-radius: 13px;
  overflow: hidden;
}
.card-header {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 11px 15px;
  background: var(--accent-bg-08);
  border-bottom: 1px solid var(--o07);
}
.card-title {
  font-family: var(--font-display);
  font-weight: var(--font-weight-semibold);
  font-size: 12.5px;
  color: var(--accent-ink);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.card-body {
  padding: 15px;
}
.chip-row {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-bottom: 9px;
}
.ticket-number {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--muted2);
}
.ticket-title {
  font-size: 13.5px;
  font-weight: var(--font-weight-semibold);
  line-height: 1.4;
  margin-bottom: 11px;
  color: var(--text);
}
.ai-line {
  margin-bottom: 14px;
  display: inline-flex;
}
.view-btn {
  width: 100%;
  padding: 9px;
  background: var(--accent-solid);
  color: var(--on-accent-solid);
  border: none;
  border-radius: 9px;
  font-size: 12.5px;
  font-weight: var(--font-weight-bold);
  cursor: pointer;
}
</style>
