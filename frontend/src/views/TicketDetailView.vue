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
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { useTicketDetail } from '@/composables/useTicketDetail'
import { SELECTABLE_STATUSES, statusMeta, PRIORITIES, priorityMeta } from '@/components/tickets/ticketMeta'
import TicketStatusBadge from '@/components/tickets/TicketStatusBadge.vue'
import TicketAiStateChip from '@/components/tickets/TicketAiStateChip.vue'
import TicketActivityFeed from '@/components/tickets/TicketActivityFeed.vue'
import TicketSidePanel from '@/components/tickets/TicketSidePanel.vue'
import TicketInvestigationPanel from '@/components/tickets/TicketInvestigationPanel.vue'
import TicketRcaDoc from '@/components/tickets/TicketRcaDoc.vue'
import TicketApprovalBanner from '@/components/tickets/TicketApprovalBanner.vue'
import { permissionChecks } from '@/utils/permissions'
import type { TicketPriority, TicketStatus } from '@/types/ticket'

const route = useRoute()
const router = useRouter()
const ticketId = computed(() => String(route.params.id))

const {
  detail, investigation, ticket, activities, hasActiveRun, isLoading, isSavingComment,
  error, setStatus, setPriority, setSeverity, setTitle, setDescription,
  setAssignee, setCustomer, addComment, resolve, reopen, investigate,
  saveRcaDraft, sendRcaToCustomer, isRcaBusy, approveProposal, rejectProposal,
} = useTicketDetail(ticketId)

const canManage = permissionChecks.canManageTickets()
const canApprove = permissionChecks.canApproveTicketActions()

// The banner shows a pending proposal always; a decided one only while the
// ticket still reflects that decision (approved → resolved states).
const bannerProposal = computed(() => {
  const proposal = investigation.value?.proposal
  if (!proposal) return null
  if (proposal.status === 'pending') return proposal
  if (proposal.status === 'approved' &&
      ['resolved', 'resolved_pending_confirmation', 'closed'].includes(ticket.value?.status || '')) {
    return proposal
  }
  if (proposal.status === 'rejected' && !hasActiveRun.value) return proposal
  return null
})
const titleDraft = ref<string | null>(null)
const showResolvePanel = ref(false)
const resolveOutcome = ref('fixed')
const resolveCustomerMessage = ref('')

const RESOLVE_OUTCOMES = [
  ['fixed', 'Fixed'],
  ['workaround', 'Workaround provided'],
  ['not_a_bug', 'Not a bug'],
  ['duplicate', 'Duplicate'],
  ['cannot_reproduce', 'Cannot reproduce'],
] as const

const isReopenable = computed(() =>
  ['resolved', 'closed', 'resolved_pending_confirmation'].includes(ticket.value?.status || ''),
)

// No linked conversation and no customer email → nothing to deliver through,
// so hide every "send to customer" affordance instead of faking it.
const canNotifyCustomer = computed(() => detail.value?.can_notify_customer ?? false)

const isEditingDescription = ref(false)
const descriptionDraft = ref('')

function startDescriptionEdit() {
  descriptionDraft.value = ticket.value?.description || ''
  isEditingDescription.value = true
}

async function saveDescription() {
  await setDescription(descriptionDraft.value.trim())
  isEditingDescription.value = false
}

function commitTitle() {
  if (titleDraft.value !== null && ticket.value && titleDraft.value.trim() && titleDraft.value !== ticket.value.title) {
    setTitle(titleDraft.value.trim())
  }
  titleDraft.value = null
}

function copyLink() {
  navigator.clipboard
    .writeText(window.location.href)
    .then(() => toast.success('Link copied'))
    .catch(() => {})
}

const isResolving = ref(false)
async function submitResolve() {
  // Guard against a double-clicked resolve firing multiple /resolve calls,
  // which would send the customer the resolution message more than once.
  if (isResolving.value) return
  isResolving.value = true
  try {
    await resolve({
      outcome: resolveOutcome.value,
      customer_message: resolveCustomerMessage.value.trim() || undefined,
    })
    showResolvePanel.value = false
    resolveCustomerMessage.value = ''
  } finally {
    isResolving.value = false
  }
}
</script>

