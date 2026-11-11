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
// A workflow question answered in free text: the question, a box and Submit
// (Ctrl/Cmd+Enter too); once answered, the answer and any confirmation. The
// controller sends it (useWorkflowScreens.handleUserInputSubmit).
import { computed, inject, useId } from 'vue'
import { WIDGET_CTX } from '../controller'
import { PANEL_COPY } from '../../copy'
import type { WidgetMessage } from '../../../types/widget'

const props = defineProps<{ message: WidgetMessage; index: number }>()

const ctrl = inject(WIDGET_CTX)!

const promptId = useId()
const prompt = computed(() => (props.message.attributes?.prompt_message || '').trim())
const confirmation = computed(() => (props.message.attributes?.confirmation_message || '').trim())
const canSubmit = computed(() => !!props.message.userInputValue?.trim())

const submit = () => {
    if (canSubmit.value) void ctrl.handleUserInputSubmit(props.message)
}
</script>

<template>
    <div class="message agent-message cm-question">
        <p v-if="prompt" :id="promptId" class="message-bubble cm-question__prompt">{{ prompt }}</p>
        <form v-if="!message.isSubmitted && index >= 0" class="cm-question__form" @submit.prevent="submit">
            <textarea
                v-model="message.userInputValue"
                class="cm-field cm-question__field"
                rows="3"
                :aria-label="prompt ? undefined : PANEL_COPY.yourAnswer"
                :aria-labelledby="prompt ? promptId : undefined"
                :placeholder="PANEL_COPY.answerPlaceholder"
                @keydown.enter.ctrl.prevent="submit"
                @keydown.enter.meta.prevent="submit"
            ></textarea>
            <button type="submit" class="cm-primary cm-press" :disabled="!canSubmit">{{ PANEL_COPY.submit }}</button>
        </form>
        <div v-else class="cm-question__answer">
            <p class="cm-question__label">{{ PANEL_COPY.yourAnswer }}</p>
            <p class="cm-question__value">{{ message.submittedValue }}</p>
            <p v-if="confirmation" class="cm-question__confirmation">{{ confirmation }}</p>
        </div>
    </div>
</template>

<style scoped>
.cm-question__prompt { margin: 0; }
.cm-question__form { display: flex; flex-direction: column; gap: 8px; }
.cm-question__field { padding-top: 10px; padding-bottom: 10px; resize: vertical; }
.cm-question__answer { display: flex; flex-direction: column; gap: 4px; }
.cm-question__label, .cm-question__value, .cm-question__confirmation { margin: 0; }
</style>
