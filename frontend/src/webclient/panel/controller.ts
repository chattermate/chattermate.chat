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

import type { InjectionKey, Ref } from 'vue'
import type { AgentCustomization } from '../../types/agent'
import type { HumanAgent, WidgetMessage } from '../../types/widget'
import type { PresenceLine } from '../../utils/widgetPresence'
import type { HostPrompt, PageChip, PendingConfirm } from '../actions/hostActionsClient'
import type { ActionReceipt } from '../actions/receipts'
import type { JourneyProgress } from '../journeys/journeyClient'
import type { ConnectionStatus } from '../../composables/useWidgetSocket'
import type { HostCapabilities } from '../../composables/useHostMessages'
import type { PreviewFile, UploadedFile } from '../../composables/useWidgetFiles'
import type { WorkflowForm, WorkflowMessage } from '../../composables/useWorkflowScreens'
import type { EmailCheckPurpose, EmailCheckState } from '../../composables/useEmailCheck'
import type { HistoryState } from '../../composables/useConversationHistory'
import type { PageSuggestions } from '../../composables/usePageSuggestions'
import type { VisitorFeedback } from './answer-extras'

/** What the widget root is given (by widget.ts, or the dashboard preview). */
export interface WidgetControllerProps {
    widgetId?: string | null
    token?: string | null
    initialAuthError?: string | null
}

/** State a view shows but never writes. */
type Shown<T> = Readonly<Ref<T>>
type CssStyle = Record<string, string>

/** A workflow's landing page. */
export interface LandingPage {
    heading?: string
    content?: string
}

/** What the rendering view does for the controller: DOM work only a view can do. */
export interface WidgetViewHooks {
    /** Pin the message list to its newest message. */
    scrollToBottom: () => void
    /** Focus the message box (after the host prefilled it). */
    focusComposer: () => void
    /** A message was just sent. */
    afterSend: () => void
    /**
     * The embedding page reported the widget open or closed (WIDGET_VISIBILITY),
     * on every report, even one that repeats the current state: the first report
     * after load is an "open" when the visitor clicked the launcher early.
     */
    hostVisibilityReported?: (open: boolean, how?: { cascade: boolean }) => void
}

/** The agent's look, the surfaces on screen and the header. */
export interface WidgetLook {
    widgetId: Shown<string | null | undefined>
    customization: Shown<Partial<AgentCustomization>>
    agentName: Shown<string>
    isAuroraStyle: Shown<boolean>
    isAskAnythingStyle: Shown<boolean>
    isExpanded: Shown<boolean>
    chatStyles: Shown<CssStyle>
    chatIconStyles: Shown<CssStyle>
    agentBubbleStyles: Shown<CssStyle>
    userBubbleStyles: Shown<CssStyle>
    messageNameStyles: Shown<CssStyle>
    headerBorderStyles: Shown<CssStyle>
    shadowStyle: Shown<CssStyle>
    containerStyles: Shown<CssStyle>
    themeClass: Shown<string>
    themeVars: Shown<CssStyle>
    photoUrl: Shown<string>
    humanAgentPhotoUrl: Shown<string>
    /** A person has taken the conversation over from the AI. */
    isHandedOverToHuman: Shown<boolean>
    useOrbAvatar: Shown<boolean>
    orbStyle: Shown<CssStyle>
    presence: Shown<PresenceLine>
    showBranding: Shown<boolean>
    /** The org's live help center (http(s) only), or null. */
    helpCenterUrl: Shown<string | null>
    showCitations: Shown<boolean>
    showAiDisclaimer: Shown<boolean>
    quickActions: Shown<string[]>
    welcomeMessageText: Shown<string>
    showWelcomeBlock: Shown<boolean>
    showQuickActions: Shown<boolean>
    shouldShowWelcomeMessage: Shown<boolean>
    askAiSubtitle: Shown<string>
    /** Whether the embedding page shows the widget at all. */
    hostVisible: Shown<boolean>
    /** What the embed loader can do for the panel (HOST_CAPABILITIES). */
    hostCapabilities: Shown<HostCapabilities>
    /** The Ask AI palette is on screen instead of the chat. */
    useAskAiPanel: Shown<boolean>
    askAiHotkey: Shown<boolean>
    formatCurrency: (price: string | number | null | undefined, currencyCode?: string) => string
    /** Ask the embedding page to minimize the widget. */
    minimizeWidget: () => void
}

