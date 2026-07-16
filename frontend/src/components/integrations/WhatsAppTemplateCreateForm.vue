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
import channelsService, { type TemplateCategory, type TemplateComponent } from '@/services/channels'
import { WHATSAPP_LANGUAGES, DEFAULT_LANGUAGE, languageLabel } from '@/utils/whatsappLanguages'
import { AUTH_SECURITY_NOTE, authBodyPreview, authExpiryNote } from '@/utils/whatsappTemplates'

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

/** Meta's own bounds for code_expiration_minutes. */
const MIN_EXPIRY = 1
const MAX_EXPIRY = 90
/** Meta caps OTP button text; a longer one round-trips to a rejection. */
const MAX_BUTTON_TEXT = 25

const creating = ref(false)
const form = ref({
  name: '',
  category: 'UTILITY' as TemplateCategory,
  language: DEFAULT_LANGUAGE,
  body: '',
  // Authentication only — Meta writes the body, we only choose these.
  securityNote: true,
  expiryMinutes: '' as number | '',
  buttonText: 'Copy Code',
})

const isAuth = computed(() => form.value.category === 'AUTHENTICATION')

/**
 * Authentication templates can be created in several languages at once, because
 * Meta writes the copy for each. Every other category needs its own translated
 * body, so it stays single-language.
 */
const authLanguages = ref<string[]>([DEFAULT_LANGUAGE])
const languageToAdd = ref('')
const addableLanguages = computed(() =>
  WHATSAPP_LANGUAGES.filter((language) => !authLanguages.value.includes(language.code)),
)

const addLanguage = () => {
  if (!languageToAdd.value) return
  authLanguages.value.push(languageToAdd.value)
  languageToAdd.value = ''
}

const removeLanguage = (code: string) => {
  authLanguages.value = authLanguages.value.filter((existing) => existing !== code)
}

// Meta only accepts lowercase letters, digits and underscores in a name.
const nameIsValid = computed(() => /^[a-z0-9_]+$/.test(form.value.name))

const expiryIsValid = computed(() => {
  if (form.value.expiryMinutes === '') return true // optional
  const minutes = Number(form.value.expiryMinutes)
  return Number.isInteger(minutes) && minutes >= MIN_EXPIRY && minutes <= MAX_EXPIRY
})

const canCreate = computed(() => {
  if (!nameIsValid.value || creating.value) return false
  // An authentication template has no body to write — Meta supplies it.
  if (isAuth.value) {
    return expiryIsValid.value && !!form.value.buttonText.trim() && authLanguages.value.length > 0
  }
  return !!form.value.body.trim()
})

/** The preview of what Meta will actually send, assembled from its fixed parts. */
const authPreview = computed(() => {
  const lines = [authBodyPreview('')]
  if (form.value.securityNote) lines.push(AUTH_SECURITY_NOTE)
  if (expiryIsValid.value && form.value.expiryMinutes !== '') {
    lines.push(authExpiryNote(Number(form.value.expiryMinutes)))
  }
  return lines.join('\n')
})

/**
 * Authentication templates carry no body text: Meta builds the copy from these
 * flags and requires an OTP button. Sending free text here is why every
 * authentication template made in this form used to be rejected.
 */
const authComponents = (): TemplateComponent[] => {
  const components: TemplateComponent[] = [
    { type: 'BODY', add_security_recommendation: form.value.securityNote },
  ]
  // Omit FOOTER entirely rather than sending a null expiry.
  if (form.value.expiryMinutes !== '') {
    components.push({ type: 'FOOTER', code_expiration_minutes: Number(form.value.expiryMinutes) })
  }
  components.push({
    type: 'BUTTONS',
    buttons: [{ type: 'OTP', otp_type: 'COPY_CODE', text: form.value.buttonText.trim() }],
  })
  return components
}

