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
 * Narrows the list to one AI agent and/or one teammate, on top of the view.
 * A disclosure, not a menu: it holds form fields.
 */
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { navIconSvg } from '@/components/layout/navIcons'

export interface InboxFilterValues {
  agentId: string
  assigneeId: string
}

const filters = defineModel<InboxFilterValues>({ required: true })

defineProps<{
  agents: Array<{ id: string; label: string }>
  teammates: Array<{ id: string; label: string }>
}>()

const open = ref(false)
const root = ref<HTMLElement | null>(null)
const active = computed(() => [filters.value.agentId, filters.value.assigneeId].filter(Boolean).length)

function set(field: keyof InboxFilterValues, value: string) {
  filters.value = { ...filters.value, [field]: value }
}

function clear() {
  filters.value = { agentId: '', assigneeId: '' }
  open.value = false
}

const onPointerDown = (event: PointerEvent) => {
  if (root.value && !root.value.contains(event.target as Node)) open.value = false
}
const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') open.value = false
}
// Listen only while open: an idle panel costs nothing
watch(open, (isOpen) => {
  if (isOpen) {
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeydown)
  } else {
    document.removeEventListener('pointerdown', onPointerDown)
    document.removeEventListener('keydown', onKeydown)
  }
})
onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onPointerDown)
  document.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <div ref="root" class="filters">
    <button
      type="button"
      class="filter-btn"
      :class="{ on: active }"
      :aria-label="active ? `Filters, ${active} on` : 'Filters'"
      :aria-expanded="open"
      aria-controls="inbox-filters"
      @click="open = !open"
    >
      <span aria-hidden="true" v-html="navIconSvg('filter', 14)"></span>
      <span v-if="active" class="badge" aria-hidden="true">{{ active }}</span>
    </button>
    <div v-if="open" id="inbox-filters" class="panel" role="group" aria-label="Filters">
      <label class="field">
        <span>AI agent</span>
        <select :value="filters.agentId" @change="set('agentId', ($event.target as HTMLSelectElement).value)">
          <option value="">Any agent</option>
          <option v-for="agent in agents" :key="agent.id" :value="agent.id">{{ agent.label }}</option>
        </select>
      </label>
      <label class="field">
        <span>Assigned to</span>
        <select :value="filters.assigneeId" @change="set('assigneeId', ($event.target as HTMLSelectElement).value)">
          <option value="">Anyone</option>
          <option v-for="teammate in teammates" :key="teammate.id" :value="teammate.id">{{ teammate.label }}</option>
        </select>
      </label>
      <button type="button" class="clear" :disabled="!active" @click="clear">Clear filters</button>
    </div>
  </div>
</template>

<style scoped>
.filters {
  position: relative;
  flex-shrink: 0;
}

.filter-btn {
  position: relative;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border-radius: 8px;
  border: 1px solid var(--o08);
  background: transparent;
  color: var(--text3);
  cursor: pointer;
}

.filter-btn.on {
  border-color: var(--accent-border);
  color: var(--accent-ink);
}

.filter-btn:focus-visible {
  outline: 2px solid var(--accent-border);
  outline-offset: 1px;
}

.badge {
  position: absolute;
  top: -5px;
  right: -5px;
  min-width: 14px;
  height: 14px;
  padding: 0 3px;
  box-sizing: border-box;
  border-radius: 999px;
  background: var(--accent-solid);
  color: var(--on-accent-solid);
  font-size: 9px;
  font-weight: 700;
  line-height: 14px;
  text-align: center;
}

.panel {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  z-index: var(--z-dropdown, 50);
  width: 240px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid var(--o10);
  background: var(--surface);
  box-shadow: var(--shadow-md, 0 8px 24px rgba(0, 0, 0, 0.3));
}

.field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  color: var(--muted);
}

.field select {
  height: 32px;
  padding: 0 8px;
  border-radius: 8px;
  border: 1px solid var(--o10);
  background: var(--o04);
  color: var(--text);
  font: inherit;
  font-size: 13px;
}

.field select option {
  background: var(--surface);
  color: var(--text);
}

.clear {
  align-self: flex-start;
  padding: 0;
  border: 0;
  background: none;
  color: var(--accent-ink);
  font: inherit;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.clear:disabled {
  color: var(--muted2);
  cursor: default;
}
</style>
