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
/** One past conversation: its title and latest line (or the search snippet), when it last moved. */
import { computed } from 'vue'
import { relativeTime } from '../history-groups'
import { PANEL_COPY } from '../../copy'
import type { ConversationItem } from '../../../composables/useConversationHistory'

const props = defineProps<{ item: ConversationItem }>()
const emit = defineEmits<{ open: [] }>()

const line = computed(() => props.item.snippet
    || (props.item.last_from_visitor ? PANEL_COPY.youPrefix : '') + props.item.last_message)
const when = computed(() => relativeTime(props.item.last_at))
</script>

<template>
    <button type="button" class="cm-conversation cm-press" :class="{ 'is-open': item.open, 'is-current': item.current }" @click="emit('open')">
        <span class="cm-conversation__text">
            <span class="cm-conversation__title">{{ item.title }}</span>
            <span class="cm-conversation__line">{{ line }}</span>
        </span>
        <span class="cm-conversation__meta">
            <span class="cm-conversation__when">{{ when }}</span>
            <span v-if="item.resolved_by" class="cm-conversation__by">{{ PANEL_COPY.resolvedBy(item.resolved_by.name) }}</span>
        </span>
    </button>
</template>

<style scoped>
.cm-conversation { width: 100%; display: flex; align-items: flex-start; gap: 10px; padding: 10px; text-align: left; }
.cm-conversation__text { display: flex; flex-direction: column; gap: 2px; min-width: 0; flex: 1; }
.cm-conversation__title, .cm-conversation__line { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cm-conversation__meta { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; flex: none; }
</style>
