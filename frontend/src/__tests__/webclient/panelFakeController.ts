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
import type { AgentCustomization, WidgetUiVersion } from '@/types/agent'
import type { HumanAgent, WidgetMessage } from '@/types/widget'
import type { ConnectionStatus } from '@/composables/useWidgetSocket'
import type { HostPrompt, PageChip, PendingConfirm } from '@/webclient/actions/hostActionsClient'
import type { JourneyProgress } from '@/webclient/journeys/journeyClient'
import type { UploadedFile } from '@/composables/useWidgetFiles'
import type { WorkflowForm } from '@/composables/useWorkflowScreens'
import type { PresenceLine } from '@/utils/widgetPresence'

/** The controller with its read-only refs made writable, for tests. */
type Writable<T> = { [K in keyof T]: T[K] extends Readonly<Ref<infer V>> ? Ref<V> : T[K] }

const baseController = () => ({
    // look
    widgetId: ref<string | null | undefined>('w-1'),
    customization: ref<Partial<AgentCustomization>>({}),
    ui: ref<WidgetUiVersion>(2),
    agentName: ref('Ada'),
    photoUrl: ref(''),
    humanAgentPhotoUrl: ref(''),
    isHandedOverToHuman: ref(false),
    orbStyle: ref<Record<string, string>>({}),
    presence: ref<PresenceLine>({ text: PANEL_PRESENCE_TEXT.ai, online: true }),
    showBranding: ref(true),
    showCitations: ref(false),
    showAiDisclaimer: ref(true),
    quickActions: ref<string[]>([]),
    welcomeMessageText: ref(''),
    hostVisible: ref(true),
    themeVars: ref<Record<string, string>>({}),
    containerStyles: ref<Record<string, string>>({}),
    useAskAiPanel: ref(false),
    askAiHotkey: ref(true),
    askAiSubtitle: ref('Ask a question'),
    formatCurrency: (price: string | number | null | undefined) => `$${price}`,
    minimizeWidget: vi.fn(),
    // connection
    isInitializing: ref(false),
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
    // composer
    newMessage: ref(''),
    secretInMessage: ref(false),
    isMessageInputEnabled: ref(true),
    canTypeMessage: ref(true),
    placeholderText: ref('Type a message...'),
    sendMessage: vi.fn(async () => {}),
    sendQuickAction: vi.fn((_label: string) => {}),
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
    submitEmailGate: vi.fn(async () => {}),
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
