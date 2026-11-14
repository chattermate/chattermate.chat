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
 * picks it up. Only the team sees it. #actions holds more for the card (the
 * enterprise module's Refresh and AI-drafted article); without it, "Add the
 * answer to knowledge" opens the
 * help center editor with the customer's question filled in, so the next
 * customer who asks gets an answer.
 */
import { computed } from 'vue'
import { navIconSvg } from '@/components/layout/navIcons'
import { transferReasonLabel } from './inboxPresentation'

const props = defineProps<{
  agentName: string
  reason?: string | null
  summary?: string | null
  /** A newer summary than the handover's (a Refresh in #actions), shown in its place */
  latestSummary?: string | null
  handedOverAt?: string | null
  /** The editor with the question filled in; none when the viewer can't edit */
  knowledgeLink?: string | null
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

    <section v-if="shown || knowledgeLink || $slots.actions" class="card" aria-labelledby="handover-summary-title">
      <h3 id="handover-summary-title" class="card-title">
        <span class="spark" aria-hidden="true" v-html="navIconSvg('sparkle', 13)"></span>
        Handover summary
        <span class="private">· {{ latestSummary ? 'updated just now' : 'only your team sees this' }}</span>
      </h3>
      <ul v-if="points" class="points">
        <li v-for="(point, index) in points" :key="index">{{ point }}</li>
      </ul>
      <p v-else-if="shown" class="summary">{{ shown }}</p>
      <slot name="actions">
        <div v-if="knowledgeLink">
          <router-link :to="knowledgeLink" class="add-knowledge">Add the answer to knowledge</router-link>
        </div>
      </slot>
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

.add-knowledge {
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

.add-knowledge:hover {
  background: color-mix(in srgb, var(--accent-ink) 18%, transparent);
}
</style>
