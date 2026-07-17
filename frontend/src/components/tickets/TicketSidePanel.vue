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
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { Ticket } from '@/types/ticket'
import { formatSlaCountdown, ticketInitials } from './ticketMeta'
import { useUsers } from '@/composables/useUsers'

const props = defineProps<{
  ticket: Ticket
  linkedSessionIds: string[]
  canManage: boolean
}>()

const emit = defineEmits<{
  (e: 'assign', userId: string | null): void
  (e: 'set-customer', email: string, name?: string): void
}>()

const router = useRouter()
const { users, fetchUsers } = useUsers()
const isPickingAssignee = ref(false)

const isEditingCustomer = ref(false)
const customerEmailDraft = ref('')
const customerNameDraft = ref('')

function startCustomerEdit() {
  customerEmailDraft.value = props.ticket.customer?.email || ''
  customerNameDraft.value = props.ticket.customer?.full_name || ''
  isEditingCustomer.value = true
}

function saveCustomer() {
  if (!customerEmailDraft.value.trim()) return
  emit('set-customer', customerEmailDraft.value, customerNameDraft.value)
  isEditingCustomer.value = false
}

onMounted(() => {
  if (props.canManage) fetchUsers().catch(() => {})
})

const sla = computed(() => formatSlaCountdown(props.ticket.sla_due_at, props.ticket.resolved_at))
const firstResponseMet = computed(() => !!props.ticket.first_response_at)

const assigneeName = computed(
  () => props.ticket.assignee?.full_name || props.ticket.assignee_name || null,
)

function openConversation() {
  if (props.linkedSessionIds.length) {
    router.push({ path: '/conversations', query: { session: props.linkedSessionIds[0] } })
  }
}

function pickAssignee(userId: string | null) {
  isPickingAssignee.value = false
  emit('assign', userId)
}
</script>

<template>
  <aside class="side-panel">
    <div class="panel-card">
      <div class="card-label">Assignee</div>
      <div class="assignee-row">
        <span class="avatar" :class="{ ai: !assigneeName }">
          {{ ticketInitials(assigneeName) }}
        </span>
        <div class="assignee-info">
          <div class="assignee-name">{{ assigneeName || 'ChatterMate AI' }}</div>
          <div class="assignee-sub">{{ assigneeName ? 'Human agent' : 'Unassigned — AI handles' }}</div>
        </div>
        <button v-if="canManage" class="change-btn" @click="isPickingAssignee = !isPickingAssignee">
          Change
        </button>
      </div>
      <div v-if="isPickingAssignee" class="assignee-picker">
        <button class="picker-option" @click="pickAssignee(null)">ChatterMate AI (unassign)</button>
        <button
          v-for="user in users"
          :key="user.id"
          class="picker-option"
          @click="pickAssignee(user.id)"
        >
          {{ user.full_name || user.email }}
        </button>
      </div>
    </div>

    <div class="panel-card">
      <div class="card-label-row">
        <div class="card-label">Customer</div>
        <button
          v-if="canManage && !isEditingCustomer"
          class="change-btn"
          @click="startCustomerEdit"
        >
          {{ ticket.customer ? 'Edit' : 'Add' }}
        </button>
      </div>
      <template v-if="isEditingCustomer">
        <input
          v-model="customerEmailDraft"
          type="email"
          class="customer-input"
          placeholder="customer@company.com"
          maxlength="320"
        />
        <input
          v-model="customerNameDraft"
          class="customer-input"
          placeholder="Name (optional)"
          maxlength="200"
        />
        <div class="customer-edit-actions">
          <button class="customer-cancel" @click="isEditingCustomer = false">Cancel</button>
          <button
            class="customer-save"
            :disabled="!customerEmailDraft.trim()"
            @click="saveCustomer"
          >
            Save
          </button>
        </div>
      </template>
      <div v-else-if="ticket.customer" class="customer-row">
        <span class="customer-avatar">
          {{ (ticket.customer.full_name || ticket.customer.email || '?')[0]?.toUpperCase() }}
        </span>
        <div>
          <div class="assignee-name">{{ ticket.customer.full_name || 'Customer' }}</div>
          <div class="assignee-sub">{{ ticket.customer.email }}</div>
        </div>
      </div>
      <div v-else class="no-customer">
        No customer linked — notifications can't be sent for this ticket.
      </div>
    </div>

    <div v-if="linkedSessionIds.length" class="panel-card">
      <div class="card-label">Linked conversation</div>
      <button class="open-conversation" @click="openConversation">Open conversation →</button>
    </div>

    <div class="panel-card">
      <div class="card-label">SLA</div>
      <div class="sla-row">
        <span class="sla-label">First response</span>
        <span class="sla-value" :style="{ color: firstResponseMet ? 'var(--c-positive)' : 'var(--muted2)' }">
          {{ firstResponseMet ? '✓ Met' : 'Pending' }}
        </span>
      </div>
      <div class="sla-row">
        <span class="sla-label">Resolution</span>
        <span class="sla-value mono" :style="{ color: sla.color }">{{ sla.label }}</span>
      </div>
    </div>

    <div v-if="ticket.intent || ticket.ai_summary" class="panel-card">
      <div class="card-label">AI triage</div>
      <div v-if="ticket.intent" class="triage-row">
        <span class="sla-label">Intent</span>
        <span class="sla-value mono">{{ ticket.intent }}</span>
      </div>
      <div v-if="ticket.triage_confidence != null" class="triage-row">
        <span class="sla-label">Confidence</span>
        <span class="sla-value mono">{{ ticket.triage_confidence.toFixed(2) }}</span>
      </div>
      <p v-if="ticket.ai_summary" class="triage-summary">{{ ticket.ai_summary }}</p>
    </div>

    <div v-if="ticket.external_ref_id" class="panel-card">
      <div class="card-label">External reference</div>
      <a
        :href="ticket.external_ref_url || '#'"
        target="_blank"
        rel="noopener"
        class="external-ref"
      >
        {{ ticket.external_ref_type }} · {{ ticket.external_ref_id }}
      </a>
    </div>
  </aside>
