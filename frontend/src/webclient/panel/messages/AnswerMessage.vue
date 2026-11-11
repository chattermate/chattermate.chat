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
 * An AI reply: full width with no bubble, under a label row (the mark and
 * "<agent> AI") and the receipt of the steps the agent took. Live replies reveal a
 * word at a time. Under the text: the page it links to (LinkCard), the sources it
 * drew on, files, copy and thumbs, and on the latest answer, follow-up questions.
 */
import { computed, inject, ref } from 'vue'
import { WIDGET_CTX, WIDGET_PREVIEW } from '../controller'
import AgentMark from '../AgentMark.vue'
import AttachmentList from './AttachmentList.vue'
import AnswerBody from './answer/AnswerBody.vue'
import SourceChips from './answer/SourceChips.vue'
import LinkCard from './answer/LinkCard.vue'
import AnswerActions from './answer/AnswerActions.vue'
import FollowUpChips from './answer/FollowUpChips.vue'
import TraceReceipt from './answer/TraceReceipt.vue'
import StatusCard from './StatusCard.vue'
import { agentFace } from '../agent-face'
import { renderMarkdown } from '../../markdown'
import { decorateAnswerLinks, type AnswerSource } from '../../answer-links'
import { hostOrigin } from '../../host-bridge'
import { cardsOf, feedbackOf, followUpsOf, traceOf } from '../answer-extras'
import { PANEL_COPY } from '../../copy'
import type { WidgetMessage } from '../../../types/widget'

const props = defineProps<{
    message: WidgetMessage
    /** Its place in the conversation, for the typewriter; -1 when it is not in it. */
    index: number
}>()

const ctrl = inject(WIDGET_CTX)!
const preview = inject(WIDGET_PREVIEW, false)
const { agentName, photoUrl, orbStyle, messages, loading, isMessageInputEnabled, hostCapabilities } = ctrl

const face = computed(() => agentFace(ctrl.customization.value, photoUrl.value))
const inConversation = computed(() => props.index >= 0)
const streaming = computed(() => inConversation.value && ctrl.isStreaming(props.index))
const sources = computed<AnswerSource[]>(() => (ctrl.showCitations.value ? props.message.sources ?? [] : []))
const answer = computed(() => {
    const full = props.message.message || ''
    const shown = streaming.value ? ctrl.displayText(props.index, full) : full
    return decorateAnswerLinks(renderMarkdown(shown), sources.value, {
        hostOrigin: preview ? null : hostOrigin(),
        sameTab: hostCapabilities.value.navigate,
    })
})
const files = computed(() => props.message.attachments ?? [])
const trace = computed(() => traceOf(props.message))
const cards = computed(() => (streaming.value ? [] : cardsOf(props.message)))
const isLatest = computed(() => inConversation.value && props.index === messages.value.length - 1)
const followUps = computed(() => (isLatest.value && !streaming.value ? followUpsOf(props.message) : []))
const showActions = computed(() => inConversation.value && !streaming.value && !!props.message.message)
const canRate = computed(() => typeof props.message.id === 'number')

const body = ref<InstanceType<typeof AnswerBody> | null>(null)
const answerText = () => body.value?.text() ?? ''
</script>

<template>
    <div class="message agent-message cm-answer">
        <div class="cm-answer__label">
            <AgentMark size="sm" :face="face" :photo-url="photoUrl" :orb-style="orbStyle" />
            <span class="cm-answer__name">{{ PANEL_COPY.aiLabel(agentName) }}</span>
        </div>
        <TraceReceipt v-if="trace" :trace="trace" />
        <AnswerBody ref="body" :html="answer.html" :busy="streaming" />
        <LinkCard v-if="answer.card && !streaming" :source="answer.card" class="cm-fade" />
        <StatusCard v-for="(card, i) in cards" :key="card.id" :card="card" class="cm-enter" :style="{ '--cm-i': i }" />
        <SourceChips v-if="sources.length" :sources="sources" />
        <AttachmentList v-if="files.length" :attachments="files" />
        <AnswerActions
            v-if="showActions"
            :feedback="feedbackOf(message)"
            :can-rate="canRate"
            :text="answerText"
            @feedback="value => ctrl.sendFeedback(message, value)"
        />
        <FollowUpChips
            v-if="followUps.length"
            :choices="followUps"
            :disabled="loading || !isMessageInputEnabled"
            @pick="ctrl.sendQuickAction"
        />
    </div>
</template>

<style scoped>
.cm-answer__label { display: flex; align-items: center; gap: 8px; }
</style>
