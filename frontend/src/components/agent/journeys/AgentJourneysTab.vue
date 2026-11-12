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
/** The agent's Journeys tab: the list, the template gallery, the editor and the funnel. */
import { computed, onMounted, ref } from 'vue'
import { toast } from 'vue-sonner'
import BaseModal from '@/components/common/BaseModal.vue'
import ToggleSwitch from '@/components/common/ToggleSwitch.vue'
import { useAgentActions } from '@/composables/useAgentActions'
import { useJourneysAdmin } from '@/composables/useJourneysAdmin'
import { journeysService } from '@/services/journeys'
import { permissionChecks } from '@/utils/permissions'
import type { ContextKey, Journey, JourneyInput, JourneyTemplate } from '@/types/journeys'
import JourneyEditor from './JourneyEditor.vue'
import JourneyFunnel from './JourneyFunnel.vue'
import TemplateGallery from './TemplateGallery.vue'
import { audienceSummary, startSummary } from './journeyModel'

const props = defineProps<{ agentId: string }>()

type View = { kind: 'list' } | { kind: 'gallery' } | { kind: 'edit'; journey: Journey | null; stepId?: string } | { kind: 'funnel'; journey: Journey }
const view = ref<View>({ kind: 'list' })
// The step open in the editor, so saving doesn't jump back to the first one.
const currentStepId = ref<string | undefined>()
const templates = ref<JourneyTemplate[]>([])
const contextKeys = ref<ContextKey[]>([])
const pendingDelete = ref<Journey | null>(null)
const canManage = permissionChecks.canManageAgents()

const { journeys, loading, saving, loadError, load, save, fromTemplate, setStatus, move, remove } = useJourneysAdmin(() => props.agentId)
const { actions, load: loadActions } = useAgentActions(() => props.agentId)

onMounted(async () => {
  await Promise.all([load(), loadActions()])
  try {
    ;[templates.value, contextKeys.value] = await Promise.all([
      journeysService.templates(props.agentId), journeysService.contextKeys(props.agentId),
    ])
  } catch {
    /* the list still works; the gallery and variable hints just stay empty */
  }
})

const editing = computed(() => (view.value.kind === 'edit' ? view.value.journey : null))

async function run<T>(work: () => Promise<T>, success?: string): Promise<T | undefined> {
  try {
    const result = await work()
    if (success) toast.success(success)
    return result
  } catch (error) {
    toast.error((error as Error).message)
    return undefined
  }
}

async function handleSave(input: JourneyInput) {
  const saved = await run(() => save(input, editing.value?.id), 'Journey saved')
  if (saved) view.value = { kind: 'edit', journey: saved, stepId: currentStepId.value }
}

async function useTemplate(key: string) {
  const made = await run(() => fromTemplate(key), 'Added as a draft')
  if (made) view.value = { kind: 'edit', journey: made }
}

const toggleLive = (journey: Journey, live: boolean) => run(() => setStatus(journey.id, live ? 'live' : 'paused'))

async function confirmDelete() {
  const journey = pendingDelete.value
  pendingDelete.value = null
  if (journey) await run(() => remove(journey.id), `Deleted ${journey.name}`)
}

const statusLabel = (journey: Journey) => ({ live: 'Live', paused: 'Paused', draft: 'Draft' })[journey.status]
</script>

