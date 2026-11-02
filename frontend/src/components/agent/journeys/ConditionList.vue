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
import { CONDITION_KINDS, OPERATORS } from './journeyModel'

const model = defineModel<Condition[]>({ required: true })
const props = defineProps<{
  kinds: ConditionKind[]
  /** "or" for any-of lists, "and" for all-of. */
  joiner: 'or' | 'and'
  addLabel: string
  idPrefix: string
}>()

const kindOptions = () => CONDITION_KINDS.filter((k) => props.kinds.includes(k.value))
const isField = (condition: Condition) => condition.kind === 'ctx' || condition.kind === 'user'
const placeholder = (kind: ConditionKind) => ({
  url: '/invoices/new*', event: 'invoice_sent', ctx: 'plan', user: 'email', action: 'send_invoice',
} as const)[kind]

function update(index: number, patch: Partial<Condition>) {
  model.value = model.value.map((c, i) => (i === index ? { ...c, ...patch } : c))
}

function setKind(index: number, kind: ConditionKind) {
  update(index, { kind, op: kind === 'ctx' || kind === 'user' ? 'exists' : null, operand: null })
}

function add() {
  model.value = [...model.value, { kind: props.kinds[0], value: '' }]
}

function remove(index: number) {
  model.value = model.value.filter((_, i) => i !== index)
}
</script>

<template>
  <div class="conditions">
    <template v-for="(condition, index) in model" :key="index">
      <div v-if="index > 0" class="joiner">{{ joiner }}</div>
      <div class="row" :class="{ field: isField(condition) }">
        <select :id="`${idPrefix}-kind-${index}`" class="input" :value="condition.kind" aria-label="Kind"
          @change="setKind(index, ($event.target as HTMLSelectElement).value as ConditionKind)">
          <option v-for="kind in kindOptions()" :key="kind.value" :value="kind.value">{{ kind.label }}</option>
        </select>
        <input :id="`${idPrefix}-value-${index}`" class="input mono" :value="condition.value" :placeholder="placeholder(condition.kind)"
          aria-label="Value" @input="update(index, { value: ($event.target as HTMLInputElement).value.trim() })" />
        <template v-if="isField(condition)">
          <select class="input" :value="condition.op ?? 'exists'" aria-label="Comparison"
            @change="update(index, { op: ($event.target as HTMLSelectElement).value as Condition['op'] })">
            <option v-for="op in OPERATORS" :key="op.value" :value="op.value">{{ op.label }}</option>
          </select>
          <input v-if="condition.op && condition.op !== 'exists'" class="input mono" :value="condition.operand ?? ''"
            aria-label="Compared with" @input="update(index, { operand: ($event.target as HTMLInputElement).value })" />
        </template>
        <button type="button" class="remove" :aria-label="`Remove condition ${index + 1}`" @click="remove(index)">✕</button>
      </div>
    </template>
    <button type="button" class="add" @click="add">+ {{ addLabel }}</button>
  </div>
</template>

<style scoped src="../actions/actions.css"></style>
<style scoped>
.conditions { display: flex; flex-direction: column; gap: 8px; }
.row { display: grid; grid-template-columns: 170px minmax(0, 1fr) 32px; gap: 8px; align-items: center; }
.row.field { grid-template-columns: 150px minmax(0, 1fr) 120px minmax(0, 0.8fr) 32px; }
.mono { font-family: var(--font-mono); font-size: 13px; }
.joiner { font-size: 11.5px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; color: var(--muted2); }
.remove { background: none; border: none; color: var(--muted2); cursor: pointer; border-radius: 8px; padding: 6px; }
.remove:hover { color: var(--c-coral); }
.add { align-self: flex-start; background: none; border: none; color: var(--accent-ink); font-size: 13px; font-weight: 500; cursor: pointer; padding: 0; }
@media (max-width: 768px) {
  .row, .row.field { grid-template-columns: minmax(0, 1fr) 32px; }
}
</style>
