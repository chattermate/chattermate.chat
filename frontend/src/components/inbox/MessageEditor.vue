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
 * A sent reply, being edited in place: Enter saves, Shift+Enter breaks the
 * line, Escape cancels. A refused save leaves the text here to try again.
 */
import { computed, onMounted, ref } from 'vue'

const props = defineProps<{
  text: string
  save: (text: string) => Promise<void>
}>()

const emit = defineEmits<{ (e: 'done'): void }>()

const draft = ref(props.text)
const box = ref<HTMLTextAreaElement | null>(null)
// Straight into the text, the cursor at its end
onMounted(() => {
  box.value?.focus()
  box.value?.setSelectionRange(draft.value.length, draft.value.length)
})
const saving = ref(false)
const changed = computed(() => !!draft.value.trim() && draft.value.trim() !== props.text.trim())
const rows = computed(() => Math.min(8, Math.max(2, draft.value.split('\n').length)))

async function submit() {
  if (saving.value) return
  if (!changed.value) return emit('done')
  saving.value = true
  try {
    await props.save(draft.value.trim())
    emit('done')
  } catch {
    // Said by whoever saved; the draft stays
  } finally {
    saving.value = false
  }
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault()
    emit('done')
  } else if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
    event.preventDefault()
    void submit()
  }
}
</script>

<template>
  <form class="editor" @submit.prevent="submit">
    <textarea
      ref="box"
      v-model="draft"
      class="editor-text"
      :rows="rows"
      maxlength="4000"
      aria-label="Edit your reply"
      @keydown="onKeydown"
    ></textarea>
    <span class="editor-actions">
      <span class="editor-hint">Enter to save · Esc to cancel</span>
      <button type="button" class="editor-btn" @click="emit('done')">Cancel</button>
      <button type="submit" class="editor-btn primary" :disabled="saving || !changed">{{ saving ? 'Saving…' : 'Save' }}</button>
    </span>
  </form>
</template>

<style scoped>
.editor {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: min(420px, 60vw);
}

.editor-text {
  width: 100%;
  box-sizing: border-box;
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid var(--accent-border);
  background: var(--bg);
  color: var(--text);
  font: inherit;
  font-size: 14px;
  line-height: 1.5;
  resize: vertical;
}

.editor-text:focus {
  outline: none;
}

.editor-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
}

.editor-hint {
  margin-right: auto;
  font-size: 11px;
  color: var(--muted2);
}

.editor-btn {
  height: 28px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid var(--o12);
  background: var(--o04);
  color: var(--text);
  font: inherit;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.editor-btn.primary {
  border: 0;
  background: var(--accent-solid);
  color: var(--on-accent-solid);
}

.editor-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.editor-btn:focus-visible {
  outline: 2px solid var(--accent-border);
  outline-offset: 1px;
}
</style>
