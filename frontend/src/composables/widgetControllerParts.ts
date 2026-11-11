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

/**
 * The widget controller's seams, kept out of useWidgetController so it reads as
 * the order things are set up in: the view's DOM hooks, and which keys of each
 * composable the views may use (WidgetController).
 */

import { computed } from 'vue'
import type { WidgetViewHooks } from '../webclient/panel/controller'
import type { useWidgetDisplay } from './useWidgetDisplay'
import type { useWidgetAuth } from './useWidgetAuth'
import type { useComposer } from './useComposer'
import type { useHostPrompt } from './useHostPrompt'
import type { EmailGate } from './useEmailGate'
import type { useWorkflowScreens } from './useWorkflowScreens'

// Only these keys of a composable reach the views.
const pick = <T extends object, K extends keyof T>(source: T, ...keys: K[]) =>
    Object.fromEntries(keys.map((key) => [key, source[key]])) as Pick<T, K>

/**
 * The rendering view's DOM hooks (no-ops until it registers, during its setup,
 * before anything can call them), and the promise the view waits on for the end
 * of initialization.
 */
export function useViewHooks() {
    const view: WidgetViewHooks = { scrollToBottom: () => {}, focusComposer: () => {}, afterSend: () => {} }
    const registerView = (hooks: WidgetViewHooks) => { Object.assign(view, hooks) }
    let resolveReady = () => {}
    const ready = new Promise<void>((resolve) => { resolveReady = resolve })
    return { view, registerView, ready, markReady: () => resolveReady() }
}

export interface ViewedParts {
    display: ReturnType<typeof useWidgetDisplay>
    auth: ReturnType<typeof useWidgetAuth>
    composer: ReturnType<typeof useComposer>
    hostPrompt: ReturnType<typeof useHostPrompt>
    emailGate: EmailGate
    workflow: ReturnType<typeof useWorkflowScreens>
}

/** What the views see of the display, auth, composer, page prompt, email gate and workflow. */
export const viewedParts = ({ display, auth, composer, hostPrompt, emailGate, workflow }: ViewedParts) => ({
    ...pick(display, 'containerStyles', 'hostVisible', 'useAskAiPanel', 'askAiHotkey'),
    ...pick(auth, 'isInitializing', 'hasConversationToken', 'authError', 'showAuthError',
        'isApiKeyAuthRequired', 'handleReconnect'),
    ...pick(composer, 'newMessage', 'secretInMessage', 'isMessageInputEnabled', 'canTypeMessage',
        'placeholderText', 'sendMessage', 'sendQuickAction', 'handleKeyPress', 'heldForEmail'),
    ...pick(hostPrompt, 'pendingConfirm', 'approveAction', 'declineAction', 'receiptsAfter',
        'journeyProgress', 'chipBusy', 'skipStep', 'dismissJourney', 'shownPrompt', 'replyChips',
        'onPageChip', 'promptPlace'),
    receiptCount: computed(() => hostPrompt.receipts.value.length),
    ...pick(emailGate, 'emailInput', 'emailGateError', 'submittingEmail', 'shouldCollectEmail',
        'showEmailGate', 'submitEmailGate', 'submitEmailOnce'),
    ...pick(workflow, 'showLandingPage', 'landingPageData', 'workflowButtonText', 'showFullScreenForm',
        'fullScreenFormData', 'formData', 'formErrors', 'isSubmittingForm', 'shouldShowNewConversationOption',
        'handleLandingPageProceed', 'handleFormSubmit', 'handleFieldChange', 'submitFullScreenForm',
        'handleUserInputSubmit'),
})
