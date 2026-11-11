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
import type { AgentCustomization } from '../types/agent'
import type { HumanAgent, WidgetMessage } from '../types/widget'
import type { WidgetController } from '../webclient/panel/controller'
import type { PreviewConversation } from '../webclient/panel/preview-sample'
import { NO_HOST_CAPABILITIES } from './useHostMessages'
import { followUpsOn } from '../webclient/widget-answers'
import { emptyHistory } from './useConversationHistory'
import { useCurrency } from './useCurrency'
import { useWidgetPresentation } from './useWidgetPresentation'
import { useWidgetStyles } from './useWidgetStyles'

/** What the dashboard knows that the widget would learn from its startup data. */
export interface PreviewContext {
    /** Any non-empty id: the panel renders only for a widget it knows. */
    widgetId: Readonly<Ref<string>>
    agentName: Readonly<Ref<string>>
    /** The agent's photo, or the dashboard's orb stand-in. */
    photoUrl: Readonly<Ref<string>>
    /** The plan's branding, as the server decides it for the live widget. */
    showBranding: Readonly<Ref<boolean>>
    /** The preview box, px. */
    width: Readonly<Ref<number>>
    height: Readonly<Ref<number>>
    /** The org's live help center, or null. */
    helpCenterUrl?: Readonly<Ref<string | null>>
}

const noop = () => {}

/** The sample as shown: its follow-up chips dropped while follow-ups are off. */
const withFollowUps = (messages: WidgetMessage[], on: boolean): WidgetMessage[] =>
    on ? messages : messages.map((message) => {
        if (!message.attributes?.quick_replies) return message
        const { quick_replies: _dropped, ...attributes } = message.attributes
        return { ...message, attributes }
    })
const asyncNoop = async () => {}
// The fields whose edit only shows on the start state, so the preview goes there.
// Unset, null, '' and [] are all "none": the form and the server fill them in
// differently on load and after a save, and neither is an edit.
const startStateFields = (c: Partial<AgentCustomization>) => JSON.stringify([
    c.welcome_title || '', c.welcome_subtitle || '', c.welcome_message || '',
    (c.quick_actions || []).filter(action => !!action),
])

/**
 * The widget controller for the dashboard preview: the redesigned panel drawn from
 * the agent's (unsaved) customization and a sample conversation, with no socket,
 * no visitor and no host page. Every action is inert: nothing is sent or stored.
 * The look comes from the same composables as the live widget, so the two match.
 *
 * It shows the sample conversation; an edit to the welcome text or quick actions
 * shows the start state, where they are, until a quick action brings the sample back.
 */
