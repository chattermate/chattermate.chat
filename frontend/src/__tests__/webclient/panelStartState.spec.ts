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
import { nextTick, ref } from 'vue'
import type { VueWrapper } from '@vue/test-utils'
import PanelWidget from '@/webclient/panel/PanelWidget.vue'
import StartState from '@/webclient/panel/StartState.vue'
import EmailCard from '@/webclient/panel/EmailCard.vue'
import { fakeController, mountWithController, type FakeController } from './panelFakeController'
import type { WidgetMessage } from '@/types/widget'

/**
 * The start state (the empty chat, every style) and the inline email card, with a
 * stand-in controller. The hold itself (nothing sent before the email) is tested
 * in useComposer.spec and end to end in widgetPanel.spec.
 */

let wrapper: VueWrapper<any> | undefined
let ctrl: FakeController

afterEach(() => {
    wrapper?.unmount()
    wrapper = undefined
    document.body.innerHTML = ''
})

const mountPart = (component: any, overrides: Partial<FakeController> = {}) => {
    ctrl = fakeController(overrides)
    wrapper = mountWithController(component, ctrl)
    return wrapper
}

const msg = (message_type: string, message: string): WidgetMessage =>
    ({ message_type, message, created_at: '', session_id: '' })

describe('the start state', () => {
    it('greets with the welcome title and leads with the welcome subtitle', () => {
        mountPart(StartState, { customization: ref({ welcome_title: 'Good evening', welcome_subtitle: 'How can we help today?' }) })
        expect(wrapper!.get('.cm-start__greeting').text()).toBe('Good evening')
        expect(wrapper!.get('h2.cm-start__headline').text()).toBe('How can we help today?')
    })

    it('falls back to friendly defaults', () => {
        mountPart(StartState)
        expect(wrapper!.get('.cm-start__greeting').text()).toBe('Hi there')
        expect(wrapper!.get('.cm-start__headline').text()).toBe('How can we help?')
    })

    it('shows the welcome message as sanitised markdown body text, with the classic hook', () => {
        mountPart(StartState, { welcomeMessageText: ref('We answer **orders** fast. <img src=x onerror="alert(1)">') })
        const body = wrapper!.get('.cm-welcome-block .message-bubble')
        expect(body.html()).toContain('<strong>orders</strong>')
        expect(body.html()).not.toContain('onerror')
    })

    it('leaves the body out when there is no welcome message', () => {
        mountPart(StartState)
        expect(wrapper!.find('.cm-welcome-block').exists()).toBe(false)
    })

    it('lists the suggestions as rows that send their text', async () => {
        mountPart(StartState, { quickActions: ref(['Track my order', 'Talk to a person']) })
        const list = wrapper!.get('ul.cm-suggestions')
        expect(list.attributes('aria-label')).toBe('Suggestions')
        const rows = list.findAll('button.cm-suggestion')
        expect(rows.map(row => row.text())).toEqual(['Track my order', 'Talk to a person'])
        await rows[1].trigger('click')
        expect(ctrl.sendQuickAction).toHaveBeenCalledWith('Talk to a person')
    })

    it('disables the suggestions while nothing can be sent, and drops them when the chat ended', async () => {
        mountPart(StartState, { quickActions: ref(['Track my order']), isMessageInputEnabled: ref(false) })
        expect(wrapper!.get('button.cm-suggestion').attributes('disabled')).toBeDefined()
        ctrl.shouldShowNewConversationOption.value = true
        await nextTick()
        expect(wrapper!.find('.cm-suggestions').exists()).toBe(false)
    })

    it('rests the suggestions, saying why, while a typed message waits for the email', async () => {
        mountPart(StartState, { quickActions: ref(['Track my order']) })
        const row = () => wrapper!.get('button.cm-suggestion')
        expect(row().attributes('disabled')).toBeUndefined()
        ctrl.heldForEmail.value = true
        await nextTick()
        expect(row().attributes('disabled')).toBeDefined()
        const reason = wrapper!.get(`#${row().attributes('aria-describedby')}`)
        expect(reason.text()).toContain('waiting for your email')
    })

    it('shows the agent mark, large', () => {
        mountPart(StartState)
        expect(wrapper!.find('.cm-mark--lg').exists()).toBe(true)
    })
})

