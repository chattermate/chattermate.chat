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
 * Every visitor-facing string the redesigned widget (ui 2) adds, in one place, so
 * translating it later means this file (plan G6). Strings the classic widget
 * already owns (new-chat.ts, secretGuard, aiDisclaimer) are imported from there.
 */

import { PRESENCE_TEXT, type PresenceWording } from '../utils/widgetPresence'

/** The header's status line, by who answers. Human and away keep the classic, honest wording.
 * The AI is not named here or on answers: the footer's disclaimer says it once. */
export const PANEL_PRESENCE_TEXT: PresenceWording = {
    ...PRESENCE_TEXT,
    ai: 'Replies instantly',
}

export const PANEL_COPY = {
    /** The header status while a reply is being worked on. */
    working: 'Working on it…',
    minimize: 'Minimize chat',
    expand: 'Expand chat',
    collapse: 'Make chat smaller',
    /** Takes the visitor down to replies that arrived while they read further up. */
    newMessages: 'New messages',
    /** The message log's accessible name (the e2e page object finds it by this). */
    messages: 'Messages',
    /** The typing indicator's accessible name (the e2e page object finds it by this). */
    replying: 'Agent is replying',
    /** The composer's accessible name. */
    message: 'Message',
    send: 'Send message',
    /** Shows the reply in full at once (server-side stop comes with plan 2.5). */
    stop: 'Stop',
    attach: 'Attach a file',
    /** While picked files upload. Same text as classic. */
    uploading: 'Uploading files...',
    /** The footer link: "Powered by ChatterMate" (its accessible name). */
    poweredBy: 'Powered by',
    brandName: 'ChatterMate',
    removeFile: (name: string) => `Remove ${name}`,
    /** The label row above an answer: the agent's own name, as the merchant wrote it. */
    answerLabel: (agent: string) => agent.trim() || 'Assistant',
    sources: 'Sources',
    /** The start state: greeting and headline when the agent set none (welcome_title / _subtitle). */
    welcomeTitle: 'Hi there',
    welcomeSubtitle: 'How can we help?',
    /** The suggestion rows' accessible name (quick_actions). */
    suggestions: 'Suggestions',
    suggestedForPage: 'Suggested for this page',
    popularQuestions: 'Popular questions',
    /** Why the suggestions rest while a typed message waits for the email. */
    suggestionsHeld: 'Your typed message is waiting for your email. Send it first or clear it to pick a suggestion.',
    /** The inline email card. Placeholder and button text as classic (the e2e page object uses them). */
    emailTitle: 'Before we start',
    emailText: "Enter your email and we'll continue the chat.",
    emailPlaceholder: 'you@example.com',
    emailLabel: 'Email',
    emailContinue: 'Continue to chat',
    emailWait: 'Please wait…',
    /** Shown on the card while a message waits for the email. */
    emailHeld: 'Your message is ready. It sends as soon as your email is in.',
    /** Connection and widget states. Same text as classic. */
    initializing: 'Initializing chat...',
    connecting: 'Connecting to chat service...',
    connectionFailed: 'Connection failed.',
    reconnect: 'Click here to reconnect',
    unavailableTitle: 'Chat Unavailable',
    unavailableText: 'This chat widget is not currently configured. Please contact the website administrator to enable chat support.',
    authErrorTitle: 'Authentication Error',
    refresh: 'Refresh Page',
    closeChat: 'Close chat',
    /** The end of a workflow conversation. Same text as classic. */
    chatEnded: 'This chat has ended.',
    startNewConversation: 'Click here to start a new conversation',
    continueLabel: 'Continue',
    /** The end-of-chat rating card (plan G4). "Submit Rating" and "N out of 5" as classic (e2e). */
    ratingTitle: 'Sorted. How did we do?',
    ratingPrompt: (name: string) => `Rate the chat session that you had with ${name || 'our agent'}`,
    ratingOption: (n: number) => `${n} out of 5`,
    ratingLow: 'Not good',
    ratingHigh: 'Excellent',
    ratingFeedbackLabel: 'Your feedback (optional)',
    ratingFeedbackPlaceholder: 'Please share your feedback (optional)',
    ratingSubmit: 'Submit Rating',
    ratingSubmitting: 'Submitting...',
    ratingThanks: 'Thank you for your rating!',
    /** Workflow forms and questions. Same text as classic. */
    submit: 'Submit',
    submitting: 'Submitting...',
    selectPlaceholder: 'Select an option',
    /** Read out when a form is refused: what to fix. */
    formErrors: (errors: string[]) =>
        `${errors.length === 1 ? 'Please fix 1 field' : `Please fix ${errors.length} fields`}: ${errors.join('. ')}`,
    yourAnswer: 'Your input',
    answerPlaceholder: 'Type your message here...',
    /** Your conversations (plan phase 5). */
    history: 'Your conversations',
    historyCount: (n: number) => (n === 1 ? '1 conversation' : `${n} conversations`),
    openHistory: 'Your conversations',
    back: 'Back',
    newChatFromHistory: 'Start a new chat',
    searchConversations: 'Search your conversations',
    searchCapped: 'Searched your 200 most recent conversations.',
    noConversations: 'No conversations yet.',
    noMatches: (q: string) => `Nothing found for "${q}".`,
    askInNewChat: (q: string) => `Ask about "${q}" in a new chat`,
    recent: 'Recent',
    allConversations: 'All conversations',
    groupOpen: 'Open',
    groupToday: 'Today',
    groupWeek: 'This week',
    groupMonth: 'This month',
    youPrefix: 'You: ',
    resolvedBy: (name: string) => `With ${name}`,
    continueConversation: 'Continue this conversation',
    backToChat: 'Back to the chat',
    loadingConversation: 'Loading…',
    earlierMessages: 'Show earlier messages',
    continueFailed: "Couldn't continue that conversation. Please try again.",
    /** Chats from the visitor's other browsers, after an email check from the history screen. */
    otherDevices: 'Chatted with us on another device?',
    otherDevicesShown: (masked: string) => `Including chats confirmed with ${masked}`,
    /** Files on messages and in the composer, and the image preview. */
    stagedFiles: 'Files to send',
    previewImage: (name: string) => `Preview ${name}`,
    opensInNewTab: '(opens in a new tab)',
    /** Answers (plan phase 2): source numbers, actions, follow-ups and handover. */
    sourceNumber: (n: number) => `source ${n}`,
    sourceChip: (n: number, label: string) => `Source ${n}: ${label}`,
    answerActions: 'Answer actions',
    copyAnswer: 'Copy answer',
    copied: 'Copied',
    helpful: 'Helpful',
    notHelpful: 'Not helpful',
    followUps: 'Ask next',
    handoverConnecting: 'Connecting you to the team',
    handoverOffline: 'Our team will get back to you',
    /** The start-state row that opens the org's public help center. */
    helpCenter: 'Browse the help center',
    imagePreview: 'Image preview',
    closePreview: 'Close preview',
} as const

/**
 * The dashboard preview's sample conversation (usePreviewController): a question,
 * an answer citing its sources, and the in-app action it took.
 */
export const PREVIEW_SAMPLE_COPY = {
    question: 'Do you offer free returns?',
    answer: 'Yes, returns are free for 30 days. Start one from your order page and we will email you a prepaid label.',
    sources: [
        { name: 'Returns policy', type: 'url' },
        { name: 'Shipping FAQ', type: 'file' },
    ],
    receipt: 'Opened your order page',
    /** What the visitor might ask next. */
    followUps: ['How long does a refund take?', 'Can I exchange instead?'],
} as const
