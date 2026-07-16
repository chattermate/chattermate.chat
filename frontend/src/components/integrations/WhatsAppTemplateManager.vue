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
import { ref, computed, watch, onMounted } from 'vue'
import { toast } from 'vue-sonner'
import channelsService, {
  type ChannelAccount,
  type TemplateCategory,
  type WhatsAppTemplate,
} from '@/services/channels'
import { templateBody } from '@/utils/whatsappTemplates'
import {
  WHATSAPP_LANGUAGES,
  DEFAULT_LANGUAGE,
  languageLabel,
} from '@/utils/whatsappLanguages'

const props = defineProps<{
  accounts: ChannelAccount[]
}>()

const emit = defineEmits<{ (e: 'close'): void }>()

// Kept out of the template: the compiler cannot parse a mustache that itself
// contains {{n}}, which is exactly the syntax being described here.
const BODY_PLACEHOLDER = 'Hi {{1}}, your order {{2}} has shipped.'
const VARIABLE_HINT = 'Use {{1}}, {{2}} for values you fill in when sending.'

const CATEGORIES: { value: TemplateCategory; label: string; hint: string }[] = [
  { value: 'UTILITY', label: 'Utility', hint: 'Order updates, reminders, account alerts.' },
  { value: 'MARKETING', label: 'Marketing', hint: 'Offers and announcements.' },
  { value: 'AUTHENTICATION', label: 'Authentication', hint: 'One-time passcodes.' },
]

const dialog = ref<HTMLElement | null>(null)
const accountId = ref(props.accounts[0]?.id ?? '')
const templates = ref<WhatsAppTemplate[]>([])
const loading = ref(true)
const loadError = ref('')
const creating = ref(false)
const showCreate = ref(false)
const deletingName = ref('')
const confirmingName = ref('')

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

// Guards against a slow response for a previously selected number landing after
// a newer one and rendering its templates under the wrong account.
let loadToken = 0

const load = async () => {
  const token = ++loadToken
  confirmingName.value = ''
  loadError.value = ''
  if (!accountId.value) {
    templates.value = []
    loading.value = false
    return
  }
  loading.value = true
  try {
    const result = await channelsService.listWhatsAppTemplates(accountId.value)
    if (token !== loadToken) return
    templates.value = result
  } catch (error: any) {
    if (token !== loadToken) return
    loadError.value = error?.response?.data?.detail || 'Could not load templates'
    templates.value = []
  } finally {
    if (token === loadToken) loading.value = false
  }
}

onMounted(() => {
  dialog.value?.focus()
  load()
})

watch(accountId, load)

const resetForm = () => {
  form.value = { name: '', category: 'UTILITY', language: DEFAULT_LANGUAGE, body: '' }
}

const create = async () => {
  if (!canCreate.value) return
  try {
    creating.value = true
    await channelsService.createWhatsAppTemplate(accountId.value, {
      name: form.value.name,
      category: form.value.category,
      language: form.value.language,
      components: [{ type: 'BODY', text: form.value.body.trim() }],
    })
    toast.success('Template submitted', { description: 'Meta reviews it before it can be sent.' })
    resetForm()
    showCreate.value = false
    await load()
  } catch (error: any) {
    toast.error('Could not create template', {
      description: error?.response?.data?.detail || 'Please try again',
      closeButton: true,
    })
  } finally {
    creating.value = false
  }
}

const remove = async (name: string) => {
  try {
    deletingName.value = name
    await channelsService.deleteWhatsAppTemplate(accountId.value, name)
    toast.success(`Deleted ${name}`)
    confirmingName.value = ''
    await load()
  } catch (error: any) {
    toast.error('Could not delete template', {
      description: error?.response?.data?.detail || 'Please try again',
      closeButton: true,
    })
  } finally {
    deletingName.value = ''
  }
}
</script>

