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
 * The panel's header: the agent's mark, its name and an honest status line, then
 * new chat, expand (when the loader can size the panel up) and minimize. After a
 * takeover the person's name and avatar lead. No team presence: a person only
 * appears once they joined. On a phone the header (with its grabber) can be
 * swiped down to close the panel.
 */
import { computed, inject } from 'vue'
import { WIDGET_CTX, WIDGET_PREVIEW } from './controller'
import AgentMark from './AgentMark.vue'
import PersonAvatar from './PersonAvatar.vue'
import { agentFace } from './agent-face'
import { PANEL_COPY } from '../copy'
import { NEW_CHAT_LABEL } from '../new-chat'
import { useSwipeToClose } from '../../composables/useSwipeToClose'

defineProps<{
    /** The loader can size the panel up (HOST_CAPABILITIES.expand). */
    canExpand?: boolean
    expanded?: boolean
}>()
const emit = defineEmits<{ (e: 'expand'): void }>()

const ctrl = inject(WIDGET_CTX)!
const {
    agentName, humanAgent, humanAgentPhotoUrl, photoUrl, orbStyle, presence, loading,
    isHandedOverToHuman, canStartNewChat, startingNewChat, newChatArmed, history,
} = ctrl

// Past chats need a conversation of the visitor's own (none in the dashboard preview).
const preview = inject(WIDGET_PREVIEW, false)
const historyAvailable = computed(() => !preview && ctrl.historyAvailable.value)

const face = computed(() => agentFace(ctrl.customization.value, photoUrl.value))
const personName = computed(() => humanAgent.value.human_agent_name || '')
const title = computed(() => personName.value || agentName.value)

// The AI is working on a reply (a person's replies come without a typing state).
const working = computed(() => loading.value && !isHandedOverToHuman.value)

// The status line: "Working on it…" while the AI works, otherwise who answers and how soon.
const statusText = computed(() => (working.value ? PANEL_COPY.working : presence.value.text))

// Swipe down to close, where the loader can move the panel (a phone screen).
const swipe = computed(() => !preview && ctrl.hostCapabilities.value.swipe)
const { onPointerDown } = useSwipeToClose(swipe)
</script>

<template>
    <div class="cm-header" :class="{ 'is-swipeable': swipe }" @pointerdown="onPointerDown">
        <span v-if="swipe" class="cm-grabber" aria-hidden="true"></span>
        <div class="cm-header__faces">
            <AgentMark
                :face="face"
                :photo-url="photoUrl"
                :orb-style="orbStyle"
                :working="working"
                :human-joined="isHandedOverToHuman"
            />
            <PersonAvatar
                v-if="isHandedOverToHuman"
                class="cm-fade"
                :name="personName"
                :photo-url="humanAgentPhotoUrl"
            />
        </div>
        <div class="header-info cm-header__info">
            <h3 class="cm-header__name">{{ title }}</h3>
            <p class="cm-status" :class="{ 'is-away': !presence.online }">
                <span class="cm-status__dot" aria-hidden="true"></span>
                <span class="cm-status__text" :title="statusText">{{ statusText }}</span>
            </p>
        </div>
        <div class="cm-header__actions">
            <button
                v-if="historyAvailable"
                type="button"
                class="cm-icon-button cm-press"
                :title="PANEL_COPY.openHistory"
                :aria-label="PANEL_COPY.openHistory"
                :aria-pressed="history.showing"
                @click="history.showing ? ctrl.closeHistory() : ctrl.openHistory()"
            >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="8.5"></circle><path d="M12 7.5V12l3 2"></path>
                </svg>
            </button>
            <button
                v-if="canStartNewChat"
                type="button"
                class="cm-icon-button cm-press"
                :class="{ 'is-armed': newChatArmed }"
                :disabled="startingNewChat"
                :title="NEW_CHAT_LABEL"
                :aria-label="NEW_CHAT_LABEL"
                :aria-expanded="newChatArmed"
                @click="ctrl.requestNewChat"
            >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M12 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-6"></path>
                    <path d="M17.5 3.5a2.1 2.1 0 013 3L12 15l-4 1 1-4z"></path>
                </svg>
            </button>
            <button
                v-if="canExpand"
                type="button"
                class="cm-icon-button cm-press"
                :title="expanded ? PANEL_COPY.collapse : PANEL_COPY.expand"
                :aria-label="expanded ? PANEL_COPY.collapse : PANEL_COPY.expand"
                @click="emit('expand')"
            >
                <svg v-if="!expanded" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"></path></svg>
                <svg v-else width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7"></path></svg>
            </button>
            <button
                type="button"
                class="cm-icon-button cm-press"
                :title="PANEL_COPY.minimize"
                :aria-label="PANEL_COPY.minimize"
                @click="ctrl.minimizeWidget"
            >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M6 9l6 6 6-6"></path>
                </svg>
            </button>
        </div>
    </div>
</template>

<style scoped>
.cm-header {
    height: 64px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 10px 0 14px;
}
/* On a phone the header is the handle for swiping the panel away: the browser
   must not take the drag for scrolling or pull-to-refresh. */
.cm-header.is-swipeable {
    position: relative;
    touch-action: none;
}
.cm-grabber {
    position: absolute;
    top: 6px;
    left: 50%;
    width: 36px;
    height: 4px;
    margin-left: -18px;
    border-radius: 2px;
    background: var(--cm-muted);
    opacity: .45;
}
.cm-header__faces { display: flex; align-items: center; gap: 4px; }
.cm-header__info { display: flex; flex-direction: column; gap: 2px; flex-grow: 1; min-width: 0; }
.cm-header__name { margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cm-status { margin: 0; display: flex; align-items: center; gap: 6px; white-space: nowrap; min-width: 0; }
.cm-status__text { overflow: hidden; text-overflow: ellipsis; }
.cm-status__dot { width: 7px; height: 7px; flex-shrink: 0; box-sizing: border-box; }
.cm-header__actions { display: flex; align-items: center; gap: 2px; }
</style>
