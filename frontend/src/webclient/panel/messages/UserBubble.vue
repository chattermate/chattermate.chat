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
// The visitor's own message: an accent bubble on the right, with any files below it.
import { computed } from 'vue'
import { renderMarkdown } from '../../markdown'
import AttachmentList from './AttachmentList.vue'
import type { WidgetMessage } from '../../../types/widget'

const props = defineProps<{ message: WidgetMessage; index: number }>()

const text = computed(() => props.message.message || '')
const files = computed(() => props.message.attachments ?? [])
// A files-only message has no text bubble.
const showBubble = computed(() => !!text.value || files.value.length === 0)
</script>

<template>
    <div class="message user-message cm-user">
        <div v-if="showBubble" class="message-bubble" v-html="renderMarkdown(text)"></div>
        <AttachmentList v-if="files.length" class="cm-user__files" :attachments="files" />
    </div>
</template>

<style scoped>
.cm-user__files { align-items: flex-end; }
</style>
