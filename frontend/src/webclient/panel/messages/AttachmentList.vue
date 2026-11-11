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
// Files on a message: images as thumbnails that open the preview (and can be
// downloaded), anything else as a download link with its size. Links open in a
// new tab; the preview is the panel's PreviewModal.
import { inject } from 'vue'
import { WIDGET_CTX } from '../controller'
import { PANEL_COPY } from '../../copy'
import type { WidgetMessage } from '../../../types/widget'

type Attachment = NonNullable<WidgetMessage['attachments']>[number]

defineProps<{ attachments: Attachment[] }>()

const ctrl = inject(WIDGET_CTX)!

const preview = (attachment: Attachment) => ctrl.openPreview({
    url: attachment.file_url,
    filename: attachment.filename,
    type: attachment.content_type,
    file_url: ctrl.getDownloadUrl(attachment.file_url),
})
</script>

<template>
    <ul class="cm-attachments">
        <li v-for="attachment in attachments" :key="attachment.id" class="cm-attachments__item">
            <button
                v-if="ctrl.isImageAttachment(attachment.content_type)"
                type="button"
                class="cm-attachments__thumb"
                :aria-label="PANEL_COPY.previewImage(attachment.filename)"
                @click="preview(attachment)"
            >
                <img :src="ctrl.getDownloadUrl(attachment.file_url)" alt="" loading="lazy">
            </button>
            <a
                class="cm-attachments__link"
                :href="ctrl.getDownloadUrl(attachment.file_url)"
                target="_blank"
                rel="noopener noreferrer"
            >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"></path></svg>
                <span>{{ attachment.filename }} ({{ ctrl.formatFileSize(attachment.file_size) }})</span>
                <span class="cm-visually-hidden">{{ PANEL_COPY.opensInNewTab }}</span>
            </a>
        </li>
    </ul>
</template>

<style scoped>
.cm-attachments { list-style: none; margin: 6px 0 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
.cm-attachments__item { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.cm-attachments__thumb { display: block; padding: 0; border: 0; background: none; cursor: zoom-in; max-width: 220px; }
.cm-attachments__thumb img { display: block; width: 100%; max-height: 180px; object-fit: cover; }
.cm-attachments__link { display: inline-flex; align-items: center; gap: 6px; overflow-wrap: anywhere; }
</style>
