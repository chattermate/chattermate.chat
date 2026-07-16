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
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { formatDistanceToNow } from 'date-fns'
import { useTicketsWorkspace } from '@/composables/useTicketsWorkspace'
import { formatSlaCountdown, ticketInitials } from '@/components/tickets/ticketMeta'
import TicketStatusBadge from '@/components/tickets/TicketStatusBadge.vue'
import TicketPriorityBadge from '@/components/tickets/TicketPriorityBadge.vue'
import TicketAiStateChip from '@/components/tickets/TicketAiStateChip.vue'
import TicketFilterBar from '@/components/tickets/TicketFilterBar.vue'
import TicketEmptyState from '@/components/tickets/TicketEmptyState.vue'
import TicketCreateModal from '@/components/tickets/TicketCreateModal.vue'
import { permissionChecks } from '@/utils/permissions'

const router = useRouter()
const {
  tickets, stats, pagination, page, filters, phase,
  error, planGated, hasActiveFilters, refresh, clearFilters,
} = useTicketsWorkspace()

const showCreateModal = ref(false)
const canManage = permissionChecks.canManageTickets()

const statChips = computed(() => [
  { label: 'Open', value: stats.value?.open ?? '—', color: 'var(--c-info)', alert: false },
  { label: 'Awaiting approval', value: stats.value?.awaiting_approval ?? '—', color: 'var(--c-warn)', alert: false },
  {
    label: 'SLA breaching',
    value: stats.value?.sla_breaching ?? '—',
    color: 'var(--c-danger)',
    alert: (stats.value?.sla_breaching ?? 0) > 0,
  },
  {
    label: 'AI-resolved',
    value: stats.value?.ai_resolved_pct_7d != null ? `${stats.value.ai_resolved_pct_7d}%` : '—',
    color: 'var(--c-positive)',
    alert: false,
    sub: 'last 7 days',
  },
])

const timeAgo = (iso?: string | null) =>
  iso ? formatDistanceToNow(new Date(iso), { addSuffix: false }) : ''

function openTicket(id: string) {
  router.push(`/tickets/${id}`)
}
</script>

<template>
  <div class="tickets-view">
    <div class="page-header">
      <div>
        <h1 class="page-title">Tickets</h1>
        <p class="page-subtitle">
          The AI investigates in the open — every conclusion traces back to evidence.
        </p>
      </div>
      <button v-if="canManage" class="new-ticket-btn" @click="showCreateModal = true">
        <span class="plus">+</span> New ticket
      </button>
    </div>

    <div v-if="planGated" class="plan-gate">
      {{ error }}
    </div>

    <template v-else>
      <div class="stat-grid">
        <div v-for="chip in statChips" :key="chip.label" class="stat-card">
          <div class="stat-label">
            <span class="stat-dot" :style="{ background: chip.color }"></span>
            {{ chip.label }}
          </div>
          <div class="stat-value" :style="chip.alert ? { color: chip.color } : {}">
            {{ chip.value }}
            <span v-if="chip.sub" class="stat-sub">{{ chip.sub }}</span>
          </div>
        </div>
      </div>

      <TicketFilterBar :filters="filters" />

      <div class="ticket-table">
        <div class="table-scroll">
          <div class="table-head">
            <span>Ticket</span><span>Title</span><span>Status</span><span>Priority</span>
            <span>AI state</span><span>Assignee / SLA</span><span class="right">Updated</span>
          </div>

          <div v-if="phase === 'loading'" class="table-loading">Loading tickets…</div>

          <template v-else-if="phase === 'populated'">
            <div
              v-for="ticket in tickets"
              :key="ticket.id"
              class="table-row"
              @click="openTicket(ticket.id)"
            >
              <span class="ticket-number">{{ ticket.display_number }}</span>
              <div class="title-cell">
                <div class="ticket-title">{{ ticket.title }}</div>
                <div v-if="ticket.tags?.length" class="ticket-tags">
                  {{ ticket.tags.join(' · ') }}
                </div>
              </div>
              <span><TicketStatusBadge :status="ticket.status" /></span>
              <span><TicketPriorityBadge :priority="ticket.priority" /></span>
              <span><TicketAiStateChip :state="ticket.ai_state" /></span>
              <div class="assignee-cell">
                <span
                  class="avatar"
                  :class="{ 'avatar-ai': !ticket.assignee_name }"
                  :title="ticket.assignee_name || 'ChatterMate AI'"
                >
                  {{ ticketInitials(ticket.assignee_name) }}
                </span>
                <span
                  class="sla"
                  :style="{ color: formatSlaCountdown(ticket.sla_due_at, ticket.resolved_at).color }"
                >
                  {{ formatSlaCountdown(ticket.sla_due_at, ticket.resolved_at).label }}
                </span>
              </div>
              <span class="updated">{{ timeAgo(ticket.updated_at) }}</span>
            </div>
          </template>

          <TicketEmptyState
            v-else
            :filtered="hasActiveFilters"
            @clear="clearFilters"
            @create="showCreateModal = true"
          />
        </div>

        <div v-if="pagination && pagination.total_pages > 1" class="pager">
          <button class="pager-btn" :disabled="page <= 1" @click="page--">← Prev</button>
          <span class="pager-info">Page {{ pagination.page }} of {{ pagination.total_pages }}</span>
          <button class="pager-btn" :disabled="page >= pagination.total_pages" @click="page++">
            Next →
          </button>
        </div>
      </div>
    </template>

    <TicketCreateModal
      :open="showCreateModal"
      @close="showCreateModal = false"
      @created="refresh()"
    />
  </div>
