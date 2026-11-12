/*
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
*/

import { computed, ref, type Ref } from 'vue'
import { isValidEmail } from '../types/widget'
import type { AgentCustomization } from '../types/agent'

export const EMAIL_MISSING_TEXT = 'Please enter your email address.'
export const EMAIL_INVALID_TEXT = 'Please enter a valid email address.'
export const EMAIL_GATE_FAILED_TEXT = 'Something went wrong. Please try again.'

export interface EmailGateOptions {
    customization: Ref<Partial<AgentCustomization>>
    /** The gate-less Ask AI layouts never collect an email. */
    isAskAnythingStyle: Readonly<Ref<boolean>>
    hasStartedChat: Ref<boolean>
    /** Sends the email to the backend (associates it and (re)connects the socket). */
    authorize: () => Promise<unknown>
    /**
     * The panel keeps its email card up when the server refuses or fails
     * the email (the authorize call answers false): it clears the widget-wide error
     * that refusal raised and returns true, and the card says to try again. Returns
     * false when the refusal must show as it is (a widget that is not set up).
     */
    recoverRefusal?: () => boolean
}

/** The message shown for an email the visitor typed, or '' when it can be sent. */
export const emailGateProblem = (email: string): string => {
    if (!email) return EMAIL_MISSING_TEXT
    if (!isValidEmail(email)) return EMAIL_INVALID_TEXT
    return ''
}

/**
 * Pre-chat email gate. When the agent collects email, a small form shows first (like
 * a workflow step); the chat (welcome message, quick actions, input) only appears once
 * a valid email is submitted, so quick actions can never fire before it is captured.
 */
export function useEmailGate({
    customization, isAskAnythingStyle, hasStartedChat, authorize, recoverRefusal,
}: EmailGateOptions) {
    const emailInput = ref('')
    const emailCollected = ref(false)
    const emailGateError = ref('')
    const submittingEmail = ref(false)

    // Only when the agent opts in (and never for the gate-less Ask AI layout).
    const shouldCollectEmail = computed(() =>
        customization.value.collect_email === true && !isAskAnythingStyle.value)

    const showEmailGate = computed(() =>
        !hasStartedChat.value && shouldCollectEmail.value && !emailCollected.value)

    const submitEmailGate = async () => {
        const email = emailInput.value.trim()
        const problem = emailGateProblem(email)
        if (problem) {
            emailGateError.value = problem
            return
        }
        emailGateError.value = ''
        submittingEmail.value = true
        try {
            const accepted = await authorize()
            if (accepted === false && recoverRefusal?.()) {
                emailGateError.value = EMAIL_GATE_FAILED_TEXT
                return
            }
            emailCollected.value = true
        } catch {
            emailGateError.value = EMAIL_GATE_FAILED_TEXT
        } finally {
            submittingEmail.value = false
        }
    }

    // The same submit, ignored while one is in flight (the panel's card and its held
    // sends both submit).
    const submitEmailOnce = async () => {
        if (submittingEmail.value) return
        await submitEmailGate()
    }

    return {
        emailInput,
        emailCollected,
        emailGateError,
        submittingEmail,
        shouldCollectEmail,
        showEmailGate,
        submitEmailGate,
        submitEmailOnce,
    }
}

export type EmailGate = ReturnType<typeof useEmailGate>
