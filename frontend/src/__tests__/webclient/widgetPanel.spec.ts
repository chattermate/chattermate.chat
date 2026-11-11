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

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * The redesigned panel (widget_ui version 2) end to end through the real widget
 * controller, with the fake socket: which view renders, the header, sending, the
 * live reveal and stop, a takeover, the email step, and focus on open.
 */

// As in widgetEmailGate.spec: a hook just before each authorize call, so a test can
// have the server refuse a visitor it does not know yet (no email): the gate stays up.
const hooks = vi.hoisted(() => ({ beforeAuthorize: null as null | (() => void) }))

vi.mock('@/composables/useWidgetSocket', async () => (await import('./widgetHarness')).socketModule())
vi.mock('@/composables/useConversationToken', async (importOriginal) => {
    const real: any = await importOriginal()
    return {
        ...real,
        useConversationToken: (options: any) => {
            const lifecycle = real.useConversationToken(options)
            return {
                ...lifecycle,
                ensureFresh: async (widgetId: string) => {
                    const hook = hooks.beforeAuthorize
                    hooks.beforeAuthorize = null
                    hook?.()
                    return lifecycle.ensureFresh(widgetId)
                },
            }
        },
    }
})

import { jsonResponse, mountWidget, postFromParent, resetSocket, settle, socket, socketCalls } from './widgetHarness'

const V2 = { customization_metadata: { widget_ui: { version: 2 } } }

let wrapper: any

const mountPanel = async (customization: Record<string, any> = {}, initialData: Record<string, any> = {}) => {
    const mounted = await mountWidget({ customization: { ...V2, ...customization }, initialData })
    wrapper = mounted.wrapper
    document.body.appendChild(wrapper.element)
    await settle(wrapper, 6)
    return mounted
}

const panelRoot = () => wrapper.find('.chat-container.cm-surface.cm-ui-2')
const composer = () => wrapper.find('textarea[aria-label="Message"]')
const sendButton = () => wrapper.find('.cm-send')
const status = () => wrapper.find('.cm-status').text()

beforeEach(() => resetSocket())
afterEach(() => {
    wrapper?.unmount()
    wrapper = undefined
    hooks.beforeAuthorize = null
    vi.useRealTimers()
    vi.unstubAllGlobals()
    document.body.innerHTML = ''
})

describe('which view renders', () => {
    it('is the panel when the agent chose the redesign', async () => {
        await mountPanel()
        expect(panelRoot().exists()).toBe(true)
        expect(wrapper.find('.chat-panel').exists()).toBe(false)
        // The redesign's own tokens are on the root.
        expect(panelRoot().attributes('style')).toContain('--cm-tint')
    })

    it('is the classic widget otherwise, without the redesign tokens', async () => {
        const mounted = await mountWidget({ customization: { chat_style: 'SUNRISE' } })
        wrapper = mounted.wrapper
        await settle(wrapper, 6)
        expect(wrapper.find('.cm-ui-2').exists()).toBe(false)
        expect(wrapper.find('.chat-panel').exists()).toBe(true)
        expect(wrapper.find('.chat-container').attributes('style')).not.toContain('--cm-tint')
    })
})

