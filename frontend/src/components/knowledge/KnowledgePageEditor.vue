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

const props = withDefaults(
  defineProps<{
    title: string
    content: string
    saving: boolean
    submitLabel?: string
  }>(),
  { submitLabel: 'Save page' },
)

const emit = defineEmits<{
  (e: 'update:title', value: string): void
  (e: 'update:content', value: string): void
  (e: 'save'): void
  (e: 'cancel'): void
}>()

const canSave = computed(() => props.content.trim().length > 0 && !props.saving)
</script>

<template>
  <div class="editor">
    <div class="editor__body">
      <label class="editor__label" for="kb-page-title">PAGE TITLE</label>
      <input
        id="kb-page-title"
        class="editor__title"
        :value="title"
        type="text"
        placeholder="Page title"
        @input="emit('update:title', ($event.target as HTMLInputElement).value)"
      />

      <label class="editor__label" for="kb-page-content">PAGE CONTENT</label>
      <textarea
        id="kb-page-content"
        class="editor__content"
        :value="content"
        placeholder="Type the page content here. Leave a blank line between paragraphs."
        @input="emit('update:content', ($event.target as HTMLTextAreaElement).value)"
      ></textarea>
    </div>

    <div class="editor__foot">
      <span class="editor__status">
        <span class="editor__status-dot"></span>Editing — re-embeds on save
      </span>
      <div class="editor__buttons">
        <button class="btn btn--ghost" type="button" :disabled="saving" @click="emit('cancel')">Cancel</button>
        <button class="btn btn--primary" type="button" :disabled="!canSave" @click="emit('save')">
          {{ saving ? 'Saving…' : submitLabel }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.editor__body {
  flex: 1;
  overflow-y: auto;
  padding: 18px 24px;
  display: flex;
  flex-direction: column;
}

.editor__label {
  font-family: var(--font-mono);
  font-size: 10.5px;
  letter-spacing: 0.08em;
  color: var(--muted2);
  margin-bottom: 8px;
}

.editor__title {
  background: var(--bg);
  border: 1px solid var(--o12);
  border-radius: 9px;
  outline: none;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 18px;
  color: var(--text);
  padding: 10px 12px;
  margin-bottom: 16px;
}

.editor__title:focus,
.editor__content:focus {
  border-color: var(--accent-border, var(--accent-ink));
}

.editor__content {
  flex: 1;
  min-height: 320px;
  background: var(--bg);
  border: 1px solid var(--o12);
  border-radius: 12px;
  padding: 16px 18px;
  font-size: 15px;
  line-height: 1.7;
  color: var(--text3);
  outline: none;
  resize: vertical;
  font-family: var(--font-sans);
}

.editor__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 18px;
  border-top: 1px solid var(--o10);
  background: var(--bg2);
  flex-shrink: 0;
}

.editor__status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--muted);
}

.editor__status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--c-coral);
}

.editor__buttons {
  display: flex;
  align-items: center;
  gap: 9px;
}

.btn {
  padding: 9px 18px;
  border-radius: 9px;
  font-size: 13.5px;
  font-weight: 600;
  font-family: var(--font-sans);
  cursor: pointer;
  border: 1px solid transparent;
}

.btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.btn--ghost {
  background: transparent;
  border-color: var(--o12);
  color: var(--muted);
}

.btn--ghost:hover:not(:disabled) { background: var(--o05); }

.btn--primary {
  background: var(--accent-solid);
  color: var(--on-accent-solid);
}

.btn--primary:hover:not(:disabled) { filter: brightness(1.05); }
</style>
