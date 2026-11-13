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

import { afterEach, describe, expect, it } from 'vitest'
import { type VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import MessageItem from '@/webclient/panel/MessageItem.vue'
import { cardsOf } from '@/webclient/panel/answer-extras'
import { browserLanguages } from '@/composables/useWidgetSocket'
import { fakeController, mountWithController, type FakeController } from './panelFakeController'
import type { WidgetMessage } from '@/types/widget'

/** Status cards under an answer (plan phase 4): an order and a ticket. */

let wrapper: VueWrapper<any> | undefined
let ctrl: FakeController
afterEach(() => { wrapper?.unmount(); wrapper = undefined })

const orderCard = {
    id: 'order-55', kind: 'order', title: 'Order #1042', subtitle: 'Placed 3 Nov · 2 items',
    status: { key: 'in_transit', label: 'In transit', tone: 'info' },
    steps: [
        { label: 'Ordered', state: 'done' }, { label: 'Processing', state: 'done' },
        { label: 'Shipped', state: 'current' }, { label: 'Delivered', state: 'upcoming' },
    ],
    rows: [{ label: 'Ship to', value: 'Leeds, LS1' }, { label: 'Tracking', value: 'UPS •••• 1234' }],
    items: [{ title: 'Mug', quantity: 2, image: 'https://cdn.shopify.com/m.png', amount: { value: '20.00', currency: 'GBP' } }],
    total: { label: 'Total', amount: { value: '45.00', currency: 'GBP' } },
    actions: [
        { id: 'track', label: 'Track with carrier', kind: 'link', value: 'https://ups.example/t', style: 'primary' },
        { id: 'help', label: 'Get help with this order', kind: 'reply', value: 'I need help with order #1042', style: 'secondary' },
    ],
}

const reply = (cards: unknown[]): WidgetMessage =>
    ({ message_type: 'bot', message: 'Here it is.', created_at: '', session_id: '', attributes: { cards } })

const mountReply = (message: WidgetMessage) => {
    ctrl = fakeController()
    ctrl.messages.value = [message]
    wrapper = mountWithController(MessageItem, ctrl, { message, index: 0 })
}

describe('a status card', () => {
    it('draws an order: status in words, steps with the current one, rows, items, total', () => {
        mountReply(reply([orderCard]))
        const card = wrapper!.get('section[aria-label="Order #1042"]')
        expect(card.get('.cm-status-card__pill').text()).toBe('In transit')
        const current = card.get('[aria-current="step"]')
        expect(current.text()).toBe('Shipped')
        expect(card.findAll('.cm-status-card__step').map(s => s.attributes('aria-label'))).toEqual([
            'Ordered, done', 'Processing, done', 'Shipped, current step', 'Delivered',
        ])
        expect(card.get('.cm-status-card__fill').attributes('style')).toContain('scaleX(0.6666')
        expect(card.findAll('.cm-status-card__row').map(r => r.text())).toEqual(['Ship toLeeds, LS1', 'TrackingUPS •••• 1234'])
        expect(card.get('.cm-status-card__item').text()).toContain('× 2')
        expect(card.get('.cm-status-card__total').text()).toBe('Total$45.00')
    })

    it('opens a link in a new tab and sends a reply action as the visitor', async () => {
        mountReply(reply([orderCard]))
        const link = wrapper!.get('a.cm-status-card__action')
        expect(link.attributes('href')).toBe('https://ups.example/t')
        expect(link.attributes('target')).toBe('_blank')
        await wrapper!.get('button.cm-status-card__action').trigger('click')
        expect(ctrl.sendQuickAction).toHaveBeenCalledWith('I need help with order #1042')
    })

    it('waits while a reply is coming', async () => {
        mountReply(reply([orderCard]))
        ctrl.loading.value = true
        await nextTick()
        expect(wrapper!.get('button.cm-status-card__action').attributes('disabled')).toBeDefined()
    })

    it('shows nothing of a card until the reply is revealed', () => {
        ctrl = fakeController({ isStreaming: (() => true) as any, displayText: ((_i: number, t: string) => t.slice(0, 3)) as any })
        const message = reply([orderCard])
        ctrl.messages.value = [message]
        wrapper = mountWithController(MessageItem, ctrl, { message, index: 0 })
        expect(wrapper.find('.cm-status-card').exists()).toBe(false)
    })
})

describe('cardsOf', () => {
    it('drops what it cannot show safely', () => {
        const [card] = cardsOf(reply([{
            ...orderCard,
            status: { label: 'Odd', tone: 'purple' },
            steps: [{ label: 'A', state: 'weird' }, { label: 'B', state: 'done' }],
            items: [{ title: 'X', image: 'javascript:alert(1)' }],
            actions: [
                { id: 'a', label: 'Bad', kind: 'link', value: 'javascript:alert(1)' },
                { id: 'b', label: 'Run', kind: 'tool', value: 'x' },
                { id: 'c', label: 'Ok', kind: 'reply', value: 'hi' },
            ],
        }, { title: 'no id' }, 'junk']))
        expect(card.status?.tone).toBe('neutral')
        expect(card.steps).toEqual([{ label: 'B', state: 'done' }])
        expect(card.items[0].image).toBeUndefined()
        expect(card.actions.map(a => a.id)).toEqual(['c'])
        expect(cardsOf(reply('nope' as any))).toEqual([])
    })
})

describe('a card in the visitor\'s language', () => {
    const german = {
        ...orderCard, lang: 'de', title: 'Bestellung #1042',
        status: { key: 'in_transit', label: 'Unterwegs', tone: 'info' },
    }

    it('says its language, so screen readers read it in that voice', () => {
        mountReply(reply([german]))
        const card = wrapper!.get('section[aria-label="Bestellung #1042"]')
        expect(card.attributes('lang')).toBe('de')
        expect(card.get('.cm-status-card__pill').text()).toBe('Unterwegs')
    })

    it('follows the text direction of its words (Arabic reads right to left)', () => {
        mountReply(reply([{ ...orderCard, lang: 'ar', title: 'الطلب #1042' }]))
        expect(wrapper!.get('section.cm-status-card').attributes('dir')).toBe('auto')
    })

    it('keeps only a real language tag', () => {
        expect(cardsOf(reply([german]))[0].lang).toBe('de')
        expect(cardsOf(reply([{ ...orderCard, lang: 'zh-Hant' }]))[0].lang).toBe('zh-Hant')
        expect(cardsOf(reply([{ ...orderCard, lang: 'de" onload="x' }]))[0].lang).toBeUndefined()
        expect(cardsOf(reply([{ ...orderCard, lang: 42 }]))[0].lang).toBeUndefined()
        expect(cardsOf(reply([orderCard]))[0].lang).toBeUndefined()
    })
})

describe('browserLanguages', () => {
    it('sends the browser\'s languages, most preferred first, at most five', () => {
        expect(browserLanguages({ languages: ['de-DE', 'en-US'], language: 'de-DE' })).toEqual(['de-DE', 'en-US'])
        expect(browserLanguages({ languages: ['a', 'b', 'c', 'd', 'e', 'f'], language: 'a' })).toHaveLength(5)
    })

    it('falls back to the one language an older browser gives', () => {
        expect(browserLanguages({ languages: [], language: 'fr-FR' })).toEqual(['fr-FR'])
        expect(browserLanguages({ languages: undefined as any, language: '' })).toEqual([])
    })
})
