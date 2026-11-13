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
 * The start state's "Recent": the visitor's latest earlier conversation, to pick up
 * where they left off, and "All conversations". Only the latest, never a list.
 */
import { computed, inject, onMounted } from 'vue'
import { WIDGET_CTX, WIDGET_PREVIEW } from '../controller'
import ConversationRow from './ConversationRow.vue'
import { PANEL_COPY } from '../../copy'

const ctrl = inject(WIDGET_CTX)!
const preview = inject(WIDGET_PREVIEW, false)
const { history, historyAvailable } = ctrl

// Only where past chats can be offered (on Free the row never asks)
const latest = computed(() => (historyAvailable.value ? history.value.items.find(i => !i.current) ?? null : null))

onMounted(() => {
    if (historyAvailable.value && !preview && !history.value.loaded) ctrl.refreshConversations()
})

const open = () => {
    if (!latest.value) return
    ctrl.openHistory()
    ctrl.openConversation(latest.value.id)
}
</script>

<template>
    <div v-if="latest" class="cm-recent">
        <div class="cm-recent__head">
            <span class="cm-recent__label">{{ PANEL_COPY.recent }}</span>
            <button type="button" class="cm-recent__all" @click="ctrl.openHistory">{{ PANEL_COPY.allConversations }}</button>
        </div>
        <ConversationRow :item="latest" @open="open" />
    </div>
</template>

<style scoped>
.cm-recent { display: flex; flex-direction: column; gap: 4px; }
.cm-recent__head { display: flex; align-items: center; justify-content: space-between; }
</style>