describe('the panel', () => {
    it('keeps the hooks the e2e page object and host scripts use', async () => {
        await mountPanel()
        expect(wrapper.find('.header-info h3').text()).toBe('Ada')
        // The log appears with the first message (the welcome block stands in until then).
        expect(wrapper.find('[role="log"]').exists()).toBe(false)
        socket.messages.value = [{ message_type: 'user', message: 'Hi', created_at: '', session_id: '' }]
        await settle(wrapper)
        expect(wrapper.find('[role="log"][aria-label="Messages"]').exists()).toBe(true)
        expect(composer().attributes('placeholder')).toBe('Type a message...')
        expect(wrapper.find('button[aria-label="Send message"]').exists()).toBe(true)
    })

    it('says the AI replies instantly, and "Working on it…" with a typing status while it works', async () => {
        await mountPanel()
        expect(status()).toBe('AI agent · replies instantly')
        socket.loading.value = true
        await settle(wrapper)
        expect(status()).toBe('Working on it…')
        expect(wrapper.find('[role="status"][aria-label="Agent is replying"]').exists()).toBe(true)
    })

    it('sends on Enter through the controller', async () => {
        await mountPanel()
        await composer().setValue('Where is my order?')
        await composer().trigger('keydown', { key: 'Enter' })
        await settle(wrapper)
        expect(socketCalls.sendMessage).toHaveBeenCalledWith('Where is my order?', expect.anything(), [], {})
        expect((composer().element as HTMLTextAreaElement).value).toBe('')
    })

    it('holds a message typed while a reply is coming and sends it after', async () => {
        await mountPanel()
        socket.loading.value = true
        await settle(wrapper)
        await composer().setValue('one more thing')
        await composer().trigger('keydown', { key: 'Enter' })
        expect(socketCalls.sendMessage).not.toHaveBeenCalled()
        socket.loading.value = false
        await settle(wrapper)
        expect(socketCalls.sendMessage).toHaveBeenCalledWith('one more thing', expect.anything(), [], {})
    })

    it('draws the conversation with the classic hooks', async () => {
        await mountPanel()
        socket.messages.value = [
            { message_type: 'user', message: 'Hi', created_at: '', session_id: '' },
            { message_type: 'bot', message: 'Hello, how can I help?', created_at: '', session_id: '' },
        ]
        await settle(wrapper)
        expect(wrapper.find('.message.user-message .message-bubble').text()).toBe('Hi')
        expect(wrapper.find('.message.agent-message .message-bubble').text()).toBe('Hello, how can I help?')
        expect(wrapper.find('.cm-answer__name').text()).toBe('Ada AI')
    })

    it('turns send into Stop while a live reply is revealing, and Stop shows it in full', async () => {
        await mountPanel()
        const reply = 'This reply is long enough to still be typing when the stop arrives.'
        socket.messages.value.push({ message_type: 'bot', message: reply, stream: true, created_at: '', session_id: '' })
        await settle(wrapper)
        expect(sendButton().attributes('aria-label')).toBe('Stop')

        await sendButton().trigger('click')
        await settle(wrapper)

        expect(wrapper.find('.message.agent-message .message-bubble').text()).toBe(reply)
        expect(sendButton().attributes('aria-label')).toBe('Send message')
        expect(socketCalls.sendMessage).not.toHaveBeenCalled()
    })

    it('shows the person after a takeover: name, avatar, the joined note and their replies', async () => {
        await mountPanel()
        socket.humanAgent.value = { human_agent_name: 'Priya Rao' }
        socket.messages.value.push(
            { message_type: 'system', message: 'Priya Rao joined the conversation', created_at: '', session_id: '' },
            { message_type: 'agent', message: 'Hi, I have it open.', agent_name: 'Priya Rao', created_at: '', session_id: '' },
        )
        await settle(wrapper)
        expect(wrapper.find('.header-info h3').text()).toBe('Priya Rao')
        expect(wrapper.find('.cm-header .cm-person').text()).toBe('PR')
        expect(wrapper.find('.cm-joined__text').text()).toBe('Priya Rao joined the conversation')
        expect(wrapper.find('.message.agent-message.cm-human .message-bubble').text()).toBe('Hi, I have it open.')
        // The AI disclosure goes once a person owns the conversation.
        expect(wrapper.text()).not.toContain('AI can make mistakes')
    })

    it('offers attachments only after a person took over, as the classic widget does', async () => {
        await mountPanel({}, { allowAttachments: true })
        expect(wrapper.find('button[aria-label="Attach a file"]').exists()).toBe(false)
        socket.humanAgent.value = { human_agent_name: 'Priya' }
        await settle(wrapper)
        expect(wrapper.find('button[aria-label="Attach a file"]').exists()).toBe(true)
    })

    it('minimizes through the host page', async () => {
        const post = vi.spyOn(window.parent, 'postMessage')
        await mountPanel()
        await wrapper.find('button[aria-label="Minimize chat"]').trigger('click')
        expect(post.mock.calls.some(([data]) => (data as any)?.type === 'WIDGET_MINIMIZE')).toBe(true)
    })
})

