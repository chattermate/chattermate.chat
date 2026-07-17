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
import { ref } from 'vue'
import { toast } from 'vue-sonner'
import type { InvestigationEvent } from '@/types/ticket'

const props = defineProps<{ event: InvestigationEvent }>()

const isExpanded = ref(false)

function copyQuery() {
  if (!props.event.tool_input) return
  navigator.clipboard
    .writeText(props.event.tool_input)
    .then(() => toast.success('Query copied'))
    .catch(() => {})
}

function formatTime(iso?: string | null): string {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}
</script>

<template>
  <div class="evidence-row" :class="{ failed: !!event.error }">
    <button class="evidence-head" @click="isExpanded = !isExpanded">
      <span class="tool-badge">{{ event.connector_name || 'MCP' }}</span>
      <span class="tool-name">{{ event.tool_name }}</span>
      <span v-if="event.error" class="error-tag">error</span>
      <span class="evidence-meta">
        <span v-if="event.duration_ms != null" class="mono">{{ event.duration_ms }}ms</span>
        <span class="mono">{{ formatTime(event.created_at) }}</span>
        <span class="chevron">{{ isExpanded ? '▾' : '▸' }}</span>
      </span>
    </button>
    <div v-if="isExpanded" class="evidence-body">
      <template v-if="event.tool_input">
        <div class="block-label-row">
          <span class="block-label">Query</span>
          <button class="copy-btn" @click="copyQuery">Copy</button>
        </div>
        <pre class="code-block">{{ event.tool_input }}</pre>
      </template>
      <template v-if="event.error">
        <div class="block-label">Error</div>
        <pre class="code-block error">{{ event.error }}</pre>
      </template>
      <template v-else-if="event.tool_result">
        <div class="block-label">Result</div>
        <pre class="code-block">{{ event.tool_result }}</pre>
      </template>
    </div>
  </div>
</template>

<style scoped>
.evidence-row {
  border: 1px solid var(--o07);
  border-radius: 10px;
  background: var(--bg2);
  overflow: hidden;
}
.evidence-row.failed {
  border-color: color-mix(in srgb, var(--c-danger) 35%, transparent);
}
.evidence-head {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 8px 11px;
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
}
.tool-badge {
  font-family: var(--font-mono);
  font-size: 9.5px;
  font-weight: var(--font-weight-semibold);
  letter-spacing: 0.05em;
  color: var(--c-teal);
  background: var(--teal-bg-10);
  padding: 2px 7px;
  border-radius: 6px;
  flex-shrink: 0;
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.tool-name {
  font-family: var(--font-mono);
  font-size: 11.5px;
  color: var(--text3);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.error-tag {
  font-family: var(--font-mono);
  font-size: 9.5px;
  color: var(--c-danger);
  background: color-mix(in srgb, var(--c-danger) 12%, transparent);
  padding: 2px 7px;
  border-radius: 6px;
}
.evidence-meta {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 9px;
  color: var(--faint);
  font-size: 10.5px;
  flex-shrink: 0;
}
.mono {
  font-family: var(--font-mono);
}
.chevron {
  color: var(--muted2);
}
.evidence-body {
  padding: 0 11px 11px;
}
.block-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.block-label {
  font-family: var(--font-mono);
  font-size: 9.5px;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: var(--faint);
  margin: 8px 0 5px;
}
.copy-btn {
  font-size: 10.5px;
  color: var(--accent-ink);
  background: var(--accent-bg-08);
  border: none;
  padding: 2px 8px;
  border-radius: 6px;
  cursor: pointer;
}
.code-block {
  margin: 0;
  padding: 9px 11px;
  background: var(--surface);
  border: 1px solid var(--o07);
  border-radius: 8px;
  font-family: var(--font-mono);
  font-size: 11px;
  line-height: 1.55;
  color: var(--text3);
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 260px;
  overflow-y: auto;
}
.code-block.error {
  color: var(--c-danger);
}
</style>
