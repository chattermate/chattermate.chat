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
// The agent's suggestions (quick_actions) as rows on the start state; a row sends
// its text like a typed message (held for the email when the panel asks for one).
// While a typed message waits for the email the rows rest, saying why: a tap would
// replace that message. One generic icon for now; page-aware icons come with plan 6.3.
import { computed, inject, useId } from 'vue'
import { WIDGET_CTX } from './controller'
import { PANEL_COPY } from '../copy'

const ctrl = inject(WIDGET_CTX)!
const { quickActions, isMessageInputEnabled, shouldShowNewConversationOption, heldForEmail } = ctrl

const shown = computed(() => quickActions.value.length > 0 && !shouldShowNewConversationOption.value)
const resting = computed(() => !isMessageInputEnabled.value || heldForEmail.value)
const reasonId = useId()
</script>

<template>
    <ul v-if="shown" class="cm-suggestions" :aria-label="PANEL_COPY.suggestions">
        <li v-if="heldForEmail" :id="reasonId" class="cm-visually-hidden">{{ PANEL_COPY.suggestionsHeld }}</li>
        <li v-for="action in quickActions" :key="action" class="cm-suggestions__item">
            <button
                type="button"
                class="cm-suggestion"
                :disabled="resting"
                :aria-describedby="heldForEmail ? reasonId : undefined"
                @click="ctrl.sendQuickAction(action)"
            >
                <span class="cm-suggestion__icon" aria-hidden="true">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 01-11.6 7.1L4 20l1-4.6A8 8 0 1121 12z"></path></svg>
                </span>
                <span class="cm-suggestion__label">{{ action }}</span>
                <svg class="cm-suggestion__chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"></path></svg>
            </button>
        </li>
    </ul>
</template>

<style scoped>
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