<template>
  <DashboardLayout>
  <div class="ticket-detail-view">
    <div v-if="isLoading && !ticket" class="loading-state">Loading ticket…</div>
    <div v-else-if="error && !ticket" class="error-state">
      {{ error }}
      <button class="back-btn" @click="router.push('/tickets')">← Back to tickets</button>
    </div>

    <div v-else-if="ticket" class="detail-grid">
      <!-- MAIN COLUMN -->
      <div class="main-col">
        <div class="detail-header">
          <div class="header-chips">
            <button class="back-chip" @click="router.push('/tickets')">← Tickets</button>
            <span class="ticket-number">{{ ticket.display_number }}</span>
            <TicketStatusBadge :status="ticket.status" />
            <TicketAiStateChip :state="ticket.ai_state" />
            <button class="copy-link" @click="copyLink">Copy link</button>
          </div>

          <input
            class="title-input"
            :value="titleDraft ?? ticket.title"
            :readonly="!canManage"
            :title="canManage ? 'Click to edit the title' : undefined"
            @input="titleDraft = ($event.target as HTMLInputElement).value"
            @blur="commitTitle"
            @keydown.enter="($event.target as HTMLInputElement).blur()"
          />
          <div v-if="ticket.original_title && ticket.original_title !== ticket.title" class="original-title">
            Originally: “{{ ticket.original_title }}”
          </div>

          <div class="control-row">
            <div class="control">
              <span class="control-label">Status</span>
              <select
                :value="ticket.status"
                :disabled="!canManage"
                class="control-select"
                @change="setStatus(($event.target as HTMLSelectElement).value as TicketStatus)"
              >
                <option v-if="!SELECTABLE_STATUSES.includes(ticket.status)" :value="ticket.status">
                  {{ statusMeta(ticket.status).label }}
                </option>
                <option v-for="status in SELECTABLE_STATUSES" :key="status" :value="status">
                  {{ statusMeta(status).label }}
                </option>
              </select>
            </div>
            <div class="control">
              <span class="control-label">Priority</span>
              <select
                :value="ticket.priority"
                :disabled="!canManage"
                class="control-select"
                :style="{ color: priorityMeta(ticket.priority).color }"
                @change="setPriority(($event.target as HTMLSelectElement).value as TicketPriority)"
              >
                <option v-for="p in PRIORITIES" :key="p" :value="p">{{ priorityMeta(p).label }}</option>
              </select>
            </div>
            <div class="control">
              <span class="control-label">Severity</span>
              <select
                :value="ticket.severity ?? ''"
                :disabled="!canManage"
                class="control-select"
                @change="setSeverity(Number(($event.target as HTMLSelectElement).value))"
              >
                <option value="" disabled>—</option>
                <option :value="1">SEV-1</option>
                <option :value="2">SEV-2</option>
                <option :value="3">SEV-3</option>
              </select>
            </div>

            <div class="header-actions">
              <button
                v-if="canManage && !hasActiveRun"
                class="action-btn"
                :disabled="isReopenable"
                :title="
                  isReopenable
                    ? 'This ticket is resolved — reopen it to investigate again'
                    : 'Run an AI investigation (hypotheses + evidence + RCA)'
                "
                @click="investigate()"
              >
                <font-awesome-icon :icon="['fas', 'bolt']" />
                Investigate
              </button>
              <button
                v-if="canManage && isReopenable"
                class="action-btn"
                @click="reopen()"
              >
                Reopen
              </button>
              <button
                v-if="canManage && !isReopenable"
                class="action-btn resolve"
                @click="showResolvePanel = !showResolvePanel"
              >
                Resolve…
              </button>
            </div>
          </div>
        </div>

        <!-- L2 APPROVAL BANNER — pinned above everything else -->
        <TicketApprovalBanner
          v-if="bannerProposal"
          :proposal="bannerProposal"
          :hypotheses="investigation?.hypotheses || []"
          :can-approve="canApprove"
          @approve="approveProposal"
          @reject="(reason, reinvestigate) => rejectProposal(reason, reinvestigate)"
        />

        <div v-if="hasActiveRun" class="run-banner">
          <span class="run-dot"></span>
          AI is working on this ticket — triage and classification update live.
        </div>

        <div v-if="showResolvePanel" class="resolve-panel">
          <div class="resolve-title">Resolve {{ ticket.display_number }}</div>
          <label class="field-label">Outcome</label>
          <select v-model="resolveOutcome" class="control-select outcome-select">
            <option v-for="[value, label] in RESOLVE_OUTCOMES" :key="value" :value="value">
              {{ label }}
            </option>
          </select>
          <template v-if="canNotifyCustomer">
            <label class="field-label">Message to the customer (plain language)</label>
            <textarea
              v-model="resolveCustomerMessage"
              class="resolve-textarea"
              placeholder="What happened and what was done to fix it…"
            ></textarea>
          </template>
          <div class="resolve-actions">
            <button class="action-btn" @click="showResolvePanel = false">Cancel</button>
            <button class="resolve-submit" :disabled="isResolving" @click="submitResolve">
              {{ isResolving ? 'Resolving…' : (canNotifyCustomer ? 'Resolve & notify customer' : 'Resolve') }}
            </button>
          </div>
          <div class="resolve-hint">
            <template v-if="canNotifyCustomer">
              The ticket waits for customer confirmation and closes automatically after the
              configured timeout.
            </template>
            <template v-else>
              No customer is linked to this ticket, so no notification will be sent.
            </template>
          </div>
        </div>

        <div v-if="ticket.description || canManage" class="description-card">
          <div class="card-header-row">
            <div class="card-label">Description</div>
            <button
              v-if="canManage && !isEditingDescription"
              class="edit-btn"
              @click="startDescriptionEdit"
            >
              {{ ticket.description ? 'Edit' : 'Add' }}
            </button>
          </div>
          <template v-if="isEditingDescription">
            <textarea
              v-model="descriptionDraft"
              class="description-editor"
              placeholder="What's happening? Include any error, customer impact, and steps…"
            ></textarea>
            <div class="edit-actions">
              <button class="action-btn" @click="isEditingDescription = false">Cancel</button>
              <button class="edit-save" @click="saveDescription">Save</button>
            </div>
          </template>
          <p v-else-if="ticket.description" class="description-text">{{ ticket.description }}</p>
          <p v-else class="description-empty">No description yet.</p>
        </div>

        <div v-if="ticket.ai_summary" class="summary-card">
          <div class="card-label">AI summary</div>
          <p class="description-text">{{ ticket.ai_summary }}</p>
        </div>

        <!-- GLASS BOX: hypotheses + evidence of the latest investigation run -->
        <TicketInvestigationPanel
          v-if="investigation?.run"
          :investigation="investigation"
        />

        <TicketRcaDoc
          v-if="investigation?.rca"
          :rca="investigation.rca"
          :can-manage="canManage"
          :can-notify="canNotifyCustomer"
          :is-busy="isRcaBusy"
          @save-draft="saveRcaDraft"
          @send-customer="sendRcaToCustomer"
        />

        <TicketActivityFeed
          :activities="activities"
          :can-comment="true"
          :can-message-customer="canNotifyCustomer"
          :is-saving="isSavingComment"
          @comment="addComment"
        />
      </div>

      <!-- SIDE PANEL -->
      <TicketSidePanel
        :ticket="ticket"
        :linked-session-ids="detail?.linked_session_ids || []"
        :can-manage="canManage"
        @assign="setAssignee"
        @set-customer="setCustomer"
      />
    </div>
  </div>
  </DashboardLayout>
