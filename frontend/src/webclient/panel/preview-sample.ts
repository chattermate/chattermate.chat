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

import type { WidgetMessage } from '../../types/widget'
import type { ActionReceipt } from '../actions/receipts'
import { PREVIEW_SAMPLE_COPY } from '../copy'

/** A conversation the dashboard preview shows in the redesigned panel. */
export interface PreviewConversation {
    messages: WidgetMessage[]
    /** Action receipts, each shown after the first `after` messages. */
    receipts: Array<{ after: number; receipt: ActionReceipt }>
}

const SESSION = 'preview'
const AT = '2026-01-01T09:00:00Z'

/**
 * The sample: a visitor's question, the answer with the sources it drew on (shown
 * when the agent shows citations, as in the widget), and the in-app action it took.
 * Status cards join it in Phase 4.
 */
export function previewSampleConversation(): PreviewConversation {
    return {
        messages: [
            { message_type: 'user', message: PREVIEW_SAMPLE_COPY.question, created_at: AT, session_id: SESSION },
            {
                message_type: 'bot',
                message: PREVIEW_SAMPLE_COPY.answer,
                created_at: AT,
                session_id: SESSION,
                sources: PREVIEW_SAMPLE_COPY.sources.map(source => ({ ...source })),
                attributes: {
                    quick_replies: [...PREVIEW_SAMPLE_COPY.followUps],
                },
            },
        ],
        receipts: [{ after: 2, receipt: { text: PREVIEW_SAMPLE_COPY.receipt, tone: 'done' } }],
    }
}
