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
 * Editing one journey: its settings, its steps (one open at a time) and a
 * preview of the open step against sample context. Saved whole.
 */
import { computed, ref, watch } from 'vue'
import BaseModal from '@/components/common/BaseModal.vue'
import ToggleSwitch from '@/components/common/ToggleSwitch.vue'
import type { AgentAction } from '@/types/agentActions'
import type { ContextKey, Journey, JourneyInput, JourneyStep } from '@/types/journeys'
import ConditionList from './ConditionList.vue'
import StepForm from './StepForm.vue'
import {
  LONG_JOURNEY_STEPS, blankJourney, blankStep, journeyProblems, renderPreview, stepProblems, unknownVariables,
} from './journeyModel'

const props = defineProps<{
  journey: Journey | null
  actions: AgentAction[]
  contextKeys: ContextKey[]
  journeys: Journey[]
  saving: boolean
  readOnly?: boolean
  /** Open on this step (from the funnel). */
  initialStepId?: string | null
}>()
const emit = defineEmits<{ (e: 'save', input: JourneyInput): void; (e: 'back'): void; (e: 'step', stepId: string): void }>()

const draft = ref<JourneyInput>(blankJourney())
const selected = ref(0)
const sampleText = ref('{\n  "first_name": "Maya",\n  "plan": "free"\n}')
const dirty = ref(false)
const confirmingLeave = ref(false)

function reset() {
  const source = props.journey ?? blankJourney()
  draft.value = JSON.parse(JSON.stringify({
    key: source.key, name: source.name, status: source.status, priority: source.priority, auto_open: source.auto_open,
    goal_event: source.goal_event, template_key: source.template_key, definition: source.definition,
  }))
  const at = draft.value.definition.steps.findIndex(step => step.id === props.initialStepId)
  selected.value = Math.max(0, at)
  dirty.value = false
}
watch(() => props.journey, reset, { immediate: true })
watch(draft, () => { dirty.value = true }, { deep: true, flush: 'sync' })
// So a save can bring the editor back on the step being edited.
watch(selected, (index) => { const id = draft.value.definition.steps[index]?.id; if (id) emit('step', id) })

const steps = computed(() => draft.value.definition.steps)
const current = computed({
  get: () => steps.value[selected.value],
  set: (step: JourneyStep) => { draft.value.definition.steps[selected.value] = step },
})
/** A chip still being typed has no label yet; the preview shows only what a user would see. */
const previewChips = computed(() => current.value?.chips.filter((chip) => chip.label.trim()) ?? [])
const knownKeys = computed(() => new Set(props.contextKeys.map((k) => k.key)))
const otherJourneys = computed(() => props.journeys.filter((j) => j.key !== draft.value.key).map((j) => ({ key: j.key, name: j.name })))

const problemsByStep = computed(() => steps.value.map(stepProblems))
const problems = computed(() => [...journeyProblems(draft.value), ...problemsByStep.value.flat()])
const missingVariables = computed(() => current.value ? unknownVariables(current.value, knownKeys.value, draft.value.definition.variable_fallbacks) : [])

const sample = computed(() => {
  try {
    const parsed = JSON.parse(sampleText.value)
    const fields = parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}
    return { user: fields, ctx: fields }
  } catch {
    return { user: {}, ctx: {} }
  }
})
const previewMessage = computed(() =>
  current.value ? renderPreview(current.value.message, sample.value, draft.value.definition.variable_fallbacks) : '')

function addStep() {
  draft.value.definition.steps.push(blankStep())
  selected.value = steps.value.length - 1
}

function removeStep(index: number) {
  if (steps.value.length === 1) return
  draft.value.definition.steps.splice(index, 1)
  selected.value = Math.min(selected.value, steps.value.length - 1)
}

function moveStep(index: number, delta: -1 | 1) {
  const to = index + delta
  if (to < 0 || to >= steps.value.length) return
  const list = draft.value.definition.steps
  ;[list[index], list[to]] = [list[to], list[index]]
  selected.value = to
}

function setFallback(variable: string, value: string) {
  draft.value.definition.variable_fallbacks = { ...draft.value.definition.variable_fallbacks, [variable]: value }
}

function save() {
  if (problems.value.length || props.saving || props.readOnly) return
  // "Unsaved" stays until the saved journey comes back as the prop (reset): a
  // save the API refuses must not look saved.
  emit('save', JSON.parse(JSON.stringify(draft.value)))
}

function back() {
  if (dirty.value && !props.readOnly) confirmingLeave.value = true
  else emit('back')
}

function leave() {
  confirmingLeave.value = false
  emit('back')
}
</script>

