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
 * Under an AI answer: the status cards its tools produced (orders, tickets) and,
 * on the latest reply that asked for it, the email check. Hidden while the
 * answer still types out.
 */
import { computed, inject } from 'vue'
import { WIDGET_CTX } from '../controller'
import StatusCard from './StatusCard.vue'
import EmailCheckCard from './EmailCheckCard.vue'
import { cardsOf } from '../answer-extras'
import type { WidgetMessage } from '../../../types/widget'

const props = defineProps<{
    message: WidgetMessage
    /** Its place in the conversation; -1 when it is not in it. */
    index: number
}>()

const ctrl = inject(WIDGET_CTX)!
const { messages } = ctrl

const inConversation = computed(() => props.index >= 0)
const streaming = computed(() => inConversation.value && ctrl.isStreaming(props.index))
const cards = computed(() => (streaming.value ? [] : cardsOf(props.message)))
// The email check shows once, on the latest reply that asked for it.
const asksEmailCheck = computed(() => {
    if (streaming.value || !inConversation.value || props.message.attributes?.email_check !== true) return false
    const later = messages.value.slice(props.index + 1)
    return !later.some(m => m.attributes?.email_check === true)
})
</script>

<template>
    <StatusCard v-for="(card, i) in cards" :key="card.id" :card="card" class="cm-enter" :style="{ '--cm-i': i }" />
    <EmailCheckCard v-if="asksEmailCheck" class="cm-enter" />
</template>
