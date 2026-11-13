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
 * A status card (an order, a ticket): title, a status pill that says it in words
 * (never colour alone), its steps as an ordered list with the current one marked,
 * then rows, items, a total and its actions. A link opens a new tab (http(s)
 * only); a reply action sends its words as the visitor's message.
 */
import { computed, inject } from 'vue'
import { WIDGET_CTX } from '../controller'
import { PANEL_COPY } from '../../copy'
import type { CardAction, StatusCard } from '../answer-extras'

const props = defineProps<{ card: StatusCard }>()
const ctrl = inject(WIDGET_CTX)!

const doneSteps = computed(() => props.card.steps.filter(s => s.state === 'done').length)
const progress = computed(() => {
    const steps = props.card.steps
    if (steps.length < 2) return 0
    const current = steps.findIndex(s => s.state === 'current')
    return Math.min(1, (current >= 0 ? current : doneSteps.value) / (steps.length - 1))
})
const money = (amount: { value: string; currency: string }) => ctrl.formatCurrency(amount.value, amount.currency)
const act = (action: CardAction) => {
    if (action.kind === 'reply') ctrl.sendQuickAction(action.value)
}
</script>

<template>
    <section class="cm-status-card" :class="`cm-status-card--${card.kind}`" :aria-label="card.title">
        <header class="cm-status-card__head">
            <span class="cm-status-card__titles">
                <span class="cm-status-card__title">{{ card.title }}</span>
                <span v-if="card.subtitle" class="cm-status-card__subtitle">{{ card.subtitle }}</span>
            </span>
            <span v-if="card.status" class="cm-status-card__pill" :class="`is-${card.status.tone}`">{{ card.status.label }}</span>
        </header>
        <div v-if="card.steps.length" class="cm-status-card__progress">
            <div class="cm-status-card__track" aria-hidden="true">
                <span class="cm-status-card__fill" :style="{ transform: `scaleX(${progress})` }"></span>
            </div>
            <ol class="cm-status-card__steps" :aria-label="PANEL_COPY.cardSteps">
                <li
                    v-for="step in card.steps"
                    :key="step.label"
                    :class="['cm-status-card__step', `is-${step.state}`]"
                    :aria-current="step.state === 'current' ? 'step' : undefined"
                    :aria-label="PANEL_COPY.cardStepState(step.label, step.state)"
                >{{ step.label }}</li>
            </ol>
        </div>
        <dl v-if="card.rows.length" class="cm-status-card__rows">
            <div v-for="row in card.rows" :key="row.label" class="cm-status-card__row">
                <dt>{{ row.label }}</dt>
                <dd>{{ row.value }}</dd>
            </div>
        </dl>
        <ul v-if="card.items.length" class="cm-status-card__items">
            <li v-for="(item, i) in card.items" :key="i" class="cm-status-card__item">
                <span class="cm-status-card__thumb" aria-hidden="true"><img v-if="item.image" :src="item.image" alt="" loading="lazy"></span>
                <span class="cm-status-card__item-text">
                    <span class="cm-status-card__item-title">{{ item.title }}</span>
                    <span v-if="item.meta || item.quantity" class="cm-status-card__item-meta">
                        {{ [item.meta, item.quantity ? PANEL_COPY.quantity(item.quantity) : ''].filter(Boolean).join(' · ') }}
                    </span>
                </span>
                <span v-if="item.amount" class="cm-status-card__amount">{{ money(item.amount) }}</span>
            </li>
        </ul>
        <div v-if="card.total" class="cm-status-card__total">
            <span>{{ card.total.label }}</span>
            <span>{{ money(card.total.amount) }}</span>
        </div>
        <div v-if="card.actions.length" class="cm-status-card__actions">
            <template v-for="action in card.actions" :key="action.id">
                <a
                    v-if="action.kind === 'link'"
                    class="cm-status-card__action cm-press"
                    :class="`is-${action.style}`"
                    :href="action.value"
                    target="_blank"
                    rel="noopener noreferrer"
                >{{ action.label }}<span class="cm-sr-only"> {{ PANEL_COPY.opensInNewTab }}</span></a>
                <button
                    v-else
                    type="button"
                    class="cm-status-card__action cm-press"
                    :class="`is-${action.style}`"
                    :disabled="ctrl.loading.value || !ctrl.isMessageInputEnabled.value"
                    @click="act(action)"
                >{{ action.label }}</button>
            </template>
        </div>
    </section>
</template>

<style scoped>
.cm-status-card { display: flex; flex-direction: column; gap: 12px; padding: 14px; }
.cm-status-card__head { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
.cm-status-card__titles { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.cm-status-card__pill { flex: none; white-space: nowrap; }
.cm-status-card__track { position: relative; height: 4px; overflow: hidden; }
.cm-status-card__fill { position: absolute; inset: 0; transform-origin: 0 50%; }
.cm-status-card__steps { list-style: none; margin: 6px 0 0; padding: 0; display: flex; justify-content: space-between; gap: 4px; }
.cm-status-card__rows { margin: 0; display: flex; flex-direction: column; gap: 6px; }
.cm-status-card__row { display: flex; justify-content: space-between; gap: 12px; }
.cm-status-card__row dt, .cm-status-card__row dd { margin: 0; }
.cm-status-card__row dd { text-align: right; overflow-wrap: anywhere; }
.cm-status-card__items { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
.cm-status-card__item { display: flex; align-items: center; gap: 10px; }
.cm-status-card__thumb { flex: none; width: 36px; height: 36px; overflow: hidden; }
.cm-status-card__thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
.cm-status-card__item-text { display: flex; flex-direction: column; min-width: 0; flex: 1; }
.cm-status-card__total { display: flex; justify-content: space-between; }
.cm-status-card__actions { display: flex; flex-wrap: wrap; gap: 8px; }
.cm-status-card__action { min-height: 34px; display: inline-flex; align-items: center; padding: 0 14px; text-decoration: none; }
</style>
