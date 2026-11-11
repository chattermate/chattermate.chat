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

import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { postToHost } from '../webclient/host-bridge'
import type { WidgetController, WidgetControllerProps, WidgetViewHooks } from '../webclient/panel/controller'
import { useWidgetCustomization } from './useWidgetCustomization'
import { useCurrency } from './useCurrency'
import { useWidgetSocket } from './useWidgetSocket'
import { useHostPrompt } from './useHostPrompt'
import { useTypewriter } from './useTypewriter'
import { useUnreadBadge } from './useUnreadBadge'
import { useEmailGate } from './useEmailGate'
import { useWidgetAuth } from './useWidgetAuth'
import { useWidgetStyles } from './useWidgetStyles'
import { useWidgetFiles } from './useWidgetFiles'
import { useComposer } from './useComposer'
import { useEndChat } from './useEndChat'
import { useRating } from './useRating'
import { useWorkflowScreens } from './useWorkflowScreens'
import { useHostMessages } from './useHostMessages'
import { useNewChat } from './useNewChat'
import { useWidgetPresentation } from './useWidgetPresentation'
import { useWidgetDisplay } from './useWidgetDisplay'

export type { WidgetControllerProps }

// Only these keys of a composable reach the views.
const pick = <T extends object, K extends keyof T>(source: T, ...keys: K[]) =>
    Object.fromEntries(keys.map((key) => [key, source[key]])) as Pick<T, K>

/**
 * Everything the chat widget does, for whichever view renders it: the socket, the
 * visitor's identity, the host page, the composer, workflow screens, rating and
 * display. Call once, in the widget root's setup; its lifecycle hooks belong there.
 * The composables are created in the order the widget always created them, since
 * several register window listeners and watchers at once. DOM work (scrolling,
 * focus, the classic view's input listeners) belongs to the view: see registerView.
 */