/** Whether the widget may talk, and the connection. */
export interface WidgetConnection {
    isInitializing: Shown<boolean>
    hasConversationToken: Shown<boolean>
    authError: Shown<string | null>
    showAuthError: Shown<boolean>
    isApiKeyAuthRequired: Shown<boolean>
    connectionStatus: Shown<ConnectionStatus>
    errorMessage: Shown<string>
    showError: Shown<boolean>
    /** The connection banner's retry. */
    handleReconnect: () => Promise<void>
}

/** The conversation, its live reveal and the end-of-chat rating. */
export interface WidgetConversation {
    /** Views may write fields of a message (form and rating input), not the list. */
    messages: Shown<WidgetMessage[]>
    loading: Shown<boolean>
    loadingHistory: Shown<boolean>
    hasStartedChat: Shown<boolean>
    humanAgent: Shown<HumanAgent>
    displayText: (index: number, fullText: string) => string
    isStreaming: (index: number) => boolean
    /** Whether any reply is still being revealed. */
    isRevealing: Shown<boolean>
    /** Show every reply in full at once (the panel's stop button). */
    skipReveal: () => void
    /** Thumb an AI reply up or down, or take the thumb back (null). */
    sendFeedback: (message: WidgetMessage, value: VisitorFeedback | null) => void
    /** Ask the shop for a product's options, for the product sheet (product-sheet.ts). */
    requestProductOptions: (productId: string) => void
    /** "Suggested for this page" for the start state (usePageSuggestions). */
    pageSuggestions: Shown<PageSuggestions>
    /** "Your conversations": the visitor's own past chats (useConversationHistory). */
    history: Shown<HistoryState>
    openHistory: () => void
    closeHistory: () => void
    refreshConversations: () => void
    loadMoreConversations: () => void
    searchConversations: (query: string) => void
    openConversation: (id: string) => void
    closeConversation: () => void
    loadOlderMessages: () => void
    continueConversation: (id: string) => Promise<void>
    /** The email check: the visitor proves an email is theirs with a code (useEmailCheck). */
    emailCheck: Shown<EmailCheckState>
    startEmailCheck: (email: string, purpose?: EmailCheckPurpose) => void
    verifyEmailCode: (code: string) => void
    restartEmailCheck: () => void
    hoverRating: Shown<number>
    isSubmittingRating: Shown<boolean>
    handleStarHover: (rating: number) => void
    handleStarLeave: () => void
    handleStarClick: (rating: number) => Promise<void>
    handleSubmitRating: (sessionId: string, rating: number, feedback?: string | null) => Promise<void>
}

/** The message box and the files staged with it. */
export interface WidgetComposer {
    newMessage: Ref<string>
    secretInMessage: Shown<boolean>
    isMessageInputEnabled: Shown<boolean>
    canTypeMessage: Shown<boolean>
    placeholderText: Shown<string>
    sendMessage: () => Promise<void>
    sendQuickAction: (label: string) => void
    handleKeyPress: (event: KeyboardEvent) => void
    /** The redesigned panel is holding a send until the visitor's email is in. */
    heldForEmail: Shown<boolean>
    uploadedAttachments: Shown<UploadedFile[]>
    isUploading: Shown<boolean>
    canUploadMore: Shown<boolean>
    maxFiles: number
    acceptTypes: string
    previewModal: Shown<boolean>
    previewFile: Shown<PreviewFile | null>
    formatFileSize: (bytes: number) => string
    isImage: (type: string) => boolean
    isImageAttachment: (contentType: string) => boolean
    getDownloadUrl: (fileUrl: string | null | undefined) => string
    getPreviewUrl: (file: { url: string; file_url?: string }) => string
    handleFileSelect: (event: Event) => Promise<void>
    handleDrop: (event: DragEvent) => Promise<void>
    handleDragOver: (event: DragEvent) => void
    handleDragLeave: (event: DragEvent) => void
    handlePaste: (event: ClipboardEvent) => Promise<void>
    removeAttachment: (index: number) => Promise<void>
    openPreview: (file: PreviewFile) => void
    closePreview: () => void
}

