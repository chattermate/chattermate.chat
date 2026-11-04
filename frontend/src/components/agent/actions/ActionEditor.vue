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
import { computed, ref, watch } from 'vue'
import { agentActionsService } from '@/services/agentActions'
import { apiErrorMessage } from '@/utils/apiError'
import ToggleSwitch from '@/components/common/ToggleSwitch.vue'
import type { AgentAction, AgentActionInput, AgentActionModelView } from '@/types/agentActions'
import { ACTION_NAME_PATTERN, CONFIRM_POLICIES, blankAction, parseParameters } from './actionPolicies'

const props = defineProps<{
  agentId: string
  /** The action being edited, or null for a new one. */
  action: AgentAction | null
  saving: boolean
  /** Viewers see the form but can't change it. */
  readOnly?: boolean
}>()

const emit = defineEmits<{
  (e: 'save', input: AgentActionInput): void
  (e: 'cancel'): void
}>()

const form = ref<AgentActionInput>(blankAction())
const parametersText = ref('')
const preview = ref<AgentActionModelView | null>(null)
const previewError = ref<string | null>(null)

function reset() {
  const source = props.action ?? blankAction()
  form.value = {
    name: source.name,
    label: source.label,
    description: source.description,
    parameters: source.parameters,
    confirm: source.confirm,
    timeout_s: source.timeout_s,
    sensitive_form: source.sensitive_form,
    enabled: source.enabled,
  }
  parametersText.value = JSON.stringify(source.parameters, null, 2)
  loadPreview()
}

async function loadPreview() {
  preview.value = null
  previewError.value = null
  if (!props.action) return
  try {
    preview.value = await agentActionsService.modelView(props.agentId, props.action.id)
  } catch (error) {
    previewError.value = apiErrorMessage(error, "Couldn't load the preview.")
  }
}

watch(() => props.action, reset, { immediate: true })

const parsed = computed(() => parseParameters(parametersText.value))
const nameError = computed(() =>
  form.value.name && !ACTION_NAME_PATTERN.test(form.value.name)
    ? 'Use lowercase letters, digits and underscores, starting with a letter.'
    : null,
)
const canSave = computed(() =>
  !props.saving &&
  !!form.value.name && !nameError.value &&
  !!form.value.label.trim() &&
  !!form.value.description.trim() &&
  !parsed.value.error &&
  !props.readOnly,
)

function submit() {
  if (!canSave.value || !parsed.value.value) return
  // An emptied number box comes back as ''; send nothing so the server default applies.
  const timeout = Number(form.value.timeout_s)
  emit('save', {
    ...form.value,
    parameters: parsed.value.value,
    timeout_s: Number.isInteger(timeout) && timeout > 0 ? timeout : undefined,
  })
}
</script>

