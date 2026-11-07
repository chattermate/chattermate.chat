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
/** One journey step: when it starts, what it says, what may run, when it's done. */
import { computed } from 'vue'
import ToggleSwitch from '@/components/common/ToggleSwitch.vue'
import ActionPolicyBadge from '@/components/agent/actions/ActionPolicyBadge.vue'
import type { AgentAction } from '@/types/agentActions'
import type { JourneyChip, JourneyStep } from '@/types/journeys'
import ConditionList from './ConditionList.vue'
import { MAX_CHIPS } from './journeyModel'

const step = defineModel<JourneyStep>({ required: true })
const props = defineProps<{
  actions: AgentAction[]
  /** Keys of the agent's other journeys, for "Start another journey". */
  otherJourneys: { key: string; name: string }[]
  index: number
  count: number
}>()

const set = (patch: Partial<JourneyStep>) => { step.value = { ...step.value, ...patch } }

const allowed = computed(() => new Set(step.value.allowed_actions))
const actionNames = computed(() => props.actions.map((a) => a.name))

function toggleAction(name: string) {
  const next = new Set(allowed.value)
  if (next.has(name)) next.delete(name)
  else next.add(name)
  set({ allowed_actions: [...next] })
}

function setChip(index: number, patch: Partial<JourneyChip>) {
  const chips = step.value.chips.map((c, i) => (i === index ? { ...c, ...patch } : c))
  const chip = chips[index]
  // A chip may only run an action the step allows, so picking one allows it.
  const picked = chip.kind === 'action' && chip.value && !allowed.value.has(chip.value)
  set(picked ? { chips, allowed_actions: [...allowed.value, chip.value] } : { chips })
}

const addChip = () => set({ chips: [...step.value.chips, { label: '', kind: 'text', value: '' }] })
const removeChip = (index: number) => set({ chips: step.value.chips.filter((_, i) => i !== index) })

const nudgeOn = computed({
  get: () => !!step.value.nudge,
  set: (on: boolean) => set({ nudge: on ? { after_min: 3, message: 'Still there? I can help with this.' } : null }),
})
</script>

<template>
  <div class="step-form">
    <div class="top">
      <label class="grow">
        <span class="step-no">Step {{ index + 1 }} of {{ count }}</span>
        <input id="step-title" class="input title" :value="step.title" aria-label="Step title" maxlength="80"
          @input="set({ title: ($event.target as HTMLInputElement).value })" />
      </label>
      <label class="inline">
        <ToggleSwitch :model-value="step.skippable" label="Users can skip" @update:model-value="set({ skippable: $event })" />
        Users can skip
      </label>
    </div>

    <section class="section">
      <h4>Trigger</h4>
      <p class="hint">User is on this step when… (any one is enough; none: right after the last step)</p>
      <ConditionList :model-value="step.triggers" :kinds="['url', 'event', 'ctx', 'user']" joiner="or"
        add-label="Add condition" id-prefix="trigger" label="Trigger" @update:model-value="set({ triggers: $event })" />
    </section>

    <section class="section">
      <h4>Message</h4>
      <textarea id="step-message" class="input textarea" rows="3" maxlength="1000" :value="step.message"
        aria-label="Opening message" placeholder="Hi {{user.first_name}}, let's draft your first invoice."
        @input="set({ message: ($event.target as HTMLTextAreaElement).value })" />
      <p class="hint" v-pre>Use {{user.first_name}} or {{ctx.anything}} the page sends.</p>
      <div class="chips">
        <div v-for="(chip, i) in step.chips" :key="i" class="chip-row">
          <input class="input" :value="chip.label" :aria-label="`Chip ${i + 1} label`" placeholder="As the user would say it" maxlength="80"
            @input="setChip(i, { label: ($event.target as HTMLInputElement).value })" />
          <select class="input" :value="chip.kind" :aria-label="`Chip ${i + 1} does`"
            @change="setChip(i, { kind: ($event.target as HTMLSelectElement).value as JourneyChip['kind'], value: '' })">
            <option value="text">Sends text</option>
            <option value="action">Runs an action</option>
          </select>
          <select v-if="chip.kind === 'action'" class="input mono" :value="chip.value" :aria-label="`Chip ${i + 1} action`"
            @change="setChip(i, { value: ($event.target as HTMLSelectElement).value })">
            <option value="" disabled>Pick an action</option>
            <option v-for="action in actions" :key="action.name" :value="action.name">{{ action.name }}</option>
          </select>
          <input v-else class="input" :value="chip.value" :aria-label="`Chip ${i + 1} text`" placeholder="What it sends"
            @input="setChip(i, { value: ($event.target as HTMLInputElement).value })" />
          <button type="button" class="remove" :aria-label="`Remove chip ${i + 1}`" @click="removeChip(i)">✕</button>
        </div>
        <button v-if="step.chips.length < MAX_CHIPS" type="button" class="add" @click="addChip">+ Add reply</button>
      </div>
      <p v-if="step.chips.length" class="hint">Replies show on the user's side of the chat, so write them as the user would say them: "Switch to GBP".</p>
    </section>

    <section class="section">
      <h4>Suggested actions</h4>
      <p class="hint">Replies can run these, and the agent is told they finish this step. It can still do anything else the user asks.</p>
      <p v-if="!actions.length" class="hint">No actions yet. Add them on the Actions tab.</p>
      <label v-for="action in actions" :key="action.name" class="action" :class="{ on: allowed.has(action.name) }">
        <input type="checkbox" :checked="allowed.has(action.name)" @change="toggleAction(action.name)" />
        <span class="action-name">{{ action.name }}</span>
        <ActionPolicyBadge :policy="action.confirm" />
      </label>
    </section>

    <section class="section">
      <h4>Done when</h4>
      <ConditionList :model-value="step.done_when" :kinds="['action', 'event', 'ctx', 'user']" joiner="or"
        add-label="Add condition" id-prefix="done" label="Done when" :action-names="actionNames" @update:model-value="set({ done_when: $event })" />
      <div class="then">
        <span class="label">Then</span>
        <select id="step-then" class="input" :value="step.then.kind" aria-label="Then"
          @change="set({ then: { kind: ($event.target as HTMLSelectElement).value as JourneyStep['then']['kind'], value: null } })">
          <option value="next">Next step</option>
          <option value="message">Send a message</option>
          <option value="block">Show code or a link</option>
          <option value="start_journey">Start another journey</option>
        </select>
        <select v-if="step.then.kind === 'start_journey'" class="input" :value="step.then.value ?? ''" aria-label="Journey to start"
          @change="set({ then: { kind: 'start_journey', value: ($event.target as HTMLSelectElement).value } })">
          <option value="" disabled>Pick a journey</option>
          <option v-for="other in otherJourneys" :key="other.key" :value="other.key">{{ other.name }}</option>
        </select>
        <textarea v-else-if="step.then.kind !== 'next'" class="input textarea" rows="2" :value="step.then.value ?? ''"
          aria-label="What it shows" @input="set({ then: { ...step.then, value: ($event.target as HTMLTextAreaElement).value } })" />
      </div>
      <div class="nudge">
        <ToggleSwitch v-model="nudgeOn" label="Nudge if idle" />
        <span>Nudge if idle for</span>
        <template v-if="step.nudge">
          <input class="input narrow" type="number" min="1" max="120" :value="step.nudge.after_min" aria-label="Minutes"
            @input="set({ nudge: { ...step.nudge!, after_min: Number(($event.target as HTMLInputElement).value) || 1 } })" />
          <span>min</span>
          <input class="input" :value="step.nudge.message" aria-label="Nudge message" maxlength="500"
            @input="set({ nudge: { ...step.nudge!, message: ($event.target as HTMLInputElement).value } })" />
        </template>
      </div>
    </section>
  </div>
