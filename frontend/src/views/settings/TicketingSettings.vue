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
import { computed, ref, watch } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { useTicketingSettings } from '@/composables/useTicketingSettings'
import { PRIORITIES, priorityMeta } from '@/components/tickets/ticketMeta'
import type { SlaTarget, TicketPriority } from '@/types/ticket'

const { settings, isLoading, isSaving, error, planGated, save } = useTicketingSettings()

// Autonomy cards: each enumerates exactly what the AI may do at that level.
const AUTONOMY_CARDS = [
  {
    level: 1,
    tier: 'L1',
    title: 'Investigate only',
    caps: [
      { label: 'Triage & investigate', ok: true },
      { label: 'Propose resolution', ok: false },
      { label: 'Message customer', ok: false },
      { label: 'Close ticket', ok: false },
    ],
    warn: false,
    disabled: false,
  },
  {
    level: 2,
    tier: 'L2',
    title: 'Propose, human approves',
    caps: [
      { label: 'Triage & investigate', ok: true },
      { label: 'Propose resolution', ok: true },
      { label: 'Message customer', ok: false },
      { label: 'Close ticket', ok: false },
    ],
    warn: false,
    // Proposal/approval flows land with the investigation engine.
    disabled: true,
  },
  {
    level: 3,
    tier: 'L3',
    title: 'Auto-resolve & notify',
    caps: [
      { label: 'Triage & investigate', ok: true },
      { label: 'Propose resolution', ok: true },
      { label: 'Message customer', ok: true },
      { label: 'Close ticket', ok: true },
    ],
    warn: true,
    disabled: true,
  },
]

const DEFAULT_SLA: Record<TicketPriority, SlaTarget> = {
  urgent: { first_response_minutes: 15, resolution_minutes: 120 },
  high: { first_response_minutes: 30, resolution_minutes: 240 },
  medium: { first_response_minutes: 120, resolution_minutes: 1440 },
  low: { first_response_minutes: 480, resolution_minutes: 4320 },
}

// Deep copy per priority: a shallow spread would alias the nested SlaTarget
// objects, so edits would mutate the baseline and isDirty could never fire.
const cloneSla = (targets?: Record<TicketPriority, SlaTarget> | null) =>
  Object.fromEntries(
    PRIORITIES.map((p) => [p, { ...(targets?.[p] || DEFAULT_SLA[p]) }]),
  ) as Record<TicketPriority, SlaTarget>

const slaDraft = ref<Record<TicketPriority, SlaTarget>>(cloneSla())
const createdTemplate = ref('')
const resolvedTemplate = ref('')
const confirmationTimeout = ref(72)

watch(settings, (next) => {
  if (!next) return
  slaDraft.value = cloneSla(next.sla_targets)
  createdTemplate.value = next.created_template || defaultCreated
  resolvedTemplate.value = next.resolved_template || defaultResolved
  confirmationTimeout.value = next.confirmation_timeout_hours
})

const defaultCreated =
  "Hi [customer] — we've opened ticket [ticket] about your issue and our team is on it. We'll keep you posted."
const defaultResolved =
  "Good news [customer] — ticket [ticket] is resolved. Here's what happened and what we did to fix it. Reply if anything's still off."

const preview = (template: string) =>
  template.replace(/\[customer\]/g, 'Northwind').replace(/\[ticket\]/g, 'TKT-2038')

const isDirty = computed(() => {
  if (!settings.value) return false
  return (
    JSON.stringify(slaDraft.value) !== JSON.stringify(cloneSla(settings.value.sla_targets)) ||
    createdTemplate.value !== (settings.value.created_template || defaultCreated) ||
    resolvedTemplate.value !== (settings.value.resolved_template || defaultResolved) ||
    confirmationTimeout.value !== settings.value.confirmation_timeout_hours
  )
})

function saveAll() {
  save({
    sla_targets: slaDraft.value,
    created_template: createdTemplate.value,
    resolved_template: resolvedTemplate.value,
    confirmation_timeout_hours: confirmationTimeout.value,
  })
}
</script>

