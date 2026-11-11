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
import PanelWidget from '@/webclient/panel/PanelWidget.vue'
import { fakeController, mountWithController, type FakeController } from './panelFakeController'
import { OPEN_FOCUS_DELAY_MS } from '@/composables/usePanelVisibility'
import type { WidgetViewHooks } from '@/webclient/panel/controller'
import type { WidgetMessage } from '@/types/widget'

/**
 * The panel shell's screens with a stand-in controller: which part shows when,
 * and the stopgaps that keep every state usable until later units restyle them.
 */

let wrapper: VueWrapper<any> | undefined
let ctrl: FakeController

afterEach(() => {
    wrapper?.unmount()
    wrapper = undefined
    vi.useRealTimers()
    document.body.innerHTML = ''
})

const msg = (message_type: string, message: string): WidgetMessage =>
    ({ message_type, message, created_at: '', session_id: '' })
const conversation = () => ref([msg('user', 'Hi'), msg('bot', 'Hello!')])

/** The DOM hooks the panel handed the controller. */
const viewHooks = () => ctrl.registerView.mock.calls[0][0] as WidgetViewHooks

/** Give the message log real-looking sizes: 1000px of content in a 400px box. */
const sizeLog = () => {
    const log = wrapper!.get('[role="log"]').element as HTMLElement
    Object.defineProperty(log, 'scrollHeight', { configurable: true, value: 1000 })
    Object.defineProperty(log, 'clientHeight', { configurable: true, value: 400 })
    return log
}
const frames = () => vi.advanceTimersByTimeAsync(40)

const panel = (overrides: Partial<FakeController> = {}) => {
    ctrl = fakeController(overrides)
    wrapper = mountWithController(PanelWidget, ctrl)
    return wrapper
}

const buttonNamed = (name: string) => wrapper!.findAll('button').find(b => b.text().trim() === name)

describe('the panel shell', () => {
    it('follows a reveal only at the bottom, but always goes to the end after a send', async () => {
        vi.useFakeTimers()
        panel({ messages: conversation() })
        const log = sizeLog()
        log.scrollTop = 600
        viewHooks().scrollToBottom()
        await frames()
        expect(log.scrollTop).toBe(1000)

        // The visitor scrolls up to read: a reveal leaves them there...
        log.scrollTop = 100
        log.dispatchEvent(new Event('scroll'))
        viewHooks().scrollToBottom()
        await frames()
        expect(log.scrollTop).toBe(100)

        // ...but their own message brings them to the end.
        viewHooks().afterSend()
        await frames()
        expect(log.scrollTop).toBe(1000)
    })

    it('focuses the composer on a page prefill only while shown', async () => {
        panel({ messages: conversation(), hostVisible: ref(false) })
        const field = wrapper!.get('textarea').element
        viewHooks().focusComposer()
        expect(document.activeElement).not.toBe(field)
        ctrl.hostVisible.value = true
        viewHooks().focusComposer()
        expect(document.activeElement).toBe(field)
    })

    it('focuses the composer after the open motion when the page reports it open', async () => {
        vi.useFakeTimers()
        panel({ messages: conversation() })
        viewHooks().hostVisibilityReported!(true)
        await vi.advanceTimersByTimeAsync(OPEN_FOCUS_DELAY_MS)
        expect(document.activeElement).toBe(wrapper!.get('textarea').element)
    })

    it('focuses the email field instead while the email step shows', async () => {
        vi.useFakeTimers()
        panel({ showEmailGate: ref(true) })
        viewHooks().hostVisibilityReported!(true)
        await vi.advanceTimersByTimeAsync(OPEN_FOCUS_DELAY_MS)
        expect(document.activeElement).toBe(wrapper!.get('input[type="email"]').element)
    })

    it('does not take focus from a button the visitor already focused', async () => {
        vi.useFakeTimers()
        panel({ messages: conversation() })
        viewHooks().hostVisibilityReported!(true)
        const minimize = wrapper!.get('button[aria-label="Minimize chat"]').element as HTMLButtonElement
        minimize.focus()
        await vi.advanceTimersByTimeAsync(OPEN_FOCUS_DELAY_MS)
        expect(document.activeElement).toBe(minimize)
    })

    it('is header, conversation, composer and footer', () => {
        panel({ messages: conversation() })
        expect(wrapper!.classes()).toEqual(expect.arrayContaining(['chat-container', 'cm-surface', 'cm-ui-2']))
        expect(wrapper!.find('.cm-header').exists()).toBe(true)
        expect(wrapper!.find('[role="log"]').exists()).toBe(true)
        expect(wrapper!.find('textarea').exists()).toBe(true)
        expect(wrapper!.find('.cm-footer').text()).toContain('AI can make mistakes')
    })

    it('takes its corners from the theme unless the display squares them', async () => {
        panel({ themeVars: ref({ '--cm-radius': '24px' }), containerStyles: ref({ width: '100%', borderRadius: 'var(--radius-lg)' }) })
        expect(wrapper!.attributes('style')).toContain('border-radius: var(--cm-radius)')
        ctrl.containerStyles.value = { width: '100%', borderRadius: '0' }
        await nextTick()
        expect(wrapper!.attributes('style')).toContain('border-radius: 0')
    })

    it('links "Powered by ChatterMate" unless the plan hides it', async () => {
        panel()
        const link = wrapper!.get('.cm-footer a')
        expect(link.text().replace(/\s+/g, ' ')).toBe('Powered by ChatterMate')
        ctrl.showBranding.value = false
        ctrl.showAiDisclaimer.value = false
        await nextTick()
        expect(wrapper!.find('.cm-footer').exists()).toBe(false)
    })

    it('asks before a new chat ends this one', async () => {
        panel({ canStartNewChat: ref(true), newChatArmed: ref(true) })
        await buttonNamed('Start new chat')!.trigger('click')
        expect(ctrl.confirmNewChat).toHaveBeenCalledTimes(1)
        await buttonNamed('Cancel')!.trigger('click')
        expect(ctrl.disarmNewChat).toHaveBeenCalledTimes(1)
    })

    it('shows the Ask AI palette instead when the surface is the palette', () => {
        panel({ useAskAiPanel: ref(true) })
        expect(wrapper!.find('.cm-header').exists()).toBe(false)
        expect(wrapper!.find('.cm-panel').exists()).toBe(false)
    })

    it('renders nothing before it knows its widget', () => {
        panel({ widgetId: ref(null) })
        expect(wrapper!.html()).toBe('<!--v-if-->')
    })
})

