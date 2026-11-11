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
// A reply from the person who took the conversation over: their avatar and name
// beside a bubble. Keeps the agent-message hook: the page object reads bot and
// human replies alike.
import { computed, inject } from 'vue'
import { WIDGET_CTX } from '../controller'
import PersonAvatar from '../PersonAvatar.vue'
import AttachmentLinks from './AttachmentLinks.vue'
import { renderMarkdown } from '../../markdown'
import type { WidgetMessage } from '../../../types/widget'

const props = defineProps<{ message: WidgetMessage; index: number }>()

const ctrl = inject(WIDGET_CTX)!
const { humanAgentPhotoUrl } = ctrl

const name = computed(() =>
    props.message.agent_name || ctrl.humanAgent.value.human_agent_name || ctrl.agentName.value)
const streaming = computed(() => ctrl.isStreaming(props.index))
const html = computed(() => {
    const full = props.message.message || ''
    return renderMarkdown(streaming.value ? ctrl.displayText(props.index, full) : full)
})
const files = computed(() => props.message.attachments ?? [])
</script>

<template>
    <div class="message agent-message cm-human">
        <PersonAvatar size="sm" :name="name" :photo-url="humanAgentPhotoUrl" />
        <div class="cm-human__col">
            <span class="cm-human__name">{{ name }}</span>
            <div class="message-bubble" :aria-busy="streaming" v-html="html"></div>
            <AttachmentLinks v-if="files.length" :attachments="files" />
        </div>
    </div>
</template>

<style scoped>
.cm-human__col { display: flex; flex-direction: column; gap: 4px; min-width: 0; max-width: 80%; }
</style>
