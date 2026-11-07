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
/** An editable list of conditions (triggers, done-when, audience rules). */
import type { Condition, ConditionKind } from '@/types/journeys'
import { CONDITION_KINDS, OPERATORS, conditionSource } from './journeyModel'

const model = defineModel<Condition[]>({ required: true })
const props = defineProps<{
  kinds: ConditionKind[]
  /** "or" for any-of lists, "and" for all-of. */
  joiner: 'or' | 'and'
  addLabel: string
  idPrefix: string
  /** Names the list for assistive tech ("Trigger", "Done when"). */
  label: string
  /** Declared action names: "Action succeeds" picks one instead of typing it. */
  actionNames?: string[]
}>()

const kindOptions = () => CONDITION_KINDS.filter((k) => props.kinds.includes(k.value))
const isField = (condition: Condition) => condition.kind === 'ctx' || condition.kind === 'user'
const placeholder = (kind: ConditionKind) => ({
  url: '/invoices/new*', event: 'invoice_sent', ctx: 'plan', user: 'email', action: 'send_invoice',
} as const)[kind]

function update(index: number, patch: Partial<Condition>) {
  model.value = model.value.map((c, i) => (i === index ? { ...c, ...patch } : c))
}

const picksAction = (condition: Condition) => condition.kind === 'action' && !!props.actionNames

function setKind(index: number, kind: ConditionKind) {
  // A value typed for one kind (an event name) means nothing for another (an action).
  update(index, { kind, value: '', op: kind === 'ctx' || kind === 'user' ? 'exists' : null, operand: null })
}

function add() {
  model.value = [...model.value, { kind: props.kinds[0], value: '' }]
}

function remove(index: number) {
  model.value = model.value.filter((_, i) => i !== index)
}
</script>

<template>
  <div class="conditions" role="group" :aria-label="label">
    <template v-for="(condition, index) in model" :key="index">
      <div v-if="index > 0" class="joiner">{{ joiner }}</div>
      <div class="row" :class="{ field: isField(condition) }">
        <select :id="`${idPrefix}-kind-${index}`" class="input" :value="condition.kind" aria-label="Kind"
          @change="setKind(index, ($event.target as HTMLSelectElement).value as ConditionKind)">
          <option v-for="kind in kindOptions()" :key="kind.value" :value="kind.value">{{ kind.label }}</option>
        </select>
        <select v-if="picksAction(condition)" :id="`${idPrefix}-value-${index}`" class="input mono" :value="condition.value"
          aria-label="Action" @change="update(index, { value: ($event.target as HTMLSelectElement).value })">
          <option value="" disabled>Pick an action</option>
          <option v-for="name in actionNames" :key="name" :value="name">{{ name }}</option>
        </select>
        <input v-else :id="`${idPrefix}-value-${index}`" class="input mono" :value="condition.value" :placeholder="placeholder(condition.kind)"
          aria-label="Value" :aria-describedby="`${idPrefix}-source-${index}`" @input="update(index, { value: ($event.target as HTMLInputElement).value.trim() })" />
        <template v-if="isField(condition)">
          <select class="input op" :value="condition.op ?? 'exists'" aria-label="Comparison"
            @change="update(index, { op: ($event.target as HTMLSelectElement).value as Condition['op'] })">
            <option v-for="op in OPERATORS" :key="op.value" :value="op.value">{{ op.label }}</option>
          </select>
          <input v-if="condition.op && condition.op !== 'exists'" class="input mono operand" :value="condition.operand ?? ''"
            aria-label="Compared with" @input="update(index, { operand: ($event.target as HTMLInputElement).value })" />
        </template>
        <button type="button" class="remove" :aria-label="`Remove condition ${index + 1}`" @click="remove(index)">✕</button>
      </div>
      <p :id="`${idPrefix}-source-${index}`" class="source">
        {{ conditionSource(condition.kind, condition.value).text }}
        <code v-if="conditionSource(condition.kind, condition.value).code">{{ conditionSource(condition.kind, condition.value).code }}</code>
      </p>
    </template>
    <button type="button" class="add" @click="add">+ {{ addLabel }}</button>
  </div>
</template>

<style scoped src="../actions/actions.css"></style>
<style scoped>
.conditions { display: flex; flex-direction: column; gap: 8px; }
.row { display: grid; grid-template-columns: minmax(0, 170px) minmax(0, 1fr) 32px; gap: 8px; align-items: center; }
/* A field condition's comparison goes on a second line, so it fits the narrow step column. */
.row.field .op { grid-column: 1; grid-row: 2; }
.row.field .operand { grid-column: 2; grid-row: 2; }
.row .remove { grid-column: 3; grid-row: 1; }
.mono { font-family: var(--font-mono); font-size: 13px; }
.source { margin: -2px 0 0; font-size: 12px; color: var(--muted2); line-height: 1.5; }
.source code { font-family: var(--font-mono); font-size: 11.5px; color: var(--code); background: var(--o06); padding: 1px 6px; border-radius: 5px; overflow-wrap: anywhere; }
.joiner { font-size: 11.5px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; color: var(--muted2); }
.remove { background: none; border: none; color: var(--muted2); cursor: pointer; border-radius: 8px; padding: 6px; }
.remove:hover { color: var(--c-coral); }
.add { align-self: flex-start; background: none; border: none; color: var(--accent-ink); font-size: 13px; font-weight: 500; cursor: pointer; padding: 0; }
@media (max-width: 768px) {
  .row { grid-template-columns: minmax(0, 1fr) 32px; }
  .row > :not(.remove), .row.field .op, .row.field .operand { grid-column: 1; grid-row: auto; }
  .row .remove { grid-column: 2; grid-row: 1; }
}
</style>
