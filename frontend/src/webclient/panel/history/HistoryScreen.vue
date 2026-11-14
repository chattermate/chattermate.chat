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
 * "Your conversations": a new chat, then the visitor's past chats, open ones first,
 * grouped by when they last moved. More load as the list nears its end; a search box
 * shows once there are more than eight. A row opens the chat read-only.
 */
import { computed, inject, onMounted, onUnmounted, ref } from 'vue'
import { WIDGET_CTX } from '../controller'
import ConversationRow from './ConversationRow.vue'
import { uiLayer } from '../../ui-layer'
import { groupConversations } from '../history-groups'
import { PANEL_COPY } from '../../copy'

const ctrl = inject(WIDGET_CTX)!
const { history } = ctrl

/** The search box shows past this many conversations. */
const SEARCH_FROM = 8

const query = ref('')
/** The email check that finds chats from the visitor's other browsers is open. */
const findingOthers = ref(false)
// Finding chats from other browsers proves an email: the chat UI layer's to draw
const findOthers = uiLayer.historyOthers
const offerOthers = computed(() => history.value.otherBrowsers.offer && !history.value.otherBrowsers.email && !searching.value)
const sentinel = ref<HTMLElement | null>(null)
const searching = computed(() => history.value.query.length >= 2)
const rows = computed(() => (searching.value ? history.value.results ?? [] : history.value.items))
const groups = computed(() => groupConversations(rows.value))

let observer: IntersectionObserver | null = null
onMounted(() => {
    if (typeof IntersectionObserver === 'undefined' || !sentinel.value) return
    observer = new IntersectionObserver((entries) => {
        if (entries.some(e => e.isIntersecting) && !searching.value) ctrl.loadMoreConversations()
    }, { rootMargin: '120px' })
    observer.observe(sentinel.value)
})
onUnmounted(() => observer?.disconnect())

const onSearch = () => ctrl.searchConversations(query.value)
// Back to the chat, asking to end it first when it already has messages.
const startNewChat = () => {
    ctrl.closeHistory()
    if (ctrl.canStartNewChat.value) ctrl.requestNewChat()
}
const askInNewChat = () => {
    const question = history.value.query
    ctrl.closeHistory()
    ctrl.newMessage.value = question
}
</script>

<template>
    <section class="cm-history" :aria-label="PANEL_COPY.history">
        <header class="cm-history__head">
            <button type="button" class="cm-icon-button cm-press" :aria-label="PANEL_COPY.back" @click="ctrl.closeHistory">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"></path></svg>
            </button>
            <span class="cm-history__titles">
                <span class="cm-history__title">{{ PANEL_COPY.history }}</span>
                <span v-if="history.total" class="cm-history__count">{{ PANEL_COPY.historyCount(history.total) }}</span>
            </span>
        </header>
        <button type="button" class="cm-history__new cm-press" @click="startNewChat">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"></path></svg>
            {{ PANEL_COPY.newChatFromHistory }}
        </button>
        <p v-if="history.otherBrowsers.email" class="cm-history__note">{{ PANEL_COPY.otherDevicesShown(history.otherBrowsers.email) }}</p>
        <template v-else-if="offerOthers && findOthers">
            <component :is="findOthers" v-if="findingOthers" class="cm-history__others" purpose="history" />
            <button v-else type="button" class="cm-history__others-link" @click="findingOthers = true">{{ PANEL_COPY.otherDevices }}</button>
        </template>
        <label v-if="history.total > SEARCH_FROM" class="cm-history__search">
            <span class="cm-sr-only">{{ PANEL_COPY.searchConversations }}</span>
            <input v-model="query" type="search" :placeholder="PANEL_COPY.searchConversations" @input="onSearch">
        </label>
        <div class="cm-history__list" :aria-busy="history.loading || history.searching">
            <template v-for="group in groups" :key="group.label">
                <h3 class="cm-history__group">{{ group.label }}</h3>
                <ul class="cm-history__rows">
                    <li v-for="item in group.items" :key="item.id">
                        <ConversationRow :item="item" @open="ctrl.openConversation(item.id)" />
                    </li>
                </ul>
            </template>
            <p v-if="history.loaded && !rows.length && !searching && !history.loading" class="cm-history__empty">{{ PANEL_COPY.noConversations }}</p>
            <div v-if="searching && history.results && !history.results.length && !history.searching" class="cm-history__empty">
                <p>{{ PANEL_COPY.noMatches(history.query) }}</p>
                <button type="button" class="cm-history__ask cm-press" @click="askInNewChat">{{ PANEL_COPY.askInNewChat(history.query) }}</button>
            </div>
            <p v-if="searching && history.capped" class="cm-history__note">{{ PANEL_COPY.searchCapped }}</p>
            <div v-if="history.loading" class="cm-history__skeletons" aria-hidden="true">
                <span v-for="n in 3" :key="n" class="cm-history__skeleton"></span>
            </div>
            <div ref="sentinel" class="cm-history__sentinel"></div>
        </div>
    </section>
</template>

<style scoped>
.cm-history { display: flex; flex-direction: column; gap: 10px; padding: 12px 14px; min-height: 0; flex: 1; }
.cm-history__head { display: flex; align-items: center; gap: 8px; }
.cm-history__titles { display: flex; flex-direction: column; }
.cm-history__new { display: inline-flex; align-items: center; justify-content: center; gap: 6px; min-height: 40px; }
.cm-history__search input { width: 100%; box-sizing: border-box; min-height: 38px; padding: 0 12px; }
.cm-history__list { display: flex; flex-direction: column; gap: 6px; }
.cm-history__rows { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 2px; }
.cm-history__group { position: sticky; top: 0; margin: 8px 0 2px; }
.cm-history__empty { display: flex; flex-direction: column; align-items: flex-start; gap: 8px; margin: 12px 0; }
.cm-history__empty p { margin: 0; }
.cm-history__skeletons { display: flex; flex-direction: column; gap: 8px; }
.cm-history__skeleton { display: block; height: 44px; }
.cm-history__sentinel { height: 1px; }
.cm-history__others-link { align-self: flex-start; padding: 0; }
.cm-history__note { margin: 0; }
</style>
