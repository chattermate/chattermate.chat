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
import { ref, computed, onMounted } from 'vue'
import { toast } from 'vue-sonner'
import channelsService, { type WhatsAppTemplate } from '@/services/channels'
import {
  isSendable,
  isAuthentication,
  templatePreviewText,
  templateVariables,
  previewTemplate,
  isTemplateComplete,
  buildTemplateComponents,
} from '@/utils/whatsappTemplates'
import { DEFAULT_LANGUAGE, languageLabel } from '@/utils/whatsappLanguages'

const props = defineProps<{
  accountId: string
  sessionId: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'sent', template: WhatsAppTemplate): void
}>()

const dialog = ref<HTMLElement | null>(null)
const templates = ref<WhatsAppTemplate[]>([])
const loading = ref(true)
/** Set when the list itself could not load — distinct from "no templates yet". */
const loadError = ref('')
const selected = ref<WhatsAppTemplate | null>(null)
const values = ref<Record<number, string>>({})
const sending = ref(false)

// Only approved templates can be sent, so the rest would be dead choices here.
// They are managed from the WhatsApp account card instead.
const sendable = computed(() => templates.value.filter(isSendable))
const variables = computed(() => (selected.value ? templateVariables(selected.value) : []))
const canSend = computed(
  () => !!selected.value && !sending.value && isTemplateComplete(selected.value, values.value),
)
const preview = computed(() =>
  selected.value ? previewTemplate(selected.value, values.value) : '',
)
// An authentication template's single value is the passcode, not an authored
// {{n}} — naming it "Variable 1" would tell the agent nothing.
const isAuthSelected = computed(() => !!selected.value && isAuthentication(selected.value))
const fieldLabel = (index: number) =>
  isAuthSelected.value ? 'Verification code' : `Variable ${index}`

const select = (template: WhatsAppTemplate) => {
  // Re-clicking the current choice must not wipe what has been typed into it.
  if (selected.value?.name === template.name) return
  selected.value = template
  values.value = {}
}

onMounted(async () => {
  // Move focus into the dialog: it makes Escape work and stops keyboard users
  // starting outside an aria-modal dialog.
  dialog.value?.focus()
  try {
    templates.value = await channelsService.listWhatsAppTemplates(props.accountId)
    // Skip straight past a choice of one — the agent still confirms by sending.
    if (sendable.value.length === 1) select(sendable.value[0])
  } catch (error: any) {
    loadError.value = error?.response?.data?.detail || 'Could not load templates'
  } finally {
    loading.value = false
  }
})

