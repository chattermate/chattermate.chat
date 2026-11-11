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
import { fallbackClass, isJoinedNote, messageKind } from '@/webclient/panel/message-kind'
import { agentFace, initialsOf } from '@/webclient/panel/agent-face'
import type { WidgetMessage } from '@/types/widget'

const message = (fields: Partial<WidgetMessage>): WidgetMessage =>
    ({ message: '', message_type: 'bot', created_at: '', session_id: '', ...fields }) as WidgetMessage

describe('which component draws a message', () => {
    it.each([
        ['user', 'user'],
        ['bot', 'answer'],
        ['assistant', 'answer'],
        ['agent', 'human'],
        ['rating', 'fallback'],
        ['form', 'fallback'],
        ['user_input', 'fallback'],
        ['product', 'fallback'],
        ['something_new', 'fallback'],
    ])('%s → %s', (type, kind) => {
        expect(messageKind(message({ message_type: type }))).toBe(kind)
    })

    it('draws a reply carrying products as a product message whatever its type', () => {
        expect(messageKind(message({ message_type: 'bot', shopify_output: { products: [] } }))).toBe('fallback')
    })

    it('tells the takeover note from other system notes', () => {
        const joined = message({ message_type: 'system', message: 'Priya joined the conversation' })
        const thanks = message({ message_type: 'system', message: 'Thank you for your feedback!' })
        expect(messageKind(joined)).toBe('joined')
        expect(isJoinedNote(joined)).toBe(true)
        expect(messageKind(thanks)).toBe('system')
        expect(isJoinedNote(message({ message_type: 'bot', message: 'Priya joined the conversation' }))).toBe(false)
    })

    it('keeps the classic class hooks on the text fallbacks', () => {
        expect(fallbackClass(message({ message_type: 'form' }))).toBe('form-message')
        expect(fallbackClass(message({ message_type: 'rating' }))).toBe('rating-message')
        expect(fallbackClass(message({ message_type: 'product' }))).toBe('product-message')
        // A reply carrying products stays a reply for the page object, as in classic.
        expect(fallbackClass(message({ message_type: 'bot', shopify_output: { products: [] } })))
            .toBe('agent-message product-message')
        expect(fallbackClass(message({ message_type: 'agent', shopify_output: { products: [] } })))
            .toBe('agent-message product-message')
        expect(fallbackClass(message({ message_type: 'mystery' }))).toBe('agent-message')
    })
})

describe('what stands for the agent', () => {
    it('is the mark unless a photo is set', () => {
        expect(agentFace({}, '')).toBe('mark')
        expect(agentFace({}, 'https://cdn.test/a.png')).toBe('photo')
    })

    it('is the orb only when chosen explicitly, Aurora included', () => {
        expect(agentFace({ chat_style: 'AURORA' }, '')).toBe('mark')
        expect(agentFace({ customization_metadata: { avatar_style: 'orb' } }, 'https://cdn.test/a.png')).toBe('orb')
        expect(agentFace({ customization_metadata: { avatar_style: 'photo' } }, '')).toBe('mark')
    })

    it('writes a person\'s initials', () => {
        expect(initialsOf('Priya Rao')).toBe('PR')
        expect(initialsOf('  priya  ')).toBe('P')
        expect(initialsOf('Ana María de la Cruz')).toBe('AC')
        expect(initialsOf('')).toBe('')
    })
})