/** What the embedding page puts in the chat: in-app actions, its message, journeys. */
export interface WidgetHostPrompt {
    pendingConfirm: Shown<PendingConfirm | null>
    approveAction: () => void
    declineAction: () => void
    receiptsAfter: (count: number) => ActionReceipt[]
    /** How many action receipts are in the chat (a new one sits below the fold). */
    receiptCount: Shown<number>
    journeyProgress: Shown<JourneyProgress | null>
    chipBusy: Shown<boolean>
    skipStep: () => void
    dismissJourney: () => void
    shownPrompt: Shown<HostPrompt | null>
    replyChips: Shown<PageChip[]>
    onPageChip: (chip: PageChip) => void
    /** Where the page message sits among the messages. */
    promptPlace: { isBefore: (message: WidgetMessage) => boolean; isLast: () => boolean }
}

/** Screens in front of or instead of the chat: email gate, workflow, new chat. */
export interface WidgetScreens {
    emailInput: Ref<string>
    emailGateError: Ref<string>
    submittingEmail: Shown<boolean>
    shouldCollectEmail: Shown<boolean>
    showEmailGate: Shown<boolean>
    /**
     * The redesigned panel's email card is up: the agent collects email and the
     * conversation has not started (no authorized email yet). Sends wait meanwhile.
     */
    awaitingEmail: Shown<boolean>
    /** History was asked for and has not answered yet (the start state waits). */
    awaitingHistory: Shown<boolean>
    submitEmailGate: () => Promise<void>
    /** submitEmailGate, ignored while a submit is in flight (the panel's card). */
    submitEmailOnce: () => Promise<void>
    showLandingPage: Shown<boolean>
    landingPageData: Shown<LandingPage | null>
    workflowButtonText: Shown<string>
    showFullScreenForm: Shown<boolean>
    fullScreenFormData: Shown<WorkflowForm | null>
    /** Field values as each field type holds them (text, a checkbox's boolean...). */
    formData: Shown<Record<string, any>>
    formErrors: Shown<Record<string, string>>
    isSubmittingForm: Shown<boolean>
    shouldShowNewConversationOption: Shown<boolean>
    handleLandingPageProceed: () => Promise<void>
    handleFormSubmit: (form: WorkflowForm) => Promise<void>
    handleFieldChange: (fieldName: string, value: unknown) => void
    submitFullScreenForm: () => Promise<void>
    handleUserInputSubmit: (message: WorkflowMessage) => Promise<void>
    canStartNewChat: Shown<boolean>
    startingNewChat: Shown<boolean>
    newChatError: Shown<string>
    newChatArmed: Shown<boolean>
    requestNewChat: () => void
    confirmNewChat: () => Promise<void>
    disarmNewChat: () => void
    handleStartNewConversation: () => Promise<void>
}

/**
 * The widget controller: the widget's state and actions as a view sees them (the
 * classic view today, the panel view next). The dashboard preview implements it
 * with static data and no socket, so nothing here may assume a live connection.
 */
export interface WidgetController
    extends WidgetLook, WidgetConnection, WidgetConversation, WidgetComposer, WidgetHostPrompt, WidgetScreens {
    /** Resolves once the widget has finished initializing, authorized or not. */
    ready: Promise<void>
    /** The rendering view hands over its DOM hooks; call during its setup. */
    registerView: (hooks: WidgetViewHooks) => void
}

/**
 * Provided (true) by the dashboard preview only: there is no embedding page, so the
 * views post it nothing and listen to none of its keys. False when not provided.
 */
export const WIDGET_PREVIEW: InjectionKey<boolean> = Symbol('WidgetPreview')

/** Provided by the widget root (WidgetBuilder.vue); injected by the views. */
export const WIDGET_CTX: InjectionKey<WidgetController> = Symbol('WidgetController')
