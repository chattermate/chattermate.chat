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
// Draws one message with the component for its kind (message-kind.ts). A message
// that arrived while the visitor watched rises in; history simply appears.
import { computed, type Component } from 'vue'
import { messageKind, type MessageKind } from './message-kind'
import UserBubble from './messages/UserBubble.vue'
import AnswerMessage from './messages/AnswerMessage.vue'
import HandoverCard from './messages/HandoverCard.vue'
import HumanMessage from './messages/HumanMessage.vue'
import JoinedDivider from './messages/JoinedDivider.vue'
import FallbackMessage from './messages/FallbackMessage.vue'
import ProductMessage from './messages/ProductMessage.vue'
import RatingCard from './messages/RatingCard.vue'
import FormCard from './messages/FormCard.vue'
import UserInputCard from './messages/UserInputCard.vue'
import type { WidgetMessage } from '../../types/widget'

const props = defineProps<{
    message: WidgetMessage
    index: number
    /** It arrived on its own while the panel was showing. */
    fresh?: boolean
}>()

const COMPONENT_FOR: Record<MessageKind, Component> = {
    user: UserBubble,
    answer: AnswerMessage,
    handover: HandoverCard,
    human: HumanMessage,
    joined: JoinedDivider,
    system: JoinedDivider,
    product: ProductMessage,
    rating: RatingCard,
    form: FormCard,
    userInput: UserInputCard,
    fallback: FallbackMessage,
}

const component = computed(() => COMPONENT_FOR[messageKind(props.message)])
</script>

<template>
    <component :is="component" :message="message" :index="index" :class="{ 'cm-enter': fresh }" />
</template>
