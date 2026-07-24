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
import type { KnowledgeItem } from '@/types/knowledge'

const props = defineProps<{
  sources: KnowledgeItem[]
  linkedIds: Set<number>
  busyIds: Set<number>
  loading: boolean
  error: string | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'link', knowledgeId: number): void
  (e: 'unlink', knowledgeId: number): void
}>()

const query = ref('')

const filteredSources = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return props.sources
  return props.sources.filter(
    (s) => s.name.toLowerCase().includes(q) || s.type.toLowerCase().includes(q),
  )
})
</script>

<template>
  <div class="scrim" @click.self="emit('close')">
    <div class="modal" role="dialog" aria-modal="true" aria-label="Link existing knowledge">
      <div class="modal__head">
        <div>
          <h3 class="modal__title">Link existing knowledge</h3>
          <p class="modal__sub">Attach knowledge from your organization to this agent so it can use it.</p>
        </div>
        <button class="icon-btn" type="button" aria-label="Close" @click="emit('close')">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
      </div>

      <div class="search">
        <input v-model="query" class="text-input" type="text" placeholder="Search knowledge sources…" />
      </div>

      <div class="body">
        <div v-if="loading" class="state">Loading knowledge sources…</div>
        <div v-else-if="error" class="state state--error">{{ error }}</div>
        <div v-else-if="!filteredSources.length" class="state">
          {{ query ? 'No sources match your search.' : 'No organization knowledge to link yet.' }}
        </div>
        <ul v-else class="list">
          <li v-for="item in filteredSources" :key="item.id" class="row">
            <div class="row__main">
              <span class="row__name">{{ item.name }}</span>
              <span class="row__type">{{ item.type }}</span>
            </div>
            <button
              v-if="linkedIds.has(item.id)"
              class="btn btn--linked"
              type="button"
              :disabled="busyIds.has(item.id)"
              @click="emit('unlink', item.id)"
            >
              {{ busyIds.has(item.id) ? 'Removing…' : 'Unlink' }}
            </button>
            <button
              v-else
              class="btn btn--primary"
              type="button"
              :disabled="busyIds.has(item.id)"
              @click="emit('link', item.id)"
            >
              {{ busyIds.has(item.id) ? 'Linking…' : 'Link' }}
            </button>
          </li>
        </ul>
      </div>

      <div class="foot">
        <button class="btn btn--ghost" type="button" @click="emit('close')">Done</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scrim {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: var(--scrim);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 60px 20px;
  overflow-y: auto;
}

.modal {
  width: 560px;
  max-width: 100%;
  background: var(--bg2);
  border: 1px solid var(--o12);
  border-radius: 20px;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.4);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 24px 16px;
  border-bottom: 1px solid var(--o08);
}

.modal__title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 19px;
  color: var(--text);
  margin: 0 0 4px;
}

.modal__sub {
  font-size: 13px;
  color: var(--muted);
  margin: 0;
}

.icon-btn {
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  border-radius: 9px;
  background: var(--o05);
  border: 1px solid var(--o10);
  color: var(--muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-btn:hover {
  background: var(--o08);
  color: var(--text2);
}

.search {
  padding: 16px 24px 4px;
}

.text-input {
  width: 100%;
  background: var(--bg);
  border: 1px solid var(--o12);
  border-radius: 11px;
  padding: 12px 14px;
  font-size: 14px;
  color: var(--text);
  outline: none;
  font-family: var(--font-sans);
}

.text-input:focus {
  border-color: var(--accent-border, var(--accent-ink));
}

.body {
  padding: 12px 24px 4px;
  min-height: 180px;
  max-height: 340px;
  overflow-y: auto;
}

.state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 160px;
  font-size: 13.5px;
  color: var(--muted);
  text-align: center;
}

.state--error {
  color: var(--c-coral);
}

.list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 11px 13px;
  border-radius: 11px;
  border: 1px solid var(--o10);
  background: var(--o04);
}

.row__main {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.row__name {
  font-size: 13.5px;
  font-weight: 600;
  color: var(--text2);
  word-break: break-word;
}

.row__type {
  font-size: 11.5px;
  color: var(--muted2);
  text-transform: capitalize;
}

.foot {
  display: flex;
  justify-content: flex-end;
  gap: 9px;
  padding: 16px 24px;
  border-top: 1px solid var(--o08);
  background: var(--surface);
}

.btn {
  padding: 8px 16px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  font-family: var(--font-sans);
  cursor: pointer;
  border: 1px solid transparent;
  white-space: nowrap;
  flex-shrink: 0;
}

.btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.btn--primary {
  background: var(--accent-solid);
  color: var(--on-accent-solid);
}

.btn--primary:hover:not(:disabled) {
  filter: brightness(1.05);
}

.btn--linked {
  background: var(--o05);
  border-color: var(--o12);
  color: var(--muted);
}

.btn--linked:hover:not(:disabled) {
  background: var(--coral-bg);
  border-color: var(--coral-border);
  color: var(--c-coral);
}

.btn--ghost {
  background: transparent;
  border-color: var(--o12);
  color: var(--muted);
}

.btn--ghost:hover:not(:disabled) {
  background: var(--o05);
}
</style>
