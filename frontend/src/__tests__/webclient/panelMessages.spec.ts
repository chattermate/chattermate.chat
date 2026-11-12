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
import { nextTick, ref } from 'vue'
import type { VueWrapper } from '@vue/test-utils'
import MessageItem from '@/webclient/panel/MessageItem.vue'
import MessageList from '@/webclient/panel/MessageList.vue'
import { fakeController, mountWithController, type FakeController } from './panelFakeController'
import type { WidgetMessage } from '@/types/widget'

let wrapper: VueWrapper<any> | undefined
let ctrl: FakeController

const msg = (message_type: string, message: string): WidgetMessage =>
    ({ message_type, message, created_at: '', session_id: '' })

afterEach(() => {
    wrapper?.unmount()
    wrapper = undefined
})

const item = (message: Record<string, unknown>, overrides: Partial<FakeController> = {}, extra = {}) => {
    ctrl = fakeController(overrides)
    wrapper = mountWithController(MessageItem, ctrl, { message: { created_at: '', session_id: '', ...message }, index: 0, ...extra })
    return wrapper
}

describe('a message in the panel', () => {
    it('draws an AI reply full width under the agent\'s own name, keeping the agent-message hook', () => {
        item({ message_type: 'bot', message: 'Hello **there**' })
        expect(wrapper!.classes()).toEqual(expect.arrayContaining(['message', 'agent-message', 'cm-answer']))
        expect(wrapper!.get('.cm-answer__name').text()).toBe('Ada')
        expect(wrapper!.get('.message-bubble').html()).toContain('<strong>there</strong>')
    })

    it('reveals a live reply through the typewriter and is busy until done', () => {
        item({ message_type: 'bot', message: 'Hello there' }, {
            isStreaming: vi.fn(() => true),
            displayText: vi.fn(() => 'Hel'),
        })
        expect(wrapper!.get('.message-bubble').text()).toBe('Hel')
        expect(wrapper!.get('.message-bubble').attributes('aria-busy')).toBe('true')
    })

    it('sanitises reply markdown', () => {
        item({ message_type: 'bot', message: '<img src=x onerror="alert(1)">hi' })
        expect(wrapper!.html()).not.toContain('onerror')
    })

    it('lists sources only when citations are on', async () => {
        item({ message_type: 'bot', message: 'Yes', sources: [{ name: 'Returns policy', type: 'website' }] })
        expect(wrapper!.find('.cm-sources').exists()).toBe(false)
        ctrl.showCitations.value = true
        await nextTick()
        expect(wrapper!.get('.cm-sources').attributes('aria-label')).toBe('Sources')
        expect(wrapper!.get('.cm-sources').text()).toContain('Returns policy')
    })

    it('draws the visitor\'s message as a user bubble', () => {
        item({ message_type: 'user', message: 'Where is my order?' })
        expect(wrapper!.classes()).toEqual(expect.arrayContaining(['message', 'user-message']))
        expect(wrapper!.get('.message-bubble').text()).toBe('Where is my order?')
    })

    it('links a message\'s files instead of dropping them', () => {
        item({
            message_type: 'user',
            message: '',
            attachments: [{ id: 1, filename: 'shot.png', file_url: 'f/1', content_type: 'image/png', file_size: 12 }],
        })
        expect(wrapper!.find('.message-bubble').exists()).toBe(false)
        const link = wrapper!.get('.cm-attachments__link')
        expect(link.text()).toContain('shot.png (12 B)')
        expect(link.text()).toContain('(opens in a new tab)')
        expect(link.attributes('href')).toBe('https://files.test/f/1')
        expect(link.attributes('rel')).toContain('noopener')
    })

    it('draws a person\'s reply with their name and avatar, keeping the agent-message hook', () => {
        item({ message_type: 'agent', message: 'Hi Jamie', agent_name: 'Priya Rao' })
        expect(wrapper!.classes()).toEqual(expect.arrayContaining(['message', 'agent-message', 'cm-human']))
        expect(wrapper!.get('.cm-human__name').text()).toBe('Priya Rao')
        expect(wrapper!.get('.cm-person').text()).toBe('PR')
        expect(wrapper!.get('.message-bubble').text()).toBe('Hi Jamie')
    })

    it('draws the takeover note as a divider with lines, other notes without', async () => {
        item({ message_type: 'system', message: 'Priya joined the conversation' })
        expect(wrapper!.get('.cm-joined__text').text()).toBe('Priya joined the conversation')
        expect(wrapper!.findAll('.cm-joined__line')).toHaveLength(2)
        wrapper!.unmount()
        item({ message_type: 'system', message: 'Thank you for your feedback!' })
        expect(wrapper!.findAll('.cm-joined__line')).toHaveLength(0)
    })

    it.each([
        ['form', { message_type: 'form', attributes: { form_data: { title: 'Before we connect you', fields: [] } } }, 'form-message'],
        ['rating', { message_type: 'rating', message: '' }, 'rating-message'],
        ['product', { message_type: 'product', message: 'Picks', shopify_output: { products: [] } }, 'product-message'],
        ['free-text question', { message_type: 'user_input', attributes: { prompt_message: 'Your order number?' } }, 'cm-question'],
    ])('draws a %s with its own card, keeping its class hook', (_name, message, hook) => {
        item(message as Record<string, unknown>)
        expect(wrapper!.classes()).toContain(hook)
    })

    it('keeps a reply carrying products readable as a reply', () => {
        item({
            message_type: 'bot',
            message: 'Here are two picks.',
            shopify_output: { products: [{ id: 'p1', title: 'Guji 250g', price: '14' }] },
        })
        expect(wrapper!.classes()).toEqual(expect.arrayContaining(['message', 'agent-message', 'product-message']))
        expect(wrapper!.get('.message-bubble').text()).toContain('Here are two picks.')
    })

    it('never drops a message of an unknown kind', () => {
        item({ message_type: 'mystery', message: 'Still shown' })
        expect(wrapper!.text()).toContain('Still shown')
    })

    it('rises in only when it arrived live', async () => {
        item({ message_type: 'user', message: 'hi' })
        expect(wrapper!.classes()).not.toContain('cm-enter')
        await wrapper!.setProps({ fresh: true })
        expect(wrapper!.classes()).toContain('cm-enter')
    })
})

