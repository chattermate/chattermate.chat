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
 * The conversation: a polite log (role=log, "Messages") of every message, with
 * what the page and the agent add after them (page message, action receipts and
 * confirmations, reply chips, the typing indicator). It follows new content only
 * while the visitor is at the bottom (useStickyScroll).
 */
import { computed, inject } from 'vue'
import { WIDGET_CTX } from './controller'
import MessageItem from './MessageItem.vue'
import AnswerMessage from './messages/AnswerMessage.vue'
import JourneyPlan from '../JourneyPlan.vue'
import ActionReceiptLine from '../ActionReceiptLine.vue'
import ActionConfirmCard from '../ActionConfirmCard.vue'
import SuggestedReplies from '../SuggestedReplies.vue'
import { useStickyScroll } from '../../composables/useStickyScroll'
import { useMessageArrivals } from '../../composables/useMessageArrivals'
import { PANEL_COPY } from '../copy'
import type { WidgetMessage } from '../../types/widget'

const ctrl = inject(WIDGET_CTX)!
const {
    messages, loading, loadingHistory, pendingConfirm, shownPrompt, receiptCount, journeyProgress,
    replyChips, chipBusy, isMessageInputEnabled, promptPlace,
} = ctrl

const { scroller, content, unseen, onScroll, follow, scrollToBottom, remember, restore } = useStickyScroll([
    () => messages.value.length, pendingConfirm, shownPrompt, receiptCount, loading,
])
const { isFresh } = useMessageArrivals(messages)

// The page's own message (ChatterMate.prompt) reads like an answer, never typed out.
const pageMessage = computed<WidgetMessage>(() => ({
    message: shownPrompt.value?.message || '',
    message_type: 'bot',
    created_at: '',
    session_id: '',
}))

defineExpose({ follow, scrollToBottom, remember, restore })
</script>

<template>
    <div class="cm-thread-wrap">
    <div
        ref="scroller"
        class="cm-thread"
        role="log"
        :aria-label="PANEL_COPY.messages"
        :aria-busy="loadingHistory"
        @scroll.passive="onScroll"
    >
        <div ref="content" class="cm-thread__content">
            <JourneyPlan v-if="journeyProgress" :progress="journeyProgress" @skip="ctrl.skipStep" @hide="ctrl.dismissJourney" />

            <template v-for="(message, index) in messages" :key="index">
                <AnswerMessage v-if="promptPlace.isBefore(message)" class="cm-host-prompt" :message="pageMessage" :index="-1" />
                <MessageItem :message="message" :index="index" :fresh="isFresh(message)" />
                <ActionReceiptLine
                    v-for="(receipt, r) in ctrl.receiptsAfter(index + 1)"
                    :key="`receipt-${index}-${r}`"
                    :receipt="receipt"
                />
            </template>

            <AnswerMessage v-if="promptPlace.isLast()" class="cm-host-prompt" :message="pageMessage" :index="-1" />

            <SuggestedReplies
                v-if="replyChips.length"
                :chips="replyChips"
                :disabled="!isMessageInputEnabled || chipBusy"
                @pick="ctrl.onPageChip"
            />

            <ActionConfirmCard v-if="pendingConfirm" :pending="pendingConfirm" @approve="ctrl.approveAction" @decline="ctrl.declineAction" />

            <div v-if="loading && !pendingConfirm" class="cm-typing cm-fade" role="status" :aria-label="PANEL_COPY.replying">
                <span class="cm-typing-dot"></span>
                <span class="cm-typing-dot"></span>
                <span class="cm-typing-dot"></span>
            </div>
        </div>
    </div>
    <!-- Replies arrived below while the visitor read further up: one tap down. -->
    <button v-if="unseen" type="button" class="cm-new-messages cm-fade" @click="scrollToBottom">
        {{ PANEL_COPY.newMessages }}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14M5 12l7 7 7-7"></path></svg>
    </button>
    </div>
</template>

<style scoped>
.cm-thread-wrap {
    position: relative;
    flex-grow: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
}
.cm-thread {
    flex-grow: 1;
    min-height: 0;
    overflow-y: auto;
    overflow-x: hidden;
    overscroll-behavior: contain;
}
/* Wraps the content so its growth can be observed (useStickyScroll). */
.cm-thread__content {
    padding: 18px 18px 10px;
    display: flex;
    flex-direction: column;
    gap: 16px;
}
.cm-typing { display: inline-flex; align-self: flex-start; gap: 4px; padding: 13px 14px; }
.cm-typing-dot { width: 6px; height: 6px; }
.cm-new-messages {
    position: absolute;
    left: 50%;
    bottom: 10px;
    transform: translateX(-50%);
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 32px;
    padding: 0 14px;
    white-space: nowrap;
}
</style>
