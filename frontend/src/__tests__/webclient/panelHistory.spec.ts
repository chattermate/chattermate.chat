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
import { nextTick, ref } from 'vue'
import HistoryScreen from '@/webclient/panel/history/HistoryScreen.vue'
import PastConversation from '@/webclient/panel/history/PastConversation.vue'
import RecentRow from '@/webclient/panel/history/RecentRow.vue'
import { groupConversations, relativeTime } from '@/webclient/panel/history-groups'
import { emptyHistory } from '@/composables/useConversationHistory'
import { fakeController, mountWithController, type FakeController } from './panelFakeController'

let wrapper: VueWrapper<any> | undefined
let ctrl: FakeController
afterEach(() => { wrapper?.unmount(); wrapper = undefined })

const NOW = new Date('2026-11-11T12:00:00')
const item = (id: string, last_at: string, fields = {}) => ({
    id, title: `Chat ${id}`, last_message: 'Thanks!', last_from_visitor: false, last_at, open: false, current: false,
    resolved_by: null, ...fields,
})

describe('grouping', () => {
    it('puts open chats first, then Today, This week, This month, then months', () => {
        const groups = groupConversations([
            item('today', '2026-11-11T09:00:00'), item('open', '2026-10-01T09:00:00', { open: true }),
            item('week', '2026-11-07T09:00:00'), item('month', '2026-11-01T09:00:00'), item('old', '2026-09-03T09:00:00'),
        ], NOW)
        expect(groups.map(g => [g.label, g.items.map(i => i.id)])).toEqual([
            ['Open', ['open']], ['Today', ['today']], ['This week', ['week']], ['This month', ['month']],
            [new Date('2026-09-03').toLocaleDateString(undefined, { month: 'long', year: 'numeric' }), ['old']],
        ])
    })

    it('says when a conversation last moved', () => {
        expect(relativeTime('2026-11-11T11:55:00', NOW)).toBe('5m')
        expect(relativeTime('2026-11-11T09:00:00', NOW)).toBe('3h')
        expect(relativeTime('2026-11-10T09:00:00', NOW)).toBe('Yesterday')
        expect(relativeTime(null, NOW)).toBe('')
    })
})

describe('your conversations', () => {
    const show = (fields = {}) => {
        ctrl = fakeController()
        ctrl.history.value = { ...emptyHistory(), showing: true, loaded: true, ...fields }
        wrapper = mountWithController(HistoryScreen, ctrl)
    }

    it('lists the chats, opens one, and goes back', async () => {
        show({ items: [item('a', new Date().toISOString(), { last_from_visitor: true })], total: 1 })
        expect(wrapper!.get('section[aria-label="Your conversations"]').text()).toContain('1 conversation')
        const row = wrapper!.get('.cm-conversation')
        expect(row.text()).toContain('You: Thanks!')
        await row.trigger('click')
        expect(ctrl.openConversation).toHaveBeenCalledWith('a')
        await wrapper!.get('button[aria-label="Back"]').trigger('click')
        expect(ctrl.closeHistory).toHaveBeenCalled()
    })

    it('offers search only past eight conversations', async () => {
        show({ items: [item('a', '2026-11-10T10:00:00')], total: 3 })
        expect(wrapper!.find('input[type="search"]').exists()).toBe(false)
        wrapper!.unmount()
        show({ items: [item('a', '2026-11-10T10:00:00')], total: 9 })
        await wrapper!.get('input[type="search"]').setValue('ship')
        expect(ctrl.searchConversations).toHaveBeenCalledWith('ship')
    })

    it('offers to ask in a new chat when nothing matches', async () => {
        show({ total: 9, query: 'refund', results: [], searching: false })
        expect(wrapper!.text()).toContain('Nothing found for "refund".')
        await wrapper!.get('.cm-history__ask').trigger('click')
        expect(ctrl.newMessage.value).toBe('refund')
    })

    it('says when it is empty', () => {
        show({ items: [], total: 0 })
        expect(wrapper!.text()).toContain('No conversations yet.')
    })

    it('offers to find chats from another device with the email check', async () => {
        show({ items: [], total: 0, otherBrowsers: { email: null, offer: true } })
        expect(wrapper!.find('.cm-email-check').exists()).toBe(false)
        await wrapper!.get('.cm-history__others-link').trigger('click')
        const card = wrapper!.get('section[aria-label="Find your other chats"]')
        await card.get('input[type="email"]').setValue('jane@acme.com')
        await card.get('form').trigger('submit')
        expect(ctrl.startEmailCheck).toHaveBeenCalledWith('jane@acme.com', 'history')
    })

    it('says whose chats it includes once the email is confirmed', () => {
        show({ items: [], total: 0, otherBrowsers: { email: 'j•••@acme.com', offer: false } })
        expect(wrapper!.text()).toContain('Including chats confirmed with j•••@acme.com')
        expect(wrapper!.find('.cm-history__others-link').exists()).toBe(false)
    })

    it('offers nothing where the check is not available, or while searching', () => {
        show({ items: [], total: 0 })
        expect(wrapper!.find('.cm-history__others-link').exists()).toBe(false)
        wrapper!.unmount()
        show({ total: 9, query: 'refund', results: [], otherBrowsers: { email: null, offer: true } })
        expect(wrapper!.find('.cm-history__others-link').exists()).toBe(false)
    })
})