describe('the message list', () => {
    const list = (overrides: Partial<FakeController> = {}) => {
        ctrl = fakeController(overrides)
        wrapper = mountWithController(MessageList, ctrl)
        return wrapper
    }

    it('is a log named "Messages", without the welcome block in it', () => {
        list({ welcomeMessageText: ref('We answer in seconds.') })
        const log = wrapper!.get('[role="log"]')
        expect(log.attributes('aria-label')).toBe('Messages')
        expect(log.find('.cm-start').exists()).toBe(false)
    })

    it('shows the typing indicator as a status named "Agent is replying"', async () => {
        list()
        expect(wrapper!.find('[role="status"]').exists()).toBe(false)
        ctrl.loading.value = true
        await nextTick()
        expect(wrapper!.get('[role="status"]').attributes('aria-label')).toBe('Agent is replying')
        expect(wrapper!.findAll('.cm-typing-dot')).toHaveLength(3)
    })

    it('draws every message, and the page\'s own message where it belongs', async () => {
        list({
            shownPrompt: ref({ message: 'Need a hand with checkout?', chips: [], open: true, source: 'host' as const }),
            promptPlace: { isBefore: () => false, isLast: () => true },
        })
        ctrl.messages.value = [msg('user', 'Hi'), msg('bot', 'Hello!')]
        await nextTick()
        expect(wrapper!.findAll('.message.user-message')).toHaveLength(1)
        expect(wrapper!.findAll('.message.agent-message .message-bubble').map(b => b.text()))
            .toEqual(['Hello!', 'Need a hand with checkout?'])
    })

    it('offers "New messages" when a reply arrives while the visitor reads further up', async () => {
        list()
        ctrl.messages.value = [msg('user', 'Hi'), msg('bot', 'Hello!')]
        await nextTick()
        const log = wrapper!.get('[role="log"]').element as HTMLElement
        Object.defineProperty(log, 'scrollHeight', { configurable: true, value: 1000 })
        Object.defineProperty(log, 'clientHeight', { configurable: true, value: 400 })
        log.scrollTop = 100
        log.dispatchEvent(new Event('scroll'))
        expect(wrapper!.find('.cm-new-messages').exists()).toBe(false)

        ctrl.messages.value.push(msg('bot', 'One more thing'))
        await nextTick()
        await nextTick()
        const pill = wrapper!.get('button.cm-new-messages')
        expect(pill.text()).toBe('New messages')
        // Outside the log, so it is not read out as part of the conversation.
        expect(log.contains(pill.element)).toBe(false)

        await pill.trigger('click')
        await nextTick()
        expect(wrapper!.find('.cm-new-messages').exists()).toBe(false)
    })

    it('animates a message that arrives live, not the history', async () => {
        list()
        ctrl.messages.value = [msg('user', 'old'), msg('bot', 'older')]
        await nextTick()
        ctrl.messages.value.push(msg('bot', 'new'))
        await nextTick()
        const rows = wrapper!.findAll('.message')
        expect(rows.map(row => row.classes().includes('cm-enter'))).toEqual([false, false, true])
    })
})
