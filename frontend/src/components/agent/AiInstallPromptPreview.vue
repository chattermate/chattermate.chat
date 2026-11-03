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
// Shows exactly what the AI-builder button copies, closed until asked for
defineProps<{ prompt: string }>()
</script>

<template>
  <details v-if="prompt" class="prompt-preview">
    <summary class="prompt-summary">
      <font-awesome-icon icon="fa-solid fa-chevron-right" class="chevron" aria-hidden="true" />
      What gets copied
    </summary>
    <pre class="prompt-text">{{ prompt }}</pre>
  </details>
</template>

<style scoped>
.prompt-preview {
  border: 1px solid var(--o08);
  border-radius: var(--radius-input);
}

.prompt-summary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  list-style: none;
  color: var(--text3);
  font-size: 13.5px;
  font-weight: 500;
  cursor: pointer;
}

.prompt-summary::-webkit-details-marker {
  display: none;
}

.prompt-summary:focus-visible {
  outline: 2px solid var(--accent-ink);
  outline-offset: 2px;
  border-radius: var(--radius-input);
}

.chevron {
  font-size: 11px;
  transition: transform var(--transition-fast);
}

.prompt-preview[open] .chevron {
  transform: rotate(90deg);
}

.prompt-text {
  margin: 0;
  padding: 2px 16px 16px 34px;
  font-family: var(--font-mono);
  font-size: 12px;
  line-height: 1.65;
  color: var(--code);
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
