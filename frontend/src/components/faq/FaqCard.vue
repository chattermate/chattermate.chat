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
import type { FaqItem } from '@/types/faq'
import MarkdownEditor from './MarkdownEditor.vue'

const props = defineProps<{
  faq: FaqItem
  editing: boolean
  isNew?: boolean
  saving?: boolean
  draftQuestion: string
  draftAnswer: string
  locked?: boolean
  /** Selection mode is on somewhere in the list (keeps checkboxes visible). */
  selectable?: boolean
  selected?: boolean
}>()

const emit = defineEmits<{
  'toggle-status': []
  edit: []
  delete: []
  save: []
  cancel: []
  'toggle-select': []
  'update:draftQuestion': [value: string]
  'update:draftAnswer': [value: string]
}>()

function onQuestionInput(event: Event) {
  emit('update:draftQuestion', (event.target as HTMLInputElement).value)
}

const sourceLabel = () => props.faq.source_label || 'Generated'

// Answers are stored as Markdown; strip the syntax and cap the length for the
// compact, line-clamped card preview (the public article page and the editor
// show the full formatted content).
const PREVIEW_MAX_CHARS = 240
function answerPreview(md: string): string {
  const text = (md || '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`~]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  return text.length > PREVIEW_MAX_CHARS ? `${text.slice(0, PREVIEW_MAX_CHARS).trimEnd()}…` : text
}
</script>

<template>
  <div class="faq-card" :class="{ 'faq-card--editing': editing, 'faq-card--selecting': selectable, 'faq-card--selected': selected }">
    <!-- Edit mode -->
    <div v-if="editing">
      <div class="edit-label">{{ isNew ? 'NEW FAQ' : 'EDITING' }}</div>
      <input
        class="edit-question"
        type="text"
        placeholder="Question"
        :value="draftQuestion"
        @input="onQuestionInput"
      />
      <MarkdownEditor
        class="edit-answer"
        :model-value="draftAnswer"
        @update:model-value="$emit('update:draftAnswer', $event)"
      />
      <p class="edit-hint">Markdown supported — headings, <strong>bold</strong>, lists, links and images.</p>
      <div class="edit-actions">
        <button class="btn-save" type="button" :disabled="saving" @click="$emit('save')">
          {{ saving ? 'Saving…' : 'Save' }}
        </button>
        <button class="btn-cancel" type="button" :disabled="saving" @click="$emit('cancel')">Cancel</button>
      </div>
    </div>

    <!-- Display mode -->
    <div v-else class="faq-card__row">
      <input
        v-if="!locked"
        class="faq-card__check"
        type="checkbox"
        :checked="selected"
        :aria-label="`Select ${faq.question}`"
        @change="$emit('toggle-select')"
      />
      <div class="faq-card__body">
        <div class="faq-card__question">{{ faq.question }}</div>
        <div class="faq-card__answer">{{ answerPreview(faq.answer) }}</div>
        <div class="faq-card__source">
          <span class="faq-card__source-dot"></span>
          {{ sourceLabel() }}
          <span
            v-if="(faq.helpful_yes || 0) + (faq.helpful_no || 0) > 0"
            class="faq-card__fb"
            :title="`${faq.helpful_yes || 0} found this helpful, ${faq.helpful_no || 0} did not`"
          >
            <span class="faq-card__fb-item faq-card__fb-item--up">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M7 11v9H4a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1z" /><path d="M7 11l4-8a2 2 0 0 1 3 1.8V9h4.5a2 2 0 0 1 2 2.4l-1.4 7A2 2 0 0 1 17 20H7" /></svg>
              {{ faq.helpful_yes || 0 }}
            </span>
            <span class="faq-card__fb-item faq-card__fb-item--down">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M17 13V4h3a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1z" /><path d="M17 13l-4 8a2 2 0 0 1-3-1.8V15H5.5a2 2 0 0 1-2-2.4l1.4-7A2 2 0 0 1 7 4h10" /></svg>
              {{ faq.helpful_no || 0 }}
            </span>
          </span>
        </div>
      </div>
      <div class="faq-card__controls">
        <button
          class="pill"
          :class="faq.status === 'published' ? 'pill--published' : 'pill--draft'"
          type="button"
          :disabled="locked"
          @click="$emit('toggle-status')"
        >
          <span class="pill__dot"></span>
          {{ faq.status === 'published' ? 'Published' : 'Draft' }}
        </button>
        <button v-if="!locked" class="icon-btn icon-btn--edit" type="button" title="Edit" @click="$emit('edit')">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></svg>
        </button>
        <button v-if="!locked" class="icon-btn icon-btn--delete" type="button" title="Delete" @click="$emit('delete')">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16" /><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /><path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" /></svg>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.faq-card {
  background: var(--surface);
  border: 1px solid var(--o08);
  border-radius: 14px;
  padding: 16px 18px;
}

.faq-card--editing {
  border-color: var(--purple-border);
}

.faq-card--selected {
  border-color: var(--teal-border);
  background: var(--teal-bg);
}

.faq-card__check {
  width: 16px;
  height: 16px;
  margin: 3px 0 0;
  flex-shrink: 0;
  accent-color: var(--c-teal);
  cursor: pointer;
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.faq-card:hover .faq-card__check,
.faq-card--selecting .faq-card__check,
.faq-card__check:checked,
.faq-card__check:focus-visible {
  opacity: 1;
}

.faq-card__row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.faq-card__body {
  flex: 1;
  min-width: 0;
}

.faq-card__question {
  font-size: 15px;
  font-weight: 600;
  color: var(--text2);
  line-height: 1.4;
  margin-bottom: 6px;
}

.faq-card__answer {
  font-size: 13.5px;
  color: var(--muted);
  line-height: 1.55;
  /* Keep every card compact and uniform — imported articles can be very long;
     full content is on the public page and in the editor. */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.faq-card__source {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin-top: 11px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--faint);
}

.faq-card__source-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--faint);
}

