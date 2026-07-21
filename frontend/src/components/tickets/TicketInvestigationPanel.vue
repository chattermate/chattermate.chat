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
import { computed } from 'vue'
import type { InvestigationDetail } from '@/types/ticket'
import HypothesisCard from './HypothesisCard.vue'

const props = defineProps<{ investigation: InvestigationDetail }>()

const run = computed(() => props.investigation.run)
const isActive = computed(() => ['pending', 'running'].includes(run.value?.status || ''))

const RUN_STATUS_META: Record<string, { label: string; color: string }> = {
  pending: { label: 'Queued', color: 'var(--c-neutral)' },
  running: { label: 'Investigating', color: 'var(--c-info)' },
  completed: { label: 'Completed', color: 'var(--c-positive)' },
  failed: { label: 'Failed', color: 'var(--c-danger)' },
  cancelled: { label: 'Cancelled', color: 'var(--c-neutral)' },
  budget_exceeded: { label: 'Partial · budget', color: 'var(--c-warn)' },
}
const statusMeta = computed(
  () => RUN_STATUS_META[run.value?.status || ''] || RUN_STATUS_META.pending,
)

// "What the AI is doing now": the newest event, phrased for humans.
const tickerLine = computed(() => {
  if (!isActive.value) return null
  const events = props.investigation.events
  const latest = events[events.length - 1]
  if (!latest) return 'Starting the investigation…'
  if (latest.event_type === 'phase') return latest.label
  return `Querying ${latest.connector_name || 'connector'} · ${latest.tool_name}`
})

const toolCallCount = computed(
  () => props.investigation.events.filter((e) => e.event_type === 'tool_call').length,
)

// Compact token total for the run header, e.g. "1.2k tokens". Only shown once
// the run has recorded usage.
const tokenLabel = computed(() => {
  const total = (run.value?.input_tokens || 0) + (run.value?.output_tokens || 0)
  if (!total) return ''
  return total >= 1000 ? `${(total / 1000).toFixed(1)}k tokens` : `${total} tokens`
})
</script>

<template>
  <div v-if="run" class="investigation-panel">
    <div class="panel-head">
      <div class="head-left">
        <span class="panel-title">AI investigation</span>
        <span class="run-chip" :style="{ color: statusMeta.color, borderColor: statusMeta.color }">
          <span v-if="isActive" class="pulse-dot" :style="{ background: statusMeta.color }"></span>
          {{ statusMeta.label }}
        </span>
      </div>
      <div class="head-meta mono">
        <span>{{ investigation.hypotheses.length }} hypotheses</span>
        <span>·</span>
        <span>{{ toolCallCount }}/{{ run.max_tool_calls || '—' }} tool calls</span>
        <span v-if="run.llm_calls">· {{ run.llm_calls }} LLM calls</span>
        <span v-if="tokenLabel">· {{ tokenLabel }}</span>
        <span v-if="run.model_name">· {{ run.model_name }}</span>
      </div>
    </div>

    <div v-if="tickerLine" class="ticker">
      <span class="ticker-dot"></span>
      {{ tickerLine }}
    </div>

    <div v-if="run.status === 'failed' && run.error" class="run-error">
      {{ run.error }}
    </div>

    <div v-if="investigation.hypotheses.length" class="hypothesis-list">
      <HypothesisCard
        v-for="hypothesis in investigation.hypotheses"
        :key="hypothesis.id"
        :hypothesis="hypothesis"
        :events="investigation.events"
      />
    </div>
    <p v-else-if="!isActive" class="empty-note">No hypotheses were generated in this run.</p>
  </div>
</template>

<style scoped>
.investigation-panel {
  background: var(--surface);
  border: 1px solid var(--o08);
  border-radius: 15px;
  padding: 16px 18px;
}
.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}
.head-left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.panel-title {
  font-family: var(--font-display);
  font-weight: var(--font-weight-bold);
  font-size: 14.5px;
  color: var(--text);
}
.run-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: var(--font-weight-semibold);
  letter-spacing: 0.04em;
  border: 1px solid;
  padding: 2px 9px;
  border-radius: 20px;
}
.pulse-dot,
.ticker-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  animation: inv-pulse 1.3s ease-in-out infinite;
}
.ticker-dot {
  background: var(--c-info);
  flex-shrink: 0;
}
@keyframes inv-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
.head-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10.5px;
  color: var(--faint);
}
.mono {
  font-family: var(--font-mono);
}
.ticker {
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 9px 12px;
  background: color-mix(in srgb, var(--c-info) 8%, transparent);
  border: 1px solid color-mix(in srgb, var(--c-info) 30%, transparent);
  border-radius: 10px;
  font-size: 12px;
  color: var(--text3);
  font-family: var(--font-mono);
}
.run-error {
  margin-top: 12px;
  padding: 9px 12px;
  background: color-mix(in srgb, var(--c-danger) 8%, transparent);
  border: 1px solid color-mix(in srgb, var(--c-danger) 35%, transparent);
  border-radius: 10px;
  font-size: 12px;
  color: var(--c-danger);
}
.hypothesis-list {
  margin-top: 13px;
  display: flex;
  flex-direction: column;
  gap: 9px;
}
.empty-note {
  margin: 12px 0 0;
  font-size: 12.5px;
  color: var(--faint);
}
</style>
