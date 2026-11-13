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
/**
 * Where the AI handed the conversation over, why, and its summary for whoever
 * picks it up. Only the team sees it. Refresh asks the AI for a summary as the
 * conversation stands now. "Add the answer to knowledge" turns the team's
 * answer into a help article, so the next customer who asks gets an answer.
 */
import { computed } from 'vue'
import { navIconSvg } from '@/components/layout/navIcons'
import { transferReasonLabel } from './inboxPresentation'

const props = defineProps<{
  agentName: string
  reason?: string | null
  summary?: string | null
  handedOverAt?: string | null
  /** A newer summary than the handover's (Refresh), shown in its place */
  latestSummary?: string | null
  /** May ask the AI for a summary as of now */
  canRefresh?: boolean
  refreshing?: boolean
  /** The team answered something worth keeping, and the viewer can edit the help center */
  canAddKnowledge?: boolean
  addingKnowledge?: boolean
}>()

const emit = defineEmits<{
  (e: 'refresh'): void
  (e: 'add-knowledge'): void
}>()

const reasonText = computed(() => transferReasonLabel(props.reason))
const time = computed(() =>
  props.handedOverAt
    ? new Date(props.handedOverAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    : null
)

/** A summary written as "- point" lines reads as a list; anything else as text */
const shown = computed(() => props.latestSummary || props.summary || '')
const points = computed(() => {
  const lines = shown.value.split('\n').map((l) => l.trim()).filter(Boolean)
  const bulleted = lines.length > 1 && lines.every((l) => /^[-*•]\s+/.test(l))
  return bulleted ? lines.map((l) => l.replace(/^[-*•]\s+/, '')) : null
})
</script>

<template>
  <div class="handover" id="handover">
    <p class="handover-line">
      <span aria-hidden="true" v-html="navIconSvg('handover', 13)"></span>
      <span>{{ agentName }} handed over</span>
      <template v-if="reasonText"><span aria-hidden="true">·</span><strong>{{ reasonText }}</strong></template>
      <template v-if="time"><span aria-hidden="true">·</span><span>{{ time }}</span></template>
    </p>

    <section v-if="shown || canAddKnowledge || canRefresh" class="card" aria-labelledby="handover-summary-title">
      <div class="card-head">
        <h3 id="handover-summary-title" class="card-title">
          <span class="spark" aria-hidden="true" v-html="navIconSvg('sparkle', 13)"></span>
          Handover summary
          <span class="private">· {{ latestSummary ? 'updated just now' : 'only your team sees this' }}</span>
        </h3>
        <button v-if="canRefresh" type="button" class="refresh" :disabled="refreshing" @click="emit('refresh')">
          {{ refreshing ? 'Refreshing…' : 'Refresh' }}
        </button>
      </div>
      <ul v-if="points" class="points">
        <li v-for="(point, index) in points" :key="index">{{ point }}</li>
      </ul>
      <p v-else-if="shown" class="summary">{{ shown }}</p>
      <p v-else-if="canRefresh" class="summary empty">No summary yet. Refresh to have the AI write one.</p>
      <div v-if="canAddKnowledge">
        <button type="button" class="add-knowledge" :disabled="addingKnowledge" @click="emit('add-knowledge')">
          {{ addingKnowledge ? 'Checking the answer…' : 'Add the answer to knowledge' }}
        </button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.handover {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.handover-line {
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 4px 8px;
  text-align: center;
  font-size: 12px;
  color: var(--muted);
}

.handover-line span:first-child {
  display: inline-flex;
}

.handover-line strong {
  color: var(--text2);
  font-weight: 600;
}

.card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid var(--o10);
  background: var(--surface);
}

.card-title {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.spark {
  display: inline-flex;
  flex-shrink: 0;
  color: var(--accent-ink);
}

.private {
  font-weight: 500;
  color: var(--muted2);
  overflow: hidden;
  text-overflow: ellipsis;
}

.points {
  margin: 0;
  padding-left: 18px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 13px;
  line-height: 1.5;
  color: var(--text2);
}

.summary {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--text2);
  white-space: pre-line;
}

.summary.empty {
  color: var(--muted);
}

.card-head {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.card-head .card-title {
  flex: 1;
}

.refresh {
  flex-shrink: 0;
  height: 24px;
  padding: 0 8px;
  border: 1px solid var(--o10);
  border-radius: 6px;
  background: transparent;
  color: var(--text2);
  font: inherit;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.refresh:hover:not(:disabled) {
  background: var(--o06);
}

.refresh:disabled,
.add-knowledge:disabled {
  opacity: 0.7;
  cursor: progress;
}

.refresh:focus-visible,
.add-knowledge:focus-visible {
  outline: 2px solid var(--accent-border);
  outline-offset: 1px;
}

.add-knowledge {
  border: 0;
  font: inherit;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  height: 28px;
  padding: 0 10px;
  border-radius: 8px;
  background: var(--accent-bg-12);
  color: var(--accent-ink);
  font-size: 12px;
  font-weight: 600;
  text-decoration: none;
  white-space: nowrap;
}

.add-knowledge:hover:not(:disabled) {
  background: color-mix(in srgb, var(--accent-ink) 18%, transparent);
}
</style>
