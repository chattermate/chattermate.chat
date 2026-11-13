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
 * A visitor's thumb on an AI reply, stored on the reply's row as
 * attributes.visitor_feedback (backend app/services/message_feedback.py). Read by
 * the widget (its answer actions) and the dashboard (the mark in a conversation).
 */

export type VisitorFeedback = 'up' | 'down'

export const VISITOR_FEEDBACK_KEY = 'visitor_feedback'

/** The thumb in a message's attributes, or null. */
export function visitorFeedbackIn(attributes: unknown): VisitorFeedback | null {
    if (!attributes || typeof attributes !== 'object') return null
    const value = (attributes as Record<string, unknown>)[VISITOR_FEEDBACK_KEY]
    return value === 'up' || value === 'down' ? value : null
}

/** `attributes` with the thumb set, or removed when `value` is not up or down
 * (the visitor took it back). A new object: the original is left as it was. */
export function withVisitorFeedback(attributes: unknown, value: unknown): Record<string, unknown> {
    const next: Record<string, unknown> = attributes && typeof attributes === 'object' ? { ...(attributes as Record<string, unknown>) } : {}
    const thumb = visitorFeedbackIn({ [VISITOR_FEEDBACK_KEY]: value })
    if (thumb) next[VISITOR_FEEDBACK_KEY] = thumb
    else delete next[VISITOR_FEEDBACK_KEY]
    return next
}
