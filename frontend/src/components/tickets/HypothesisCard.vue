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
import type { InvestigationEvent, InvestigationHypothesis } from '@/types/ticket'
import { hypothesisMeta } from './ticketMeta'
import EvidenceCitationRow from './EvidenceCitationRow.vue'

const props = defineProps<{
  hypothesis: InvestigationHypothesis
  events: InvestigationEvent[]
}>()

const isExpanded = ref(false)
const meta = computed(() => hypothesisMeta(props.hypothesis.status))
const isTesting = computed(() => props.hypothesis.status === 'testing')
const evidence = computed(() =>
  props.events.filter((e) => e.hypothesis_id === props.hypothesis.id && e.event_type === 'tool_call'),
)
const confidencePct = computed(() =>
  props.hypothesis.confidence != null ? Math.round(props.hypothesis.confidence * 100) : null,
)
</script>

<template>
  <div class="hypothesis-card" :id="`hypothesis-${hypothesis.idx}`">
    <button class="hypo-head" @click="isExpanded = !isExpanded">
      <span class="hypo-id mono">H{{ hypothesis.idx }}</span>
      <span class="hypo-title">{{ hypothesis.title }}</span>
      <span class="hypo-chip" :style="{ color: meta.color, borderColor: meta.color }">
        <span v-if="isTesting" class="pulse-dot" :style="{ background: meta.color }"></span>
        {{ meta.label }}
      </span>
      <span class="chevron">{{ isExpanded ? '▾' : '▸' }}</span>
    </button>

    <div v-if="confidencePct != null" class="confidence-row">
      <div class="confidence-track">
        <div
          class="confidence-fill"
          :style="{ width: `${confidencePct}%`, background: meta.color }"
        ></div>
      </div>
      <span class="confidence-value mono" :style="{ color: meta.color }">{{ (hypothesis.confidence ?? 0).toFixed(2) }}</span>
    </div>

    <div v-if="isExpanded" class="hypo-body">
      <p v-if="hypothesis.rationale" class="hypo-text">
        <span class="text-label">Rationale · </span>{{ hypothesis.rationale }}
      </p>
      <p v-if="hypothesis.conclusion" class="hypo-text">
        <span class="text-label">Conclusion · </span>{{ hypothesis.conclusion }}
      </p>
      <template v-if="evidence.length">
        <div class="evidence-label">Evidence — {{ evidence.length }} tool {{ evidence.length === 1 ? 'call' : 'calls' }}</div>
        <div class="evidence-list">
          <EvidenceCitationRow v-for="event in evidence" :key="event.id" :event="event" />
        </div>
      </template>
      <p v-else class="no-evidence">No tool evidence — tested by reasoning over the ticket context.</p>
    </div>
  </div>
</template>

<style scoped>
.hypothesis-card {
  border: 1px solid var(--o08);
  border-radius: 12px;
  background: var(--surface);
  padding: 11px 13px;
}
.hypo-head {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
  padding: 0;
}
.hypo-id {
  font-size: 11px;
  font-weight: var(--font-weight-bold);
  color: var(--muted2);
  background: var(--o05);
  border: 1px solid var(--o08);
  padding: 2px 7px;
  border-radius: 6px;
  flex-shrink: 0;
}
.mono {
  font-family: var(--font-mono);
}
.hypo-title {
  font-size: 13px;
  font-weight: var(--font-weight-semibold);
  color: var(--text);
  flex: 1;
  min-width: 0;
}
.hypo-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: var(--font-weight-semibold);
  letter-spacing: 0.04em;
  border: 1px solid;
  padding: 2px 8px;
  border-radius: 20px;
  flex-shrink: 0;
}
.pulse-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  animation: hypo-pulse 1.3s ease-in-out infinite;
}
@keyframes hypo-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
.chevron {
  color: var(--muted2);
  font-size: 11px;
  flex-shrink: 0;
}
.confidence-row {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-top: 9px;
}
.confidence-track {
  flex: 1;
  height: 4px;
  border-radius: 3px;
  background: var(--o07);
  overflow: hidden;
}
.confidence-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.4s ease;
}
.confidence-value {
  font-size: 10.5px;
  font-weight: var(--font-weight-semibold);
}
.hypo-body {
  margin-top: 11px;
  border-top: 1px solid var(--o06);
  padding-top: 11px;
}
.hypo-text {
  margin: 0 0 9px;
  font-size: 12.5px;
  line-height: 1.55;
  color: var(--text3);
}
.text-label {
  color: var(--faint);
  font-size: 11px;
}
.evidence-label {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--faint);
  margin: 11px 0 7px;
}
.evidence-list {
  display: flex;
  flex-direction: column;
  gap: 7px;
}
.no-evidence {
  margin: 0;
  font-size: 12px;
  color: var(--faint);
}
</style>
