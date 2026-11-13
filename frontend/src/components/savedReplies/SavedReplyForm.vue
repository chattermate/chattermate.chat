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
 * Writing a saved reply: its title, an optional /shortcut, and the text, with
 * the variables it may use. Saving reports a refused shortcut inline.
 */
import { computed, ref } from 'vue'
import type { SavedReplyInput } from '@/services/savedReplies'
import { REPLY_VARIABLES } from '@/components/inbox/savedReplyText'

const props = defineProps<{
  initial: SavedReplyInput
  submitLabel: string
  save: (input: SavedReplyInput) => Promise<void>
}>()

const emit = defineEmits<{ (e: 'cancel'): void }>()

const title = ref(props.initial.title)
const shortcut = ref(props.initial.shortcut ?? '')
const body = ref(props.initial.body)
const saving = ref(false)
const error = ref('')
const bodyBox = ref<HTMLTextAreaElement | null>(null)

const valid = computed(() => !!title.value.trim() && !!body.value.trim())

function insertVariable(token: string) {
  const el = bodyBox.value
  const at = el?.selectionStart ?? body.value.length
  body.value = body.value.slice(0, at) + token + body.value.slice(at)
}

async function submit() {
  if (!valid.value || saving.value) return
  saving.value = true
  error.value = ''
  try {
    await props.save({ title: title.value.trim(), body: body.value.trim(), shortcut: shortcut.value.trim() || null })
  } catch (err: any) {
    const detail = err?.response?.data?.detail
    error.value = typeof detail === 'string' ? detail : 'The saved reply could not be saved. Check the fields and try again.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <form class="form" @submit.prevent="submit">
    <label class="field">
      <span>Title</span>
      <input v-model="title" maxlength="100" required placeholder="EU refund policy" />
    </label>
    <label class="field">
      <span>Shortcut <em>(optional)</em></span>
      <span class="shortcut">
        <span aria-hidden="true">/</span>
        <input v-model="shortcut" maxlength="40" placeholder="refund-eu" aria-describedby="shortcut-hint" />
      </span>
      <small id="shortcut-hint">Type it after / in a reply. Lowercase letters, digits and dashes.</small>
    </label>
    <label class="field">
      <span>Reply</span>
      <textarea ref="bodyBox" v-model="body" rows="6" maxlength="4000" required></textarea>
    </label>
    <div class="variables">
      <span>Insert:</span>
      <button v-for="variable in REPLY_VARIABLES" :key="variable.token" type="button" class="chip" @click="insertVariable(variable.token)">
        {{ variable.label }}
      </button>
    </div>
    <p v-if="error" class="error" role="alert">{{ error }}</p>
    <div class="actions">
      <button type="button" class="btn" @click="emit('cancel')">Cancel</button>
      <button type="submit" class="btn primary" :disabled="!valid || saving">{{ saving ? 'Saving…' : submitLabel }}</button>
    </div>
  </form>
</template>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text2);
}

.field em {
  font-style: normal;
  font-weight: 400;
  color: var(--muted2);
}

.field input,
.field textarea {
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid var(--o12);
  background: var(--o04);
  color: var(--text);
  font: inherit;
  font-weight: 400;
}

.field textarea {
  resize: vertical;
  line-height: 1.5;
}

.field input:focus,
.field textarea:focus {
  outline: none;
  border-color: var(--accent-border);
}

.shortcut {
  display: flex;
  align-items: center;
  gap: 4px;
  font-family: var(--font-mono);
  color: var(--muted2);
}

.shortcut input {
  flex: 1;
  font-family: var(--font-mono);
}

small {
  font-weight: 400;
  color: var(--muted2);
}

.variables {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--muted);
}

.chip {
  height: 24px;
  padding: 0 8px;
  border-radius: 999px;
  border: 1px solid var(--o10);
  background: var(--o04);
  color: var(--text2);
  font: inherit;
  font-size: 12px;
  cursor: pointer;
}

.error {
  margin: 0;
  font-size: 13px;
  color: var(--c-danger);
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.btn {
  height: 36px;
  padding: 0 14px;
  border-radius: 8px;
  border: 1px solid var(--o12);
  background: var(--surface);
  color: var(--text2);
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.btn.primary {
  border: 0;
  background: var(--accent-solid);
  color: var(--on-accent-solid);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