<template>
  <div class="editor">
    <header class="head">
      <button type="button" class="btn ghost" aria-label="Back to journeys" @click="back">← Journeys</button>
      <input id="journey-name" v-model="draft.name" class="input name" aria-label="Journey name" maxlength="120" :disabled="readOnly" />
      <input id="journey-key" v-model.trim="draft.key" class="input key" aria-label="Journey key" :disabled="readOnly || !!journey" />
      <span class="spacer"></span>
      <span v-if="dirty && !readOnly" class="unsaved" role="status">Unsaved changes</span>
      <button v-if="!readOnly" type="button" class="btn accent" :disabled="!!problems.length || saving" @click="save">
        {{ saving ? 'Saving…' : 'Save' }}
      </button>
    </header>

    <fieldset class="settings" :disabled="readOnly">
      <label class="setting">
        <span>Audience</span>
        <select id="journey-audience" v-model="draft.definition.audience.kind" class="input">
          <option value="everyone">Everyone</option>
          <option value="new_users">New users</option>
          <option value="rules">Custom rules</option>
        </select>
      </label>
      <label class="setting">
        <span>Starts when</span>
        <select id="journey-start" v-model="draft.definition.start.kind" class="input">
          <option value="url">Page URL matches</option>
          <option value="event">App event</option>
          <option value="manual">From your code</option>
        </select>
        <input v-if="draft.definition.start.kind !== 'manual'" id="journey-start-value" v-model.trim="draft.definition.start.value"
          class="input mono" aria-label="Start value" :placeholder="draft.definition.start.kind === 'url' ? '/dashboard*' : 'signed_up'" />
        <code v-else class="code">ChatterMate.startJourney('{{ draft.key }}')</code>
      </label>
      <label class="setting">
        <span>Goal</span>
        <input id="journey-goal" :value="draft.goal_event ?? ''" class="input mono" placeholder="first_invoice_sent" aria-label="Goal event"
          @input="draft.goal_event = ($event.target as HTMLInputElement).value.trim() || null" />
      </label>
      <label class="setting toggle">
        <ToggleSwitch v-model="draft.auto_open" label="Open the chat panel by itself" />
        <span>Open the chat by itself</span>
      </label>
      <div v-if="draft.definition.audience.kind !== 'everyone'" class="rules">
        <p class="hint" v-if="draft.definition.audience.kind === 'new_users'">New users: first seen in the last 14 days, or signed up then if your page says so. Rules below narrow it further.</p>
        <ConditionList v-model="draft.definition.audience.rules" :kinds="['ctx', 'user']" joiner="and" add-label="Add rule" id-prefix="audience" label="Audience rules" />
        <p class="hint">Rules on page fields aren't verified. Use user fields for anything that must be trusted.</p>
      </div>
    </fieldset>

    <div class="grid">
      <aside class="steps">
        <div class="col-head">Steps · {{ steps.length }}</div>
        <ol aria-label="Steps">
          <li v-for="(step, i) in steps" :key="step.id" :class="{ sel: i === selected, bad: problemsByStep[i].length }">
            <button type="button" class="step-btn" :aria-label="step.title || `Step ${i + 1}`" :aria-current="i === selected ? 'step' : undefined" @click="selected = i">
              <span class="dot">{{ problemsByStep[i].length ? '!' : i + 1 }}</span>
              <span class="step-title">{{ step.title }}</span>
            </button>
            <span v-if="!readOnly" class="step-tools">
              <button type="button" :aria-label="`Move ${step.title} up`" :disabled="i === 0" @click="moveStep(i, -1)">↑</button>
              <button type="button" :aria-label="`Move ${step.title} down`" :disabled="i === steps.length - 1" @click="moveStep(i, 1)">↓</button>
              <button type="button" :aria-label="`Delete ${step.title}`" :disabled="steps.length === 1" @click="removeStep(i)">✕</button>
            </span>
          </li>
        </ol>
        <button v-if="!readOnly" type="button" class="add-step" @click="addStep">+ Add step</button>
        <p v-if="steps.length > LONG_JOURNEY_STEPS" class="warn" role="note">
          This journey has {{ steps.length }} steps. Shorter ones finish more often. Consider ending this one with Start another journey.
        </p>
        <label class="finish">
          <span>Finish message</span>
          <textarea v-model="draft.definition.finish.message" class="input" rows="2" maxlength="1000" :disabled="readOnly" />
        </label>
      </aside>

      <fieldset class="form" :disabled="readOnly">
        <StepForm v-if="current" v-model="current" :actions="actions" :other-journeys="otherJourneys"
          :index="selected" :count="steps.length" />
        <ul v-if="problemsByStep[selected]?.length" class="problems" role="alert">
          <li v-for="problem in problemsByStep[selected]" :key="problem">{{ problem }}</li>
        </ul>
        <div v-for="variable in missingVariables" :key="variable" class="missing" role="note">
          <span><b>{{ variable }}</b> isn't in your page context yet, so users would see a blank. Send it with setContext, or set a fallback:</span>
          <input class="input" :aria-label="`Fallback for ${variable}`" :value="draft.definition.variable_fallbacks[variable] ?? ''"
            @change="setFallback(variable, ($event.target as HTMLInputElement).value)" />
        </div>
      </fieldset>

      <aside class="preview" aria-label="Test">
        <div class="col-head">Test</div>
        <label class="sample">
          <span>Sample context (JSON)</span>
          <textarea v-model="sampleText" class="input mono" rows="5" spellcheck="false" aria-label="Sample context" />
        </label>
        <div class="bubble" aria-label="Preview message">{{ previewMessage || 'This step has no message.' }}</div>
        <div v-if="previewChips.length" class="preview-chips">
          <span v-for="(chip, i) in previewChips" :key="i" class="preview-chip">{{ renderPreview(chip.label, sample, draft.definition.variable_fallbacks) }}</span>
        </div>
        <p class="hint">Step {{ selected + 1 }} of {{ steps.length }}. Actions don't run here.</p>
      </aside>
    </div>

    <BaseModal v-if="confirmingLeave" title="Leave without saving?" @close="confirmingLeave = false">
      <p class="modal-text">Your changes to this journey will be lost.</p>
      <template #actions>
        <button type="button" class="btn ghost" @click="confirmingLeave = false">Keep editing</button>
        <button type="button" class="btn danger" @click="leave">Leave</button>
      </template>
    </BaseModal>
  </div>