.faq-card__fb {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  padding-left: 9px;
  margin-left: 2px;
  border-left: 1px solid var(--o10);
}

.faq-card__fb-item {
  display: inline-flex;
  align-items: center;
  gap: 3px;
}

.faq-card__fb-item--up {
  color: var(--c-teal, #1d9e75);
}

.faq-card__fb-item--down {
  color: var(--c-coral, #d85a30);
}

.faq-card__controls {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.pill {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 7px 13px;
  border-radius: 9px;
  font-family: var(--font-sans);
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
}

.pill:disabled {
  cursor: default;
}

.pill__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.pill--published {
  background: var(--teal-bg);
  border: 1px solid var(--teal-border);
  color: var(--c-teal);
}

.pill--published .pill__dot {
  background: var(--c-teal);
}

.pill--draft {
  background: var(--pill-idle-bg);
  border: 1px solid var(--o12);
  color: var(--pill-idle-fg);
}

.pill--draft .pill__dot {
  background: var(--faint);
}

.icon-btn {
  width: 32px;
  height: 32px;
  border-radius: 9px;
  background: var(--o05);
  border: 1px solid var(--o12);
  color: var(--muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color var(--transition-fast), color var(--transition-fast);
}

.icon-btn--edit:hover {
  background: var(--o08);
  color: var(--text2);
}

.icon-btn--delete:hover {
  background: var(--coral-bg);
  color: var(--c-coral);
  border-color: var(--coral-border);
}

.edit-label {
  font-family: var(--font-mono);
  font-size: 10.5px;
  letter-spacing: 0.08em;
  color: var(--c-purple);
  margin-bottom: 10px;
}

.edit-question {
  width: 100%;
  background: var(--bg);
  border: 1px solid var(--o12);
  border-radius: 10px;
  padding: 11px 13px;
  color: var(--text);
  outline: none;
  box-sizing: border-box;
  font-size: 14.5px;
  font-weight: 600;
  margin-bottom: 9px;
}

/* .edit-answer wraps the MarkdownEditor, which supplies its own chrome. */
.edit-hint {
  margin: 8px 0 0;
  font-size: 11.5px;
  color: var(--muted2);
}

.edit-hint strong {
  font-weight: 600;
}

.edit-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
}

.btn-save {
  padding: 9px 18px;
  background: var(--accent-solid);
  border: none;
  border-radius: 9px;
  color: var(--on-accent-solid);
  font-family: var(--font-sans);
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: default;
}

.btn-cancel {
  padding: 9px 16px;
  background: transparent;
  border: 1px solid var(--o12);
  border-radius: 9px;
  color: var(--muted);
  font-family: var(--font-sans);
  font-size: 13.5px;
  font-weight: 500;
  cursor: pointer;
}
</style>
