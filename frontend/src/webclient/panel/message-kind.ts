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
 * Which component draws a message in the redesigned panel. Pure, so the dispatcher
 * (MessageItem.vue) and its tests agree on every message type the socket sends.
 */

import type { WidgetMessage } from '../../types/widget'

export type MessageKind =
    /** The visitor's own message. */
    | 'user'
    /** An AI reply. */
    | 'answer'
    /** A reply from a person who took the conversation over. */
    | 'human'
    /** "<name> joined the conversation". */
    | 'joined'
    /** Any other system note ("Thank you for your feedback!"). */
    | 'system'
    /** Ratings, forms, products, free-text questions: plain text until plan 1.4. */
    | 'fallback'

/** The socket's takeover note (useWidgetSocket, handle_taken_over). */
const JOINED_SUFFIX = ' joined the conversation'

/** Kinds the panel draws as text for now; each keeps the classic class hook. */
const FALLBACK_CLASS: Record<string, string> = {
    rating: 'rating-message',
    form: 'form-message',
    product: 'product-message',
    user_input: 'user-input-message',
}

const AI_TYPES = new Set(['bot', 'assistant'])

const hasProducts = (message: WidgetMessage) => !!message.shopify_output

/** The component kind for one message. Unknown types fall back to text, never dropped. */
export function messageKind(message: WidgetMessage): MessageKind {
    const type = message.message_type
    if (type === 'product' || hasProducts(message)) return 'fallback'
    if (type === 'user') return 'user'
    if (AI_TYPES.has(type)) return 'answer'
    if (type === 'agent') return 'human'
    if (type === 'system') return isJoinedNote(message) ? 'joined' : 'system'
    return 'fallback'
}

/** Whether a system message is the takeover note. */
export const isJoinedNote = (message: WidgetMessage): boolean =>
    message.message_type === 'system' && (message.message || '').endsWith(JOINED_SUFFIX)

/** Reply types written by the agent (AI or person): they keep the agent-message hook. */
const REPLY_TYPES = new Set([...AI_TYPES, 'agent'])

/**
 * The class hooks a fallback keeps: form-message (used by the e2e page object),
 * rating- and product-message; and agent-message on a reply that carries products,
 * as the classic widget gives it, so the page object reads it as a reply.
 */
export function fallbackClass(message: WidgetMessage): string {
    if (hasProducts(message) && REPLY_TYPES.has(message.message_type)) return 'agent-message product-message'
    return FALLBACK_CLASS[hasProducts(message) ? 'product' : message.message_type] || 'agent-message'
}