describe('the panel and its start state', () => {
    it('shows the start state while the chat is empty, outside the message log, with the composer below', () => {
        mountPart(PanelWidget)
        expect(wrapper!.find('.cm-start').exists()).toBe(true)
        expect(wrapper!.find('[role="log"]').exists()).toBe(false)
        expect(wrapper!.find('textarea[aria-label="Message"]').exists()).toBe(true)
    })

    it('gives way to the conversation on the first message', async () => {
        mountPart(PanelWidget)
        ctrl.messages.value = [msg('user', 'Track my order')]
        await nextTick()
        await nextTick()
        expect(wrapper!.find('.cm-start').exists()).toBe(false)
        expect(wrapper!.find('[role="log"]').exists()).toBe(true)
    })

    it('stays away while history loads or the page put something in the thread', async () => {
        mountPart(PanelWidget, { loadingHistory: ref(true) })
        expect(wrapper!.find('.cm-start').exists()).toBe(false)
        ctrl.loadingHistory.value = false
        ctrl.shownPrompt.value = { message: 'Need a hand?', chips: [], open: true, source: 'host' }
        ctrl.promptPlace = { isBefore: () => false, isLast: () => true }
        await nextTick()
        expect(wrapper!.find('.cm-start').exists()).toBe(false)
    })

    it('replaces the Ask Anything welcome when the panel, not the palette, is on screen', () => {
        mountPart(PanelWidget, { customization: ref({ chat_style: 'ASK_ANYTHING', welcome_title: 'Ask us' }), useAskAiPanel: ref(false) })
        expect(wrapper!.get('.cm-start__greeting').text()).toBe('Ask us')
        expect(wrapper!.find('.welcome-message-section').exists()).toBe(false)
    })

    it('puts the email card on top of the start state, in one scrolling body, keeping the suggestions and the composer', () => {
        mountPart(PanelWidget, { awaitingEmail: ref(true), quickActions: ref(['Track my order']) })
        const body = wrapper!.get('.cm-panel__body')
        const card = body.get('.cm-email-card').element
        const start = body.get('.cm-start').element
        expect(card.compareDocumentPosition(start) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
        expect(body.find('button.cm-suggestion').exists()).toBe(true)
        // The composer sits outside the scrolling body, pinned below it.
        expect(body.find('textarea').exists()).toBe(false)
        expect(wrapper!.find('textarea[aria-label="Message"]').exists()).toBe(true)
    })

    it('keeps the same card, and what is typed in it, when the thread starts', async () => {
        mountPart(PanelWidget, { awaitingEmail: ref(true) })
        const field = wrapper!.get('input[type="email"]').element as HTMLInputElement
        field.focus()
        ctrl.messages.value = [msg('bot', 'Hello')]
        await nextTick()
        await nextTick()
        expect(wrapper!.find('.cm-start').exists()).toBe(false)
        expect(wrapper!.get('input[type="email"]').element).toBe(field)
        expect(document.activeElement).toBe(field)
    })

    it('carries focus from the card to the composer when the email is accepted', async () => {
        mountPart(PanelWidget, { awaitingEmail: ref(true) })
        ;(wrapper!.get('input[type="email"]').element as HTMLInputElement).focus()
        ctrl.awaitingEmail.value = false
        await nextTick()
        await nextTick()
        expect(wrapper!.find('.cm-email-card').exists()).toBe(false)
        expect(document.activeElement).toBe(wrapper!.get('textarea').element)
    })

    it('leaves focus alone when the email is accepted while the visitor is elsewhere', async () => {
        mountPart(PanelWidget, { awaitingEmail: ref(true) })
        const minimize = wrapper!.get('button[aria-label="Minimize chat"]').element as HTMLButtonElement
        minimize.focus()
        ctrl.awaitingEmail.value = false
        await nextTick()
        await nextTick()
        expect(document.activeElement).toBe(minimize)
    })

    it('does not flash the unavailable screen while the email submit decides, but shows it if it stays', async () => {
        mountPart(PanelWidget, { awaitingEmail: ref(true), submittingEmail: ref(true), showAuthError: ref(true) })
        expect(wrapper!.find('.cm-email-card').exists()).toBe(true)
        expect(wrapper!.text()).not.toContain('Authentication Error')
        ctrl.submittingEmail.value = false
        await nextTick()
        expect(wrapper!.text()).toContain('Authentication Error')
    })

    it('waits for history instead of flashing the start state', async () => {
        mountPart(PanelWidget, { awaitingHistory: ref(true) })
        expect(wrapper!.find('.cm-start').exists()).toBe(false)
        ctrl.awaitingHistory.value = false
        await nextTick()
        expect(wrapper!.find('.cm-start').exists()).toBe(true)
    })
})

describe('the email card', () => {
    const card = (overrides: Partial<FakeController> = {}) => mountPart(EmailCard, overrides)
    const field = () => wrapper!.get('input[type="email"]')

    it('keeps the classic placeholder and button text', () => {
        card()
        expect(field().attributes('placeholder')).toBe('you@example.com')
        expect(field().attributes('aria-label')).toBe('Email')
        expect(wrapper!.get('button[type="submit"]').text()).toBe('Continue to chat')
    })

    it('submits the email to the controller', async () => {
        card()
        await field().setValue('ada@example.com')
        expect(ctrl.emailInput.value).toBe('ada@example.com')
        await wrapper!.trigger('submit')
        // The guarded submit (useEmailGate ignores one while another is in flight).
        expect(ctrl.submitEmailOnce).toHaveBeenCalledTimes(1)
        expect(ctrl.submitEmailGate).not.toHaveBeenCalled()
    })

    it('says it is busy while the submit is in flight', () => {
        card({ submittingEmail: ref(true) })
        expect(wrapper!.get('button[type="submit"]').text()).toBe('Please wait…')
        expect(wrapper!.get('button[type="submit"]').attributes('disabled')).toBeDefined()
    })

    it('announces an error, ties it to the field and moves focus there', async () => {
        card()
        ctrl.emailGateError.value = 'Please enter a valid email address.'
        await nextTick()
        await nextTick()
        const error = wrapper!.get('[role="alert"]')
        expect(error.text()).toBe('Please enter a valid email address.')
        expect(field().attributes('aria-invalid')).toBe('true')
        expect(field().attributes('aria-describedby')).toBe(error.attributes('id'))
        expect(document.activeElement).toBe(field().element)
    })

    it('moves focus to the field only once the submit is over (the field is disabled until then)', async () => {
        card({ submittingEmail: ref(true) })
        ctrl.emailGateError.value = 'Something went wrong. Please try again.'
        await nextTick()
        await nextTick()
        expect(document.activeElement).not.toBe(field().element)
        ctrl.submittingEmail.value = false
        await nextTick()
        await nextTick()
        expect(document.activeElement).toBe(field().element)
    })

    it('clears the error as the visitor types', async () => {
        card({ emailGateError: ref('Please enter your email address.') })
        await field().setValue('a')
        expect(ctrl.emailGateError.value).toBe('')
    })

    it('keeps its live regions mounted and only changes their text, so it is announced', async () => {
        card()
        const alert = wrapper!.get('[role="alert"]')
        const status = wrapper!.get('[role="status"]')
        expect(alert.text()).toBe('')
        expect(status.text()).toBe('')
        expect(field().attributes('aria-describedby')).toBeUndefined()

        ctrl.heldForEmail.value = true
        ctrl.emailGateError.value = 'Something went wrong. Please try again.'
        await nextTick()
        expect(wrapper!.get('[role="alert"]').element).toBe(alert.element)
        expect(wrapper!.get('[role="status"]').element).toBe(status.element)
        expect(status.text()).toBe('Your message is ready. It sends as soon as your email is in.')
        expect(alert.text()).toBe('Something went wrong. Please try again.')
    })

    it('can be focused by the panel', () => {
        card()
        wrapper!.vm.focus()
        expect(document.activeElement).toBe(field().element)
    })
})
