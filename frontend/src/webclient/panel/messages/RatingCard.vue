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
 * The end-of-chat rating (plan G4): "Sorted. How did we do?" with five numbered
 * buttons from "Not good" to "Excellent", each named "N out of 5". Picking one
 * opens an optional feedback note and "Submit Rating"; the same rating flow as the
 * classic stars (useRating through the controller). Keeps the rating-message and
 * star-button hooks.
 */
import { computed, inject } from 'vue'
import { WIDGET_CTX } from '../controller'
import { PANEL_COPY } from '../../copy'
import type { WidgetMessage } from '../../../types/widget'

const props = defineProps<{ message: WidgetMessage; index: number }>()

const ctrl = inject(WIDGET_CTX)!
const { isSubmittingRating, hoverRating } = ctrl

const SCALE = [1, 2, 3, 4, 5]
const FEEDBACK_MAX = 500

const submitted = computed(() => !!props.message.isSubmitted)
// The number shown as chosen: the submitted one, else the one picked.
const chosen = computed(() => (submitted.value ? props.message.finalRating : props.message.selectedRating) ?? 0)
const name = computed(() =>
    props.message.agent_name || ctrl.humanAgent.value.human_agent_name || ctrl.agentName.value)

const pick = (rating: number) => {
    if (!submitted.value) void ctrl.handleStarClick(rating)
}

const submit = () => {
    const rating = props.message.selectedRating || hoverRating.value
    void ctrl.handleSubmitRating(props.message.session_id, rating, props.message.feedback)
}
</script>

<template>
    <div class="message rating-message cm-rating">
        <div class="cm-rating__head">
            <span class="cm-rating__check" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"></path></svg>
            </span>
            <p class="cm-rating__title">{{ PANEL_COPY.ratingTitle }}</p>
        </div>
        <p class="cm-rating__prompt">{{ PANEL_COPY.ratingPrompt(name) }}</p>
        <div class="cm-rating__scale" role="group" :aria-label="PANEL_COPY.ratingTitle">
            <button
                v-for="n in SCALE"
                :key="n"
                type="button"
                class="star-button cm-rating__option"
                :class="{ 'is-chosen': n === chosen }"
                :aria-label="PANEL_COPY.ratingOption(n)"
                :aria-pressed="n === chosen"
                :disabled="isSubmittingRating || submitted"
                @click="pick(n)"
            >{{ n }}</button>
        </div>
        <div class="cm-rating__ends" aria-hidden="true">
            <span>{{ PANEL_COPY.ratingLow }}</span><span>{{ PANEL_COPY.ratingHigh }}</span>
        </div>
        <div v-if="message.showFeedback && !submitted" class="cm-rating__feedback">
            <input
                v-model="message.feedback"
                class="cm-field"
                :aria-label="PANEL_COPY.ratingFeedbackLabel"
                :placeholder="PANEL_COPY.ratingFeedbackPlaceholder"
                :maxlength="FEEDBACK_MAX"
                :disabled="isSubmittingRating"
            >
            <span class="cm-rating__count" aria-hidden="true">{{ message.feedback?.length || 0 }}/{{ FEEDBACK_MAX }}</span>
            <button type="button" class="cm-primary cm-press" :disabled="isSubmittingRating || !chosen" @click="submit">
                {{ isSubmittingRating ? PANEL_COPY.ratingSubmitting : PANEL_COPY.ratingSubmit }}
            </button>
        </div>
        <p v-if="submitted" class="cm-rating__done" role="status">
            {{ message.finalFeedback || PANEL_COPY.ratingThanks }}
        </p>
    </div>
</template>

<style scoped>
.cm-rating { display: flex; flex-direction: column; gap: 10px; padding: 14px; }
.cm-rating__head { display: flex; align-items: center; gap: 10px; }
.cm-rating__check { width: 26px; height: 26px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
.cm-rating__title, .cm-rating__prompt, .cm-rating__done { margin: 0; }
.cm-rating__scale { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 6px; }
.cm-rating__option { height: 40px; }
.cm-rating__ends { display: flex; justify-content: space-between; }
.cm-rating__feedback { display: flex; flex-direction: column; gap: 6px; }
.cm-rating__count { align-self: flex-end; }
</style>
