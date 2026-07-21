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
import type { InvestigationHypothesis, TicketProposal } from '@/types/ticket'

const props = defineProps<{
  proposal: TicketProposal
  hypotheses: InvestigationHypothesis[]
  canApprove: boolean
}>()

const emit = defineEmits<{
  (e: 'approve'): void
  (e: 'reject', reason: string, reinvestigate: boolean): void
}>()

const isRejecting = ref(false)
const rejectReason = ref('')
const reinvestigate = ref(true)
const isSubmitting = ref(false)

const bestHypothesis = computed(() => {
  const validated = props.hypotheses.filter((h) => h.status === 'validated')
  if (!validated.length) return null
  return validated.reduce((a, b) => ((a.confidence ?? 0) >= (b.confidence ?? 0) ? a : b))
})

function jumpToHypothesis() {
  if (!bestHypothesis.value) return
  document
    .getElementById(`hypothesis-${bestHypothesis.value.idx}`)
    ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

function approve() {
  isSubmitting.value = true
  emit('approve')
}

function submitReject() {
  isSubmitting.value = true
  emit('reject', rejectReason.value.trim(), reinvestigate.value)
}
</script>

<template>
  <div class="approval-banner" :class="proposal.status">
    <!-- PENDING -->
    <template v-if="proposal.status === 'pending'">
      <div class="banner-head">
        <font-awesome-icon :icon="['fas', 'hourglass-half']" class="banner-icon pending" />
        <div>
          <div class="banner-title">AI proposes a resolution — awaiting your approval</div>
          <div class="banner-sub">
            Approving resolves the ticket and sends the customer message below. ChatterMate never
            executes infrastructure changes — any fix stays with your team.
          </div>
        </div>
        <span v-if="proposal.confidence != null" class="confidence-chip mono">
          {{ proposal.confidence.toFixed(2) }}
        </span>
      </div>

      <div class="proposal-body">
        <div class="block-label">Proposed resolution</div>
        <p class="proposal-text">{{ proposal.summary }}</p>
        <template v-if="proposal.customer_message">
          <div class="block-label">Message to the customer</div>
          <p class="proposal-text customer">{{ proposal.customer_message }}</p>
        </template>
        <button v-if="bestHypothesis" class="reasoning-link" @click="jumpToHypothesis">
          Reasoning: H{{ bestHypothesis.idx }} · Validated
          <template v-if="bestHypothesis.confidence != null">
            · confidence {{ bestHypothesis.confidence.toFixed(2) }}
          </template>
          <font-awesome-icon :icon="['fas', 'arrow-down']" />
        </button>
      </div>

      <div v-if="canApprove" class="banner-actions">
        <template v-if="!isRejecting">
          <button class="reject-btn" :disabled="isSubmitting" @click="isRejecting = true">
            Reject…
          </button>
          <button class="approve-btn" :disabled="isSubmitting" @click="approve">
            <font-awesome-icon :icon="['fas', 'check']" />
            Approve &amp; resolve
          </button>
        </template>
        <div v-else class="reject-form">
          <textarea
            v-model="rejectReason"
            class="reject-input"
            placeholder="Why is this wrong? Your reason guides the next investigation…"
          ></textarea>
          <label class="reinvestigate-row">
            <input v-model="reinvestigate" type="checkbox" />
            Re-run the investigation with this feedback
          </label>
          <div class="reject-actions">
            <button class="cancel-btn" @click="isRejecting = false">Cancel</button>
            <button class="reject-confirm" :disabled="isSubmitting" @click="submitReject">
              Reject proposal
            </button>
          </div>
        </div>
      </div>
      <div v-else class="banner-sub">
        You don't have permission to approve AI actions on tickets.
      </div>
    </template>

    <!-- DECIDED -->
    <template v-else-if="proposal.status === 'approved'">
      <div class="banner-head">
        <font-awesome-icon :icon="['fas', 'circle-check']" class="banner-icon approved" />
        <div>
          <div class="banner-title">Proposal approved</div>
          <div class="banner-sub">
            <template v-if="proposal.decided_by_name">By {{ proposal.decided_by_name }} — </template>
            the ticket was resolved and the customer notified. Any infrastructure change is
            performed by your team, not ChatterMate.
          </div>
        </div>
      </div>
    </template>

    <template v-else-if="proposal.status === 'rejected'">
      <div class="banner-head">
        <font-awesome-icon :icon="['fas', 'circle-xmark']" class="banner-icon rejected" />
        <div>
          <div class="banner-title">Proposal rejected</div>
          <div class="banner-sub">
            <template v-if="proposal.decided_by_name">By {{ proposal.decided_by_name }}. </template>
            <template v-if="proposal.reject_reason">“{{ proposal.reject_reason }}”</template>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.approval-banner {
  border-radius: 14px;
  padding: 16px 18px;
  border: 1.5px solid var(--c-warn);
  background: color-mix(in srgb, var(--c-warn) 8%, transparent);
}
.approval-banner.approved {
  border-color: var(--c-positive);
  background: color-mix(in srgb, var(--c-positive) 8%, transparent);
}
.approval-banner.rejected {
  border-color: var(--o10);
  background: var(--surface);
}
.banner-head {
  display: flex;
  align-items: flex-start;
  gap: 11px;
}
.banner-icon {
  font-size: 17px;
  line-height: 1.3;
  flex-shrink: 0;
  margin-top: 1px;
}
/* Status colour comes from the design tokens so both themes stay in step —
   an emoji glyph can't follow the palette. */
.banner-icon.pending {
  color: var(--c-warn);
}
.banner-icon.approved {
  color: var(--c-positive);
}
.banner-icon.rejected {
  color: var(--c-danger);
}
.banner-title {
  font-family: var(--font-display);
  font-weight: var(--font-weight-bold);
  font-size: 14.5px;
  color: var(--text);
}
.banner-sub {
  margin-top: 3px;
  font-size: 12px;
  color: var(--muted);
  line-height: 1.5;
}
.confidence-chip {
  margin-left: auto;
  font-size: 11px;
  font-weight: var(--font-weight-semibold);
  color: var(--c-warn);
  background: color-mix(in srgb, var(--c-warn) 14%, transparent);
  padding: 3px 9px;
  border-radius: 20px;
  flex-shrink: 0;
}
.mono {
  font-family: var(--font-mono);
}
.proposal-body {
  margin-top: 13px;
}
.block-label {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: var(--faint);
  margin: 10px 0 5px;
}
.proposal-text {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: var(--text);
  white-space: pre-wrap;
  word-break: break-word;
}
.proposal-text.customer {
  color: var(--text3);
  background: var(--surface);
  border: 1px solid var(--o08);
  border-radius: 10px;
  padding: 10px 12px;
}
.reasoning-link {
  margin-top: 11px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--c-info);
  background: color-mix(in srgb, var(--c-info) 10%, transparent);
  border: none;
  padding: 5px 10px;
  border-radius: 8px;
  cursor: pointer;
}
.banner-actions {
  margin-top: 14px;
}
.banner-actions > .approve-btn,
.banner-actions > .reject-btn {
  margin-right: 0;
}
.approve-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 17px;
  background: var(--c-positive);
  color: var(--on-light, #04140d);
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: var(--font-weight-bold);
  cursor: pointer;
}
.reject-btn {
  padding: 9px 15px;
  background: transparent;
  border: 1px solid var(--o12);
  color: var(--text3);
  border-radius: 10px;
  font-size: 13px;
  cursor: pointer;
  margin-right: 9px;
}
.approve-btn:disabled,
.reject-btn:disabled,
.reject-confirm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.reject-form {
  background: var(--surface);
  border: 1px solid var(--o08);
  border-radius: 11px;
  padding: 12px;
}
.reject-input {
  width: 100%;
  min-height: 68px;
  resize: vertical;
  background: var(--bg2);
  border: 1px solid var(--o10);
  border-radius: 9px;
  padding: 9px 11px;
  color: var(--text);
  font-size: 12.5px;
  line-height: 1.5;
  outline: none;
}
.reinvestigate-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 9px;
  font-size: 12px;
  color: var(--text3);
  cursor: pointer;
}
.reject-actions {
  display: flex;
  justify-content: flex-end;
  gap: 9px;
  margin-top: 10px;
}
.cancel-btn {
  padding: 7px 13px;
  background: var(--o05);
  border: 1px solid var(--o10);
  color: var(--muted);
  border-radius: 9px;
  font-size: 12.5px;
  cursor: pointer;
}
.reject-confirm {
  padding: 7px 15px;
  background: var(--c-danger);
  color: var(--on-light, #fff);
  border: none;
  border-radius: 9px;
  font-size: 12.5px;
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
}
</style>