const create = async () => {
  if (!canCreate.value) return
  try {
    creating.value = true
    if (isAuth.value) {
      const count = authLanguages.value.length
      await channelsService.upsertWhatsAppTemplates(props.accountId, {
        name: form.value.name,
        category: form.value.category,
        languages: authLanguages.value,
        components: authComponents(),
      })
      toast.success(
        count === 1 ? 'Template submitted' : `Template submitted in ${count} languages`,
        { description: 'Meta reviews each one before it can be sent.' },
      )
    } else {
      await channelsService.createWhatsAppTemplate(props.accountId, {
        name: form.value.name,
        category: form.value.category,
        language: form.value.language,
        components: [{ type: 'BODY', text: form.value.body.trim() }],
      })
      toast.success('Template submitted', { description: 'Meta reviews it before it can be sent.' })
    }
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

    <!-- Meta writes authentication copy in every language, so several can be
         submitted at once. Other categories need their own translated body. -->
    <div v-if="isAuth" class="wtm-field">
      <span class="wtm-label">Languages</span>
      <ul v-if="authLanguages.length" class="wtm-chips">
        <li v-for="code in authLanguages" :key="code" class="wtm-chip">
          {{ languageLabel(code) }}
          <button
            type="button"
            class="wtm-chip-remove"
            :aria-label="`Remove ${languageLabel(code)}`"
            @click="removeLanguage(code)"
          >
            ×
          </button>
        </li>
      </ul>
      <select
        v-model="languageToAdd"
        class="wtm-input"
        aria-label="Add a language"
        @change="addLanguage"
      >
        <option value="">Add a language…</option>
        <option v-for="language in addableLanguages" :key="language.code" :value="language.code">
          {{ language.label }} ({{ language.code }})
        </option>
      </select>
      <span class="wtm-hint">
        One template is created per language, and each counts towards your template limit.
      </span>
    </div>

    <label v-else class="wtm-field">
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

    <!-- Meta writes the body of an authentication template itself; all we
         choose is what it assembles it from. -->
    <template v-if="isAuth">
      <div class="wtm-field">
        <span class="wtm-label">Message</span>
        <p class="wtm-fixed-body">{{ authPreview }}</p>
        <span class="wtm-hint">
          WhatsApp writes this message and fills in the code when you send it.
        </span>
      </div>

      <label class="wtm-field wtm-check">
        <input v-model="form.securityNote" type="checkbox" />
        <span class="wtm-check-label">Add “{{ AUTH_SECURITY_NOTE }}”</span>
      </label>

      <label class="wtm-field">
        <span class="wtm-label">Code expires after (optional)</span>
        <input
          v-model="form.expiryMinutes"
          class="wtm-input"
          type="number"
          :min="MIN_EXPIRY"
          :max="MAX_EXPIRY"
          placeholder="e.g. 5"
        />
        <span v-if="!expiryIsValid" class="wtm-error">
          Enter a whole number of minutes between {{ MIN_EXPIRY }} and {{ MAX_EXPIRY }}.
        </span>
        <span v-else class="wtm-hint">Minutes. Leave blank for no expiry notice.</span>
      </label>

      <label class="wtm-field">
        <span class="wtm-label">Button text</span>
        <input
          v-model="form.buttonText"
          class="wtm-input"
          :maxlength="MAX_BUTTON_TEXT"
          autocomplete="off"
        />
        <span class="wtm-hint">The copy-code button WhatsApp requires on these.</span>
      </label>
    </template>

    <label v-else class="wtm-field">
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

/* Meta's fixed copy — shown, not editable, so it reads as a preview */
.wtm-fixed-body {
  margin: 0;
  padding: 10px 12px;
  border: 1px dashed var(--border-color);
  border-radius: var(--radius-btn, 8px);
  background: var(--background-soft);
  color: var(--muted);
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-wrap;
}

.wtm-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  list-style: none;
  margin: 0 0 8px;
  padding: 0;
}

.wtm-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 6px 4px 10px;
  border-radius: 999px;
  border: 1px solid var(--border-color);
  background: var(--background-soft);
  font-size: 12px;
}

.wtm-chip-remove {
  background: none;
  border: none;
  color: var(--muted);
  font-size: 15px;
  line-height: 1;
  padding: 0 2px;
  cursor: pointer;
}

.wtm-chip-remove:hover {
  color: var(--c-danger);
}

.wtm-check {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.wtm-check-label {
  font-size: 13px;
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
