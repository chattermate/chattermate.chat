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
 * A stand-in widget controller for mounting one panel component on its own: refs
 * for the state it reads, spies for the actions it calls. Only what the panel
 * components use; pass overrides for anything a test needs set.
 *
 * Checked against WidgetController (`satisfies`): a renamed key or a changed type
 * in the controller fails here instead of passing silently. Its refs are writable
 * so a test can change state the views only read.
 */

import { vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref, type Component, type Ref } from 'vue'
import { WIDGET_CTX, type LandingPage, type WidgetController } from '@/webclient/panel/controller'
import { PANEL_PRESENCE_TEXT } from '@/webclient/copy'
import type { AgentCustomization } from '@/types/agent'
import type { HumanAgent, WidgetMessage } from '@/types/widget'
import type { ConnectionStatus } from '@/composables/useWidgetSocket'
import type { HostCapabilities } from '@/composables/useHostMessages'
import type { HostPrompt, PageChip, PendingConfirm } from '@/webclient/actions/hostActionsClient'
import type { JourneyProgress } from '@/webclient/journeys/journeyClient'
import type { PreviewFile, UploadedFile } from '@/composables/useWidgetFiles'
import type { WorkflowForm } from '@/composables/useWorkflowScreens'
import type { PresenceLine } from '@/utils/widgetPresence'
import type { EmailCheckState } from '@/composables/useEmailCheck'
import { emptyHistory, type HistoryState } from '@/composables/useConversationHistory'
import type { PageSuggestions } from '@/composables/usePageSuggestions'
import type { VisitorFeedback } from '@/webclient/panel/answer-extras'

/** The controller with its read-only refs made writable, for tests. */
type Writable<T> = { [K in keyof T]: T[K] extends Readonly<Ref<infer V>> ? Ref<V> : T[K] }

