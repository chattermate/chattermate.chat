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
 * A note that steers the next investigation. Used by the L2 approval banner
 * when rejecting a proposal, and by the investigation panel for a plain
 * guided re-run — the two differ only in wording and button colour, so the
 * autofocus, the keyboard shortcuts and the trim live here rather than twice.
 */
import { onMounted, ref } from 'vue'

withDefaults(
  defineProps<{
    placeholder: string
    submitLabel: string
    tone?: 'danger' | 'accent'
    busy?: boolean
  }>(),
  { tone: 'accent', busy: false },
)

const emit = defineEmits<{
  (e: 'submit', note: string): void
  (e: 'cancel'): void
}>()

const note = ref('')
const input = ref<HTMLTextAreaElement | null>(null)

onMounted(() => input.value?.focus())

// An empty note is allowed: re-running unchanged is a legitimate thing to
// want, and the reject flow has always permitted a reason-less rejection.
const submit = () => emit('submit', note.value.trim())
</script>

<template>
  <div class="note-form">
    <textarea
      ref="input"
      v-model="note"
      class="note-input"
      :placeholder="placeholder"
      @keydown.esc.stop="emit('cancel')"
      @keydown.enter.meta.stop.prevent="submit"
      @keydown.enter.ctrl.stop.prevent="submit"
    ></textarea>
    <slot />
    <div class="note-actions">
      <button type="button" class="cancel-btn" @click="emit('cancel')">Cancel</button>
      <button
        type="button"
        class="submit-btn"
        :class="tone"
        :disabled="busy"
        @click="submit"
      >
        {{ submitLabel }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.note-form {
  background: var(--surface);
  border: 1px solid var(--o08);
  border-radius: 11px;
  padding: 12px;
}
.note-input {
  width: 100%;
  min-height: 68px;
  resize: vertical;
  background: var(--bg2);
  border: 1px solid var(--o10);
  border-radius: 9px;
  padding: 9px 11px;
  color: var(--text);
  font-size: 12.5px;
  line-height: 1.5;
  outline: none;
}
.note-actions {
  display: flex;
  justify-content: flex-end;
  gap: 9px;
  margin-top: 10px;
}
.cancel-btn {
  padding: 7px 13px;
  background: var(--o05);
  border: 1px solid var(--o10);
  color: var(--muted);
  border-radius: 9px;
  font-size: 12.5px;
  cursor: pointer;
}
.submit-btn {
  padding: 7px 15px;
  border: none;
  border-radius: 9px;
  font-size: 12.5px;
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
}
.submit-btn.danger {
  background: var(--c-danger);
  color: var(--on-light, #fff);
}
.submit-btn.accent {
  background: var(--accent-solid);
  color: var(--on-accent-solid);
}
.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