</template>

<style scoped>
.tickets-view {
  padding: 26px 30px 36px;
}
.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 20px;
}
.page-title {
  font-family: var(--font-display);
  font-weight: var(--font-weight-bold);
  font-size: 25px;
  letter-spacing: var(--tracking-display);
  margin: 0 0 4px;
  color: var(--text);
}
.page-subtitle {
  margin: 0;
  font-size: 13px;
  color: var(--muted);
}
.new-ticket-btn {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 9px 16px;
  background: var(--accent-solid);
  color: var(--on-accent-solid);
  border: none;
  border-radius: 10px;
  font-size: 13.5px;
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
}
.plus {
  font-size: 15px;
  line-height: 0;
}
.plan-gate {
  padding: 40px;
  text-align: center;
  color: var(--muted);
  background: var(--surface);
  border: 1px solid var(--o08);
  border-radius: 15px;
}
.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}
.stat-card {
  background: var(--surface);
  border: 1px solid var(--o08);
  border-radius: 14px;
  padding: 15px 17px;
}
.stat-label {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 10px;
  font-size: 12px;
  color: var(--muted);
}
.stat-dot {
  width: 7px;
  height: 7px;
  border-radius: 2px;
}
.stat-value {
  font-family: var(--font-display);
  font-weight: var(--font-weight-bold);
  font-size: 28px;
  letter-spacing: var(--tracking-display);
  line-height: 1;
  color: var(--text);
  display: flex;
  align-items: baseline;
  gap: 7px;
}
.stat-sub {
  font-size: 11.5px;
  font-family: var(--font-sans);
  font-weight: var(--font-weight-normal);
  color: var(--faint);
}
.ticket-table {
  border: 1px solid var(--o08);
  border-radius: 15px;
  background: var(--surface);
  overflow: hidden;
}
.table-scroll {
  overflow-x: auto;
}
.table-head,
.table-row {
  display: grid;
  grid-template-columns: 98px minmax(200px, 1fr) 150px 96px 158px 132px 92px;
  gap: 14px;
  align-items: center;
  padding: 11px 20px;
  min-width: 900px;
}
.table-head {
  border-bottom: 1px solid var(--o07);
  background: var(--o03);
  font-family: var(--font-mono);
  font-size: 10.5px;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: var(--faint);
}
.table-row {
  padding: 14px 20px;
  border-bottom: 1px solid var(--o06);
  cursor: pointer;
}
.table-row:hover {
  background: var(--o03);
}
.table-row:last-child {
  border-bottom: none;
}
.table-loading {
  padding: 46px 20px;
  text-align: center;
  color: var(--muted);
  font-size: 13px;
}
.ticket-number {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--muted);
}
.title-cell {
  min-width: 0;
}
.ticket-title {
  font-size: 13.5px;
  font-weight: var(--font-weight-medium);
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ticket-tags {
  font-family: var(--font-mono);
  font-size: 10.5px;
  color: var(--faint);
  margin-top: 3px;
}
.assignee-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}
.avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--c-purple);
  color: var(--on-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: var(--font-weight-bold);
  flex-shrink: 0;
}
.avatar-ai {
  background: var(--accent-solid);
  color: var(--on-accent-solid);
  border-radius: 8px;
}
.sla {
  font-family: var(--font-mono);
  font-size: 11.5px;
  font-weight: var(--font-weight-semibold);
}
.updated {
  text-align: right;
  font-size: 11.5px;
  color: var(--faint);
}
.right {
  text-align: right;
}
.pager {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 12px;
  border-top: 1px solid var(--o07);
}
.pager-btn {
  padding: 6px 12px;
  background: var(--o05);
  border: 1px solid var(--o10);
  color: var(--text);
  border-radius: 8px;
  font-size: 12px;
  cursor: pointer;
}
.pager-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.pager-info {
  font-size: 12px;
  color: var(--muted);
}
@media (max-width: 900px) {
  .stat-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
