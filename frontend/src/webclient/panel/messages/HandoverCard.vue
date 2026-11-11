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
 * The AI handing the chat to the team: "Connecting you to the team" while a
 * teammate is being found, or that the team will get back to the visitor when
 * nobody is online. The reply's own text is the card's body.
 */
import { computed, inject } from 'vue'
import { WIDGET_CTX } from '../controller'
import { renderMarkdown } from '../../markdown'
import { PANEL_COPY } from '../../copy'
import { handoverOf } from '../answer-extras'
import type { WidgetMessage } from '../../../types/widget'

const props = defineProps<{ message: WidgetMessage; index: number }>()

const ctrl = inject(WIDGET_CTX)!
const state = computed(() => handoverOf(props.message) ?? 'connecting')
// Still connecting only while nothing came after it (a teammate's reply, a join).
const pulsing = computed(() => state.value === 'connecting' && props.index === ctrl.messages.value.length - 1)
const title = computed(() => (state.value === 'offline' ? PANEL_COPY.handoverOffline : PANEL_COPY.handoverConnecting))
const html = computed(() => renderMarkdown(props.message.message || ''))
</script>

<template>
    <div class="message agent-message cm-handover" :class="`is-${state}`" role="status">
        <div class="cm-handover__head">
            <span class="cm-handover__icon" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.2"></circle><path d="M3.5 19a5.5 5.5 0 0 1 11 0"></path><path d="M16 5.2a3.2 3.2 0 0 1 0 5.6M18 14.2a5.5 5.5 0 0 1 2.5 4.8"></path></svg>
            </span>
            <span class="cm-handover__title">{{ title }}</span>
            <span v-if="pulsing" class="cm-handover__pulse cm-pulse" aria-hidden="true"></span>
        </div>
        <div class="message-bubble cm-handover__body" v-html="html"></div>
    </div>
</template>

<style scoped>
.cm-handover { display: flex; flex-direction: column; gap: 8px; }
.cm-handover__head { display: flex; align-items: center; gap: 10px; }
.cm-handover__icon { display: grid; place-items: center; width: 30px; height: 30px; flex: none; }
.cm-handover__pulse { width: 8px; height: 8px; border-radius: 50%; margin-left: auto; }
</style>