<template>
  <form class="action-editor" aria-label="Action" @submit.prevent="submit">
    <fieldset class="editor-body" :disabled="readOnly">
    <header class="editor-head">
      <h4>{{ action ? action.name : 'New action' }}</h4>
    </header>

    <div class="editor-grid">
      <label class="field">
        <span class="field-label">Name</span>
        <input id="action-name" v-model.trim="form.name" class="input mono" placeholder="create_draft_invoice" autocomplete="off" />
        <span v-if="nameError" class="field-error">{{ nameError }}</span>
      </label>
      <label class="field">
        <span class="field-label">Label</span>
        <input id="action-label" v-model="form.label" class="input" maxlength="80" placeholder="Draft an invoice" />
      </label>
      <label class="field full">
        <span class="field-label">What it does <span class="field-note">(the AI reads this)</span></span>
        <textarea id="action-description" v-model="form.description" class="input textarea" rows="2" maxlength="1000"
          placeholder="Creates a draft invoice for one of the user's customers." />
      </label>
      <label class="field full">
        <span class="field-label">Arguments <span class="field-note">(JSON Schema)</span></span>
        <textarea id="action-parameters" v-model="parametersText" class="input textarea mono" rows="7" spellcheck="false" />
        <span v-if="parsed.error" class="field-error">{{ parsed.error }}</span>
      </label>

      <fieldset class="field">
        <legend class="field-label">Asks the user first</legend>
        <label v-for="policy in CONFIRM_POLICIES" :key="policy.value" class="radio" :class="{ on: form.confirm === policy.value }">
          <input v-model="form.confirm" type="radio" name="confirm" :value="policy.value" />
          <span>
            <span class="radio-title">{{ policy.label }}</span>
            <span class="radio-hint">{{ policy.hint }}</span>
          </span>
        </label>
      </fieldset>

      <div class="field side">
        <label class="field">
          <span class="field-label">Timeout (seconds)</span>
          <input id="action-timeout" v-model.number="form.timeout_s" class="input narrow" type="number" min="1" placeholder="Default" />
        </label>
        <div class="toggle-row">
          <ToggleSwitch v-model="form.sensitive_form" label="Opens a form for private details" />
          <div>
            <div class="toggle-title">Opens a form for private details</div>
            <p class="field-note">IDs, bank or health details. Never takes them in chat.</p>
          </div>
        </div>
        <div class="toggle-row">
          <ToggleSwitch v-model="form.enabled" label="On" />
          <div class="toggle-title">On</div>
        </div>
      </div>

      <div v-if="action" class="field full">
        <span class="field-label">Preview what the model sees</span>
        <pre v-if="preview" class="model-view">{{ preview.name }}: {{ preview.description }}
args: {{ JSON.stringify(preview.parameters) }}</pre>
        <p v-else-if="previewError" class="field-error">{{ previewError }}</p>
      </div>
    </div>

    </fieldset>
    <footer class="editor-actions">
      <button type="button" class="btn ghost" @click="emit('cancel')">{{ readOnly ? 'Close' : 'Cancel' }}</button>
      <button v-if="!readOnly" type="submit" class="btn accent" :disabled="!canSave">{{ saving ? 'Saving…' : 'Save' }}</button>
    </footer>
  </form>
</template>

<style scoped src="./actions.css"></style>
<style scoped>
.action-editor {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 18px 20px 20px;
  background: var(--surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-card);
}
.editor-head h4 { margin: 0; font-size: 15.5px; font-weight: 600; font-family: var(--font-mono); }
.editor-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
.field { display: flex; flex-direction: column; gap: 6px; min-width: 0; border: none; padding: 0; margin: 0; }
.field.full { grid-column: 1 / -1; }
.field.side { gap: 14px; }
.field-label { font-size: 13px; font-weight: 500; color: var(--text3); }
.field-note { font-size: 12px; font-weight: 400; color: var(--muted2); margin: 0; }
.field-error { font-size: 12.5px; color: var(--c-coral); }
.input.mono { font-family: var(--font-mono); font-size: 13px; }
.input.narrow { width: 120px; }
.textarea { resize: vertical; line-height: 1.5; }
.radio {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 9px 12px;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  cursor: pointer;
}
.radio.on { border-color: var(--accent-border); background: var(--accent-bg-06); }
.radio input { margin-top: 3px; accent-color: var(--accent-solid); }
.radio-title { display: block; font-size: 13.5px; font-weight: 500; color: var(--text); }
.radio-hint { display: block; font-size: 12px; color: var(--muted2); margin-top: 2px; }
.toggle-row { display: flex; align-items: flex-start; gap: 10px; }
.toggle-title { font-size: 13.5px; font-weight: 500; color: var(--text); margin-top: 3px; }
.model-view {
  margin: 0;
  padding: 10px 12px;
  border: 1px dashed var(--o14);
  border-radius: 12px;
  background: var(--o03);
  font-family: var(--font-mono);
  font-size: 12px;
  line-height: 1.6;
  color: var(--muted);
  white-space: pre-wrap;
  word-break: break-word;
}
.editor-body { border: none; margin: 0; padding: 0; min-width: 0; display: flex; flex-direction: column; gap: 16px; }
.editor-actions { display: flex; justify-content: flex-end; gap: 8px; }
@media (max-width: 768px) {
  .editor-grid { grid-template-columns: 1fr; }
}
</style>
