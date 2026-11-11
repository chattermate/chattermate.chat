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
import { handoverOf } from './answer-extras'

export type MessageKind =
    /** The visitor's own message. */
    | 'user'
    /** An AI reply. */
    | 'answer'
    /** The AI handing the chat to the team (its handover card). */
    | 'handover'
    /** A reply from a person who took the conversation over. */
    | 'human'
    /** "<name> joined the conversation". */
    | 'joined'
    /** Any other system note ("Thank you for your feedback!"). */
    | 'system'
    /** A reply carrying product cards (Shopify). */
    | 'product'
    /** The end-of-chat rating request. */
    | 'rating'
    /** A form the workflow put in the chat. */
    | 'form'
    /** A workflow question answered in free text. */
    | 'userInput'
    /** A type this widget does not know: its text, never dropped. */
    | 'fallback'

/** The socket's takeover note (useWidgetSocket, handle_taken_over). */
const JOINED_SUFFIX = ' joined the conversation'

const AI_TYPES = new Set(['bot', 'assistant'])

const KIND_FOR_TYPE: Record<string, MessageKind> = {
    user: 'user',
    agent: 'human',
    rating: 'rating',
    form: 'form',
    user_input: 'userInput',
    product: 'product',
}

const hasProducts = (message: WidgetMessage) => !!message.shopify_output

/** The component kind for one message. Unknown types fall back to text, never dropped. */
export function messageKind(message: WidgetMessage): MessageKind {
    const type = message.message_type
    if (hasProducts(message)) return 'product'
    if (AI_TYPES.has(type)) return handoverOf(message) ? 'handover' : 'answer'
    if (type === 'system') return isJoinedNote(message) ? 'joined' : 'system'
    return KIND_FOR_TYPE[type] || 'fallback'
}

/** Whether a system message is the takeover note. */
export const isJoinedNote = (message: WidgetMessage): boolean =>
    message.message_type === 'system' && (message.message || '').endsWith(JOINED_SUFFIX)
