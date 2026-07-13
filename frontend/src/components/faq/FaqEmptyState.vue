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
import FaqOrb from './FaqOrb.vue'

defineProps<{
  sourceCount: number
  pageCount: number
}>()

defineEmits<{
  generate: []
  import: []
  add: []
}>()
</script>

<template>
  <div class="empty-state">
    <FaqOrb class="empty-state__orb" :size="64" />
    <h3 class="empty-state__title">No FAQs yet</h3>
    <p class="empty-state__copy">
      Let ChatterMate read your knowledge base and draft clear, ready-to-publish FAQs — grouped by
      topic and kept in sync as your docs change.
    </p>
    <div class="empty-state__pill">
      <span class="empty-state__dot"></span>
      Reading from {{ sourceCount }} sources · {{ pageCount }} pages
    </div>
    <div class="empty-state__actions">
      <button class="btn btn--primary" type="button" @click="$emit('generate')">
        <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3v4M3 5h4M6 17v4M4 19h4M13 3l2.5 6.5L22 12l-6.5 2.5L13 21l-2.5-6.5L4 12l6.5-2.5z" /></svg>
        Generate from knowledge base
      </button>
      <button class="btn btn--ghost" type="button" @click="$emit('import')">Import existing FAQ</button>
      <button class="btn btn--text" type="button" @click="$emit('add')">Add manually</button>
    </div>
  </div>
</template>

<style scoped>
.empty-state {
  background: var(--surface);
  border: 1px dashed var(--o14);
  border-radius: 16px;
  padding: 56px 32px;
  text-align: center;
}

.empty-state__orb {
  margin: 0 auto 22px;
}

.empty-state__title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 22px;
  letter-spacing: -0.01em;
  color: var(--text);
  margin: 0 0 10px;
}

.empty-state__copy {
  font-size: 14.5px;
  color: var(--muted);
  line-height: 1.6;
  margin: 0 auto 26px;
  max-width: 440px;
}

.empty-state__pill {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  padding: 8px 14px;
  border-radius: var(--radius-pill);
  background: var(--o04);
  border: 1px solid var(--o10);
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text3);
  margin-bottom: 26px;
}

.empty-state__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--c-teal);
  box-shadow: 0 0 6px var(--c-teal);
}

.empty-state__actions {
  display: flex;
  gap: 11px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  border-radius: 12px;
  font-family: var(--font-sans);
  font-size: 15px;
  cursor: pointer;
  transition: filter var(--transition-fast), background-color var(--transition-fast);
}

.btn--primary {
  padding: 14px 24px;
  background: var(--grad-generate);
  border: none;
  color: var(--on-dark);
  font-weight: 600;
}

.btn--primary:hover {
  filter: brightness(1.1);
}

.btn--ghost {
  padding: 14px 20px;
  background: var(--o05);
  border: 1px solid var(--o14);
  color: var(--text2);
  font-weight: 600;
}

.btn--ghost:hover {
  background: var(--o08);
}

.btn--text {
  padding: 14px 20px;
  background: transparent;
  border: 1px solid var(--o12);
  color: var(--muted);
  font-weight: 500;
}

.btn--text:hover {
  background: var(--o04);
}
</style>
