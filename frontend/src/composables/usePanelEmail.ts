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

import { computed, ref, watch, type Ref } from 'vue'

export interface PanelEmailOptions {
    /** The redesigned panel renders (widget_ui version 2). */
    isPanel: Readonly<Ref<boolean>>
    shouldCollectEmail: Readonly<Ref<boolean>>
    hasStartedChat: Readonly<Ref<boolean>>
    /** The widget-wide authorization error a refused email submit raises. */
    auth: {
        isApiKeyAuthRequired: Readonly<Ref<boolean>>
        showAuthError: Ref<boolean>
        authError: Ref<string | null>
    }
}

/**
 * The redesigned panel's inline email card: when it is up, and what a refused
 * email submit does there. Classic widgets get neither (isPanel false).
 *
 * The card is up while the agent collects email and no conversation has started
 * in this session yet. "Started" is sticky: a new chat briefly resets the
 * conversation, and the visitor's email is already known then.
 */
export function usePanelEmail({ isPanel, shouldCollectEmail, hasStartedChat, auth }: PanelEmailOptions) {
    // The server took this visitor's email and the conversation began, once.
    const emailAccepted = ref(false)
    watch(hasStartedChat, (started) => { if (started) emailAccepted.value = true }, { immediate: true })

    const awaitingEmail = computed(() => isPanel.value && shouldCollectEmail.value && !emailAccepted.value)

    /**
     * The server refused or failed the email (500, network error, a 401 after a
     * valid address): keep the card, the composer and any held message, and clear
     * the error that would replace the whole panel. Not for a widget that is not
     * set up (API key required): that one must show.
     */
    const recoverRefusal = (): boolean => {
        if (!isPanel.value || auth.isApiKeyAuthRequired.value) return false
        auth.showAuthError.value = false
        auth.authError.value = null
        return true
    }

    return { awaitingEmail, recoverRefusal }
}
