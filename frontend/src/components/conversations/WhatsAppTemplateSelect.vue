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
 * Template choice + variable filling, shared by the session-mode picker
 * (reopen an expired window) and the phone-mode New-conversation modal.
 *
 * One component on purpose: Chatwoot and Intercom each bolted template
 * variables onto one send path and not the other, and both are still paying
 * for the split. The parent owns the send; this owns what to send.
 */
import { ref, computed, watch, onMounted } from 'vue'
import channelsService, {
  type TemplateComponent,
  type WhatsAppTemplate,
} from '@/services/channels'
import {
  isSendable,
  isAuthentication,
  templatePreviewText,
  templateVariables,
  previewTemplate,
  isTemplateComplete,
  buildTemplateComponents,
  isSameTemplate,
  templateKey,
} from '@/utils/whatsappTemplates'
import { languageLabel } from '@/utils/whatsappLanguages'

export interface TemplateSelection {
  template: WhatsAppTemplate
  components?: TemplateComponent[]
  complete: boolean
}

const props = defineProps<{
  accountId: string
  /** Restrict to these categories (e.g. outbound = UTILITY/AUTHENTICATION). */
  categories?: string[]
  emptyHint?: string
}>()

/** The parent reads this to send: null until a template is chosen. */
const selection = defineModel<TemplateSelection | null>('selection', { default: null })

const templates = ref<WhatsAppTemplate[]>([])
const loading = ref(true)
/** Set when the list itself could not load — distinct from "no templates yet". */
const loadError = ref('')
const selected = ref<WhatsAppTemplate | null>(null)
const values = ref<Record<number, string>>({})

const sendable = computed(() =>
  templates.value.filter(
    (template) =>
      isSendable(template) &&
      (!props.categories ||
        props.categories.includes(String(template.category || '').toUpperCase())),
  ),
)
const variables = computed(() => (selected.value ? templateVariables(selected.value) : []))
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
  // Compared by name AND language: a same-named sibling is a DIFFERENT
  // template, and returning early there silently kept the language already
  // chosen — sending English to someone the agent picked Spanish for.
  if (isSameTemplate(selected.value, template)) return
  selected.value = template
  values.value = {}
}

watch([selected, values], () => {
  selection.value = selected.value
    ? {
        template: selected.value,
        components: buildTemplateComponents(selected.value, values.value),
        complete: isTemplateComplete(selected.value, values.value),
      }
    : null
}, { deep: true })

onMounted(async () => {
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
</script>

<template>
  <div v-if="loading" class="tps-skeleton" aria-live="polite" aria-busy="true">
    <div v-for="n in 3" :key="n" class="tps-skeleton-row"></div>
    <span class="tps-visually-hidden">Loading templates</span>
  </div>

  <div v-else-if="loadError" class="tps-empty">
    <font-awesome-icon icon="fa-solid fa-circle-exclamation" />
    <p>{{ loadError }}</p>
  </div>

  <div v-else-if="sendable.length === 0" class="tps-empty">
    <p>No approved templates yet.</p>
    <p class="tps-empty-hint">
      {{ emptyHint || 'Create one from the WhatsApp card in Settings → Integrations. Meta reviews each template before it can be sent.' }}
    </p>
  </div>

  <div v-else class="tps-body">
    <ul class="tps-list" aria-label="Approved templates">
      <!-- Keyed and compared on name+language: one name can have a row per
           language, and keying on the name alone gave Vue duplicate keys and
           lit every sibling up as selected at once. -->
      <li v-for="template in sendable" :key="templateKey(template)">
        <button
          type="button"
          class="tps-option"
          :class="{ selected: isSameTemplate(selected, template) }"
          :aria-pressed="isSameTemplate(selected, template)"
          @click="select(template)"
        >
          <span class="tps-option-head">
            <span class="tps-name">{{ template.name }}</span>
            <span v-if="template.language" class="tps-lang">
              {{ languageLabel(template.language) }}
            </span>
          </span>
          <span class="tps-preview">{{ templatePreviewText(template) }}</span>
        </button>
      </li>
    </ul>

    <div v-if="selected && variables.length" class="tps-fields">
      <label v-for="index in variables" :key="index" class="tps-field">
        <span class="tps-field-label">{{ fieldLabel(index) }}</span>
        <input
          v-model="values[index]"
          type="text"
          class="tps-input"
          :placeholder="isAuthSelected ? 'The passcode to send' : `Value for {{${index}}}`"
        />
      </label>
    </div>

    <div v-if="selected" class="tps-result">
      <span class="tps-field-label">Preview</span>
      <p class="tps-result-text">{{ preview }}</p>
    </div>
  </div>
</template>

<style scoped>
.tps-body {
  overflow-y: auto;
  flex: 1;
}

.tps-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tps-option {
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

.tps-option:hover {
  border-color: var(--accent-solid);
}

.tps-option.selected {
  border-color: var(--accent-solid);
  background: color-mix(in srgb, var(--accent-solid) 10%, var(--background-soft));
}

.tps-option:focus-visible {
  outline: 2px solid var(--accent-solid);
  outline-offset: 2px;
}

.tps-option-head {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tps-name {
  font-weight: 600;
  font-size: 14px;
}

.tps-lang {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 999px;
  background: var(--background-color);
  border: 1px solid var(--border-color);
  color: var(--muted);
}

.tps-preview {
  font-size: 13px;
  color: var(--muted);
  line-height: 1.5;
}

.tps-fields {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tps-field {
  display: block;
}

.tps-field-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 6px;
}

.tps-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-btn, 8px);
  background: var(--background-soft);
  color: inherit;
  font-size: 14px;
}

.tps-result {
  margin-top: 16px;
}

.tps-result-text {
  margin: 0;
  padding: 12px;
  border-radius: var(--radius-btn, 8px);
  background: var(--background-soft);
  border: 1px solid var(--border-color);
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-wrap;
}

.tps-skeleton {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Like the real row, the border is what makes it legible — --background-soft
   alone is invisible against the modal in dark theme. */
.tps-skeleton-row {
  height: 56px;
  border-radius: var(--radius-btn, 8px);
  border: 1px solid var(--border-color);
  background: var(--o08);
  animation: tps-pulse 1.4s ease-in-out infinite;
}

@keyframes tps-pulse {
  50% {
    opacity: 0.6;
  }
}

@media (prefers-reduced-motion: reduce) {
  .tps-skeleton-row {
    animation: none;
  }
}

.tps-empty {
  text-align: center;
  padding: 24px 8px;
  color: var(--muted);
  font-size: 14px;
}

.tps-empty p {
  margin: 0 0 6px;
}

.tps-empty-hint {
  font-size: 13px;
  line-height: 1.6;
}

.tps-visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}
</style>
