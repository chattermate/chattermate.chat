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
import { computed, ref, watch } from 'vue'
import Modal from '@/components/common/Modal.vue'
import type { GenerateEstimate, GenerationSource } from '@/types/faq'

const props = defineProps<{
  open: boolean
  estimate: GenerateEstimate | null
  submitting?: boolean
}>()

const emit = defineEmits<{
  close: []
  generate: [knowledgeIds: number[]]
}>()

const sources = computed<GenerationSource[]>(() => props.estimate?.sources ?? [])
const selected = ref<Set<number>>(new Set())

// Default selection = sources without FAQs (the "new" ones). Seed only when the
// picker OPENS (not on later estimate changes) so a background refetch can't
// wipe the user's manual selection mid-interaction.
watch(
  () => props.open,
  (open) => {
    if (!open) return
    const next = new Set<number>()
    for (const s of sources.value) if (!s.has_faqs) next.add(s.id)
    // If everything already has FAQs, start from all so the user can regenerate.
    if (next.size === 0) for (const s of sources.value) next.add(s.id)
    selected.value = next
  },
  { immediate: true },
)

function toggle(id: number) {
  const next = new Set(selected.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  selected.value = next
}

const allSelected = computed(
  () => sources.value.length > 0 && selected.value.size === sources.value.length,
)

function toggleAll() {
  selected.value = allSelected.value ? new Set() : new Set(sources.value.map((s) => s.id))
}

const metered = computed(() => props.estimate?.metered ?? false)
const remaining = computed(() => props.estimate?.remaining_credits ?? null)

const selectedCredits = computed(() =>
  sources.value.reduce((n, s) => (selected.value.has(s.id) ? n + s.estimated_calls : n), 0),
)

const overBudget = computed(
  () => metered.value && remaining.value !== null && selectedCredits.value > remaining.value,
)

const canGenerate = computed(() => selected.value.size > 0 && !props.submitting && !overBudget.value)

function labelFor(s: GenerationSource): string {
  const pages = s.pages ? `${s.pages} page${s.pages === 1 ? '' : 's'}` : ''
  return pages
}

function submit() {
  if (!canGenerate.value) return
  emit('generate', [...selected.value])
}
</script>

<template>
  <Modal v-if="open" @close="$emit('close')">
    <template #title>Generate FAQs</template>
    <template #content>
      <p class="picker-sub">Choose which knowledge sources to generate FAQs from.</p>

      <div class="picker-toolbar">
        <button class="link-btn" type="button" @click="toggleAll">
          {{ allSelected ? 'Clear all' : 'Select all' }}
        </button>
        <span class="picker-count">{{ selected.size }} of {{ sources.length }} selected</span>
      </div>

      <div class="picker-list">
        <label
          v-for="s in sources"
          :key="s.id"
          class="src"
          :class="{ 'src--on': selected.has(s.id) }"
        >
          <input class="src__check" type="checkbox" :checked="selected.has(s.id)" @change="toggle(s.id)" />
          <span class="src__body">
            <span class="src__name" :title="s.name">{{ s.name }}</span>
            <span class="src__meta">
              <span class="src__type">{{ s.source_type }}</span>
              <template v-if="labelFor(s)"> · {{ labelFor(s) }}</template>
              <span v-if="s.has_faqs" class="src__badge">already generated</span>
            </span>
          </span>
        </label>
      </div>

      <p v-if="metered" class="picker-credits" :class="{ 'picker-credits--over': overBudget }">
        Uses about {{ selectedCredits }} credit{{ selectedCredits === 1 ? '' : 's' }}<template v-if="remaining !== null"> · {{ remaining }} remaining</template>
        <template v-if="overBudget"> — not enough credits; upgrade or switch to your own AI model.</template>
      </p>

      <div class="picker-actions">
        <button class="btn-cancel" type="button" @click="$emit('close')">Cancel</button>
        <button class="btn-generate" type="button" :disabled="!canGenerate" @click="submit">
          {{ submitting ? 'Starting…' : `Generate from ${selected.size} source${selected.size === 1 ? '' : 's'}` }}
        </button>
      </div>
    </template>
  </Modal>
</template>

<style scoped>
.picker-sub {
  font-size: 13.5px;
  color: var(--muted);
  margin: -12px 0 16px;
  line-height: 1.5;
}

.picker-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.link-btn {
  background: transparent;
  border: none;
  color: var(--c-purple);
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
}

.picker-count {
  font-family: var(--font-mono);
  font-size: 11.5px;
  color: var(--muted2);
}

.picker-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 42vh;
  overflow-y: auto;
  margin-bottom: 16px;
}

.src {
  display: flex;
  align-items: flex-start;
  gap: 11px;
  padding: 12px 13px;
  background: var(--bg);
  border: 1px solid var(--o10);
  border-radius: 11px;
  cursor: pointer;
  transition: border-color var(--transition-fast), background-color var(--transition-fast);
}

.src--on {
  border-color: var(--purple-border);
  background: var(--purple-bg);
}

.src__check {
  width: 16px;
  height: 16px;
  margin: 1px 0 0;
  flex-shrink: 0;
  accent-color: var(--c-purple);
  cursor: pointer;
}

.src__body {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.src__name {
  font-size: 13.5px;
  font-weight: 600;
  color: var(--text2);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.src__meta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  font-size: 12px;
  color: var(--muted);
}

.src__type {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--muted2);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.src__badge {
  padding: 1px 7px;
  border-radius: 6px;
  background: var(--o05);
  border: 1px solid var(--o12);
  font-size: 10.5px;
  color: var(--muted);
}

.picker-credits {
  font-size: 12.5px;
  color: var(--muted);
  margin: 0 0 16px;
  line-height: 1.5;
}

.picker-credits--over {
  color: var(--c-coral);
}

.picker-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
}

.btn-cancel {
  padding: 11px 18px;
  background: transparent;
  border: 1px solid var(--o12);
  border-radius: 10px;
  color: var(--muted);
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.btn-generate {
  padding: 11px 20px;
  background: var(--purple-bg);
  border: 1px solid var(--purple-border);
  border-radius: 10px;
  color: var(--c-purple);
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.btn-generate:disabled {
  opacity: 0.55;
  cursor: default;
}
</style>
