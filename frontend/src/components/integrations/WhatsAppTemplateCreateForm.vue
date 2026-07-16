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
import { ref, computed } from 'vue'
import { toast } from 'vue-sonner'
import channelsService, { type TemplateCategory } from '@/services/channels'
import { WHATSAPP_LANGUAGES, DEFAULT_LANGUAGE } from '@/utils/whatsappLanguages'

const props = defineProps<{
  accountId: string
}>()

const emit = defineEmits<{
  (e: 'created'): void
  (e: 'cancel'): void
}>()

// Kept out of the template: the compiler cannot parse a mustache that itself
// contains {{n}}, which is exactly the syntax being described here.
const BODY_PLACEHOLDER = 'Hi {{1}}, your order {{2}} has shipped.'
const VARIABLE_HINT = 'Use {{1}}, {{2}} for values you fill in when sending.'

const CATEGORIES: { value: TemplateCategory; label: string; hint: string }[] = [
  { value: 'UTILITY', label: 'Utility', hint: 'Order updates, reminders, account alerts.' },
  { value: 'MARKETING', label: 'Marketing', hint: 'Offers and announcements.' },
  { value: 'AUTHENTICATION', label: 'Authentication', hint: 'One-time passcodes.' },
]

const creating = ref(false)
const form = ref({
  name: '',
  category: 'UTILITY' as TemplateCategory,
  language: DEFAULT_LANGUAGE,
  body: '',
})

// Meta only accepts lowercase letters, digits and underscores in a name.
const nameIsValid = computed(() => /^[a-z0-9_]+$/.test(form.value.name))
const canCreate = computed(
  () => nameIsValid.value && !!form.value.body.trim() && !creating.value,
)

const create = async () => {
  if (!canCreate.value) return
  try {
    creating.value = true
    await channelsService.createWhatsAppTemplate(props.accountId, {
      name: form.value.name,
      category: form.value.category,
      language: form.value.language,
      components: [{ type: 'BODY', text: form.value.body.trim() }],
    })
    toast.success('Template submitted', { description: 'Meta reviews it before it can be sent.' })
    emit('created')
  } catch (error: any) {
    toast.error('Could not create template', {
      description: error?.response?.data?.detail || 'Please try again',
      closeButton: true,
    })
  } finally {
    creating.value = false
  }
}
</script>

<template>
  <form class="wtm-create" @submit.prevent="create">
    <label class="wtm-field">
      <span class="wtm-label">Name</span>
      <input v-model="form.name" class="wtm-input" placeholder="order_update" autocomplete="off" />
      <span v-if="form.name && !nameIsValid" class="wtm-error">
        Use lowercase letters, numbers and underscores only.
      </span>
    </label>

    <label class="wtm-field">
      <span class="wtm-label">Category</span>
      <select v-model="form.category" class="wtm-input">
        <option v-for="category in CATEGORIES" :key="category.value" :value="category.value">
          {{ category.label }} — {{ category.hint }}
        </option>
      </select>
    </label>

    <label class="wtm-field">
      <span class="wtm-label">Language</span>
      <!-- Native select: the modal body scrolls, so a custom popover would be
           clipped — and native gives type-ahead over 111 options for free.
           The code is shown too: admins cross-reference it in Meta. -->
      <select v-model="form.language" class="wtm-input">
        <option v-for="language in WHATSAPP_LANGUAGES" :key="language.code" :value="language.code">
          {{ language.label }} ({{ language.code }})
        </option>
      </select>
    </label>

    <label class="wtm-field">
      <span class="wtm-label">Message</span>
      <textarea
        v-model="form.body"
        class="wtm-input wtm-textarea"
        rows="3"
        :placeholder="BODY_PLACEHOLDER"
      ></textarea>
      <span class="wtm-hint">{{ VARIABLE_HINT }}</span>
    </label>

    <div class="wtm-actions">
      <button type="button" class="wtm-btn" @click="emit('cancel')">Cancel</button>
      <button type="submit" class="wtm-btn wtm-btn-primary" :disabled="!canCreate">
        <i v-if="creating" class="fas fa-spinner fa-spin"></i>
        {{ creating ? 'Submitting…' : 'Submit for review' }}
      </button>
    </div>
  </form>
</template>

<style scoped>
.wtm-create {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
}

.wtm-field {
  display: block;
  margin-bottom: 12px;
}

.wtm-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 6px;
}

.wtm-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-btn, 8px);
  background: var(--background-soft);
  color: inherit;
  font-size: 14px;
  font-family: inherit;
}

.wtm-textarea {
  resize: vertical;
}

.wtm-hint,
.wtm-error {
  display: block;
  font-size: 12px;
  margin-top: 4px;
  color: var(--muted);
}

.wtm-error {
  color: var(--c-danger);
}

.wtm-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
}

.wtm-btn {
  padding: 8px 14px;
  border-radius: var(--radius-btn, 8px);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid var(--border-color);
  background: var(--background-soft);
  color: inherit;
}

.wtm-btn-primary {
  background: var(--accent-solid);
  color: var(--on-accent-solid);
  border-color: transparent;
}

.wtm-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
