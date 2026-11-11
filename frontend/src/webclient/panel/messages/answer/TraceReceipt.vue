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
 * What the agent did for an answer, folded to one line ("Searched the help center
 * · 1.2s"); a tap opens the list of steps.
 */
import { computed, ref } from 'vue'
import { PANEL_COPY } from '../../../copy'
import { formatDuration, type TraceReceipt } from '../../answer-extras'

const props = defineProps<{ trace: TraceReceipt }>()

const open = ref(false)
const summary = computed(() =>
    PANEL_COPY.traceSummary(props.trace.steps[0].done_label, props.trace.steps.length, formatDuration(props.trace.duration_ms)))
const listId = `cm-trace-${Math.random().toString(36).slice(2, 9)}`
</script>

<template>
    <div class="cm-trace-receipt">
        <button type="button" class="cm-trace-receipt__toggle" :aria-expanded="open" :aria-controls="listId" @click="open = !open">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"></path></svg>
            <span>{{ summary }}</span>
            <svg class="cm-trace-receipt__chevron" :class="{ 'is-open': open }" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"></path></svg>
        </button>
        <ol v-show="open" :id="listId" class="cm-trace-receipt__steps cm-fade" :aria-label="PANEL_COPY.stepsTaken">
            <li v-for="(step, i) in trace.steps" :key="i" :class="['cm-trace-receipt__step', `is-${step.status}`]">
                <span>{{ step.status === 'error' ? `${step.done_label} · ${PANEL_COPY.stepFailed}` : step.done_label }}</span>
                <span class="cm-trace-receipt__time">{{ formatDuration(step.duration_ms) }}</span>
            </li>
        </ol>
    </div>
</template>

<style scoped>
.cm-trace-receipt__toggle { display: inline-flex; align-items: center; gap: 6px; padding: 0; }
.cm-trace-receipt__steps { margin: 6px 0 0; padding: 0 0 0 19px; display: flex; flex-direction: column; gap: 4px; }
.cm-trace-receipt__step { display: flex; justify-content: space-between; gap: 12px; }
</style>
