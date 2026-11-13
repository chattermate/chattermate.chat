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
 * The panel's message box: a textarea that grows to five lines, Enter to send and
 * Shift+Enter for a new line, an attach button when files may be sent, and one
 * button that is "Send" or, while a reply is still being revealed, "Stop" (shows
 * it in full; stopping the agent itself comes with plan 2.5).
 * Plain v-model: the classic view's native-listener workaround is not used here.
 */
import { computed, inject, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { WIDGET_CTX } from './controller'
import { PANEL_COPY } from '../copy'
import { SECRET_WARNING } from '../../utils/secretGuard'
import { carriesFiles, growToFit, isSendKey, refitOnWidthChange } from './composer-input'
import StagedFiles from './StagedFiles.vue'

const ctrl = inject(WIDGET_CTX)!
const {
    newMessage, placeholderText, canTypeMessage, secretInMessage, isRevealing,
    canUploadMore, isUploading, uploadedAttachments, acceptTypes,
} = ctrl

const field = ref<HTMLTextAreaElement | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

const hasContent = computed(() => !!newMessage.value.trim() || uploadedAttachments.value.length > 0)
// Sendable whenever the box takes typing: a message sent while a reply is coming is
// held and sent after it (useComposer), the same for the button as for Enter.
const canSend = computed(() => hasContent.value && canTypeMessage.value && !secretInMessage.value)

const send = () => { void ctrl.sendMessage() }

// Enter sends (a reply in flight holds it, see useComposer); Shift+Enter is a new line.
const onKeydown = (event: KeyboardEvent) => {
    if (!isSendKey(event)) return
    event.preventDefault()
    send()
}

const onSendOrStop = () => {
    if (isRevealing.value) ctrl.skipReveal()
    else send()
}

// The box follows its text, including text set from outside (prefill, cleared on send)
// and a draft already there when it appears, and its width (the panel resized).
watch(newMessage, () => nextTick(() => growToFit(field.value)))
let stopRefitting = () => {}
onMounted(() => {
    growToFit(field.value)
    stopRefitting = refitOnWidthChange(field.value)
})
onBeforeUnmount(() => stopRefitting())

const openFilePicker = () => fileInput.value?.click()

// Files reach the controller only while files may be sent; pasted or dropped text is untouched.
const onPaste = (event: ClipboardEvent) => {
    if (canUploadMore.value) void ctrl.handlePaste(event)
}
const onDrop = (event: DragEvent) => {
    if (canUploadMore.value) {
        void ctrl.handleDrop(event)
        return
    }
    // A dropped file would otherwise open in the frame in place of the chat.
    if (carriesFiles(event)) event.preventDefault()
}
const onDragOver = (event: DragEvent) => {
    if (canUploadMore.value) ctrl.handleDragOver(event)
}
const onDragLeave = (event: DragEvent) => {
    if (canUploadMore.value) ctrl.handleDragLeave(event)
}

/** Focus the message box (the panel calls this when it opens). */
const focus = () => field.value?.focus()
defineExpose({ focus })
</script>

<template>
    <div class="cm-composer-wrap">
        <StagedFiles />
        <div class="cm-composer" :class="{ 'is-disabled': !canTypeMessage }">
            <input
                ref="fileInput"
                type="file"
                class="cm-composer__file"
                :accept="acceptTypes"
                multiple
                tabindex="-1"
                aria-hidden="true"
                @change="ctrl.handleFileSelect"
            >
            <button
                v-if="canUploadMore"
                type="button"
                class="cm-icon-button cm-press"
                :aria-label="PANEL_COPY.attach"
                :title="PANEL_COPY.attach"
                :disabled="isUploading"
                @click="openFilePicker"
            >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5l-8.6 8.6a5 5 0 01-7.1-7.1l8.6-8.6a3.5 3.5 0 015 5l-8.6 8.6a2 2 0 01-2.8-2.8L15.4 7.3"></path></svg>
            </button>
            <textarea
                ref="field"
                v-model="ctrl.newMessage.value"
                class="cm-composer__field"
                rows="1"
                :aria-label="PANEL_COPY.message"
                :placeholder="placeholderText"
                :disabled="!canTypeMessage"
                @keydown="onKeydown"
                @paste="onPaste"
                @drop="onDrop"
                @dragover="onDragOver"
                @dragleave="onDragLeave"
            ></textarea>
            <button
                type="button"
                class="cm-send cm-press"
                :class="{ 'is-stop': isRevealing, 'is-ready': canSend || isRevealing }"
                :aria-label="isRevealing ? PANEL_COPY.stop : PANEL_COPY.send"
                :title="isRevealing ? PANEL_COPY.stop : PANEL_COPY.send"
                :disabled="!isRevealing && !canSend"
                @click="onSendOrStop"
            >
                <span class="cm-send__stop" aria-hidden="true"></span>
                <svg class="cm-send__arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"></path></svg>
            </button>
        </div>
        <p v-if="isUploading" class="cm-composer-note" role="status">{{ PANEL_COPY.uploading }}</p>
        <p v-if="secretInMessage" class="cm-secret-hint" role="alert">{{ SECRET_WARNING }}</p>
    </div>
</template>

<style scoped>
.cm-composer {
    display: flex;
    align-items: flex-end;
    gap: 4px;
    min-height: 50px;
    padding: 6px;
    box-sizing: border-box;
}
.cm-composer__file { display: none; }
.cm-composer__field {
    flex-grow: 1;
    min-width: 0;
    resize: none;
    border: 0;
    margin: 0;
    /* Line height and vertical padding match composer-input.ts, which caps the
       box at five lines. */
    padding: 8px 4px 8px 8px;
    line-height: 20px;
    overflow-y: hidden;
    box-sizing: border-box;
}
.cm-send {
    position: relative;
    width: 36px;
    height: 36px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
}
.cm-send__stop { position: absolute; width: 11px; height: 11px; }
</style>