</template>

<style scoped src="../actions/actions.css"></style>
<style scoped>
.step-form { display: flex; flex-direction: column; gap: 14px; min-width: 0; }
.top { display: flex; align-items: flex-end; gap: 14px; }
.grow { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 6px; }
.step-no { font-family: var(--font-mono); font-size: 12px; color: var(--muted2); }
.title { font-size: 17px; font-weight: 600; }
.inline { display: flex; align-items: center; gap: 9px; font-size: 13.5px; color: var(--text3); padding-bottom: 8px; white-space: nowrap; }
.section { background: var(--surface); border: 1px solid var(--border-color); border-radius: var(--radius-card); padding: 16px 18px; display: flex; flex-direction: column; gap: 10px; }
.section h4 { margin: 0; font-size: 15px; font-weight: 600; }
.hint { margin: 0; font-size: 12.5px; color: var(--muted2); }
.textarea { resize: vertical; line-height: 1.5; }
.mono { font-family: var(--font-mono); font-size: 13px; }
.chips { display: flex; flex-direction: column; gap: 8px; }
/* Label on its own line, then what it does: fits the narrow step column at any width. */
.chip-row { display: grid; grid-template-columns: minmax(0, 150px) minmax(0, 1fr) 32px; gap: 8px; }
.chip-row > :first-child { grid-column: 1 / 3; }
.chip-row > .remove { grid-column: 3; grid-row: 1; }
.action { display: grid; grid-template-columns: 20px minmax(0, 1fr) auto; gap: 10px; align-items: center; padding: 9px 12px; border: 1px solid var(--border-color); border-radius: 12px; cursor: pointer; }
.action.on { background: var(--accent-bg-06); border-color: var(--accent-border); }
.action input { accent-color: var(--accent-solid); }
.action-name { font-family: var(--font-mono); font-size: 13px; }
.then { display: grid; grid-template-columns: max-content minmax(0, 220px); gap: 10px; align-items: start; }
.then > .textarea { grid-column: 1 / -1; }
.label { font-size: 13px; font-weight: 500; color: var(--text3); padding-top: 9px; }
.nudge { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; font-size: 13.5px; color: var(--text3); }
.narrow { width: 70px; }
.remove { background: none; border: none; color: var(--muted2); cursor: pointer; padding: 6px; border-radius: 8px; }
.remove:hover { color: var(--c-coral); }
.add { align-self: flex-start; background: none; border: none; color: var(--accent-ink); font-size: 13px; font-weight: 500; cursor: pointer; padding: 0; }
@media (max-width: 768px) {
  .then { grid-template-columns: minmax(0, 1fr); }
}
</style>
