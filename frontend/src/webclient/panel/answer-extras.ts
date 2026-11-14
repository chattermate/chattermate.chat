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
 * What the redesigned panel reads from an AI reply besides its text, as the server
 * sends it on a live reply (chat_response) and stores it in a restored message's
 * attributes: follow-up choices, the handover card and the visitor's thumb
 * (plus what the chat UI layer draws, ui-layer/index.ts). Every reader validates: history rows are old.
 */

import type { WidgetMessage } from '../../types/widget'
import { visitorFeedbackIn, type VisitorFeedback } from '../../utils/visitorFeedback'
import { uiLayer } from '../ui-layer'

export type { VisitorFeedback }
export type HandoverState = 'connecting' | 'offline'

/** At most this many follow-up chips, as the server's limit. */
// The server sends at most three follow-ups or four of the agent's choices
// (widget_reply.choice_limits_for); the chips never show more than that.
export const MAX_ANSWER_CHOICES = 4
const HANDOVER_STATES = new Set<HandoverState>(['connecting', 'offline'])

const isObject = (value: unknown): value is Record<string, unknown> =>
    !!value && typeof value === 'object' && !Array.isArray(value)

const attributesOf = (message: WidgetMessage): Record<string, unknown> =>
    isObject(message.attributes) ? message.attributes : {}

/** The follow-up choices under this reply (deduplicated, at most three). */
export function followUpsOf(message: WidgetMessage): string[] {
    const choices = attributesOf(message).quick_replies
    if (!Array.isArray(choices)) return []
    const seen = new Set<string>()
    return choices
        .filter((c): c is string => typeof c === 'string' && !!c.trim())
        .map(c => c.trim())
        .filter(c => (seen.has(c.toLowerCase()) ? false : (seen.add(c.toLowerCase()), true)))
        .slice(0, MAX_ANSWER_CHOICES)
}

/** The handover card this reply is, or null for an ordinary answer. */
export function handoverOf(message: WidgetMessage): HandoverState | null {
    const handover = attributesOf(message).handover
    const state = isObject(handover) ? handover.state : null
    return HANDOVER_STATES.has(state as HandoverState) ? (state as HandoverState) : null
}

/** The visitor's thumb on this reply, or null. */
export function feedbackOf(message: WidgetMessage): VisitorFeedback | null {
    return visitorFeedbackIn(message.attributes)
}

/** The extras of a live reply (chat_response), to keep in its attributes like history does:
 * the panel's own, and the keys the chat UI layer draws from. */
export function replyExtras(data: Record<string, unknown>): Record<string, unknown> {
    const extras: Record<string, unknown> = {}
    for (const key of ['quick_replies', 'handover', ...(uiLayer.replyKeys ?? [])]) {
        if (data[key] !== null && data[key] !== undefined) extras[key] = data[key]
    }
    return extras
}