<template>
  <section class="agent-tab journeys-tab" aria-label="Journeys">
    <template v-if="view.kind === 'list'">
      <div class="tab-head">
        <div>
          <h3 class="tab-title">Journeys</h3>
          <p class="tab-sub">Guide users through your app one step at a time. The agent watches where they are and helps them finish each step.</p>
        </div>
        <div v-if="canManage" class="row">
          <button type="button" class="btn" @click="view = { kind: 'gallery' }">Templates</button>
          <button type="button" class="btn accent" @click="view = { kind: 'edit', journey: null }">New journey</button>
        </div>
      </div>

      <p v-if="loading" class="state">Loading journeys…</p>
      <div v-else-if="loadError" class="state error">{{ loadError }} <button type="button" class="link" @click="load">Try again</button></div>
      <div v-else-if="!journeys.length" class="empty">
        <h4>No journeys yet</h4>
        <p>Start from a template or build one from scratch.</p>
        <p class="hint">{{ actions.length }} actions declared · {{ contextKeys.length }} context fields seen</p>
        <div class="row">
          <button v-if="canManage" type="button" class="btn accent" @click="view = { kind: 'gallery' }">See {{ templates.length }} templates</button>
          <button v-if="canManage" type="button" class="link" @click="view = { kind: 'edit', journey: null }">start a blank journey</button>
        </div>
      </div>
      <div v-else class="table" role="table" aria-label="Journeys">
        <div class="trow head" role="row">
          <span role="columnheader">Journey</span><span role="columnheader">Status</span><span role="columnheader">Audience</span>
          <span role="columnheader">Starts when</span><span role="columnheader">Steps</span><span role="columnheader"><span class="sr-only">Actions</span></span>
        </div>
        <div v-for="(journey, i) in journeys" :key="journey.id" class="trow" role="row">
          <span role="cell">
            <button type="button" class="name" @click="view = { kind: 'edit', journey }">{{ journey.name }}</button>
            <span class="key">{{ journey.key }}</span>
          </span>
          <span role="cell" class="status">
            <ToggleSwitch :model-value="journey.status === 'live'" :label="`${journey.name} live`"
              :disabled="!canManage || saving" @update:model-value="toggleLive(journey, $event)" />
            <span class="pill" :class="journey.status">{{ statusLabel(journey) }}</span>
          </span>
          <span role="cell" class="muted">{{ audienceSummary(journey.definition) }}</span>
          <span role="cell" class="muted">{{ startSummary(journey.definition) }}</span>
          <span role="cell">{{ journey.definition.steps.length }}</span>
          <span role="cell" class="tools">
            <button type="button" class="link" @click="view = { kind: 'funnel', journey }">Funnel</button>
            <template v-if="canManage">
              <button type="button" :aria-label="`Move ${journey.name} up`" :disabled="i === 0" @click="run(() => move(journey.id, -1))">↑</button>
              <button type="button" :aria-label="`Move ${journey.name} down`" :disabled="i === journeys.length - 1" @click="run(() => move(journey.id, 1))">↓</button>
              <button type="button" :aria-label="`Delete ${journey.name}`" @click="pendingDelete = journey">✕</button>
            </template>
          </span>
        </div>
      </div>
      <p v-if="journeys.length" class="hint">A user is in one journey at a time. If several match, the higher one wins.</p>
    </template>

    <TemplateGallery v-else-if="view.kind === 'gallery'" :templates="templates" :busy="saving"
      @use="useTemplate" @blank="view = { kind: 'edit', journey: null }" @back="view = { kind: 'list' }" />

    <JourneyEditor v-else-if="view.kind === 'edit'" :journey="editing" :actions="actions" :context-keys="contextKeys"
      :journeys="journeys" :saving="saving" :read-only="!canManage" :initial-step-id="view.stepId"
      @save="handleSave" @back="view = { kind: 'list' }" @step="currentStepId = $event" />

    <JourneyFunnel v-else-if="view.kind === 'funnel'" :agent-id="agentId" :journey="view.journey"
      @back="view = { kind: 'list' }" @open-step="view = { kind: 'edit', journey: view.journey, stepId: $event }" />

    <BaseModal v-if="pendingDelete" title="Delete journey?" @close="pendingDelete = null">
      <p class="modal-text">{{ pendingDelete.name }} stops for every user, and its funnel is lost.</p>
      <template #actions>
        <button type="button" class="btn ghost" @click="pendingDelete = null">Cancel</button>
        <button type="button" class="btn danger" @click="confirmDelete">Delete</button>
      </template>
    </BaseModal>
  </section>
</template>

<style scoped src="../actions/actions.css"></style>
<style scoped>
.journeys-tab { display: flex; flex-direction: column; gap: 16px; }
.row { display: flex; align-items: center; gap: 10px; }
.state { color: var(--muted); }
.state.error { color: var(--c-coral); }
.empty { border: 1.5px dashed var(--o14); border-radius: var(--radius-card); padding: 28px 24px; display: flex; flex-direction: column; gap: 8px; }
.empty h4, .empty p { margin: 0; }
.hint { margin: 0; font-size: 12.5px; color: var(--muted2); }
.table { border: 1px solid var(--border-color); border-radius: 16px; overflow: hidden; }
.trow { display: grid; grid-template-columns: minmax(180px, 1.6fr) 150px minmax(140px, 1.2fr) minmax(130px, 1fr) 60px 170px; gap: 12px; align-items: center; padding: 12px 16px; border-top: 1px solid var(--o06); font-size: 13.5px; }
.trow:first-child { border-top: none; }
.trow.head { background: var(--o03); font-size: 11.5px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; color: var(--muted2); }
.name { background: none; border: none; padding: 0; color: var(--text); font-weight: 600; cursor: pointer; text-align: left; }
.key { display: block; font-family: var(--font-mono); font-size: 12px; color: var(--muted2); }
.status { display: flex; align-items: center; gap: 8px; }
.pill { font-size: 12px; font-weight: 600; padding: 2px 9px; border-radius: 999px; }
.pill.live { background: var(--teal-bg); color: var(--c-teal); }
.pill.paused { background: var(--o06); color: var(--c-warn); }
.pill.draft { background: var(--o06); color: var(--muted); }
.muted { color: var(--muted); overflow: hidden; text-overflow: ellipsis; }
.tools { display: flex; gap: 6px; justify-content: flex-end; }
.tools button:not(.link) { background: none; border: none; color: var(--muted2); cursor: pointer; padding: 4px; }
.tools button:disabled { opacity: 0.3; }
.link { background: none; border: none; color: var(--accent-ink); cursor: pointer; padding: 0; font-size: 13px; }
.modal-text { margin: 0; font-size: 14px; color: var(--text3); }
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
@media (max-width: 900px) {
  .trow { grid-template-columns: minmax(0, 1fr) auto; }
  .trow > :nth-child(3), .trow > :nth-child(4), .trow > :nth-child(5) { display: none; }
}
</style>
