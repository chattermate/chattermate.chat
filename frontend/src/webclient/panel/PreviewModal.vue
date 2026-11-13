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
 * An image from the chat or the composer, shown large over the panel. A modal
 * dialog: focus moves to Close and stays inside, Escape or the backdrop closes it,
 * and focus goes back to what opened it.
 */
import { computed, inject, nextTick, ref, watch } from 'vue'
import { WIDGET_CTX } from './controller'
import { PANEL_COPY } from '../copy'

const ctrl = inject(WIDGET_CTX)!
const { previewModal, previewFile } = ctrl

const closeButton = ref<HTMLButtonElement | null>(null)
let opener: HTMLElement | null = null

const isImagePreview = computed(() => !!previewFile.value && ctrl.isImage(previewFile.value.type))

watch(previewModal, (open) => {
    if (open) {
        opener = document.activeElement as HTMLElement | null
        nextTick(() => closeButton.value?.focus())
    } else {
        opener?.focus?.()
        opener = null
    }
})

// Escape closes it (and goes no further: the page must not close the widget too).
// Tab stays on Close, the dialog's only control.
const onKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
        ctrl.closePreview()
    } else if (event.key === 'Tab') {
        event.preventDefault()
        closeButton.value?.focus()
    }
}
</script>

<template>
    <div v-if="previewModal" class="cm-preview" @click="ctrl.closePreview" @keydown="onKeydown">
        <div
            class="cm-preview__dialog"
            role="dialog"
            aria-modal="true"
            :aria-label="previewFile?.filename || PANEL_COPY.imagePreview"
            @click.stop
        >
            <button ref="closeButton" type="button" class="cm-icon-button cm-preview__close" :aria-label="PANEL_COPY.closePreview" @click="ctrl.closePreview">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"></path></svg>
            </button>
            <img v-if="isImagePreview && previewFile" :src="ctrl.getPreviewUrl(previewFile)" :alt="previewFile.filename" class="cm-preview__image">
            <p v-if="previewFile" class="cm-preview__name">{{ previewFile.filename }}</p>
        </div>
    </div>
</template>

<style scoped>
.cm-preview { position: absolute; inset: 0; z-index: 20; display: flex; align-items: center; justify-content: center; padding: 16px; }
.cm-preview__dialog { position: relative; max-width: 100%; max-height: 100%; display: flex; flex-direction: column; gap: 8px; padding: 12px; }
.cm-preview__close { position: absolute; top: 8px; right: 8px; }
.cm-preview__image { display: block; max-width: 100%; max-height: calc(100vh - 140px); object-fit: contain; }
.cm-preview__name { margin: 0; overflow-wrap: anywhere; }
</style>
