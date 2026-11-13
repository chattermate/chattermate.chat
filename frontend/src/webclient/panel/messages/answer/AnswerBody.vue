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
 * An answer's text: sanitized HTML with its links decorated (answer-links.ts).
 * aria-busy while it is still being revealed, so screen readers read it once. A
 * click on a same-site link asks the embedding page to open it (NAVIGATE).
 */
import { inject, ref } from 'vue'
import { WIDGET_PREVIEW } from '../../controller'
import { postToHost } from '../../../host-bridge'
import { sameSiteTarget } from '../../../answer-links'

defineProps<{ html: string; busy: boolean }>()

const preview = inject(WIDGET_PREVIEW, false)
const root = ref<HTMLElement | null>(null)

const onClick = (event: MouseEvent) => {
    const url = sameSiteTarget(event)
    if (!url) return
    event.preventDefault()
    if (!preview) postToHost({ type: 'NAVIGATE', url })
}

/** The answer as the visitor reads it, for copying. */
const text = () => (root.value?.innerText || root.value?.textContent || '').trim()

defineExpose({ text })
</script>

<template>
    <div ref="root" class="message-bubble cm-answer__body" :aria-busy="busy" @click="onClick" v-html="html"></div>
</template>
