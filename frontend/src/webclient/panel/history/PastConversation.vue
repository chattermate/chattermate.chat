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
 * A past conversation, read-only: its messages as they were (older ones load at the
 * top), and Continue this conversation, which carries it into a chat.
 */
import { computed, inject } from 'vue'
import { WIDGET_CTX } from '../controller'
import MessageItem from '../MessageItem.vue'
import { PANEL_COPY } from '../../copy'

const ctrl = inject(WIDGET_CTX)!
const { history } = ctrl

const viewing = computed(() => history.value.viewing)
const current = computed(() => history.value.items.some(i => i.id === viewing.value?.id && i.current))
const title = computed(() => history.value.items.find(i => i.id === viewing.value?.id)?.title
    || history.value.results?.find(i => i.id === viewing.value?.id)?.title || '')
const goBackToChat = () => ctrl.closeHistory()
</script>

<template>
    <section v-if="viewing" class="cm-past" :aria-label="title || PANEL_COPY.history">
        <header class="cm-history__head">
            <button type="button" class="cm-icon-button cm-press" :aria-label="PANEL_COPY.back" @click="ctrl.closeConversation">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"></path></svg>
            </button>
            <span class="cm-history__title">{{ title }}</span>
        </header>
        <div class="cm-past__thread" role="log" :aria-busy="history.viewingLoading">
            <button v-if="viewing.before" type="button" class="cm-past__older" :disabled="history.viewingLoading" @click="ctrl.loadOlderMessages">
                {{ PANEL_COPY.earlierMessages }}
            </button>
            <p v-if="history.viewingLoading && !viewing.messages.length" class="cm-past__loading">{{ PANEL_COPY.loadingConversation }}</p>
            <MessageItem v-for="(message, i) in viewing.messages" :key="i" :message="message" :index="-1" />
        </div>
        <div class="cm-past__actions">
            <p v-if="history.error === 'continue_failed'" class="cm-past__error" role="alert">{{ PANEL_COPY.continueFailed }}</p>
            <button v-if="current" type="button" class="cm-past__continue cm-press" @click="goBackToChat">{{ PANEL_COPY.backToChat }}</button>
            <button v-else type="button" class="cm-past__continue cm-press" :disabled="history.continuing" @click="ctrl.continueConversation(viewing.id)">
                {{ PANEL_COPY.continueConversation }}
            </button>
        </div>
    </section>
</template>

<style scoped>
.cm-past { display: flex; flex-direction: column; min-height: 0; flex: 1; }
.cm-past .cm-history__head { padding: 12px 14px 6px; display: flex; align-items: center; gap: 8px; }
.cm-past__thread { flex: 1; min-height: 0; overflow-y: auto; padding: 8px 18px; display: flex; flex-direction: column; gap: 16px; }
.cm-past__older { align-self: center; }
.cm-past__actions { padding: 10px 14px 12px; display: flex; flex-direction: column; gap: 6px; }
.cm-past__continue { min-height: 42px; }
.cm-past__error { margin: 0; }
</style>