export function usePreviewController(
    customization: Readonly<Ref<Partial<AgentCustomization>>>,
    sampleConversation: PreviewConversation,
    context: PreviewContext,
): WidgetController {
    const isAuroraStyle = computed(() => customization.value.chat_style === 'AURORA')
    const isAskAnythingStyle = computed(() => customization.value.chat_style === 'ASK_ANYTHING' || isAuroraStyle.value)

    const showingStart = ref(false)
    watch(() => startStateFields(customization.value), () => { showingStart.value = true })
    // The Ask AI designs open on their palette with nothing asked yet, as in the classic preview.
    // Follow-up chips under the sample answer only when the agent turned them on.
    const messages = computed<WidgetMessage[]>(() =>
        showingStart.value || isAskAnythingStyle.value
            ? []
            : withFollowUps(sampleConversation.messages, followUpsOn(customization.value)))
    const receipts = computed(() => (messages.value.length ? sampleConversation.receipts : []))

    const humanAgent = ref<HumanAgent>({})
    const presentation = useWidgetPresentation({
        customization: customization as Ref<Partial<AgentCustomization>>,
        agentName: context.agentName as Ref<string>,
        humanAgent,
        isAuroraStyle,
        isAskAnythingStyle,
        messages,
        loadingHistory: ref(false),
        showEmailGate: ref(false),
        shouldShowNewConversationOption: ref(false),
        allowAttachments: ref(false),
        uploadedAttachments: ref([]),
    })
    const styles = useWidgetStyles(customization as Ref<Partial<AgentCustomization>>)
    const { formatCurrency } = useCurrency()

    const showSample = () => { showingStart.value = false }
    const showStart = () => { showingStart.value = true }

    return {
        ready: Promise.resolve(),
        registerView: noop,

        // look
        widgetId: context.widgetId,
        customization,
        ui: presentation.ui,
        agentName: context.agentName,
        isAuroraStyle,
        isAskAnythingStyle,
        isExpanded: ref(true),
        chatStyles: styles.chatStyles,
        chatIconStyles: styles.chatIconStyles,
        agentBubbleStyles: styles.agentBubbleStyles,
        userBubbleStyles: styles.userBubbleStyles,
        messageNameStyles: styles.messageNameStyles,
        headerBorderStyles: styles.headerBorderStyles,
        shadowStyle: styles.shadowStyle,
        containerStyles: computed(() => ({
            width: `${context.width.value}px`,
            height: `${context.height.value}px`,
            borderRadius: 'var(--cm-radius, 24px)',
        })),
        themeClass: presentation.themeClass,
        themeVars: presentation.themeVars,
        photoUrl: context.photoUrl,
        humanAgentPhotoUrl: presentation.humanAgentPhotoUrl,
        isHandedOverToHuman: presentation.isHandedOverToHuman,
        useOrbAvatar: presentation.useOrbAvatar,
        orbStyle: presentation.orbStyle,
        presence: presentation.presence,
        showBranding: context.showBranding,
        helpCenterUrl: context.helpCenterUrl ?? ref(null),
        showCitations: presentation.showCitations,
        showAiDisclaimer: presentation.showAiDisclaimer,
        quickActions: presentation.quickActions,
        welcomeMessageText: presentation.welcomeMessageText,
        showWelcomeBlock: presentation.showWelcomeBlock,
        showQuickActions: presentation.showQuickActions,
        shouldShowWelcomeMessage: presentation.shouldShowWelcomeMessage,
        askAiSubtitle: presentation.askAiSubtitle,
        // Never "shown by a host": the panel's focus-on-show (the Ask AI box takes
        // focus when visible) would pull the dashboard's focus and scroll into it.
        hostVisible: ref(false),
        // No embed loader: no expand, no frosted backdrop.
        hostCapabilities: ref({ ...NO_HOST_CAPABILITIES }),
        useAskAiPanel: isAskAnythingStyle,
        // The dashboard keeps its own ⌘K.
        askAiHotkey: ref(false),
        formatCurrency,
        minimizeWidget: noop,

        // connection: always connected, never refused
        isInitializing: ref(false),
        hasConversationToken: ref(true),
        authError: ref(null),
        showAuthError: ref(false),
        isApiKeyAuthRequired: ref(false),
        connectionStatus: ref('connected'),
        errorMessage: ref(''),
        showError: ref(false),
        handleReconnect: asyncNoop,

        // conversation: the sample, already revealed
        messages,
        loading: ref(false),
        loadingHistory: ref(false),
        hasStartedChat: computed(() => messages.value.length > 0),
        humanAgent,
        displayText: (_index, fullText) => fullText,
        isStreaming: () => false,
        isRevealing: ref(false),
        skipReveal: noop,
        liveTrace: ref([]),
        sendFeedback: noop,
        requestProductOptions: noop,
        emailCheck: ref({ stage: 'email' as const, busy: false, maskedEmail: '', error: '', retryIn: 0, attemptsLeft: 0 }),
        startEmailCheck: noop,
        verifyEmailCode: noop,
        restartEmailCheck: noop,
        history: ref(emptyHistory()),
        pageSuggestions: ref({ loaded: false, heading: 'popular' as const, pill: null, items: [] }),
        openHistory: noop,
        closeHistory: noop,
        refreshConversations: noop,
        loadMoreConversations: noop,
        searchConversations: noop,
        openConversation: noop,
        closeConversation: noop,
        loadOlderMessages: noop,
        continueConversation: asyncNoop,
        hoverRating: ref(0),
        isSubmittingRating: ref(false),
        handleStarHover: noop,
        handleStarLeave: noop,
        handleStarClick: asyncNoop,
        handleSubmitRating: asyncNoop,

        // composer: typing works, sending does nothing
        newMessage: ref(''),
        secretInMessage: ref(false),
        isMessageInputEnabled: ref(true),
        canTypeMessage: ref(true),
        placeholderText: computed(() => (isAskAnythingStyle.value ? 'Ask me anything...' : 'Type a message...')),
        sendMessage: asyncNoop,
        sendQuickAction: showSample,
        handleKeyPress: (event) => { if (event.key === 'Enter') event.preventDefault() },
        heldForEmail: ref(false),
        uploadedAttachments: ref([]),
        isUploading: ref(false),
        canUploadMore: ref(false),
        maxFiles: presentation.maxFiles,
        acceptTypes: presentation.acceptTypes,
        previewModal: ref(false),
        previewFile: ref(null),
        formatFileSize: (bytes) => `${bytes} B`,
        isImage: (type) => type.startsWith('image/'),
        isImageAttachment: (contentType) => contentType.startsWith('image/'),
        getDownloadUrl: (fileUrl) => fileUrl || '',
        getPreviewUrl: (file) => file.file_url || file.url,
        handleFileSelect: asyncNoop,
        handleDrop: asyncNoop,
        handleDragOver: noop,
        handleDragLeave: noop,
        handlePaste: asyncNoop,
        removeAttachment: asyncNoop,
        openPreview: noop,
        closePreview: noop,

        // host prompt: no page, only the sample's receipt
        pendingConfirm: ref(null),
        approveAction: noop,
        declineAction: noop,
        receiptsAfter: (count) => receipts.value.filter(r => r.after === count).map(r => r.receipt),
        receiptCount: computed(() => receipts.value.length),
        journeyProgress: ref(null),
        chipBusy: ref(false),
        skipStep: noop,
        dismissJourney: noop,
        shownPrompt: ref(null),
        replyChips: ref([]),
        onPageChip: noop,
        promptPlace: { isBefore: () => false, isLast: () => false },

        // screens: the preview leaves out the email gate and workflows, as the classic one does
        emailInput: ref(''),
        emailGateError: ref(''),
        submittingEmail: ref(false),
        shouldCollectEmail: ref(false),
        showEmailGate: ref(false),
        awaitingEmail: ref(false),
        awaitingHistory: ref(false),
        submitEmailGate: asyncNoop,
        submitEmailOnce: asyncNoop,
        showLandingPage: ref(false),
        landingPageData: ref(null),
        workflowButtonText: ref(''),
        showFullScreenForm: ref(false),
        fullScreenFormData: ref(null),
        formData: ref({}),
        formErrors: ref({}),
        isSubmittingForm: ref(false),
        shouldShowNewConversationOption: ref(false),
        handleLandingPageProceed: asyncNoop,
        handleFormSubmit: asyncNoop,
        handleFieldChange: noop,
        submitFullScreenForm: asyncNoop,
        handleUserInputSubmit: asyncNoop,
        // "New chat" (when allowed) goes back to the start state; nothing is ended.
        canStartNewChat: computed(() => customization.value.allow_new_chat === true && messages.value.length > 0),
        startingNewChat: ref(false),
        newChatError: ref(''),
        newChatArmed: ref(false),
        requestNewChat: showStart,
        confirmNewChat: async () => showStart(),
        disarmNewChat: noop,
        handleStartNewConversation: async () => showStart(),
    }
}
