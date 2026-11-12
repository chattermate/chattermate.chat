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

import { describe, expect, it } from 'vitest'
import {
    feedbackOf, followUpsOf, handoverOf, replyExtras,
} from '@/webclient/panel/answer-extras'
import type { WidgetMessage } from '@/types/widget'

const reply = (attributes: Record<string, unknown>): WidgetMessage =>
    ({ message_type: 'bot', message: 'Hi', created_at: '', session_id: '', attributes })

describe('reading an answer\'s extras', () => {
    it('keeps at most three distinct follow-ups', () => {
        expect(followUpsOf(reply({ quick_replies: ['A', ' a ', 'B', '', 7, 'C', 'D'] }))).toEqual(['A', 'B', 'C'])
        expect(followUpsOf(reply({ quick_replies: 'A' }))).toEqual([])
    })

    it('knows a handover card by its state only', () => {
        expect(handoverOf(reply({ handover: { state: 'connecting' } }))).toBe('connecting')
        expect(handoverOf(reply({ handover: { state: 'offline' } }))).toBe('offline')
        expect(handoverOf(reply({ handover: { state: 'other' } }))).toBeNull()
        expect(handoverOf({ message_type: 'bot', created_at: '', session_id: '' })).toBeNull()
    })

    it('reads the visitor\'s thumb', () => {
        expect(feedbackOf(reply({ visitor_feedback: 'down' }))).toBe('down')
        expect(feedbackOf(reply({ visitor_feedback: 'meh' }))).toBeNull()
    })

    it('keeps a live reply\'s extras the way history stores them', () => {
        expect(replyExtras({ quick_replies: ['A'], handover: null, cards: undefined, trace: { steps: [] }, message: 'x' }))
            .toEqual({ quick_replies: ['A'] })
    })

})