describe('the stopgaps until later units', () => {
    it('shows the welcome block in place of the conversation while there is nothing in it', async () => {
        panel({ customization: ref({ welcome_title: 'Hi from Ada', welcome_subtitle: 'Ask away' }), quickActions: ref(['Track my order']) })
        expect(wrapper!.find('[role="log"]').exists()).toBe(false)
        expect(wrapper!.get('.cm-start__title').text()).toBe('Hi from Ada')
        expect(wrapper!.get('.cm-start__subtitle').text()).toBe('Ask away')
        await wrapper!.get('button.cm-chip').trigger('click')
        expect(ctrl.sendQuickAction).toHaveBeenCalledWith('Track my order')

        ctrl.messages.value = [msg('user', 'Track my order')]
        await nextTick()
        expect(wrapper!.find('.cm-start').exists()).toBe(false)
        expect(wrapper!.find('[role="log"]').exists()).toBe(true)
    })

    it('shows the welcome message with the classic hook, and friendly defaults', () => {
        panel({ welcomeMessageText: ref('We answer in seconds.') })
        expect(wrapper!.get('.cm-welcome-block .message-bubble').text()).toBe('We answer in seconds.')
        expect(wrapper!.get('.cm-start__title').text()).toBe('Hi there')
        expect(wrapper!.get('.cm-start__subtitle').text()).toBe('How can we help?')
    })

    it('shows the conversation, not the welcome block, when the page put a message in it', () => {
        panel({
            shownPrompt: ref({ message: 'Need a hand?', chips: [], open: true, source: 'host' as const }),
            promptPlace: { isBefore: () => false, isLast: () => true },
        })
        expect(wrapper!.find('.cm-start').exists()).toBe(false)
        expect(wrapper!.get('[role="log"]').text()).toContain('Need a hand?')
    })

    it('waits for history before showing the welcome block', () => {
        panel({ loadingHistory: ref(true) })
        expect(wrapper!.find('.cm-start').exists()).toBe(false)
    })

    it('shows the email step instead of the conversation and composer', () => {
        panel({ showEmailGate: ref(true) })
        expect(wrapper!.find('[role="log"]').exists()).toBe(false)
        expect(wrapper!.find('textarea').exists()).toBe(false)
        expect(wrapper!.get('input[type="email"]').attributes('placeholder')).toBe('you@example.com')
    })

    it('says when it is starting up or connecting, and offers a retry when the connection failed', async () => {
        panel({ isInitializing: ref(true) })
        expect(wrapper!.get('.cm-notice').text()).toBe('Initializing chat...')
        ctrl.isInitializing.value = false
        ctrl.connectionStatus.value = 'connecting'
        await nextTick()
        expect(wrapper!.get('.cm-notice').text()).toBe('Connecting to chat service...')
        ctrl.connectionStatus.value = 'failed'
        await nextTick()
        await buttonNamed('Click here to reconnect')!.trigger('click')
        expect(ctrl.handleReconnect).toHaveBeenCalledTimes(1)
    })

    it('shows the error alert', () => {
        panel({ showError: ref(true), errorMessage: ref('Something went wrong') })
        expect(wrapper!.get('.cm-notice--error').attributes('role')).toBe('alert')
        expect(wrapper!.get('.cm-notice--error').text()).toBe('Something went wrong')
    })

    it('says the chat is unavailable when the widget is not set up', async () => {
        panel({ showAuthError: ref(true), isApiKeyAuthRequired: ref(true), widgetId: ref(null) })
        expect(wrapper!.text()).toContain('Chat Unavailable')
        await wrapper!.get('button[aria-label="Close chat"]').trigger('click')
        expect(ctrl.minimizeWidget).toHaveBeenCalledTimes(1)
    })

    it('shows the authentication error with a refresh', () => {
        panel({ showAuthError: ref(true), authError: ref('Your session expired.') })
        expect(wrapper!.text()).toContain('Authentication Error')
        expect(wrapper!.text()).toContain('Your session expired.')
        expect(buttonNamed('Refresh Page')).toBeDefined()
    })

    it('shows a workflow landing page with its button', async () => {
        panel({
            showLandingPage: ref(true),
            landingPageData: ref({ heading: 'Welcome', content: 'Let us get you sorted.' }),
            workflowButtonText: ref('Start'),
        })
        expect(wrapper!.find('.cm-header').exists()).toBe(false)
        expect(wrapper!.text()).toContain('Let us get you sorted.')
        await buttonNamed('Start')!.trigger('click')
        expect(ctrl.handleLandingPageProceed).toHaveBeenCalledTimes(1)
    })

    it('shows a full-screen form\'s title as text', () => {
        panel({ showFullScreenForm: ref(true), fullScreenFormData: ref({ title: 'Your details', fields: [] }) })
        expect(wrapper!.get('.cm-screen__title').text()).toBe('Your details')
    })

    it.each([
        ['a landing page', { showLandingPage: ref(true), landingPageData: ref({ heading: 'Welcome' }) }],
        ['a full-screen form', { showFullScreenForm: ref(true), fullScreenFormData: ref({ title: 'Your details', fields: [] }) }],
        ['the unavailable notice', { showAuthError: ref(true), isApiKeyAuthRequired: ref(true) }],
    ] as Array<[string, Partial<FakeController>]>)('keeps "Powered by ChatterMate" under %s, without the AI disclosure', (_name, state) => {
        panel(state)
        expect(wrapper!.get('.cm-footer a').text().replace(/\s+/g, ' ')).toBe('Powered by ChatterMate')
        expect(wrapper!.text()).not.toContain('AI can make mistakes')
    })

    it('offers a new conversation when a workflow conversation ended', async () => {
        panel({ shouldShowNewConversationOption: ref(true), messages: conversation() })
        expect(wrapper!.find('textarea').exists()).toBe(false)
        expect(wrapper!.text()).toContain('This chat has ended.')
        await buttonNamed('Click here to start a new conversation')!.trigger('click')
        expect(ctrl.handleStartNewConversation).toHaveBeenCalledTimes(1)
    })
})
