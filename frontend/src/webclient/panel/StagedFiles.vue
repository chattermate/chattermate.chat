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
// Files waiting to go with the next message: images as thumbnails that open the
// preview, anything else with a file icon; each with its size and a Remove button.
import { inject } from 'vue'
import { WIDGET_CTX } from './controller'
import { PANEL_COPY } from '../copy'

const ctrl = inject(WIDGET_CTX)!
const { uploadedAttachments } = ctrl
</script>

<template>
    <ul v-if="uploadedAttachments.length" class="cm-staged" :aria-label="PANEL_COPY.stagedFiles">
        <!-- Keyed by place: two pasted screenshots are both "image.png", and a file is
             removed by its place (removeAttachment(index)). -->
        <li v-for="(file, index) in uploadedAttachments" :key="index" class="cm-staged__file">
            <button
                v-if="ctrl.isImage(file.type)"
                type="button"
                class="cm-staged__thumb"
                :aria-label="PANEL_COPY.previewImage(file.filename)"
                @click="ctrl.openPreview(file)"
            >
                <img :src="ctrl.getPreviewUrl(file)" alt="">
            </button>
            <span v-else class="cm-staged__thumb" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"></path><path d="M13 2v7h7"></path></svg>
            </span>
            <span class="cm-staged__info">
                <span class="cm-staged__name">{{ file.filename }}</span>
                <span class="cm-staged__size">{{ ctrl.formatFileSize(file.size) }}</span>
            </span>
            <button
                type="button"
                class="cm-icon-button cm-icon-button--small"
                :aria-label="PANEL_COPY.removeFile(file.filename)"
                @click="ctrl.removeAttachment(index)"
            >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"></path></svg>
            </button>
        </li>
    </ul>
</template>

<style scoped>
.cm-staged { list-style: none; margin: 0 0 8px; padding: 0; display: flex; flex-wrap: wrap; gap: 6px; }
.cm-staged__file { display: flex; align-items: center; gap: 8px; padding: 4px 4px 4px 4px; max-width: 100%; min-width: 0; }
.cm-staged__thumb { width: 36px; height: 36px; flex-shrink: 0; padding: 0; border: 0; display: flex; align-items: center; justify-content: center; overflow: hidden; }
.cm-staged__thumb img { width: 100%; height: 100%; object-fit: cover; }
.cm-staged__info { display: flex; flex-direction: column; min-width: 0; }
.cm-staged__name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 160px; }
</style>