</template>

<style scoped>
.ticket-detail-view {
  padding: 24px 28px 70px;
}
.loading-state,
.error-state {
  padding: 60px 20px;
  text-align: center;
  color: var(--muted);
  font-size: 13.5px;
}
.back-btn {
  display: block;
  margin: 16px auto 0;
  padding: 8px 14px;
  background: var(--o05);
  border: 1px solid var(--o10);
  color: var(--text);
  border-radius: 9px;
  cursor: pointer;
}
.detail-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 336px;
  gap: 24px;
  align-items: start;
}
.main-col {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.header-chips {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}
.back-chip {
  padding: 5px 10px;
  border-radius: 8px;
  background: var(--o04);
  border: 1px solid var(--o10);
  color: var(--muted);
  cursor: pointer;
  font-size: 12.5px;
}
.ticket-number {
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--muted2);
  background: var(--o05);
  border: 1px solid var(--o08);
  padding: 3px 9px;
  border-radius: 7px;
}
.copy-link {
  margin-left: auto;
  padding: 6px 11px;
  border-radius: 9px;
  background: var(--o04);
  border: 1px solid var(--o10);
  color: var(--muted);
  cursor: pointer;
  font-size: 12.5px;
}
.title-input {
  width: 100%;
  font-family: var(--font-display);
  font-weight: var(--font-weight-bold);
  font-size: 24px;
  letter-spacing: var(--tracking-display);
  color: var(--text);
  background: transparent;
  border: none;
  border-bottom: 1px dashed transparent;
  outline: none;
  padding: 2px 0;
  margin: 0 0 4px;
}
.title-input:not([readonly]):hover,
.title-input:not([readonly]):focus {
  border-bottom-color: var(--o16);
}
.original-title {
  font-size: 11.5px;
  color: var(--faint);
  margin-bottom: 10px;
}
.control-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 10px;
}
.control {
  display: flex;
  align-items: center;
  gap: 7px;
  background: var(--surface);
  border: 1px solid var(--o08);
  border-radius: 9px;
  padding: 6px 10px;
}
.control-label {
  font-size: 11px;
  color: var(--faint);
}
.control-select {
  background: transparent;
  border: none;
  color: var(--text);
  font-size: 12.5px;
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  outline: none;
}
.header-actions {
  margin-left: auto;
  display: flex;
  gap: 8px;
}
.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 13px;
  background: var(--o05);
  border: 1px solid var(--o10);
  color: var(--text);
  border-radius: 9px;
  font-size: 12.5px;
  cursor: pointer;
}
.action-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.action-btn.resolve {
  border-color: var(--c-positive);
  color: var(--c-positive);
}
.run-banner {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 11px 15px;
  background: color-mix(in srgb, var(--c-info) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--c-info) 40%, transparent);
  border-radius: 12px;
  font-size: 12.5px;
  color: var(--text3);
}
.run-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--c-info);
  animation: ticket-pulse 1.3s ease-in-out infinite;
}
@keyframes ticket-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.35; }
}
.resolve-panel {
  border: 1px solid var(--c-positive);
  background: color-mix(in srgb, var(--c-positive) 8%, transparent);
  border-radius: 14px;
  padding: 16px 18px;
}
.resolve-title {
  font-family: var(--font-display);
  font-weight: var(--font-weight-bold);
  font-size: 15px;
  color: var(--text);
  margin-bottom: 12px;
}
.field-label {
  display: block;
  font-size: 11.5px;
  color: var(--faint);
  margin: 10px 0 6px;
}
.outcome-select {
  background: var(--surface);
  border: 1px solid var(--o10);
  border-radius: 9px;
  padding: 8px 10px;
}
.resolve-textarea {
  width: 100%;
  min-height: 76px;
  resize: vertical;
  background: var(--surface);
  border: 1px solid var(--o10);
  border-radius: 10px;
  padding: 10px 12px;
  color: var(--text);
  font-size: 13px;
  line-height: 1.5;
  outline: none;
}
.resolve-actions {
  display: flex;
  justify-content: flex-end;
  gap: 9px;
  margin-top: 12px;
}
.resolve-submit {
  padding: 9px 16px;
  background: var(--c-positive);
  color: var(--on-light, #04140d);
  border: none;
  border-radius: 9px;
  font-size: 13px;
  font-weight: var(--font-weight-bold);
  cursor: pointer;
}
.resolve-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.resolve-hint {
  margin-top: 10px;
  font-size: 11.5px;
  color: var(--muted);
}
.description-card,
.summary-card {
  background: var(--surface);
  border: 1px solid var(--o08);
  border-radius: 15px;
  padding: 18px 20px;
}
.card-label {
  font-family: var(--font-mono);
  font-size: 10.5px;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: var(--faint);
  margin-bottom: 10px;
}
.description-text {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: var(--text3);
  white-space: pre-wrap;
  word-break: break-word;
}
.description-empty {
  margin: 0;
  font-size: 13px;
  color: var(--faint);
}
.card-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.edit-btn {
  font-size: 11.5px;
  color: var(--accent-ink);
  background: var(--accent-bg-08);
  border: none;
  padding: 4px 10px;
  border-radius: 7px;
  cursor: pointer;
  margin-bottom: 10px;
}
.description-editor {
  width: 100%;
  min-height: 96px;
  resize: vertical;
  background: var(--bg2);
  border: 1px solid var(--o10);
  border-radius: 10px;
  padding: 10px 12px;
  color: var(--text);
  font-size: 13.5px;
  line-height: 1.55;
  outline: none;
}
.edit-actions {
  display: flex;
  justify-content: flex-end;
  gap: 9px;
  margin-top: 10px;
}
.edit-save {
  padding: 7px 15px;
  background: var(--accent-solid);
  color: var(--on-accent-solid);
  border: none;
  border-radius: 9px;
  font-size: 12.5px;
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
}
@media (max-width: 1100px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