<template>
  <DashboardLayout>
  <div class="ticketing-settings">
    <div class="page-header">
      <h1 class="page-title">Ticketing settings</h1>
      <p class="page-subtitle">
        Set exactly what the AI is allowed to do — every action is gated by the autonomy level
        you choose.
      </p>
    </div>

    <div v-if="isLoading" class="state-msg">Loading…</div>
    <div v-else-if="planGated || error" class="state-msg">{{ error }}</div>

    <template v-else-if="settings">
      <!-- AUTONOMY -->
      <section class="section">
        <h2 class="section-title">Autonomy level</h2>
        <p class="section-hint">
          The AI never exceeds this level. Higher levels still log every action for audit.
        </p>
        <div class="autonomy-grid">
          <div
            v-for="card in AUTONOMY_CARDS"
            :key="card.level"
            class="autonomy-card"
            :class="{
              selected: settings.autonomy_level === card.level,
              disabled: card.disabled,
            }"
            @click="!card.disabled && save({ autonomy_level: card.level })"
          >
            <div class="card-head">
              <span class="radio" :class="{ on: settings.autonomy_level === card.level }">
                <span class="radio-dot"></span>
              </span>
              <span class="tier">{{ card.tier }}</span>
              <span v-if="card.disabled" class="soon-tag">Coming soon</span>
            </div>
            <div class="card-title">{{ card.title }}</div>
            <div class="caps">
              <div v-for="cap in card.caps" :key="cap.label" class="cap" :class="{ off: !cap.ok }">
                <span class="cap-icon" :class="cap.ok ? 'yes' : 'no'">{{ cap.ok ? '✓' : '✕' }}</span>
                {{ cap.label }}
              </div>
            </div>
            <div
              v-if="card.warn && settings.autonomy_level === card.level"
              class="warn-note"
            >
              ⚠ The AI can message customers and close tickets without review. Use only for
              well-scoped, low-risk queues.
            </div>
          </div>
        </div>
        <label class="toggle-row">
          <input
            type="checkbox"
            :checked="settings.auto_investigate_on_create"
            @change="save({ auto_investigate_on_create: ($event.target as HTMLInputElement).checked })"
          />
          Run AI triage automatically when a ticket is created
        </label>
      </section>

      <!-- SLA -->
      <section class="section">
        <h2 class="section-title">SLA targets</h2>
        <div class="sla-table">
          <div class="sla-head">
            <span>Priority</span><span>First response (min)</span><span>Resolution (min)</span>
          </div>
          <div v-for="p in PRIORITIES" :key="p" class="sla-row">
            <span class="sla-priority" :style="{ color: priorityMeta(p).color }">
              <span class="dot" :style="{ background: priorityMeta(p).color }"></span>
              {{ priorityMeta(p).label }}
            </span>
            <input v-model.number="slaDraft[p].first_response_minutes" type="number" min="1" class="sla-input" />
            <input v-model.number="slaDraft[p].resolution_minutes" type="number" min="1" class="sla-input" />
          </div>
        </div>
      </section>

      <!-- CUSTOMER COMMS -->
      <section class="section">
        <div class="section-head-row">
          <h2 class="section-title">Customer communications</h2>
          <label class="toggle-row inline">
            <input
              type="checkbox"
              :checked="settings.csat_enabled"
              @change="save({ csat_enabled: ($event.target as HTMLInputElement).checked })"
            />
            Collect CSAT after resolution
          </label>
        </div>
        <div class="template-grid">
          <div class="template-card">
            <div class="card-label">Template · Ticket created</div>
            <textarea v-model="createdTemplate" class="template-input"></textarea>
            <div class="card-label">Preview</div>
            <div class="template-preview">{{ preview(createdTemplate) }}</div>
          </div>
          <div class="template-card">
            <div class="card-label">Template · Ticket resolved</div>
            <textarea v-model="resolvedTemplate" class="template-input"></textarea>
            <div class="card-label">Preview</div>
            <div class="template-preview">{{ preview(resolvedTemplate) }}</div>
          </div>
        </div>
        <div class="timeout-row">
          <span class="timeout-label">
            Auto-close resolved tickets after
          </span>
          <input v-model.number="confirmationTimeout" type="number" min="1" max="720" class="sla-input" />
          <span class="timeout-label">hours without a customer reply</span>
        </div>
      </section>

      <!-- CONNECTORS (Phase 3/4 preview) -->
      <section class="section">
        <div class="section-head-row">
          <h2 class="section-title">Investigation connectors</h2>
          <span class="mcp-tag">via MCP</span>
        </div>
        <p class="section-hint">
          Read-only access to your logs, metrics and databases so the AI can gather evidence
          during investigations. Connectors attach to the
          <strong>investigation agent only</strong> — never the customer-facing chat agent.
          Coming with the investigation engine.
        </p>
      </section>

      <div class="save-bar" v-if="isDirty">
        <button class="save-btn" :disabled="isSaving" @click="saveAll">
          {{ isSaving ? 'Saving…' : 'Save changes' }}
        </button>
      </div>
    </template>
  </div>
  </DashboardLayout>
</template>