describe('the email step (stopgap until the inline email card)', () => {
    /** A brand-new visitor the server refuses until they give an email. */
    const mountUnknownVisitor = async () => {
        socket.hasStartedChat.value = false
        hooks.beforeAuthorize = () =>
            (globalThis.fetch as any).mockResolvedValue(jsonResponse({ detail: 'Unauthorized' }, 401))
        const mounted = await mountPanel({ collect_email: true })
        await settle(wrapper, 10)
        return mounted
    }

    it('asks for an email before the chat, with the classic text, then opens the chat', async () => {
        const { fetchMock } = await mountUnknownVisitor()
        const email = wrapper.find('input[type="email"]')
        expect(email.attributes('placeholder')).toBe('you@example.com')
        expect(wrapper.text()).toContain("Enter your email and we'll continue the chat.")
        expect(wrapper.findAll('button').some((b: any) => b.text() === 'Continue to chat')).toBe(true)
        expect(composer().exists()).toBe(false)

        fetchMock.mockResolvedValue(jsonResponse({ agent: { name: 'Ada' } }))
        await email.setValue('ada@example.com')
        await wrapper.find('form.cm-email').trigger('submit')
        await settle(wrapper, 10)

        expect(wrapper.find('input[type="email"]').exists()).toBe(false)
        expect(composer().exists()).toBe(true)
    })

    it('says what is wrong with an empty address', async () => {
        await mountUnknownVisitor()
        await wrapper.find('form.cm-email').trigger('submit')
        await settle(wrapper)
        expect(wrapper.find('[role="alert"]').text()).toBe('Please enter your email address.')
    })
})

describe('focus when the panel opens', () => {
    it('focuses the composer about 520ms after the page shows it, never while hidden', async () => {
        await mountPanel()
        vi.useFakeTimers()
        await postFromParent(wrapper, { type: 'WIDGET_VISIBILITY', open: false })
        await vi.advanceTimersByTimeAsync(1000)
        expect(document.activeElement).not.toBe(composer().element)

        await postFromParent(wrapper, { type: 'WIDGET_VISIBILITY', open: true })
        await vi.advanceTimersByTimeAsync(500)
        expect(document.activeElement).not.toBe(composer().element)
        await vi.advanceTimersByTimeAsync(30)
        expect(document.activeElement).toBe(composer().element)
    })

    it('focuses the composer when the first report is already "open" (launcher clicked before the frame was ready)', async () => {
        await mountPanel()
        vi.useFakeTimers()
        // No "closed" first: the panel already counted as shown when this arrives.
        await postFromParent(wrapper, { type: 'WIDGET_VISIBILITY', open: true })
        await vi.advanceTimersByTimeAsync(530)
        expect(document.activeElement).toBe(composer().element)
    })

    it('focuses the email field on open while the email step shows', async () => {
        socket.hasStartedChat.value = false
        hooks.beforeAuthorize = () =>
            (globalThis.fetch as any).mockResolvedValue(jsonResponse({ detail: 'Unauthorized' }, 401))
        await mountPanel({ collect_email: true })
        await settle(wrapper, 10)
        vi.useFakeTimers()
        await postFromParent(wrapper, { type: 'WIDGET_VISIBILITY', open: true })
        await vi.advanceTimersByTimeAsync(530)
        expect(document.activeElement).toBe(wrapper.find('input[type="email"]').element)
    })

    it('does not take focus on load', async () => {
        await mountPanel()
        expect(document.activeElement).not.toBe(composer().element)
    })

    it('fills but never sends a page prefill, focusing only while shown', async () => {
        await mountPanel()
        await postFromParent(wrapper, { type: 'PREFILL_MESSAGE', text: 'About my order' })
        await settle(wrapper)
        expect((composer().element as HTMLTextAreaElement).value).toBe('About my order')
        expect(document.activeElement).toBe(composer().element)
        expect(socketCalls.sendMessage).not.toHaveBeenCalled()
    })
})
