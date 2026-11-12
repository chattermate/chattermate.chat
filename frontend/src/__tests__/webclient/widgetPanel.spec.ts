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
 * The panel end to end through the real widget controller, with the fake socket:
 * which view renders, the header, sending, the live reveal and stop, a takeover,
 * the email step, and focus on open.
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

let wrapper: any

const mountPanel = async (customization: Record<string, any> = {}, initialData: Record<string, any> = {}) => {
    const mounted = await mountWidget({ customization, initialData })
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
    it('is always the panel', async () => {
        await mountPanel({ chat_style: 'SUNRISE' })
        expect(panelRoot().exists()).toBe(true)
        // The redesign's own tokens are on the root.
        expect(panelRoot().attributes('style')).toContain('--cm-tint')
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

    it('says it replies instantly, and "Working on it…" with a typing status while it works', async () => {
        await mountPanel()
        expect(status()).toBe('Replies instantly')
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
        expect(wrapper.find('.cm-answer__name').text()).toBe('Ada')
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

describe('the inline email card: nothing reaches the agent before the email does', () => {
    const UNKNOWN_VISITOR = () => jsonResponse({ detail: 'Unauthorized' }, 401)
    const AUTHORIZED = () => jsonResponse({ agent: { name: 'Ada' } })

    /** A brand-new visitor the server refuses until they give an email. */
    const mountUnknownVisitor = async (customization: Record<string, any> = {}) => {
        socket.hasStartedChat.value = false
        hooks.beforeAuthorize = () => (globalThis.fetch as any).mockResolvedValue(UNKNOWN_VISITOR())
        const mounted = await mountPanel({ collect_email: true, quick_actions: ['Track my order'], ...customization })
        await settle(wrapper, 10)
        return mounted
    }

    const email = () => wrapper.find('input[type="email"]')
    const card = () => wrapper.find('form.cm-email-card')
    const suggestion = () => wrapper.find('button.cm-suggestion')
    const typeAndPressEnter = async (text: string) => {
        await composer().setValue(text)
        await composer().trigger('keydown', { key: 'Enter' })
        await settle(wrapper, 6)
    }
    /** Whether the socket send came after the last authorize call (the email's). */
    const sentAfterAuthorize = (fetchMock: any) => {
        const lastAuthorize = Math.max(...fetchMock.mock.invocationCallOrder)
        return socketCalls.sendMessage.mock.invocationCallOrder[0] > lastAuthorize
    }

    it('sits on the start state with the classic placeholder and button, the composer and suggestions usable', async () => {
        await mountUnknownVisitor()
        expect(card().exists()).toBe(true)
        // Above the start state, in the same scrolling body.
        expect(wrapper.find('.cm-panel__body').element.contains(card().element)).toBe(true)
        expect(wrapper.find('.cm-start').exists()).toBe(true)
        expect(email().attributes('placeholder')).toBe('you@example.com')
        expect(wrapper.findAll('button').some((b: any) => b.text() === 'Continue to chat')).toBe(true)
        expect(composer().attributes('disabled')).toBeUndefined()
        expect(suggestion().attributes('disabled')).toBeUndefined()
    })

    it('holds a message sent with Enter, says why, and points at the email field', async () => {
        await mountUnknownVisitor()
        await typeAndPressEnter('Where is my order?')
        expect(socketCalls.sendMessage).not.toHaveBeenCalled()
        expect((composer().element as HTMLTextAreaElement).value).toBe('Where is my order?')
        expect(wrapper.find('[role="alert"]').text()).toBe('Please enter your email address.')
        expect(wrapper.find('.cm-email-card__held').exists()).toBe(true)
        expect(document.activeElement).toBe(email().element)
    })

    it('holds a message sent with the button', async () => {
        await mountUnknownVisitor()
        await composer().setValue('Hello')
        await sendButton().trigger('click')
        await settle(wrapper, 6)
        expect(socketCalls.sendMessage).not.toHaveBeenCalled()
    })

    it('holds a suggestion', async () => {
        await mountUnknownVisitor()
        await suggestion().trigger('click')
        await settle(wrapper, 6)
        expect(socketCalls.sendMessage).not.toHaveBeenCalled()
        expect((composer().element as HTMLTextAreaElement).value).toBe('Track my order')
    })

    it('holds pasted text, and stages no pasted file', async () => {
        await mountUnknownVisitor()
        // A real paste: text and a screenshot on the clipboard. The browser puts the
        // text in the box; files are not accepted before a person joins.
        const text = 'Order 1042 never arrived'
        const shot = new File(['png'], 'shot.png', { type: 'image/png' })
        const paste = new Event('paste', { bubbles: true, cancelable: true }) as ClipboardEvent
        Object.defineProperty(paste, 'clipboardData', {
            value: {
                getData: (kind: string) => (kind === 'text/plain' ? text : ''),
                items: [{ kind: 'file', getAsFile: () => shot }, { kind: 'string', getAsFile: () => null }],
            },
        })
        composer().element.dispatchEvent(paste)
        await composer().setValue(text)
        await composer().trigger('keydown', { key: 'Enter' })
        await settle(wrapper, 6)
        expect(socketCalls.sendMessage).not.toHaveBeenCalled()
        expect(wrapper.find('.cm-staged').exists()).toBe(false)
        expect(wrapper.find('.cm-email-card__held').text()).toContain('sends as soon as your email is in')
    })

    it('holds a message of files only, then sends them with the email', async () => {
        const { fetchMock } = await mountUnknownVisitor()
        // The page object sets files on the frame's file input directly.
        const input = wrapper.find('input[type="file"]')
        const note = new File(['order 1042'], 'note.txt', { type: 'text/plain' })
        Object.defineProperty(input.element, 'files', { value: [note], configurable: true })
        await input.trigger('change')
        await vi.waitFor(() => expect(wrapper.find('.cm-staged').text()).toContain('note.txt'))

        await sendButton().trigger('click')
        await settle(wrapper, 6)
        expect(socketCalls.sendMessage).not.toHaveBeenCalled()
        expect(wrapper.find('.cm-email-card__held').text()).not.toBe('')

        fetchMock.mockResolvedValue(AUTHORIZED())
        await email().setValue('ada@example.com')
        await card().trigger('submit')
        await settle(wrapper, 12)
        expect(socketCalls.sendMessage).toHaveBeenCalledTimes(1)
        const [text, , files] = socketCalls.sendMessage.mock.calls[0]
        expect(text).toBe('')
        expect(files.map((f: any) => f.filename)).toEqual(['note.txt'])
    })

    it('keeps a typed held message when a suggestion is tapped, and sends that message', async () => {
        const { fetchMock } = await mountUnknownVisitor()
        await typeAndPressEnter('My order 1042 never arrived')
        expect(suggestion().attributes('disabled')).toBeDefined()
        await suggestion().trigger('click')
        await settle(wrapper, 6)
        expect((composer().element as HTMLTextAreaElement).value).toBe('My order 1042 never arrived')

        fetchMock.mockResolvedValue(AUTHORIZED())
        await email().setValue('ada@example.com')
        await card().trigger('submit')
        await settle(wrapper, 12)
        expect(socketCalls.sendMessage).toHaveBeenCalledTimes(1)
        expect(socketCalls.sendMessage).toHaveBeenCalledWith('My order 1042 never arrived', 'ada@example.com', [], {})
    })

    it('lets go of a held message the visitor clears, and sends nothing when the email is in', async () => {
        const { fetchMock } = await mountUnknownVisitor()
        await typeAndPressEnter('Hello')
        expect(wrapper.find('.cm-email-card__held').text()).not.toBe('')
        await composer().setValue('')
        await settle(wrapper)
        expect(wrapper.find('.cm-email-card__held').text()).toBe('')
        expect(suggestion().attributes('disabled')).toBeUndefined()

        fetchMock.mockResolvedValue(AUTHORIZED())
        await email().setValue('ada@example.com')
        await card().trigger('submit')
        await settle(wrapper, 12)
        expect(socketCalls.sendMessage).not.toHaveBeenCalled()
    })

    it('holds a message while the typed email is invalid, and says so', async () => {
        await mountUnknownVisitor()
        await email().setValue('not-an-email')
        await typeAndPressEnter('Hello')
        expect(socketCalls.sendMessage).not.toHaveBeenCalled()
        expect(wrapper.find('[role="alert"]').text()).toBe('Please enter a valid email address.')
        expect(card().exists()).toBe(true)
    })

    it('sends the held message by itself, once, after Continue with a valid email', async () => {
        const { fetchMock } = await mountUnknownVisitor()
        await typeAndPressEnter('Where is my order?')
        expect(socketCalls.sendMessage).not.toHaveBeenCalled()

        fetchMock.mockResolvedValue(AUTHORIZED())
        await email().setValue('ada@example.com')
        await card().trigger('submit')
        await settle(wrapper, 12)

        expect(card().exists()).toBe(false)
        expect(socketCalls.sendMessage).toHaveBeenCalledTimes(1)
        expect(socketCalls.sendMessage).toHaveBeenCalledWith('Where is my order?', 'ada@example.com', [], {})
        expect(sentAfterAuthorize(fetchMock)).toBe(true)
    })

    it('takes the email and sends in one go when the visitor typed both and pressed Enter', async () => {
        const { fetchMock } = await mountUnknownVisitor()
        fetchMock.mockResolvedValue(AUTHORIZED())
        await email().setValue('ada@example.com')
        await typeAndPressEnter('Hello')
        await settle(wrapper, 12)
        expect(socketCalls.sendMessage).toHaveBeenCalledTimes(1)
        expect(socketCalls.sendMessage).toHaveBeenCalledWith('Hello', 'ada@example.com', [], {})
        expect(sentAfterAuthorize(fetchMock)).toBe(true)
    })

    it('sends a held suggestion once the email is in', async () => {
        const { fetchMock } = await mountUnknownVisitor()
        await suggestion().trigger('click')
        await settle(wrapper, 6)
        fetchMock.mockResolvedValue(AUTHORIZED())
        await email().setValue('ada@example.com')
        await card().trigger('submit')
        await settle(wrapper, 12)
        expect(socketCalls.sendMessage).toHaveBeenCalledTimes(1)
        expect(socketCalls.sendMessage).toHaveBeenCalledWith('Track my order', 'ada@example.com', [], {})
    })

    it.each([
        ['a server error', () => jsonResponse({ detail: 'Server error' }, 500)],
        ['a network error', null],
    ])('keeps the card, the composer and the held text on %s, and Continue retries', async (_name, answer) => {
        const { fetchMock } = await mountUnknownVisitor()
        await typeAndPressEnter('Hello')
        if (answer) fetchMock.mockResolvedValue(answer())
        else fetchMock.mockRejectedValue(new Error('offline'))
        await email().setValue('ada@example.com')
        await card().trigger('submit')
        await settle(wrapper, 12)

        // What the visitor sees: the panel, the card with a retryable error, their text.
        expect(socketCalls.sendMessage).not.toHaveBeenCalled()
        expect(wrapper.text()).not.toContain('Authentication Error')
        expect(wrapper.find('.cm-header').exists()).toBe(true)
        expect(card().find('[role="alert"]').text()).toBe('Something went wrong. Please try again.')
        expect(email().element).toBe(document.activeElement)
        expect((composer().element as HTMLTextAreaElement).value).toBe('Hello')
        expect(wrapper.find('.cm-email-card__held').text()).not.toBe('')

        fetchMock.mockReset()
        fetchMock.mockResolvedValue(AUTHORIZED())
        await card().trigger('submit')
        await settle(wrapper, 12)
        expect(card().exists()).toBe(false)
        expect(socketCalls.sendMessage).toHaveBeenCalledTimes(1)
        expect(socketCalls.sendMessage).toHaveBeenCalledWith('Hello', 'ada@example.com', [], {})
    })

    it('keeps holding, with the card up, when the server still refuses the visitor after the email', async () => {
        const { fetchMock } = await mountUnknownVisitor()
        await typeAndPressEnter('Hello')
        fetchMock.mockResolvedValue(UNKNOWN_VISITOR())
        await email().setValue('ada@example.com')
        await card().trigger('submit')
        await settle(wrapper, 12)
        expect(socketCalls.sendMessage).not.toHaveBeenCalled()
        expect(card().exists()).toBe(true)
        expect(card().find('[role="alert"]').text()).toBe('Something went wrong. Please try again.')
        expect((composer().element as HTMLTextAreaElement).value).toBe('Hello')

        // A second try that the server accepts sends it.
        fetchMock.mockResolvedValue(AUTHORIZED())
        await card().trigger('submit')
        await settle(wrapper, 12)
        expect(socketCalls.sendMessage).toHaveBeenCalledTimes(1)
    })

    it('opens the chat on Continue with nothing held, and sends nothing by itself', async () => {
        const { fetchMock } = await mountUnknownVisitor()
        fetchMock.mockResolvedValue(AUTHORIZED())
        await email().setValue('ada@example.com')
        await card().trigger('submit')
        await settle(wrapper, 12)
        expect(card().exists()).toBe(false)
        expect(composer().exists()).toBe(true)
        expect(socketCalls.sendMessage).not.toHaveBeenCalled()
    })
})

describe('after the email was accepted', () => {
    it('does not bring the card back while a new chat starts over', async () => {
        socket.hasStartedChat.value = false
        hooks.beforeAuthorize = () =>
            (globalThis.fetch as any).mockResolvedValue(jsonResponse({ detail: 'Unauthorized' }, 401))
        const { fetchMock } = await mountPanel({ collect_email: true })
        await settle(wrapper, 10)
        fetchMock.mockResolvedValue(jsonResponse({ agent: { name: 'Ada' } }))
        await wrapper.find('input[type="email"]').setValue('ada@example.com')
        await wrapper.find('form.cm-email-card').trigger('submit')
        await settle(wrapper, 12)
        expect(wrapper.find('form.cm-email-card').exists()).toBe(false)

        // A new chat resets the conversation before it authorizes again.
        socket.hasStartedChat.value = false
        socket.messages.value = []
        await settle(wrapper)
        expect(wrapper.find('form.cm-email-card').exists()).toBe(false)
    })
})

describe('a returning visitor', () => {
    /** The real socket blinks loadingHistory while the request goes out; the answer comes later. */
    const historyRequestedNotAnswered = () => {
        socketCalls.loadChatHistory.mockImplementation(async () => {
            socket.loadingHistory.value = true
            socket.loadingHistory.value = false
        })
    }

    it('does not see the start state flash before their history arrives', async () => {
        socket.hasStartedChat.value = false
        historyRequestedNotAnswered()
        await mountPanel()
        expect(socketCalls.loadChatHistory).toHaveBeenCalled()
        expect(wrapper.find('.cm-start').exists()).toBe(false)

        socket.messages.value = [{ message_type: 'user', message: 'Earlier question', created_at: '', session_id: '' }]
        await settle(wrapper)
        expect(wrapper.find('.cm-start').exists()).toBe(false)
        expect(wrapper.find('.message.user-message').text()).toBe('Earlier question')
    })

    it('sees the start state once an empty history answered', async () => {
        socket.hasStartedChat.value = false
        historyRequestedNotAnswered()
        await mountPanel()
        expect(wrapper.find('.cm-start').exists()).toBe(false)
        socket.messages.value = []
        await settle(wrapper)
        expect(wrapper.find('.cm-start').exists()).toBe(true)
    })
})

describe('with the embed loader (plan 1.5)', () => {
    const posted = (post: any, type: string) => post.mock.calls.map(([m]: any[]) => m).filter((m: any) => m?.type === type)

    it('tells the loader how to frame the redesign', async () => {
        const post = vi.spyOn(window.parent, 'postMessage')
        await mountPanel({ chat_style: 'GLASS' })
        const update = posted(post, 'CUSTOMIZATION_UPDATE').at(-1)
        expect(update.data.panel).toEqual({ ui: 2, radius: 22, elevation: 'dark', glow: 'rgba(157,140,255,.26)', glass: true })
    })

    it('shows expand only once the loader says it can, and asks it for the size', async () => {
        await mountPanel()
        expect(wrapper.find('button[aria-label="Expand chat"]').exists()).toBe(false)
        await postFromParent(wrapper, { type: 'HOST_CAPABILITIES', v: 1, expand: true, backdrop: false })
        const post = vi.spyOn(window.parent, 'postMessage')
        vi.useFakeTimers()
        await wrapper.find('button[aria-label="Expand chat"]').trigger('click')
        expect(wrapper.find('.cm-panel').classes()).toContain('cm-resizing')
        await vi.advanceTimersByTimeAsync(200)
        expect(posted(post, 'WIDGET_EXPAND')).toEqual([{ type: 'WIDGET_EXPAND', expanded: true }])
        expect(wrapper.find('.cm-panel').classes()).not.toContain('cm-resizing')
        expect(wrapper.find('button[aria-label="Make chat smaller"]').exists()).toBe(true)
    })

    it('paints Glass see-through only once the loader frosts the page', async () => {
        await mountPanel({ chat_style: 'GLASS' })
        const card = () => (panelRoot().element as HTMLElement).style.getPropertyValue('--cm-card')
        const solid = card()
        expect(solid).not.toContain('gradient')
        await postFromParent(wrapper, { type: 'HOST_CAPABILITIES', v: 1, expand: true, backdrop: true })
        expect(card()).toContain('gradient')
    })

    it('shows the grabber and takes a swipe only once the loader says the panel is a phone sheet', async () => {
        await mountPanel()
        expect(wrapper.find('.cm-grabber').exists()).toBe(false)
        await postFromParent(wrapper, { type: 'HOST_CAPABILITIES', v: 1, expand: false, backdrop: false, swipe: true })
        expect(wrapper.find('.cm-grabber').exists()).toBe(true)
        expect(wrapper.find('.cm-header').classes()).toContain('is-swipeable')
        await postFromParent(wrapper, { type: 'HOST_CAPABILITIES', v: 1, expand: false, backdrop: false, swipe: 'yes' })
        expect(wrapper.find('.cm-grabber').exists()).toBe(false)
    })

    it('ignores capabilities that are not exactly true', async () => {
        await mountPanel({ chat_style: 'GLASS' })
        await postFromParent(wrapper, { type: 'HOST_CAPABILITIES', v: 1, expand: 'yes', backdrop: 1 })
        expect(wrapper.find('button[aria-label="Expand chat"]').exists()).toBe(false)
        expect((panelRoot().element as HTMLElement).style.getPropertyValue('--cm-card')).not.toContain('gradient')
    })

    it('plays the open cascade when the loader opens it', async () => {
        await mountPanel()
        vi.stubGlobal('requestAnimationFrame', (run: () => void) => { run(); return 0 })
        await postFromParent(wrapper, { type: 'WIDGET_VISIBILITY', open: false })
        await postFromParent(wrapper, { type: 'WIDGET_VISIBILITY', open: true, cascade: true })
        expect(wrapper.find('.cm-panel').classes()).toContain('cm-cascade')
    })

    it('tells the loader it is working while hidden, and sends an unread reply for the peek', async () => {
        await mountPanel()
        const post = vi.spyOn(window.parent, 'postMessage')
        await postFromParent(wrapper, { type: 'WIDGET_VISIBILITY', open: false })
        socket.loading.value = true
        await settle(wrapper)
        expect(posted(post, 'WIDGET_ACTIVITY').at(-1)).toEqual({ type: 'WIDGET_ACTIVITY', busy: true })
        socket.loading.value = false
        socket.messages.value.push({ message_type: 'bot', message: 'Your order **shipped**', created_at: '', session_id: '' })
        await settle(wrapper)
        expect(posted(post, 'WIDGET_ACTIVITY').at(-1)).toEqual({ type: 'WIDGET_ACTIVITY', busy: false })
        expect(posted(post, 'UNREAD_PREVIEW').at(-1)).toEqual({ type: 'UNREAD_PREVIEW', text: 'Your order shipped', agentName: 'Ada' })
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
