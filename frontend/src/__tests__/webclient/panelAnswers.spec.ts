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

import { afterEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, type VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import MessageItem from '@/webclient/panel/MessageItem.vue'
import MessageList from '@/webclient/panel/MessageList.vue'
import { fakeController, mountWithController, type FakeController } from './panelFakeController'
import type { WidgetMessage } from '@/types/widget'

/**
 * An answer in the redesigned panel (plan phase 2): its receipt, link card,
 * numbered sources, copy and thumbs, follow-ups and handover.
 */

let wrapper: VueWrapper<any> | undefined
let ctrl: FakeController

afterEach(() => {
    wrapper?.unmount()
    wrapper = undefined
    vi.unstubAllGlobals()
})

const answer = (fields: Partial<WidgetMessage> = {}): WidgetMessage =>
    ({ message_type: 'bot', message: 'Returns are free.', created_at: '', session_id: '', ...fields })

const mountAnswer = (message: WidgetMessage, overrides: Partial<FakeController> = {}, index = 0) => {
    ctrl = fakeController(overrides)
    ctrl.messages.value = [message]
    wrapper = mountWithController(MessageItem, ctrl, { message, index })
    return wrapper
}

describe('answer actions', () => {
    it('thumbs a stored reply up, and a second tap takes it back', async () => {
        const message = answer({ id: 7 })
        mountAnswer(message)
        const up = wrapper!.get('button[aria-label="Helpful"]')
        expect(up.attributes('aria-pressed')).toBe('false')
        await up.trigger('click')
        expect(ctrl.sendFeedback).toHaveBeenLastCalledWith(message, 'up')

        message.attributes = { visitor_feedback: 'up' }
        wrapper!.unmount()
        mountAnswer(message)
        expect(wrapper!.get('button[aria-label="Helpful"]').attributes('aria-pressed')).toBe('true')
        await wrapper!.get('button[aria-label="Helpful"]').trigger('click')
        expect(ctrl.sendFeedback).toHaveBeenLastCalledWith(message, null)
        await wrapper!.get('button[aria-label="Not helpful"]').trigger('click')
        expect(ctrl.sendFeedback).toHaveBeenLastCalledWith(message, 'down')
    })

    it('has no thumbs for a reply that is not stored yet, but still copies', () => {
        mountAnswer(answer())
        expect(wrapper!.find('button[aria-label="Helpful"]').exists()).toBe(false)
        expect(wrapper!.find('button[aria-label="Copy answer"]').exists()).toBe(true)
    })

    it('copies the answer as shown and says so', async () => {
        const writeText = vi.fn(async () => {})
        vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText } })
        mountAnswer(answer({ message: 'Returns are **free**.' }))
        await wrapper!.get('button[aria-label="Copy answer"]').trigger('click')
        await flushPromises()
        expect(writeText).toHaveBeenCalledWith('Returns are free.')
        expect(wrapper!.find('button[aria-label="Copied"]').exists()).toBe(true)
    })

    it('shows no actions while the reply is still being revealed', () => {
        mountAnswer(answer({ id: 7 }), { isStreaming: vi.fn(() => true), displayText: vi.fn(() => 'Ret') })
        expect(wrapper!.find('.cm-answer-actions').exists()).toBe(false)
    })
})

describe('follow-up questions', () => {
    const withFollowUps = () => answer({ id: 1, attributes: { quick_replies: ['How long does a refund take?', 'Can I exchange?'] } })

    it('sends one when tapped, on the latest answer', async () => {
        mountAnswer(withFollowUps())
        const chips = wrapper!.findAll('.cm-follow-ups__chip')
        expect(chips.map(c => c.text())).toEqual(['How long does a refund take?', 'Can I exchange?'])
        await chips[0].trigger('click')
        expect(ctrl.sendQuickAction).toHaveBeenCalledWith('How long does a refund take?')
    })

    it('are gone once the conversation moved on', () => {
        ctrl = fakeController()
        const message = withFollowUps()
        ctrl.messages.value = [message, { message_type: 'user', message: 'ok', created_at: '', session_id: '' }]
        wrapper = mountWithController(MessageItem, ctrl, { message, index: 0 })
        expect(wrapper.find('.cm-follow-ups').exists()).toBe(false)
    })

    it('wait while a reply is coming', async () => {
        mountAnswer(withFollowUps())
        ctrl.loading.value = true
        await nextTick()
        expect(wrapper!.get('.cm-follow-ups__chip').attributes('disabled')).toBeDefined()
    })
})

describe('sources and the link card', () => {
    const sources = [
        { name: 'https://shop.example', type: 'website', url: 'https://shop.example/returns', title: 'Returns policy', description: 'Free for 30 days.' },
        { name: 'faq.pdf', type: 'file' },
    ]

    it('numbers the sources, linking a web page', async () => {
        mountAnswer(answer({ sources }), {})
        ctrl.showCitations.value = true
        await nextTick()
        const chips = wrapper!.findAll('.cm-sources__chip')
        expect(chips[0].element.tagName).toBe('A')
        expect(chips[0].attributes('href')).toBe('https://shop.example/returns')
        expect(chips[0].attributes('aria-label')).toBe('Source 1: Returns policy (opens in a new tab)')
        expect(chips[1].element.tagName).toBe('SPAN')
        expect(chips[1].attributes('aria-label')).toBe('Source 2: faq')
    })

    it('shows the card for the one source page the answer links', async () => {
        mountAnswer(answer({ message: 'See [returns](https://shop.example/returns).', sources }))
        ctrl.showCitations.value = true
        await nextTick()
        const card = wrapper!.get('.cm-link-card')
        expect(card.attributes('href')).toBe('https://shop.example/returns')
        expect(card.get('.cm-link-card__title').text()).toBe('Returns policy')
        expect(card.get('.cm-link-card__description').text()).toBe('Free for 30 days.')
    })
})

describe('the handover card', () => {
    it('draws a connecting handover with the reply as its body', () => {
        mountAnswer(answer({ message: 'A teammate will be with you shortly.', attributes: { handover: { state: 'connecting' } } }))
        expect(wrapper!.classes()).toContain('cm-handover')
        expect(wrapper!.get('.cm-handover__title').text()).toBe('Connecting you to the team')
        expect(wrapper!.get('.cm-handover__body').text()).toBe('A teammate will be with you shortly.')
        expect(wrapper!.find('.cm-handover__pulse').exists()).toBe(true)
    })

    it('stops pulsing once something came after it', () => {
        ctrl = fakeController()
        const card = answer({ attributes: { handover: { state: 'connecting' } } })
        ctrl.messages.value = [card, { message_type: 'system', message: 'Sam joined the conversation', created_at: '', session_id: '' }]
        wrapper = mountWithController(MessageItem, ctrl, { message: card, index: 0 })
        expect(wrapper.find('.cm-handover__pulse').exists()).toBe(false)
    })

    it('says the team will get back when nobody is online', () => {
        mountAnswer(answer({ attributes: { handover: { state: 'offline' } } }))
        expect(wrapper!.get('.cm-handover__title').text()).toBe('Our team will get back to you')
        expect(wrapper!.find('.cm-handover__pulse').exists()).toBe(false)
    })
})