describe('a past conversation', () => {
    it('shows it read-only and continues it', async () => {
        ctrl = fakeController()
        ctrl.history.value = { ...emptyHistory(), showing: true, items: [item('a', '2026-11-10T10:00:00')],
            viewing: { id: 'a', open: false, before: null, messages: [
                { message: 'My order is late', message_type: 'user', created_at: '', session_id: '' },
                { message: 'Checking now.', message_type: 'bot', created_at: '', session_id: '' },
            ] } }
        wrapper = mountWithController(PastConversation, ctrl)
        expect(wrapper.findAll('.message').length).toBe(2)
        expect(wrapper.find('textarea').exists()).toBe(false)
        expect(wrapper.find('.cm-answer-actions').exists()).toBe(false)
        await wrapper.get('.cm-past__continue').trigger('click')
        expect(ctrl.continueConversation).toHaveBeenCalledWith('a')
    })

    it('shows an old form without letting it submit into the current chat', () => {
        ctrl = fakeController()
        ctrl.history.value = { ...emptyHistory(), showing: true, items: [item('a', '2026-11-10T10:00:00')],
            viewing: { id: 'a', open: false, before: null, messages: [
                { message: '', message_type: 'form', created_at: '', session_id: '',
                  attributes: { form_data: { title: 'Your details', fields: [{ name: 'email', label: 'Email', type: 'email' }] } } },
            ] } }
        wrapper = mountWithController(PastConversation, ctrl)
        expect(wrapper.text()).toContain('Your details')
        expect(wrapper.find('.cm-form-card button[type="submit"]').exists()).toBe(false)
        expect(wrapper.get('.cm-form-card input').attributes('disabled')).toBeDefined()
    })

    it('goes back to the chat for the current conversation', async () => {
        ctrl = fakeController()
        ctrl.history.value = { ...emptyHistory(), showing: true, items: [item('a', '2026-11-10T10:00:00', { current: true })],
            viewing: { id: 'a', open: true, before: null, messages: [] } }
        wrapper = mountWithController(PastConversation, ctrl)
        expect(wrapper.get('.cm-past__continue').text()).toBe('Back to the chat')
    })
})

describe('the start state\'s Recent row', () => {
    it('reads the list once and shows only the latest earlier chat', async () => {
        ctrl = fakeController()
        wrapper = mountWithController(RecentRow, ctrl)
        expect(ctrl.refreshConversations).toHaveBeenCalledTimes(1)
        ctrl.history.value = { ...emptyHistory(), loaded: true,
            items: [item('now', '2026-11-11T10:00:00', { current: true }), item('a', '2026-11-10T10:00:00'), item('b', '2026-11-09T10:00:00')] }
        await nextTick()
        expect(wrapper.findAll('.cm-conversation')).toHaveLength(1)
        await wrapper.get('.cm-conversation').trigger('click')
        expect(ctrl.openHistory).toHaveBeenCalled()
        expect(ctrl.openConversation).toHaveBeenCalledWith('a')
    })

    it('never asks and shows nothing where past chats cannot be offered (Free)', async () => {
        ctrl = fakeController({ historyAvailable: ref(false) })
        wrapper = mountWithController(RecentRow, ctrl)
        expect(ctrl.refreshConversations).not.toHaveBeenCalled()
        ctrl.history.value = { ...emptyHistory(), loaded: true, items: [item('a', '2026-11-10T10:00:00')] }
        await nextTick()
        expect(wrapper.find('.cm-recent').exists()).toBe(false)
    })
})