export function useWidgetController(props: WidgetControllerProps): WidgetController {
    // Get widget ID from props or initial data
    const widgetId = computed(() => props.widgetId || window.__INITIAL_DATA__?.widgetId)
    const isWorkflowAgent = () => !!window.__INITIAL_DATA__?.workflow

    // The rendering view's DOM hooks; no-ops until it registers (during its setup,
    // before anything can call them).
    const view: WidgetViewHooks = { scrollToBottom: () => {}, focusComposer: () => {}, afterSend: () => {} }
    const registerView = (hooks: WidgetViewHooks) => { Object.assign(view, hooks) }
    let markReady = () => {}
    const ready = new Promise<void>((resolve) => { markReady = resolve })

    const { customization, agentName, applyCustomization, initializeFromData } = useWidgetCustomization()
    const { formatCurrency } = useCurrency()

    // Aurora is the new dark ask-me-anything design (shares the ASK_ANYTHING flow).
    const isAuroraStyle = computed(() => customization.value.chat_style === 'AURORA')
    const isAskAnythingStyle = computed(() => customization.value.chat_style === 'ASK_ANYTHING' || isAuroraStyle.value)

    const socket = useWidgetSocket()
    const { messages, loading, errorMessage, showError, loadingHistory, hasStartedChat, connectionStatus, humanAgent } = socket

    // Page messages, in-app actions and journeys. A tapped text reply goes through
    // the composer, which is set up further down.
    const hostPrompt = useHostPrompt({
        messages, loading, on: socket.on, emit: socket.emit,
        sendQuickAction: (text) => composer.sendQuickAction(text),
    })

    // Client-side typewriter reveal for live agent/bot replies; keep the view pinned
    // to the bottom as text grows.
    const { displayText, isStreaming } = useTypewriter(messages, () => nextTick(() => view.scrollToBottom()))

    // Report unread agent messages (received while minimized) to the embedder badge.
    useUnreadBadge(messages)

    const isExpanded = ref(true)

    // checkAuthorization is set up just below; it only runs on submit.
    const emailGate = useEmailGate({ customization, isAskAnythingStyle, hasStartedChat, authorize: () => auth.checkAuthorization() })

    const initialData = window.__INITIAL_DATA__
    const allowAttachments = ref(false)
    if (initialData?.allowAttachments !== undefined) {
        allowAttachments.value = initialData.allowAttachments
    }

    const auth = useWidgetAuth({
        widgetId,
        initialAuthError: props.initialAuthError,
        emailInput: emailGate.emailInput,
        allowAttachments,
        agentName,
        applyCustomization,
        socket,
    })
    initializeFromData()
    auth.startTokenLifecycle()

    const styles = useWidgetStyles(customization)
    const files = useWidgetFiles(auth.token)

    // The message box: typing, sending, and a message held while a reply is coming.
    const composer = useComposer({
        socket: { loading, hasStartedChat, connectionStatus, sendMessage: socket.sendMessage },
        emailGate,
        hasConversationToken: auth.hasConversationToken,
        isAskAnythingStyle,
        uploadedAttachments: files.uploadedAttachments,
        authorize: () => auth.checkAuthorization(),
        beforeSend: hostPrompt.takeAnsweredPrompt,
        afterSend: () => view.afterSend(),
        isWorkflowAgent,
    })

    const endChat = useEndChat({
        widgetId, token: auth.token, messages, humanAgent, agentName, currentSessionId: socket.currentSessionId,
    })

    // The end-of-chat star rating.
    const rating = useRating({ messages, submitRating: socket.submitRating })

    // Workflow screens: landing page, full-screen form, inline forms, free-text questions.
    const workflow = useWorkflowScreens({
        messages,
        currentForm: socket.currentForm,
        submitForm: socket.submitForm,
        proceedWorkflow: socket.proceedWorkflow,
        sendMessage: socket.sendMessage,
        emailInput: emailGate.emailInput,
        isWorkflowAgent,
    })

    // Ask the embedder to minimize the widget (reuses the launcher toggle on that side).
    const minimizeWidget = () => {
        postToHost({ type: 'WIDGET_MINIMIZE' })
    }

    // Must register now, during setup (see useHostMessages). The display composable
    // is set up last; its refs are only touched when a message arrives.
    useHostMessages({
        scrollToBottom: () => view.scrollToBottom(),
        endChatForHost: endChat.endChatForHost,
        continueAnonymously: auth.continueAnonymously,
        adoptHostToken: auth.adoptHostToken,
        setHostVisible: (open) => { display.hostVisible.value = open },
        setParentDisplay: (geometry) => { display.parentDisplay.value = geometry },
        prefill: (text) => {
            composer.newMessage.value = text
            nextTick(() => view.focusComposer())
        },
    })

    // The "New chat" control and the workflow's "start a new conversation" button.
    const newChat = useNewChat({
        customization,
        conversation: { messages, humanAgent, endChat: socket.endChat, getWorkflowState: socket.getWorkflowState },
        showEmailGate: emailGate.showEmailGate,
        initializeWidget: auth.initializeWidget,
        clearComposer: composer.clearComposer,
    })

    onMounted(async () => {
        await auth.initializeWidget()
        // Socket callbacks: re-authorize on takeover or refusal, report the session,
        // follow the workflow.
        auth.registerSocketCallbacks()
        socket.onWorkflowState(workflow.handleWorkflowState)
        socket.onWorkflowProceeded(() => {})
        markReady()
    })

    // The view's own unmount (its listeners) runs first: a child unmounts before its root.
    onUnmounted(() => {
        // Stop the token refresh timer with everything else, or it outlives the widget.
        auth.stopTokenLifecycle()
        newChat.disarmNewChat()
        socket.cleanup()
    })

    const presentation = useWidgetPresentation({
        customization,
        agentName,
        humanAgent,
        isAuroraStyle,
        isAskAnythingStyle,
        messages,
        loadingHistory,
        showEmailGate: emailGate.showEmailGate,
        shouldShowNewConversationOption: workflow.shouldShowNewConversationOption,
        allowAttachments,
        uploadedAttachments: files.uploadedAttachments,
    })

    // Display geometry, host visibility and the surface on screen (Ask AI palette or chat).
    const display = useWidgetDisplay({
        customization,
        isAskAnythingStyle,
        allowAttachments,
        isExpanded,
        messages,
        gatingScreens: [
            workflow.showLandingPage, workflow.showFullScreenForm, emailGate.showEmailGate,
            workflow.shouldShowNewConversationOption,
        ],
        viewportWidth: () => window.innerWidth,
        reportSurface: (palette) => postToHost({ type: 'WIDGET_SURFACE', palette }),
    })

    return {
        ready, registerView,
        widgetId, customization, agentName, formatCurrency, isAuroraStyle, isAskAnythingStyle, isExpanded,
        minimizeWidget, ...styles, ...presentation,
        ...pick(display, 'containerStyles', 'hostVisible', 'useAskAiPanel', 'askAiHotkey'),
        ...pick(auth, 'isInitializing', 'hasConversationToken', 'authError', 'showAuthError',
            'isApiKeyAuthRequired', 'handleReconnect'),
        connectionStatus, errorMessage, showError,
        messages, loading, loadingHistory, hasStartedChat, humanAgent, displayText, isStreaming, ...rating,
        ...pick(composer, 'newMessage', 'secretInMessage', 'isMessageInputEnabled', 'canTypeMessage',
            'placeholderText', 'sendMessage', 'sendQuickAction', 'handleKeyPress'),
        ...files,
        ...pick(hostPrompt, 'pendingConfirm', 'approveAction', 'declineAction', 'receiptsAfter',
            'journeyProgress', 'chipBusy', 'skipStep', 'dismissJourney', 'shownPrompt', 'replyChips',
            'onPageChip', 'promptPlace'),
        receiptCount: computed(() => hostPrompt.receipts.value.length),
        ...pick(emailGate, 'emailInput', 'emailGateError', 'submittingEmail', 'shouldCollectEmail',
            'showEmailGate', 'submitEmailGate'),
        ...pick(workflow, 'showLandingPage', 'landingPageData', 'workflowButtonText', 'showFullScreenForm',
            'fullScreenFormData', 'formData', 'formErrors', 'isSubmittingForm', 'shouldShowNewConversationOption',
            'handleLandingPageProceed', 'handleFormSubmit', 'handleFieldChange', 'submitFullScreenForm',
            'handleUserInputSubmit'),
        ...newChat,
    }
}
