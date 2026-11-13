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
// A message of a type this widget does not know (a newer server, say): its text,
// sanitised, so nothing the conversation holds is silently dropped.
import { computed } from 'vue'
import { renderMarkdown } from '../../markdown'
import type { WidgetMessage } from '../../../types/widget'

const props = defineProps<{ message: WidgetMessage; index: number }>()

const html = computed(() => renderMarkdown(props.message.message || ''))
</script>

<template>
    <div class="message agent-message cm-fallback">
        <div class="message-bubble" v-html="html"></div>
    </div>
</template>
