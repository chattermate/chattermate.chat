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
 * STOPGAP until the start state (plan 1.3): while the chat is empty, the welcome
 * title and subtitle, the agent's welcome message and its quick actions, plainly.
 * It takes the conversation's place (outside the message log); the welcome
 * message keeps the classic .cm-welcome-block hook.
 */
import { computed, inject } from 'vue'
import { WIDGET_CTX } from '../controller'
import { PANEL_COPY } from '../../copy'

const ctrl = inject(WIDGET_CTX)!
const { customization, welcomeMessageText, quickActions, isMessageInputEnabled, shouldShowNewConversationOption } = ctrl

const title = computed(() => customization.value.welcome_title || PANEL_COPY.welcomeTitle)
const subtitle = computed(() => customization.value.welcome_subtitle || PANEL_COPY.welcomeSubtitle)
const showActions = computed(() => quickActions.value.length > 0 && !shouldShowNewConversationOption.value)
</script>

<template>
    <div class="cm-start">
        <p class="cm-start__title">{{ title }}</p>
        <p class="cm-start__subtitle">{{ subtitle }}</p>
        <div v-if="welcomeMessageText" class="cm-welcome-block">
            <div class="message-bubble cm-start__message">{{ welcomeMessageText }}</div>
        </div>
        <div v-if="showActions" class="cm-start__actions">
            <button
                v-for="action in quickActions"
                :key="action"
                type="button"
                class="cm-chip cm-press"
                :disabled="!isMessageInputEnabled"
                @click="ctrl.sendQuickAction(action)"
            >{{ action }}</button>
        </div>
    </div>
</template>

<style scoped>
.cm-start {
    flex-grow: 1;
    min-height: 0;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 24px 18px 10px;
}
.cm-start__title, .cm-start__subtitle { margin: 0; }
.cm-start__message { margin-top: 8px; }
.cm-start__actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
</style>
