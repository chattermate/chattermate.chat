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
 * The redesigned widget view (ui 2): header, conversation and composer in one
 * panel, drawn from the widget controller its root provides, exactly like the
 * classic view. This view owns its DOM work: scrolling (MessageList), focus and
 * what survives the panel being hidden (usePanelVisibility).
 * The Ask AI palette (ASK_ANYTHING / AURORA, search-bar trigger) is shared with the
 * classic view.
 */
import { computed, inject, nextTick, ref, watch } from 'vue'
import { WIDGET_CTX, WIDGET_PREVIEW } from './controller'
import PanelHeader from './PanelHeader.vue'
import MessageList from './MessageList.vue'
import Composer from './Composer.vue'
import PanelFooter from './PanelFooter.vue'
import AskAiSurface from '../AskAiSurface.vue'
import NewChatConfirm from '../NewChatConfirm.vue'
import StatusBanner from './StatusBanner.vue'
import StartState from './StartState.vue'
import EmailCard from './EmailCard.vue'
import FrontScreen from './screens/FrontScreen.vue'
import ConversationEnded from './ConversationEnded.vue'
import PreviewModal from './PreviewModal.vue'
import { usePanelVisibility } from '../../composables/usePanelVisibility'
import { usePanelActivity, usePanelCascade, usePanelExpand } from '../../composables/usePanelHostMotion'
import { postToHost } from '../host-bridge'
import '../widget-panel.css'
import '../widget-panel-messages.css'
import '../widget-panel-answers.css'
import '../widget-panel-composer.css'
import '../widget-panel-start.css'
import '../widget-panel-cards.css'
import '../widget-panel-screens.css'
import '../widget-panel-shared.css'
import '../widget-motion.css'

const ctrl = inject(WIDGET_CTX)!
const {
    widgetId, showAuthError, themeVars, containerStyles, useAskAiPanel, submittingEmail,
    showLandingPage, landingPageData, showFullScreenForm, fullScreenFormData, awaitingEmail,
    shouldShowNewConversationOption, newChatArmed, canStartNewChat, startingNewChat, newChatError,
    messages, loadingHistory, loading, shownPrompt, journeyProgress, pendingConfirm, replyChips,
    awaitingHistory, hostCapabilities,
} = ctrl

// The loader's motion: the open cascade, the expand, the working dot while hidden.
const { cascading, play: playCascade } = usePanelCascade()
// The dashboard preview has no embedding page to tell anything.
const toHost = inject(WIDGET_PREVIEW, false) ? () => {} : postToHost
const { expanded, resizing, toggleExpand } = usePanelExpand(toHost)
usePanelActivity(loading, ctrl.hostVisible, toHost)

const list = ref<InstanceType<typeof MessageList> | null>(null)
const composer = ref<InstanceType<typeof Composer> | null>(null)
// One email card, above the start state or the conversation: the field the visitor
// types in never remounts when the thread starts.
const emailCard = ref<InstanceType<typeof EmailCard> | null>(null)

// The field a visitor starts with: the email card while it shows, else the composer.
const focusField = () => {
    if (awaitingEmail.value && emailCard.value) emailCard.value.focus()
    else composer.value?.focus()
}

// The email was accepted while the visitor was in the card: carry them on to the
// composer instead of leaving focus on a field that is going away.
watch(awaitingEmail, (awaiting, wasAwaiting) => {
    if (awaiting || !wasAwaiting || !emailCard.value?.hasFocus()) return
    nextTick(() => composer.value?.focus())
})

const { report, focusIfShown } = usePanelVisibility(ctrl.hostVisible, {
    focus: focusField,
    onHide: () => list.value?.remember(),
    onShow: () => list.value?.restore(),
})

ctrl.registerView({
    // Live reveals and the page's SCROLL_TO_BOTTOM: follow only if at the bottom.
    scrollToBottom: () => list.value?.follow(),
    focusComposer: focusIfShown,
    // The visitor's own message always brings them to the end.
    afterSend: () => list.value?.scrollToBottom(),
    hostVisibilityReported: (open, how) => {
        report(open)
        if (open && how?.cascade) playCascade()
    },
})

// The widget cannot be used (not set up, or the visitor's session failed). Not while
// the email card's submit is still deciding: a refused email stays on the card
// (useEmailGate's recoverRefusal), and the panel must not flash away meanwhile.
const showBlocked = computed(() => showAuthError.value && !(awaitingEmail.value && submittingEmail.value))

const showWorkflowScreen = computed(() =>
    (showLandingPage.value && !!landingPageData.value) || (showFullScreenForm.value && !!fullScreenFormData.value))
// The composer stays beside the email card: a send waits for the email (useComposer).
const showComposer = computed(() => !shouldShowNewConversationOption.value)

// The start state stands in for the conversation while there is nothing at all to
// show in it, for every chat style (the Ask Anything welcome included).
const nothingInThread = computed(() =>
    messages.value.length === 0 && !loadingHistory.value && !awaitingHistory.value && !loading.value
    && !shownPrompt.value && !journeyProgress.value && !pendingConfirm.value && replyChips.value.length === 0)

// The panel's corners come from the theme, except where the display squares them (sidebars).
// The display styles' height: 100% resolves against a frame page with no height;
// the panel sizes itself to the frame instead (see .chat-container below).
const withoutHeight = ({ height: _height, ...rest }: Record<string, string>) => rest

const rootStyle = computed(() => ({
    ...withoutHeight(containerStyles.value as Record<string, string>),
    ...themeVars.value,
    borderRadius: containerStyles.value.borderRadius === '0' ? '0' : 'var(--cm-radius)',
}))
</script>

<template>
    <div
        v-if="widgetId || showBlocked"
        class="chat-container cm-surface cm-ui-2"
        :style="rootStyle"
    >
        <template v-if="useAskAiPanel && !showBlocked">
            <StatusBanner />
            <AskAiSurface />
        </template>
        <div v-else class="cm-panel" :class="{ 'cm-cascade': cascading, 'cm-resizing': resizing }">
            <FrontScreen v-if="showBlocked || showWorkflowScreen" :blocked="showBlocked" />
            <template v-else>
                <PanelHeader :can-expand="hostCapabilities.expand" :expanded="expanded" @expand="toggleExpand" />
                <StatusBanner />
                <NewChatConfirm
                    v-if="newChatArmed && canStartNewChat"
                    :busy="startingNewChat"
                    :error="newChatError"
                    @confirm="ctrl.confirmNewChat"
                    @cancel="ctrl.disarmNewChat"
                />
                <!-- Scrolls as a whole when the card and the start state outgrow a short
                     panel; the conversation scrolls itself (MessageList). -->
                <div class="cm-panel__body">
                    <EmailCard v-if="awaitingEmail" ref="emailCard" />
                    <Transition name="cm-start" mode="out-in">
                        <StartState v-if="nothingInThread" />
                        <MessageList v-else ref="list" />
                    </Transition>
                </div>
                <div class="cm-panel__bottom">
                    <ConversationEnded v-if="shouldShowNewConversationOption" />
                    <Composer v-if="showComposer" ref="composer" />
                    <PanelFooter />
                </div>
            </template>
            <PreviewModal />
        </div>
    </div>
</template>

<style scoped>
.chat-container {
    width: 100%;
    /* The frame's page has no height of its own: fill the frame's viewport. The
       dashboard preview (1.7) mounts the panel in a sized box and overrides this. */
    height: 100vh;
    height: 100dvh;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
}
.cm-panel {
    flex-grow: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    border-radius: inherit;
    overflow: hidden;
}
.cm-panel__body {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
    display: flex;
    flex-direction: column;
}
</style>
