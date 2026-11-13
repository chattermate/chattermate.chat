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
// The start state's suggestions: "Suggested for this page" from the server
// (usePageSuggestions) once it answers, else the agent's every-page quick actions.
// A row sends its text like a typed message (held for the email when the panel asks
// for one). While a typed message waits for the email the rows rest, saying why: a
// tap would replace that message. Icons come from where a row came from.
import { computed, inject, useId } from 'vue'
import { WIDGET_CTX } from './controller'
import SuggestionIcon from './SuggestionIcon.vue'
import { keywordIcon } from '../quick-actions'
import { PANEL_COPY } from '../copy'

const ctrl = inject(WIDGET_CTX)!
const { quickActions, isMessageInputEnabled, shouldShowNewConversationOption, heldForEmail, pageSuggestions } = ctrl

const fromServer = computed(() => pageSuggestions.value.loaded && pageSuggestions.value.items.length > 0)
const rows = computed(() => fromServer.value
    ? pageSuggestions.value.items
    : quickActions.value.map(label => ({ label, icon: keywordIcon(label) })))
const heading = computed(() => {
    if (!fromServer.value) return ''
    return pageSuggestions.value.heading === 'page' ? PANEL_COPY.suggestedForPage : PANEL_COPY.popularQuestions
})
const shown = computed(() => rows.value.length > 0 && !shouldShowNewConversationOption.value)
const resting = computed(() => !isMessageInputEnabled.value || heldForEmail.value)
const reasonId = useId()
const headingId = useId()
</script>

<template>
    <div v-if="shown" class="cm-suggestions-block">
        <p v-if="heading" :id="headingId" class="cm-suggestions__heading">
            <span>{{ heading }}</span>
            <span v-if="pageSuggestions.pill && pageSuggestions.heading === 'page'" class="cm-suggestions__pill">{{ pageSuggestions.pill }}</span>
        </p>
        <ul class="cm-suggestions" :aria-label="heading ? undefined : PANEL_COPY.suggestions" :aria-labelledby="heading ? headingId : undefined">
            <li v-if="heldForEmail" :id="reasonId" class="cm-visually-hidden">{{ PANEL_COPY.suggestionsHeld }}</li>
            <li v-for="row in rows" :key="row.label" class="cm-suggestions__item">
                <button
                    type="button"
                    class="cm-suggestion"
                    :disabled="resting"
                    :aria-describedby="heldForEmail ? reasonId : undefined"
                    @click="ctrl.sendQuickAction(row.label)"
                >
                    <span class="cm-suggestion__icon" aria-hidden="true"><SuggestionIcon :icon="row.icon" /></span>
                    <span class="cm-suggestion__label">{{ row.label }}</span>
                    <svg class="cm-suggestion__chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"></path></svg>
                </button>
            </li>
        </ul>
    </div>
</template>

<style scoped>
.cm-suggestions-block { display: flex; flex-direction: column; gap: 8px; }
.cm-suggestions__heading { margin: 0; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.cm-suggestions { list-style: none; margin: 0; padding: 0; overflow: hidden; }
.cm-suggestion {
    width: 100%;
    min-height: 44px;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 14px;
    box-sizing: border-box;
    text-align: left;
}
.cm-suggestion__icon { width: 34px; height: 34px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
.cm-suggestion__label { flex-grow: 1; min-width: 0; overflow-wrap: anywhere; }
.cm-suggestion__chevron { flex-shrink: 0; }
</style>
