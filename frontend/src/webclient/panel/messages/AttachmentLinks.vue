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
// Files on a message, as download links. Stopgap until the attachment list with
// image previews (plan 1.4): nothing sent or received is dropped meanwhile.
import { inject } from 'vue'
import { WIDGET_CTX } from '../controller'
import type { WidgetMessage } from '../../../types/widget'

defineProps<{ attachments: NonNullable<WidgetMessage['attachments']> }>()

const ctrl = inject(WIDGET_CTX)!
</script>

<template>
    <ul class="cm-attachments">
        <li v-for="attachment in attachments" :key="attachment.id">
            <a
                class="cm-attachments__link"
                :href="ctrl.getDownloadUrl(attachment.file_url)"
                target="_blank"
                rel="noopener noreferrer"
            >{{ attachment.filename }} ({{ ctrl.formatFileSize(attachment.file_size) }})</a>
        </li>
    </ul>
</template>

<style scoped>
.cm-attachments { list-style: none; margin: 6px 0 0; padding: 0; display: flex; flex-direction: column; gap: 4px; }
.cm-attachments__link { overflow-wrap: anywhere; }
</style>