</template>

<style scoped src="../actions/actions.css"></style>
<style scoped>
.editor { display: flex; flex-direction: column; gap: 16px; }
.modal-text { margin: 0; font-size: 14px; color: var(--text3); line-height: 1.5; }
.head { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.name { max-width: 320px; font-weight: 600; }
.key { max-width: 200px; font-family: var(--font-mono); font-size: 13px; }
.spacer { flex: 1; }
.unsaved { font-size: 12.5px; color: var(--c-warn); }
/* A fieldset is as wide as its widest row unless told otherwise, which on a
   phone pushed the start value and the hints past the edge. */
.settings { border: none; margin: 0; padding: 0; min-width: 0; display: flex; flex-wrap: wrap; gap: 10px 16px; align-items: center; }
.setting { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; font-size: 13px; color: var(--text3); min-width: 0; max-width: 100%; }
.setting .input { width: auto; min-width: 140px; max-width: 100%; }
.setting.toggle { gap: 10px; }
.rules { width: 100%; display: flex; flex-direction: column; gap: 8px; }
.code { font-family: var(--font-mono); font-size: 12px; color: var(--code); background: var(--o06); padding: 4px 8px; border-radius: 6px; }
.mono { font-family: var(--font-mono); font-size: 13px; }
.hint { margin: 0; font-size: 12.5px; color: var(--muted2); }
.grid { display: grid; grid-template-columns: 240px minmax(0, 1fr) 300px; gap: 18px; align-items: start; }
.col-head { font-size: 11.5px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; color: var(--muted2); margin-bottom: 8px; }
.steps ol { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 4px; }
.steps li { display: flex; align-items: center; gap: 4px; border: 1px solid transparent; border-radius: 12px; padding: 4px; }
.steps li.sel { background: var(--accent-bg-06); border-color: var(--accent-border); }
.step-btn { flex: 1; min-width: 0; display: flex; align-items: center; gap: 8px; background: none; border: none; color: var(--text); text-align: left; cursor: pointer; padding: 4px; }
.dot { width: 22px; height: 22px; border-radius: 50%; display: grid; place-items: center; font-family: var(--font-mono); font-size: 11px; border: 1.5px solid var(--o16); flex-shrink: 0; }
.bad .dot { border-color: var(--coral-border); color: var(--c-coral); }
.step-title { font-size: 13.5px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.step-tools button { background: none; border: none; color: var(--muted2); cursor: pointer; padding: 2px 4px; }
.step-tools button:disabled { opacity: 0.3; cursor: default; }
.add-step { margin-top: 8px; width: 100%; padding: 9px; border: 1.5px dashed var(--o14); border-radius: 12px; background: none; color: var(--muted); cursor: pointer; }
.warn { margin: 10px 0 0; font-size: 12.5px; color: var(--c-warn); line-height: 1.45; }
.finish { display: flex; flex-direction: column; gap: 6px; margin-top: 14px; font-size: 13px; color: var(--text3); }
.form { border: none; margin: 0; padding: 0; min-width: 0; display: flex; flex-direction: column; gap: 10px; }
.problems { margin: 0; padding: 10px 14px 10px 28px; border: 1px solid var(--coral-border); background: var(--coral-bg); border-radius: 12px; font-size: 13px; color: var(--text2); }
.missing { display: flex; flex-direction: column; gap: 6px; padding: 10px 12px; border: 1px solid var(--warning-border, var(--o14)); border-radius: 12px; font-size: 13px; color: var(--text3); }
.preview { position: sticky; top: 12px; display: flex; flex-direction: column; gap: 10px; }
.sample { display: flex; flex-direction: column; gap: 6px; font-size: 13px; color: var(--text3); }
.bubble { padding: 10px 13px; border-radius: 4px 14px 14px 14px; background: var(--o05); border: 1px solid var(--border-color); font-size: 13.5px; line-height: 1.5; color: var(--text2); white-space: pre-wrap; }
.preview-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.preview-chip { font-size: 12.5px; padding: 5px 10px; border-radius: 999px; border: 1px solid var(--accent-border); color: var(--accent-ink); }
@media (max-width: 1200px) {
  .grid { grid-template-columns: 220px minmax(0, 1fr); }
  .preview { grid-column: 1 / -1; position: static; }
}
@media (max-width: 768px) {
  .grid { grid-template-columns: minmax(0, 1fr); }
}
</style>