<template>
  <div
    ref="dialog"
    class="wtm-modal"
    role="dialog"
    aria-modal="true"
    aria-labelledby="wtm-title"
    tabindex="-1"
    @click.self="emit('close')"
    @keydown.esc="emit('close')"
  >
    <div class="wtm-content">
      <div class="wtm-header">
        <h3 id="wtm-title">WhatsApp templates</h3>
        <button class="wtm-close" aria-label="Close" @click="emit('close')">×</button>
      </div>

      <p class="wtm-intro">
        Templates reopen a conversation after the customer's 24-hour window closes. Meta reviews
        each one before it can be sent.
      </p>

      <label v-if="accounts.length > 1" class="wtm-field">
        <span class="wtm-label">Number</span>
        <select v-model="accountId" class="wtm-input">
          <option v-for="account in accounts" :key="account.id" :value="account.id">
            {{ account.display_name || account.external_account_id }}
          </option>
        </select>
      </label>

      <div class="wtm-body">
        <div v-if="loading" class="wtm-skeleton" aria-live="polite" aria-busy="true">
          <div v-for="n in 3" :key="n" class="wtm-skeleton-row"></div>
        </div>

        <div v-else-if="loadError" class="wtm-empty">
          <i class="fas fa-circle-exclamation"></i>
          <p>{{ loadError }}</p>
        </div>

        <div v-else-if="templates.length === 0" class="wtm-empty">
          <p>No templates yet.</p>
          <button class="wtm-btn wtm-btn-primary" @click="showCreate = true">
            Create your first template
          </button>
        </div>

        <ul v-else class="wtm-list">
          <li v-for="template in templates" :key="template.name" class="wtm-row">
            <div class="wtm-row-main">
              <div class="wtm-row-head">
                <span class="wtm-name">{{ template.name }}</span>
                <span v-if="template.status" class="wtm-pill" :class="template.status.toLowerCase()">
                  {{ template.status }}
                </span>
              </div>
              <div class="wtm-row-meta">
                <span v-if="template.category">{{ template.category }}</span>
                <span v-if="template.language">· {{ languageLabel(template.language) }}</span>
              </div>
              <p class="wtm-row-body">{{ templateBody(template) }}</p>
            </div>

            <div class="wtm-row-actions">
              <template v-if="confirmingName === template.name">
                <span class="wtm-confirm-text">Delete?</span>
                <button
                  class="wtm-btn wtm-btn-danger"
                  :disabled="deletingName === template.name"
                  @click="remove(template.name)"
                >
                  {{ deletingName === template.name ? 'Deleting…' : 'Yes' }}
                </button>
                <button class="wtm-btn" @click="confirmingName = ''">No</button>
              </template>
              <button
                v-else
                class="wtm-btn"
                :aria-label="`Delete ${template.name}`"
                @click="confirmingName = template.name"
              >
                Delete
              </button>
            </div>
          </li>
        </ul>
      </div>

      <form v-if="showCreate" class="wtm-create" @submit.prevent="create">
        <label class="wtm-field">
          <span class="wtm-label">Name</span>
          <input
            v-model="form.name"
            class="wtm-input"
            placeholder="order_update"
            autocomplete="off"
          />
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
          <!-- Native select: .wtm-content scrolls, so a custom popover would be
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
          <button type="button" class="wtm-btn" @click="showCreate = false">Cancel</button>
          <button type="submit" class="wtm-btn wtm-btn-primary" :disabled="!canCreate">
            <i v-if="creating" class="fas fa-spinner fa-spin"></i>
            {{ creating ? 'Submitting…' : 'Submit for review' }}
          </button>
        </div>
      </form>

      <div v-else-if="templates.length > 0" class="wtm-actions">
        <button class="wtm-btn wtm-btn-primary" @click="showCreate = true">New template</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wtm-modal {
  position: fixed;
  inset: 0;
  background: var(--scrim);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.wtm-modal:focus {
  outline: none;
}

.wtm-content {
  background: var(--background-color);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg, 12px);
  width: min(620px, 100%);
  max-height: min(760px, calc(100vh - 32px));
  display: flex;
  flex-direction: column;
  padding: 24px;
  overflow-y: auto;
}

.wtm-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.wtm-header h3 {
  margin: 0;
  font-family: var(--font-display);
}

.wtm-close {
  background: none;
  border: none;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
  color: var(--muted);
}

.wtm-intro {
  margin: 0 0 16px;
  color: var(--muted);
  font-size: 14px;
  line-height: 1.6;
}

.wtm-body {
  flex: 1;
}

.wtm-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.wtm-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-btn, 8px);
  background: var(--background-soft);
}

.wtm-row-main {
  min-width: 0;
}

.wtm-row-head {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.wtm-name {
  font-weight: 600;
  font-size: 14px;
}

/* Neutral by default: Meta adds statuses over time (PENDING_DELETION, IN_APPEAL,
   FLAGGED, ...) and an unrecognised one must still read as a pill, not vanish. */
.wtm-pill {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  padding: 2px 8px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--c-neutral) 16%, transparent);
  color: var(--c-neutral);
  border: 1px solid color-mix(in srgb, var(--c-neutral) 35%, transparent);
}

.wtm-pill.approved {
  background: color-mix(in srgb, var(--c-positive) 16%, transparent);
  color: var(--c-positive);
  border-color: color-mix(in srgb, var(--c-positive) 35%, transparent);
}

.wtm-pill.pending {
  background: color-mix(in srgb, var(--c-warn) 16%, transparent);
  color: var(--c-warn);
  border-color: color-mix(in srgb, var(--c-warn) 35%, transparent);
}

/* Rejected, paused and disabled all mean "cannot send" */
.wtm-pill.rejected,
.wtm-pill.paused,
.wtm-pill.disabled {
  background: color-mix(in srgb, var(--c-danger) 16%, transparent);
  color: var(--c-danger);
  border-color: color-mix(in srgb, var(--c-danger) 35%, transparent);
}

.wtm-row-meta {
  font-size: 12px;
  color: var(--muted);
  margin-top: 4px;
}

.wtm-row-body {
  margin: 6px 0 0;
  font-size: 13px;
  color: var(--muted);
  line-height: 1.5;
  word-break: break-word;
}

.wtm-row-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.wtm-confirm-text {
  font-size: 13px;
  color: var(--muted);
}

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

.wtm-skeleton {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.wtm-skeleton-row {
  height: 64px;
  border-radius: var(--radius-btn, 8px);
  background: var(--background-soft);
  animation: wtm-pulse 1.4s ease-in-out infinite;
}

@keyframes wtm-pulse {
  50% {
    opacity: 0.5;
  }
}

@media (prefers-reduced-motion: reduce) {
  .wtm-skeleton-row {
    animation: none;
  }
}

.wtm-empty {
  text-align: center;
  padding: 24px 8px;
  color: var(--muted);
  font-size: 14px;
}

.wtm-empty p {
  margin: 0 0 12px;
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

.wtm-btn-danger {
  background: var(--c-danger);
  color: var(--on-accent-solid);
  border-color: transparent;
}

.wtm-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
