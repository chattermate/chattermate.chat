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
 * STOPGAP until the inline email card (plan 1.3): the classic email gate's step,
 * driven by the controller's email-gate state. Same placeholder and button text,
 * which the e2e page object relies on.
 */
import { computed, inject, ref } from 'vue'
import { WIDGET_CTX } from '../controller'
import { PANEL_COPY } from '../../copy'

const ctrl = inject(WIDGET_CTX)!
const { emailGateError, submittingEmail } = ctrl

const field = ref<HTMLInputElement | null>(null)

const title = computed(() => ctrl.customization.value.welcome_title || PANEL_COPY.emailTitle)
const submit = () => { void ctrl.submitEmailGate() }
const clearError = () => { ctrl.emailGateError.value = '' }

/** Focus the email field (the panel calls this when it opens). */
const focus = () => field.value?.focus()
defineExpose({ focus })
</script>

<template>
    <form class="cm-email" novalidate @submit.prevent="submit">
        <p class="cm-email__title">{{ title }}</p>
        <p class="cm-email__text">{{ PANEL_COPY.emailText }}</p>
        <input
            ref="field"
            v-model="ctrl.emailInput.value"
            class="cm-field"
            :class="{ 'is-invalid': !!emailGateError }"
            type="email"
            inputmode="email"
            autocomplete="email"
            :aria-label="PANEL_COPY.emailLabel"
            :aria-invalid="!!emailGateError"
            :placeholder="PANEL_COPY.emailPlaceholder"
            :disabled="submittingEmail"
            @input="clearError"
        >
        <p v-if="emailGateError" class="cm-email__error" role="alert">{{ emailGateError }}</p>
        <button type="submit" class="cm-primary cm-press" :disabled="submittingEmail">
            {{ submittingEmail ? PANEL_COPY.emailWait : PANEL_COPY.emailContinue }}
        </button>
    </form>
</template>

<style scoped>
.cm-email { flex-grow: 1; display: flex; flex-direction: column; justify-content: center; gap: 10px; padding: 24px 18px; }
.cm-email__title, .cm-email__text, .cm-email__error { margin: 0; }
</style>
