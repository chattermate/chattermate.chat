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
 * Asks the visitor before the app runs an action. Drawn by the widget, never
 * by the model, so a reply can't approve on the visitor's behalf.
 */
import { computed } from 'vue'
import type { PendingConfirm } from './actions/hostActionsClient'
import { confirmWording } from './actions/receipts'

const props = defineProps<{ pending: PendingConfirm }>()
const emit = defineEmits<{ (e: 'approve'): void; (e: 'decline'): void }>()

const overwriting = computed(() => !!props.pending.preview)

function show(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—'
  return typeof value === 'string' ? value : JSON.stringify(value, null, 2)
}

/** "invoice_id" → "Invoice id": argument names read as labels. */
function readable(key: string): string {
  const words = key.replace(/[_-]+/g, ' ').trim()
  return words.charAt(0).toUpperCase() + words.slice(1)
}

/** For the always-ask card: what the page says will happen, else the arguments as "key: value" lines. */
const details = computed(() =>
  props.pending.details
  ?? Object.entries(props.pending.request.args || {}).map(([key, value]) => ({ key: readable(key), value: show(value) })),
)

/** The buttons say what happens: "Send an invoice" / "Not now", "Change to GBP" / "Keep USD". */
const wording = computed(() =>
  confirmWording(props.pending.request.label, props.pending.preview?.before, props.pending.preview?.after, overwriting.value),
)
</script>

<template>
  <div class="cm-action-confirm" role="group" :aria-label="pending.request.label">
    <div class="cm-action-head">{{ pending.request.label }}?</div>
    <template v-if="overwriting">
      <div class="cm-action-row before">
        <span class="cm-action-tag">Current</span>
        <span class="cm-action-text">{{ show(pending.preview?.before) }}</span>
      </div>
      <div class="cm-action-row after">
        <span class="cm-action-tag">New</span>
        <span class="cm-action-text">{{ show(pending.preview?.after) }}</span>
      </div>
    </template>
    <dl v-else-if="details.length" class="cm-action-args">
      <template v-for="item in details" :key="item.key">
        <dt>{{ item.key }}</dt>
        <dd>{{ item.value }}</dd>
      </template>
    </dl>
    <div class="cm-action-buttons">
      <button type="button" class="cm-action-apply" @click="emit('approve')">{{ wording.approve }}</button>
      <button type="button" class="cm-action-cancel" @click="emit('decline')">{{ wording.decline }}</button>
    </div>
  </div>
</template>

<style scoped>
.cm-action-confirm {
  /* The message list is a scrolling flex column: without this the card shrinks
     to fit a short panel and its overflow:hidden clips Apply off. */
  flex-shrink: 0;
  margin: 4px 0 8px;
  border: 1px solid var(--cm-hairline);
  border-radius: var(--cm-radius);
  background: var(--cm-agent-bg);
  color: var(--cm-text);
  font-family: var(--cm-body-font);
  overflow: hidden;
}
.cm-action-head {
  padding: 9px 12px;
  font-size: 13px;
  font-weight: 600;
  border-bottom: 1px solid var(--cm-hairline);
}
.cm-action-row { padding: 9px 12px; font-size: 13px; line-height: 1.5; }
.cm-action-row + .cm-action-row { border-top: 1px dashed var(--cm-hairline); }
.cm-action-row.before { color: var(--cm-muted); }
.cm-action-row.before .cm-action-text { text-decoration: line-through; }
.cm-action-tag { display: block; font-size: 11px; color: var(--cm-muted); margin-bottom: 2px; }
.cm-action-text { white-space: pre-wrap; word-break: break-word; }
.cm-action-args {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 4px 10px;
  margin: 0;
  padding: 9px 12px;
  font-size: 12.5px;
}
.cm-action-args dt { color: var(--cm-muted); }
.cm-action-args dd { margin: 0; white-space: pre-wrap; word-break: break-word; }
.cm-action-buttons {
  display: flex;
  gap: 8px;
  padding: 9px 12px;
  border-top: 1px solid var(--cm-hairline);
}
.cm-action-buttons button {
  padding: 7px 14px;
  border-radius: var(--cm-field-radius);
  font-family: var(--cm-body-font);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}
.cm-action-apply { background: var(--cm-accent); color: var(--cm-on-accent); border: none; }
.cm-action-cancel { background: transparent; color: var(--cm-text); border: 1px solid var(--cm-hairline); }
.cm-action-buttons button:focus-visible { outline: 2px solid var(--cm-accent); outline-offset: 2px; }
</style>