const baseController = () => ({
    // look
    widgetId: ref<string | null | undefined>('w-1'),
    customization: ref<Partial<AgentCustomization>>({}),
    agentName: ref('Ada'),
    photoUrl: ref(''),
    humanAgentPhotoUrl: ref(''),
    isHandedOverToHuman: ref(false),
    orbStyle: ref<Record<string, string>>({}),
    presence: ref<PresenceLine>({ text: PANEL_PRESENCE_TEXT.ai, online: true }),
    showBranding: ref(true),
    helpCenterUrl: ref<string | null>(null),
    showCitations: ref(false),
    showAiDisclaimer: ref(true),
    quickActions: ref<string[]>([]),
    welcomeMessageText: ref(''),
    hostVisible: ref(true),
    hostCapabilities: ref<HostCapabilities>({ expand: false, backdrop: false, navigate: false, swipe: false }),
    themeVars: ref<Record<string, string>>({}),
    containerStyles: ref<Record<string, string>>({}),
    useAskAiPanel: ref(false),
    askAiHotkey: ref(true),
    askAiSubtitle: ref('Ask a question'),
    formatCurrency: (price: string | number | null | undefined) => `$${price}`,
    minimizeWidget: vi.fn(),
    // connection
    isInitializing: ref(false),
    hasConversationToken: ref(true),
    historyAvailable: ref(true),
    showAuthError: ref(false),
    isApiKeyAuthRequired: ref(false),
    authError: ref<string | null>(null),
    connectionStatus: ref<ConnectionStatus>('connected'),
    errorMessage: ref(''),
    showError: ref(false),
    handleReconnect: vi.fn(async () => {}),
    // conversation
    messages: ref<WidgetMessage[]>([]),
    loading: ref(false),
    loadingHistory: ref(false),
    hasStartedChat: ref(true),
    humanAgent: ref<HumanAgent>({}),
    displayText: vi.fn((_index: number, full: string) => full),
    isStreaming: vi.fn((_index: number) => false),
    isRevealing: ref(false),
    skipReveal: vi.fn(),
    sendFeedback: vi.fn((_message: WidgetMessage, _value: VisitorFeedback | null) => {}),
    requestProductOptions: vi.fn((_productId: string) => {}),
    emailCheck: ref<EmailCheckState>({ stage: 'email', purpose: 'chat', busy: false, maskedEmail: '', error: '', retryIn: 0, attemptsLeft: 0 }),
    startEmailCheck: vi.fn((_email: string) => {}),
    verifyEmailCode: vi.fn((_code: string) => {}),
    restartEmailCheck: vi.fn(),
    history: ref<HistoryState>(emptyHistory()),
    pageSuggestions: ref<PageSuggestions>({ loaded: false, heading: 'popular', pill: null, items: [] }),
    openHistory: vi.fn(),
    closeHistory: vi.fn(),
    refreshConversations: vi.fn(),
    loadMoreConversations: vi.fn(),
    searchConversations: vi.fn((_q: string) => {}),
    openConversation: vi.fn((_id: string) => {}),
    closeConversation: vi.fn(),
    loadOlderMessages: vi.fn(),
    continueConversation: vi.fn(async (_id: string) => {}),
    hoverRating: ref(0),
    isSubmittingRating: ref(false),
    handleStarHover: vi.fn((_rating: number) => {}),
    handleStarLeave: vi.fn(),
    handleStarClick: vi.fn(async (_rating: number) => {}),
    handleSubmitRating: vi.fn(async (_sessionId: string, _rating: number, _feedback?: string | null) => {}),
    // composer
    newMessage: ref(''),
    secretInMessage: ref(false),
    isMessageInputEnabled: ref(true),
    canTypeMessage: ref(true),
    placeholderText: ref('Type a message...'),
    sendMessage: vi.fn(async () => {}),
    sendQuickAction: vi.fn((_label: string) => {}),
    heldForEmail: ref(false),
    uploadedAttachments: ref<UploadedFile[]>([]),
    isUploading: ref(false),
    canUploadMore: ref(false),
    acceptTypes: 'image/*',
    getDownloadUrl: (url: string | null | undefined) => `https://files.test/${url}`,
    formatFileSize: (bytes: number) => `${bytes} B`,
    handleFileSelect: vi.fn(async (_event: Event) => {}),
    handlePaste: vi.fn(async (_event: ClipboardEvent) => {}),
    handleDrop: vi.fn(async (_event: DragEvent) => {}),
    handleDragOver: vi.fn((_event: DragEvent) => {}),
    handleDragLeave: vi.fn((_event: DragEvent) => {}),
    removeAttachment: vi.fn(async (_index: number) => {}),
    isImage: (type: string) => type.startsWith('image/'),
    isImageAttachment: (type: string) => type.startsWith('image/'),
    getPreviewUrl: (file: { url: string; file_url?: string }) => `https://files.test/${file.file_url || file.url}`,
    previewModal: ref(false),
    previewFile: ref<PreviewFile | null>(null),
    openPreview: vi.fn((_file: PreviewFile) => {}),
    closePreview: vi.fn(),
    // host prompt
    pendingConfirm: ref<PendingConfirm | null>(null),
    receiptCount: ref(0),
    receiptsAfter: () => [],
    journeyProgress: ref<JourneyProgress | null>(null),
    replyChips: ref<PageChip[]>([]),
    chipBusy: ref(false),
    shownPrompt: ref<HostPrompt | null>(null),
    promptPlace: { isBefore: (_message: WidgetMessage): boolean => false, isLast: (): boolean => false },
    // screens
    emailInput: ref(''),
    emailGateError: ref(''),
    submittingEmail: ref(false),
    showEmailGate: ref(false),
    awaitingEmail: ref(false),
    awaitingHistory: ref(false),
    submitEmailGate: vi.fn(async () => {}),
    submitEmailOnce: vi.fn(async () => {}),
    shouldShowNewConversationOption: ref(false),
    canStartNewChat: ref(false),
    startingNewChat: ref(false),
    newChatArmed: ref(false),
    requestNewChat: vi.fn(),
    confirmNewChat: vi.fn(async () => {}),
    disarmNewChat: vi.fn(),
    newChatError: ref(''),
    handleStartNewConversation: vi.fn(async () => {}),
    showLandingPage: ref(false),
    landingPageData: ref<LandingPage | null>(null),
    workflowButtonText: ref(''),
    handleLandingPageProceed: vi.fn(async () => {}),
    showFullScreenForm: ref(false),
    fullScreenFormData: ref<WorkflowForm | null>(null),
    formData: ref<Record<string, any>>({}),
    formErrors: ref<Record<string, string>>({}),
    isSubmittingForm: ref(false),
    handleFormSubmit: vi.fn(async (_form: WorkflowForm) => {}),
    handleFieldChange: vi.fn((_name: string, _value: unknown) => {}),
    submitFullScreenForm: vi.fn(async () => {}),
    handleUserInputSubmit: vi.fn(async (_message: any) => {}),
    // the view's hooks
    registerView: vi.fn(),
}) satisfies Partial<Writable<WidgetController>>

export type FakeController = ReturnType<typeof baseController>

/** A file staged in the composer. */
export const stagedFile = (filename: string, type = 'application/pdf'): UploadedFile =>
    ({ filename, type, size: 9, content: '', url: '', file_url: '' })

export const fakeController = (overrides: Partial<FakeController> = {}): FakeController =>
    ({ ...baseController(), ...overrides })

/** Mount one panel component with `ctrl` provided as the widget controller. */
export const mountWithController = (component: Component, ctrl: FakeController, props: Record<string, unknown> = {}) =>
    mount(component as any, {
        props,
        global: { provide: { [WIDGET_CTX as symbol]: ctrl } },
        attachTo: document.body,
    })
