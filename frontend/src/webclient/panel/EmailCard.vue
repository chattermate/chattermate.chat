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
 * The inline email card, above the start state (or the conversation) while the
 * agent collects email. The suggestions and the composer stay usable around it,
 * but a send waits (useComposer's holdForEmail) until the email is in, then goes
 * out by itself: nothing reaches the agent before the email does. A refused or
 * failed submit keeps the card up with a retryable error. The placeholder and
 * button text stay as the classic gate's (the e2e page object uses them).
 */
import { computed, inject, nextTick, ref, useId, watch } from 'vue'
import { WIDGET_CTX } from './controller'
import { PANEL_COPY } from '../copy'

const ctrl = inject(WIDGET_CTX)!
const { emailGateError, submittingEmail, heldForEmail } = ctrl

const card = ref<HTMLFormElement | null>(null)
const field = ref<HTMLInputElement | null>(null)
const errorId = useId()
const hasError = computed(() => !!emailGateError.value)
// The live regions stay mounted and only their text changes, so it is announced.
const heldText = computed(() => (heldForEmail.value ? PANEL_COPY.emailHeld : ''))

const submit = () => { void ctrl.submitEmailOnce() }
const clearError = () => { ctrl.emailGateError.value = '' }

/** Focus the email field (the panel calls this when it opens). */
const focus = () => field.value?.focus()
/** Whether focus is anywhere in the card (the panel moves it on when the card goes). */
const hasFocus = () => !!card.value && card.value.contains(document.activeElement)

// A refused address, from Continue or from a held send: the visitor fixes it here,
// once the field is enabled again (it is disabled while the submit is in flight).
watch([emailGateError, submittingEmail], ([error, submitting]) => {
    if (error && !submitting) nextTick(focus)
})

defineExpose({ focus, hasFocus })
</script>

<template>
    <form ref="card" class="cm-email-card cm-enter" novalidate @submit.prevent="submit">
        <p class="cm-email-card__title">{{ PANEL_COPY.emailTitle }}</p>
        <p class="cm-email-card__text">{{ PANEL_COPY.emailText }}</p>
        <div class="cm-email-card__row">
            <input
                ref="field"
                v-model="ctrl.emailInput.value"
                class="cm-field cm-email-card__field"
                :class="{ 'is-invalid': hasError }"
                type="email"
                inputmode="email"
                autocomplete="email"
                :aria-label="PANEL_COPY.emailLabel"
                :aria-invalid="hasError"
                :aria-describedby="hasError ? errorId : undefined"
                :placeholder="PANEL_COPY.emailPlaceholder"
                :disabled="submittingEmail"
                @input="clearError"
            >
            <button type="submit" class="cm-primary cm-press" :disabled="submittingEmail">
                {{ submittingEmail ? PANEL_COPY.emailWait : PANEL_COPY.emailContinue }}
            </button>
        </div>
        <div class="cm-email-card__notes">
            <p :id="errorId" class="cm-email-card__error" role="alert">{{ emailGateError }}</p>
            <p class="cm-email-card__held" role="status">{{ heldText }}</p>
        </div>
    </form>
</template>

<style scoped>
.cm-email-card { display: flex; flex-direction: column; gap: 6px; padding: 12px; margin: 12px 14px 0; flex-shrink: 0; }
.cm-email-card__title, .cm-email-card__text, .cm-email-card__error, .cm-email-card__held { margin: 0; }
.cm-email-card__row { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 2px; }
.cm-email-card__field { flex: 1 1 180px; min-width: 0; }
.cm-email-card__notes { display: flex; flex-direction: column; gap: 4px; }
</style>
