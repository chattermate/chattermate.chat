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
 * The email check card: the visitor's email, then the 6-digit code sent to it,
 * then a confirmation. The agent asked for it (confirm_email); once confirmed the
 * visitor's message says so and the agent can show their orders. Errors say what
 * to do next, and a spent or expired code goes back to the email step.
 */
import { computed, inject, nextTick, ref, watch } from 'vue'
import { WIDGET_CTX } from '../controller'
import { PANEL_COPY } from '../../copy'

const ctrl = inject(WIDGET_CTX)!
const { emailCheck } = ctrl

const email = ref('')
const code = ref('')
const codeField = ref<HTMLInputElement | null>(null)

const error = computed(() => {
    const reason = emailCheck.value.error
    if (!reason) return ''
    const text = PANEL_COPY.emailCheckErrors[reason] || PANEL_COPY.emailCheckErrors.send_failed
    return reason === 'wrong_code' && emailCheck.value.attemptsLeft
        ? `${text} ${PANEL_COPY.attemptsLeft(emailCheck.value.attemptsLeft)}` : text
})
const codeReady = computed(() => /^[0-9]{6}$/.test(code.value))

watch(() => emailCheck.value.stage, (stage) => {
    if (stage === 'code') {
        code.value = ''
        nextTick(() => codeField.value?.focus())
    }
})

const onCodeInput = () => {
    code.value = code.value.replace(/[^0-9]/g, '').slice(0, 6)
    if (codeReady.value) ctrl.verifyEmailCode(code.value)
}
</script>

<template>
    <section class="cm-email-check" :aria-label="PANEL_COPY.emailCheckTitle">
        <p v-if="emailCheck.stage === 'verified'" class="cm-email-check__done" role="status">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"></path></svg>
            {{ PANEL_COPY.emailCheckDone(emailCheck.maskedEmail) }}
        </p>
        <template v-else>
            <p class="cm-email-check__title">{{ PANEL_COPY.emailCheckTitle }}</p>
            <form v-if="emailCheck.stage === 'email'" class="cm-email-check__form" novalidate @submit.prevent="ctrl.startEmailCheck(email)">
                <p class="cm-email-check__text">{{ PANEL_COPY.emailCheckText }}</p>
                <label class="cm-sr-only" for="cm-email-check-email">{{ PANEL_COPY.emailLabel }}</label>
                <input id="cm-email-check-email" v-model="email" class="cm-email-check__input" type="email"
                       autocomplete="email" inputmode="email" :placeholder="PANEL_COPY.emailPlaceholder"
                       :aria-invalid="!!error" :aria-describedby="error ? 'cm-email-check-error' : undefined">
                <button type="submit" class="cm-email-check__submit cm-press" :disabled="emailCheck.busy || !email.trim()">
                    {{ emailCheck.busy ? PANEL_COPY.emailCheckSending : PANEL_COPY.emailCheckSend }}
                </button>
            </form>
            <form v-else class="cm-email-check__form" novalidate @submit.prevent="ctrl.verifyEmailCode(code)">
                <p class="cm-email-check__text">{{ PANEL_COPY.emailCheckCodeText(emailCheck.maskedEmail) }}</p>
                <label class="cm-sr-only" for="cm-email-check-code">{{ PANEL_COPY.emailCheckCodeLabel }}</label>
                <input id="cm-email-check-code" ref="codeField" v-model="code" class="cm-email-check__input cm-email-check__code"
                       type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="6" pattern="[0-9]{6}"
                       :aria-invalid="!!error" :aria-describedby="error ? 'cm-email-check-error' : undefined" @input="onCodeInput">
                <button type="submit" class="cm-email-check__submit cm-press" :disabled="emailCheck.busy || !codeReady">
                    {{ PANEL_COPY.emailCheckVerify }}
                </button>
                <span class="cm-email-check__links">
                    <button type="button" class="cm-email-check__link" :disabled="emailCheck.busy" @click="ctrl.restartEmailCheck">{{ PANEL_COPY.emailCheckOtherEmail }}</button>
                    <button type="button" class="cm-email-check__link" :disabled="emailCheck.busy" @click="ctrl.startEmailCheck(email)">{{ PANEL_COPY.emailCheckResend }}</button>
                </span>
            </form>
            <p v-if="error" id="cm-email-check-error" class="cm-email-check__error" role="alert">{{ error }}</p>
        </template>
    </section>
</template>

<style scoped>
.cm-email-check { display: flex; flex-direction: column; gap: 8px; padding: 14px; }
.cm-email-check__form { display: flex; flex-direction: column; gap: 8px; margin: 0; }
.cm-email-check__title, .cm-email-check__text, .cm-email-check__error, .cm-email-check__done { margin: 0; }
.cm-email-check__done { display: flex; align-items: center; gap: 6px; }
.cm-email-check__links { display: flex; gap: 14px; }
</style>
