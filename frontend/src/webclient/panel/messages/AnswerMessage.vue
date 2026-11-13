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
 * "<agent> AI"). Live replies reveal through the shared typewriter; the reply is
 * aria-busy until shown in full, so screen readers read it once. Sources, answer
 * actions and the word-by-word reveal come with plan 2.1.
 */
import { computed, inject } from 'vue'
import { WIDGET_CTX } from '../controller'
import AgentMark from '../AgentMark.vue'
import AttachmentList from './AttachmentList.vue'
import { agentFace } from '../agent-face'
import { renderMarkdown } from '../../markdown'
import { citationLabel, citationTooltip } from '../../citations'
import { PANEL_COPY } from '../../copy'
import type { WidgetMessage } from '../../../types/widget'

const props = defineProps<{
    message: WidgetMessage
    /** Its place in the conversation, for the typewriter; -1 when it is not in it. */
    index: number
}>()

const ctrl = inject(WIDGET_CTX)!
const { agentName, photoUrl, orbStyle } = ctrl

const face = computed(() => agentFace(ctrl.customization.value, photoUrl.value))
const streaming = computed(() => props.index >= 0 && ctrl.isStreaming(props.index))
const html = computed(() => {
    const full = props.message.message || ''
    return renderMarkdown(streaming.value ? ctrl.displayText(props.index, full) : full)
})
const sources = computed(() => (ctrl.showCitations.value ? props.message.sources ?? [] : []))
const files = computed(() => props.message.attachments ?? [])
</script>

<template>
    <div class="message agent-message cm-answer">
        <div class="cm-answer__label">
            <AgentMark size="sm" :face="face" :photo-url="photoUrl" :orb-style="orbStyle" />
            <span class="cm-answer__name">{{ PANEL_COPY.aiLabel(agentName) }}</span>
        </div>
        <div class="message-bubble cm-answer__body" :aria-busy="streaming" v-html="html"></div>
        <ul v-if="sources.length" class="cm-sources" :aria-label="PANEL_COPY.sources">
            <li v-for="(source, i) in sources" :key="i" class="cm-sources__chip" :title="citationTooltip(source)">
                {{ citationLabel(source) }}
            </li>
        </ul>
        <AttachmentList v-if="files.length" :attachments="files" />
    </div>
</template>

<style scoped>
.cm-answer__label { display: flex; align-items: center; gap: 8px; }
.cm-sources { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 6px; }
</style>