</template>

<style scoped>
.side-panel {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.panel-card {
  background: var(--surface);
  border: 1px solid var(--o08);
  border-radius: 13px;
  padding: 15px;
}
.card-label {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: var(--faint);
  margin-bottom: 11px;
}
.assignee-row,
.customer-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--c-coral);
  color: var(--on-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: var(--font-weight-bold);
  flex-shrink: 0;
}
.avatar.ai {
  border-radius: 9px;
  background: var(--accent-solid);
  color: var(--on-accent-solid);
}
.no-customer {
  font-size: 12px;
  color: var(--faint);
  line-height: 1.5;
}
.card-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.customer-input {
  width: 100%;
  padding: 8px 11px;
  background: var(--bg2);
  border: 1px solid var(--o10);
  border-radius: 9px;
  color: var(--text);
  font-size: 12.5px;
  outline: none;
  margin-bottom: 8px;
}
.customer-edit-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
.customer-cancel {
  padding: 6px 12px;
  background: var(--o05);
  border: 1px solid var(--o10);
  color: var(--muted);
  border-radius: 8px;
  font-size: 12px;
  cursor: pointer;
}
.customer-save {
  padding: 6px 14px;
  background: var(--accent-solid);
  color: var(--on-accent-solid);
  border: none;
  border-radius: 8px;
  font-size: 12px;
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
}
.customer-save:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.customer-avatar {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: var(--grad-purple-teal);
  color: var(--on-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: var(--font-weight-bold);
  font-family: var(--font-display);
  flex-shrink: 0;
}
.assignee-info {
  flex: 1;
  min-width: 0;
}
.assignee-name {
  font-size: 13px;
  font-weight: var(--font-weight-semibold);
  color: var(--text);
}
.assignee-sub {
  font-size: 11px;
  color: var(--faint);
  overflow: hidden;
  text-overflow: ellipsis;
}
.change-btn {
  font-size: 11.5px;
  color: var(--accent-ink);
  background: var(--accent-bg-08);
  border: none;
  padding: 4px 9px;
  border-radius: 7px;
  cursor: pointer;
}
.assignee-picker {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-height: 200px;
  overflow-y: auto;
}
.picker-option {
  text-align: left;
  padding: 7px 10px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--text3);
  font-size: 12.5px;
  cursor: pointer;
}
.picker-option:hover {
  background: var(--o05);
  color: var(--text);
}
.open-conversation {
  width: 100%;
  padding: 9px;
  background: var(--o05);
  border: 1px solid var(--o10);
  color: var(--text);
  border-radius: 9px;
  font-size: 12.5px;
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
}
.open-conversation:hover {
  background: var(--o08);
}
.sla-row,
.triage-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 9px;
}
.sla-row:last-child,
.triage-row:last-child {
  margin-bottom: 0;
}
.sla-label {
  font-size: 12.5px;
  color: var(--text3);
}
.sla-value {
  font-size: 11.5px;
  font-weight: var(--font-weight-semibold);
}
.mono {
  font-family: var(--font-mono);
  font-size: 12px;
}
.triage-summary {
  margin: 10px 0 0;
  font-size: 12.5px;
  line-height: 1.55;
  color: var(--text3);
}
.external-ref {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--c-teal);
  text-decoration: none;
}
</style>
