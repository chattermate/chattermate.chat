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
 * Under an answer: copy it, and thumb it up or down. A second tap on a thumb
 * takes it back. Thumbs show once the reply is stored (it has an id).
 */
import { computed, onUnmounted, ref } from 'vue'
import { PANEL_COPY } from '../../../copy'
import { copyText } from '../../../clipboard'
import type { VisitorFeedback } from '../../answer-extras'

const props = defineProps<{
    feedback: VisitorFeedback | null
    canRate: boolean
    /** The answer's text as shown. */
    text: () => string
}>()
const emit = defineEmits<{ feedback: [value: VisitorFeedback | null] }>()

const copied = ref(false)
let timer: ReturnType<typeof setTimeout> | null = null

const copy = async () => {
    if (!(await copyText(props.text()))) return
    copied.value = true
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => { copied.value = false }, 1600)
}
onUnmounted(() => { if (timer) clearTimeout(timer) })

const thumb = (value: VisitorFeedback) => emit('feedback', props.feedback === value ? null : value)
const upPressed = computed(() => props.feedback === 'up')
const downPressed = computed(() => props.feedback === 'down')
</script>

<template>
    <div class="cm-answer-actions" role="group" :aria-label="PANEL_COPY.answerActions">
        <button type="button" class="cm-answer-actions__btn cm-press" :aria-label="copied ? PANEL_COPY.copied : PANEL_COPY.copyAnswer" @click="copy">
            <svg v-if="!copied" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="12" height="12" rx="2"></rect><path d="M5 15V5a2 2 0 0 1 2-2h10"></path></svg>
            <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"></path></svg>
        </button>
        <span class="cm-sr-only" aria-live="polite">{{ copied ? PANEL_COPY.copied : '' }}</span>
        <template v-if="canRate">
            <button type="button" class="cm-answer-actions__btn cm-press" :aria-pressed="upPressed" :aria-label="PANEL_COPY.helpful" @click="thumb('up')">
                <svg width="15" height="15" viewBox="0 0 24 24" :fill="upPressed ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 11v9H4a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1h3zm0 0l4-8a2.5 2.5 0 0 1 2.5 2.5V9h5.2a2 2 0 0 1 2 2.3l-1.2 7A2 2 0 0 1 17.5 20H7"></path></svg>
            </button>
            <button type="button" class="cm-answer-actions__btn cm-press" :aria-pressed="downPressed" :aria-label="PANEL_COPY.notHelpful" @click="thumb('down')">
                <svg width="15" height="15" viewBox="0 0 24 24" :fill="downPressed ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 13V4h3a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-3zm0 0l-4 8a2.5 2.5 0 0 1-2.5-2.5V15H5.3a2 2 0 0 1-2-2.3l1.2-7A2 2 0 0 1 6.5 4H17"></path></svg>
            </button>
        </template>
    </div>
</template>

<style scoped>
.cm-answer-actions { display: flex; align-items: center; gap: 2px; }
.cm-answer-actions__btn { display: grid; place-items: center; width: 30px; height: 30px; padding: 0; }
</style>