<style scoped>
.ticketing-settings {
  max-width: 960px;
  margin: 0 auto;
  padding: 28px 30px 70px;
}
.page-header {
  margin-bottom: 26px;
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
.state-msg {
  padding: 40px;
  text-align: center;
  color: var(--muted);
  background: var(--surface);
  border: 1px solid var(--o08);
  border-radius: 15px;
}
.section {
  margin-bottom: 34px;
}
.section-title {
  font-family: var(--font-display);
  font-weight: var(--font-weight-semibold);
  font-size: 16px;
  margin: 0 0 4px;
  color: var(--text);
}
.section-hint {
  margin: 0 0 16px;
  font-size: 12.5px;
  color: var(--muted);
  line-height: 1.5;
}
.section-head-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}
.autonomy-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  margin-bottom: 16px;
}
.autonomy-card {
  border: 1.5px solid var(--o08);
  background: var(--surface);
  border-radius: 15px;
  padding: 17px;
  cursor: pointer;
  transition: border-color 0.15s;
}
.autonomy-card.selected {
  border-color: var(--accent-ink);
  background: var(--accent-bg-06);
}
.autonomy-card.disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.card-head {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-bottom: 12px;
}
.radio {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid var(--o20);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.radio.on {
  border-color: var(--accent-ink);
}
.radio-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: transparent;
}
.radio.on .radio-dot {
  background: var(--accent-ink);
}
.tier {
  font-family: var(--font-display);
  font-weight: var(--font-weight-bold);
  font-size: 13px;
  color: var(--muted2);
}
.autonomy-card.selected .tier {
  color: var(--accent-ink);
}
.soon-tag {
  margin-left: auto;
  font-family: var(--font-mono);
  font-size: 9.5px;
  color: var(--faint);
  background: var(--o05);
  border: 1px solid var(--o08);
  padding: 2px 7px;
  border-radius: 20px;
}
.card-title {
  font-family: var(--font-display);
  font-weight: var(--font-weight-semibold);
  font-size: 15px;
  margin-bottom: 12px;
  color: var(--text);
}
.caps {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.cap {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
  color: var(--text3);
}
.cap.off {
  color: var(--faint);
}
.cap-icon {
  width: 15px;
  height: 15px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: var(--font-weight-bold);
  flex-shrink: 0;
}
.cap-icon.yes {
  background: color-mix(in srgb, var(--c-positive) 15%, transparent);
  color: var(--c-positive);
}
.cap-icon.no {
  background: color-mix(in srgb, var(--c-danger) 12%, transparent);
  color: var(--c-danger);
}
.warn-note {
  margin-top: 13px;
  display: flex;
  gap: 8px;
  padding: 9px 11px;
  background: color-mix(in srgb, var(--c-warn) 12%, transparent);
  border: 1px solid var(--c-warn);
  border-radius: 10px;
  font-size: 11.5px;
  color: var(--c-warn);
  line-height: 1.45;
}
.toggle-row {
  display: flex;
  align-items: center;
  gap: 9px;
  font-size: 13px;
  color: var(--text3);
  cursor: pointer;
}
.toggle-row.inline {
  font-size: 12.5px;
  color: var(--muted);
}
.sla-table {
  background: var(--surface);
  border: 1px solid var(--o08);
  border-radius: 14px;
  overflow: hidden;
}
.sla-head,
.sla-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 14px;
  padding: 11px 18px;
  align-items: center;
}
.sla-head {
  border-bottom: 1px solid var(--o07);
  background: var(--o03);
  font-family: var(--font-mono);
  font-size: 10.5px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--faint);
}
.sla-row {
  border-bottom: 1px solid var(--o06);
}
.sla-row:last-child {
  border-bottom: none;
}
.sla-priority {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 13px;
  font-weight: var(--font-weight-semibold);
}
.dot {
  width: 7px;
  height: 7px;
  border-radius: 2px;
}
.sla-input {
  width: 100px;
  padding: 7px 10px;
  background: var(--bg2);
  border: 1px solid var(--o08);
  border-radius: 8px;
  color: var(--text);
  font-family: var(--font-mono);
  font-size: 12.5px;
  outline: none;
}
.template-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-bottom: 16px;
}
.template-card {
  background: var(--surface);
  border: 1px solid var(--o08);
  border-radius: 14px;
  padding: 16px;
}
.card-label {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--faint);
  margin-bottom: 10px;
}
.template-input {
  width: 100%;
  min-height: 76px;
  resize: vertical;
  background: var(--bg2);
  border: 1px solid var(--o08);
  border-radius: 10px;
  padding: 10px 12px;
  color: var(--text);
  font-size: 12.5px;
  line-height: 1.5;
  outline: none;
  margin-bottom: 12px;
}
.template-preview {
  background: var(--bubble-ai-bg, var(--bg2));
  border: 1px solid var(--o07);
  border-radius: 10px 10px 10px 3px;
  padding: 11px 13px;
  font-size: 12.5px;
  color: var(--text3);
  line-height: 1.5;
}
.timeout-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.timeout-label {
  font-size: 13px;
  color: var(--text3);
}
.mcp-tag {
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: var(--font-weight-semibold);
  letter-spacing: 0.06em;
  color: var(--c-teal);
  background: var(--teal-bg-10);
  padding: 2px 8px;
  border-radius: 20px;
}
.save-bar {
  position: sticky;
  bottom: 20px;
  display: flex;
  justify-content: flex-end;
}
.save-btn {
  padding: 11px 22px;
  background: var(--accent-solid);
  color: var(--on-accent-solid);
  border: none;
  border-radius: 11px;
  font-size: 13.5px;
  font-weight: var(--font-weight-bold);
  cursor: pointer;
  box-shadow: 0 8px 30px -8px rgba(0, 0, 0, 0.4);
}
.save-btn:disabled {
  opacity: 0.5;
}
@media (max-width: 800px) {
  .autonomy-grid,
  .template-grid {
    grid-template-columns: 1fr;
  }
}
</style>
