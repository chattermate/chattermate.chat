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
import { computed } from 'vue'
import FaqOrb from './FaqOrb.vue'

const props = defineProps<{
  phase: 'idle' | 'generating' | 'ready'
  sourceCount: number
  pageCount: number
  faqCount: number
  publishedCount: number
  /** Sources without FAQs yet (from the estimate); null = unknown. */
  newSourceCount?: number | null
  disabled?: boolean
}>()

defineEmits<{
  generate: []
  import: []
  add: []
}>()

const title = computed(() => {
  if (props.phase === 'generating') return 'Generating FAQs…'
  if (props.phase === 'ready') return 'FAQs ready to publish'
  return 'Generate FAQs'
})

const subtitle = computed(() =>
  props.phase === 'ready'
    ? `${props.faqCount} FAQs · ${props.publishedCount} published`
    : `Reading from ${props.sourceCount} sources · ${props.pageCount} pages`,
)

const generateLabel = computed(() => {
  if (props.phase === 'generating') return 'Generating…'
  if (props.phase === 'ready') {
    // Regenerate only reads new (ungenerated) sources — say so.
    if (typeof props.newSourceCount === 'number' && props.newSourceCount > 0) {
      return `Generate ${props.newSourceCount} new source${props.newSourceCount === 1 ? '' : 's'}`
    }
    return 'Regenerate'
  }
  return 'Generate'
})

const noNewSources = computed(() => props.phase === 'ready' && props.newSourceCount === 0)

const generateDisabled = computed(() => props.phase === 'generating' || props.disabled || noNewSources.value)

const generateTitle = computed(() =>
  noNewSources.value ? 'All knowledge sources already have FAQs' : undefined,
)
</script>

<template>
  <div class="generate-bar">
    <div class="generate-bar__lead">
      <FaqOrb :size="40" />
      <div>
        <div class="generate-bar__title">{{ title }}</div>
        <div class="generate-bar__sub">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5.5A2 2 0 0 1 6 4h5v16H6a2 2 0 0 0-2 1.5z" /><path d="M20 5.5A2 2 0 0 0 18 4h-5v16h5a2 2 0 0 1 2 1.5z" /></svg>
          {{ subtitle }}
        </div>
      </div>
    </div>
    <div class="generate-bar__actions">
      <button class="btn btn--ghost" type="button" @click="$emit('import')">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12" /><path d="M8 11l4 4 4-4" /><path d="M5 21h14" /></svg>
        Import
      </button>
      <button class="btn btn--ghost" type="button" @click="$emit('add')">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14" /></svg>
        Add FAQ
      </button>
      <button class="btn btn--generate" type="button" :disabled="generateDisabled" :title="generateTitle" @click="$emit('generate')">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3v4M3 5h4M6 17v4M4 19h4M13 3l2.5 6.5L22 12l-6.5 2.5L13 21l-2.5-6.5L4 12l6.5-2.5z" /></svg>
        {{ generateLabel }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.generate-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 22px;
  background: var(--surface);
  border: 1px solid var(--o08);
  border-radius: 16px;
  flex-wrap: wrap;
}

.generate-bar__lead {
  display: flex;
  align-items: center;
  gap: 14px;
}

.generate-bar__title {
  font-size: 14.5px;
  font-weight: 600;
  color: var(--text2);
}

.generate-bar__sub {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 13px;
  color: var(--muted);
  margin-top: 2px;
}

.generate-bar__actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 11px;
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color var(--transition-fast);
}

.btn--ghost {
  background: var(--o05);
  border: 1px solid var(--o14);
  color: var(--text2);
}

.btn--ghost:hover {
  background: var(--o08);
}

.btn--generate {
  padding: 12px 20px;
  background: var(--purple-bg);
  border: 1px solid var(--purple-border);
  color: var(--c-purple);
}

.btn--generate:disabled {
  opacity: 0.6;
  cursor: default;
}

/* ── Mobile ─────────────────────────────────────────────────────────────
   Three actions wrapped 2 + 1, leaving a stranded Regenerate button. Below
   768px they share one row as equal thirds. */
@media (max-width: 768px) {
  .generate-bar {
    padding: 14px 16px;
    gap: 14px;
  }

  .generate-bar__actions {
    width: 100%;
    gap: 8px;
    flex-wrap: nowrap;
  }

  .btn {
    flex: 1 1 0;
    min-width: 0;
    justify-content: center;
    padding: 12px 8px;
    /* 44px minimum touch target (Apple HIG / WCAG 2.5.8) */
    min-height: 44px;
    white-space: nowrap;
  }
}

/* Labels alone would overflow three-up on the narrowest phones */
@media (max-width: 400px) {
  .btn {
    font-size: 12.5px;
    gap: 5px;
  }
}
</style>