const send = async () => {
  if (!selected.value || !canSend.value) return
  const template = selected.value
  try {
    sending.value = true
    await channelsService.sendWhatsAppTemplate(props.accountId, {
      session_id: props.sessionId,
      template_name: template.name,
      language: template.language || DEFAULT_LANGUAGE,
      components: buildTemplateComponents(template, values.value),
    })
    toast.success('Template sent', { description: 'The customer can reply for the next 24 hours.' })
    emit('sent', template)
  } catch (error: any) {
    toast.error('Could not send template', {
      description: error?.response?.data?.detail || 'Please try again',
      closeButton: true,
    })
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <div
    ref="dialog"
    class="tpl-modal"
    role="dialog"
    aria-modal="true"
    aria-labelledby="tpl-title"
    tabindex="-1"
    @click.self="emit('close')"
    @keydown.esc="emit('close')"
  >
    <div class="tpl-content">
      <div class="tpl-header">
        <h3 id="tpl-title">Send a template</h3>
        <button class="tpl-close" aria-label="Close" @click="emit('close')">×</button>
      </div>

      <p class="tpl-intro">
        This conversation is outside WhatsApp's 24-hour window. An approved template reopens it.
      </p>

      <div v-if="loading" class="tpl-skeleton" aria-live="polite" aria-busy="true">
        <div v-for="n in 3" :key="n" class="tpl-skeleton-row"></div>
        <span class="tpl-visually-hidden">Loading templates</span>
      </div>

      <div v-else-if="loadError" class="tpl-empty">
        <i class="fas fa-circle-exclamation"></i>
        <p>{{ loadError }}</p>
      </div>

      <div v-else-if="sendable.length === 0" class="tpl-empty">
        <p>No approved templates yet.</p>
        <p class="tpl-empty-hint">
          Create one from the WhatsApp card in Settings → Integrations. Meta reviews each template
          before it can be sent.
        </p>
      </div>

      <div v-else class="tpl-body">
        <ul class="tpl-list" aria-label="Approved templates">
          <li v-for="template in sendable" :key="template.name">
            <button
              class="tpl-option"
              :class="{ selected: selected?.name === template.name }"
              :aria-pressed="selected?.name === template.name"
              @click="select(template)"
            >
              <span class="tpl-option-head">
                <span class="tpl-name">{{ template.name }}</span>
                <span v-if="template.language" class="tpl-lang">
                  {{ languageLabel(template.language) }}
                </span>
              </span>
              <span class="tpl-preview">{{ templatePreviewText(template) }}</span>
            </button>
          </li>
        </ul>

        <div v-if="selected && variables.length" class="tpl-fields">
          <label v-for="index in variables" :key="index" class="tpl-field">
            <span class="tpl-field-label">{{ fieldLabel(index) }}</span>
            <input
              v-model="values[index]"
              type="text"
              class="tpl-input"
              :placeholder="isAuthSelected ? 'The passcode to send' : `Value for {{${index}}}`"
            />
          </label>
        </div>

        <div v-if="selected" class="tpl-result">
          <span class="tpl-field-label">Preview</span>
          <p class="tpl-result-text">{{ preview }}</p>
        </div>
      </div>

      <div class="tpl-actions">
        <button class="tpl-btn" @click="emit('close')">Cancel</button>
        <button
          class="tpl-btn tpl-btn-primary"
          :disabled="!canSend"
          :aria-busy="sending"
          @click="send"
        >
          <i v-if="sending" class="fas fa-spinner fa-spin"></i>
          {{ sending ? 'Sending…' : 'Send template' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tpl-modal {
  position: fixed;
  inset: 0;
  background: var(--scrim);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.tpl-modal:focus {
  outline: none;
}

.tpl-content {
  background: var(--background-color);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg, 12px);
  width: min(520px, 100%);
  max-height: min(680px, calc(100vh - 32px));
  display: flex;
  flex-direction: column;
  padding: 24px;
}

.tpl-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.tpl-header h3 {
  margin: 0;
  font-family: var(--font-display);
}

.tpl-close {
  background: none;
  border: none;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
  color: var(--muted);
}

.tpl-intro {
  margin: 0 0 16px;
  color: var(--muted);
  font-size: 14px;
  line-height: 1.6;
}

.tpl-body {
  overflow-y: auto;
  flex: 1;
}

.tpl-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tpl-option {
  width: 100%;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-btn, 8px);
  background: var(--background-soft);
  color: inherit;
  cursor: pointer;
}

.tpl-option:hover {
  border-color: var(--accent-solid);
}

.tpl-option.selected {
  border-color: var(--accent-solid);
  background: color-mix(in srgb, var(--accent-solid) 10%, var(--background-soft));
}

.tpl-option:focus-visible {
  outline: 2px solid var(--accent-solid);
  outline-offset: 2px;
}

.tpl-option-head {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tpl-name {
  font-weight: 600;
  font-size: 14px;
}

.tpl-lang {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 999px;
  background: var(--background-color);
  border: 1px solid var(--border-color);
  color: var(--muted);
}

.tpl-preview {
  font-size: 13px;
  color: var(--muted);
  line-height: 1.5;
}

.tpl-fields {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tpl-field {
  display: block;
}

.tpl-field-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 6px;
}

.tpl-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-btn, 8px);
  background: var(--background-soft);
  color: inherit;
  font-size: 14px;
}

.tpl-result {
  margin-top: 16px;
}

.tpl-result-text {
  margin: 0;
  padding: 12px;
  border-radius: var(--radius-btn, 8px);
  background: var(--background-soft);
  border: 1px solid var(--border-color);
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-wrap;
}

.tpl-skeleton {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tpl-skeleton-row {
  height: 56px;
  border-radius: var(--radius-btn, 8px);
  background: var(--background-soft);
  animation: tpl-pulse 1.4s ease-in-out infinite;
}

@keyframes tpl-pulse {
  50% {
    opacity: 0.5;
  }
}

@media (prefers-reduced-motion: reduce) {
  .tpl-skeleton-row {
    animation: none;
  }
}

.tpl-empty {
  text-align: center;
  padding: 24px 8px;
  color: var(--muted);
  font-size: 14px;
}

.tpl-empty p {
  margin: 0 0 6px;
}

.tpl-empty-hint {
  font-size: 13px;
  line-height: 1.6;
}

.tpl-visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

.tpl-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 20px;
}

.tpl-btn {
  padding: 9px 16px;
  border-radius: var(--radius-btn, 8px);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid var(--border-color);
  background: var(--background-soft);
  color: inherit;
}

.tpl-btn-primary {
  background: var(--accent-solid);
  color: var(--on-accent-solid);
  border-color: transparent;
}

.tpl-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
