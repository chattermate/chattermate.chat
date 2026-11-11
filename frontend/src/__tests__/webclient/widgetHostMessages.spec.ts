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

vi.mock('@/composables/useWidgetSocket', async () => (await import('./widgetHarness')).socketModule())

import {
    mountWidget, postFromStranger, postFromParent, resetSocket, settle, socket, socketCalls,
} from './widgetHarness'

/**
 * What the widget does with messages from the page that embeds it, and what it tells
 * that page back. The loader (chattermate.js) relies on every one of these; a refactor
 * that drops one breaks embeds silently, because nothing errors on either side.
 */

let hostPost: ReturnType<typeof vi.spyOn>
let wrapper: any

beforeEach(() => {
    resetSocket()
    // Not framed, window.parent === window: postToHost lands on this spy.
    hostPost = vi.spyOn(window, 'postMessage').mockImplementation(() => {})
})

afterEach(() => {
    wrapper?.unmount()
    wrapper = undefined
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
    delete (window as any).__CM_FRAME__
    document.body.innerHTML = ''
})

/** Everything the frame posted to the host page with this type. */
const posted = (type: string) => hostPost.mock.calls.map(([m]) => m as any).filter((m) => m?.type === type)

/** Mount, attached to the document so focus and querySelector behave as in the frame. */
const mountAttached = async (options: Parameters<typeof mountWidget>[0] = {}) => {
    const mounted = await mountWidget(options)
    wrapper = mounted.wrapper
    document.body.appendChild(wrapper.element)
    await settle(wrapper, 6)
    return mounted
}

const chatComposer = (wrapper: any) => wrapper.find('input[placeholder="Type a message..."]')
const paletteInput = (wrapper: any) => wrapper.find('input[aria-label="Ask me anything..."]')

describe('PREFILL_MESSAGE', () => {
    it('fills the chat composer and focuses it, without sending', async () => {
        await mountAttached()

        await postFromParent(wrapper, { type: 'PREFILL_MESSAGE', text: 'Where is my order?' })
        await settle(wrapper)

        const input = chatComposer(wrapper)
        expect((input.element as HTMLInputElement).value).toBe('Where is my order?')
        expect(document.activeElement).toBe(input.element)
        expect(socketCalls.sendMessage).not.toHaveBeenCalled()
    })

    it('cuts the text at 2000 characters', async () => {
        await mountAttached()

        await postFromParent(wrapper, { type: 'PREFILL_MESSAGE', text: 'x'.repeat(2500) })

        expect((chatComposer(wrapper).element as HTMLInputElement).value).toHaveLength(2000)
    })

    it('ignores a prefill whose text is not a string', async () => {
        await mountAttached()

        await postFromParent(wrapper, { type: 'PREFILL_MESSAGE', text: 42 })

        expect((chatComposer(wrapper).element as HTMLInputElement).value).toBe('')
    })

    it('replaces whatever the visitor had typed when a chat is already underway', async () => {
        // Pinned current behaviour (odd): an unsent draft is overwritten, not appended to.
        socket.messages.value = [
            { message: 'Hi', message_type: 'user' },
            { message: 'Hello! How can I help?', message_type: 'bot' },
        ]
        await mountAttached()
        await chatComposer(wrapper).setValue('half a sentence')

        await postFromParent(wrapper, { type: 'PREFILL_MESSAGE', text: 'Track my parcel' })

        expect((chatComposer(wrapper).element as HTMLInputElement).value).toBe('Track my parcel')
        expect(socketCalls.sendMessage).not.toHaveBeenCalled()
    })

    it('fills the Ask AI palette but does not move focus to it', async () => {
        // Pinned current behaviour (odd): the prefill focus looks for the chat-panel and
        // welcome inputs only, so in the palette focus stays wherever it was.
        await mountAttached({ customization: { chat_style: 'ASK_ANYTHING' } })
        const input = paletteInput(wrapper)
        ;(input.element as HTMLInputElement).blur()

        await postFromParent(wrapper, { type: 'PREFILL_MESSAGE', text: 'Do you ship abroad?' })
        await settle(wrapper)

        expect((input.element as HTMLInputElement).value).toBe('Do you ship abroad?')
        expect(document.activeElement).not.toBe(input.element)
    })
})

describe('WIDGET_VISIBILITY', () => {
    it('focuses the palette on mount when nobody has reported visibility (direct iframe)', async () => {
        await mountAttached({ customization: { chat_style: 'ASK_ANYTHING' } })

        expect(document.activeElement).toBe(paletteInput(wrapper).element)
    })

    it('does not focus the palette while hidden, and focuses it once shown', async () => {
        await mountAttached({ customization: { chat_style: 'ASK_ANYTHING' } })
        await postFromParent(wrapper, { type: 'WIDGET_VISIBILITY', open: false })
        ;(paletteInput(wrapper).element as HTMLInputElement).blur()

        // The palette remounts (chat-only message, then a new empty chat) while hidden.
        socket.messages.value = [{ message_type: 'rating', message: 'Rate us' }]
        await settle(wrapper)
        expect(paletteInput(wrapper).exists()).toBe(false)
        socket.messages.value = []
        await settle(wrapper, 5)
        expect(paletteInput(wrapper).exists()).toBe(true)
        expect(document.activeElement).not.toBe(paletteInput(wrapper).element)

        await postFromParent(wrapper, { type: 'WIDGET_VISIBILITY', open: true })
        await settle(wrapper)

        expect(document.activeElement).toBe(paletteInput(wrapper).element)
    })
})

describe('SCROLL_TO_BOTTOM', () => {
    it('scrolls the message list to its end', async () => {
        await mountAttached()
        const log = wrapper.find('[role="log"][aria-label="Messages"]').element as HTMLElement
        let scrollTop = 0
        Object.defineProperty(log, 'scrollHeight', { configurable: true, value: 940 })
        Object.defineProperty(log, 'scrollTop', {
            configurable: true, get: () => scrollTop, set: (v: number) => { scrollTop = v },
        })

        await postFromParent(wrapper, { type: 'SCROLL_TO_BOTTOM' })

        expect(scrollTop).toBe(940)
    })
})

describe('HOST_PAGE', () => {
    it('records the embedding page URL that leads and journeys report', async () => {
        await mountAttached()
        // The instance WidgetBuilder loaded (mountWidget resets modules first).
        const frameSession = await import('@/webclient/frame-session')

        await postFromParent(wrapper, { type: 'HOST_PAGE', url: 'https://shop.example/pricing' })
        expect(frameSession.reportedPageUrl()).toBe('https://shop.example/pricing')

        // An empty or non-string URL leaves the last good one in place.
        await postFromParent(wrapper, { type: 'HOST_PAGE', url: '' })
        await postFromParent(wrapper, { type: 'HOST_PAGE', url: 7 })
        expect(frameSession.reportedPageUrl()).toBe('https://shop.example/pricing')
    })
})

describe('END_CHAT', () => {
    it('closes the session on the server and answers END_CHAT_DONE when the host shares identity', async () => {
        // A /data page (not the /frame page) always shares identity with its host.
        const { fetchMock } = await mountAttached()
        fetchMock.mockClear()

        await postFromParent(wrapper, { type: 'END_CHAT', sessionId: 'session-9' })
        await settle(wrapper)

        const [url, init] = fetchMock.mock.calls[0]
        expect(String(url)).toContain('/widgets/w-1/end-chat')
        expect(String(url)).toContain('session_id=session-9')
        expect(String(url)).toContain('reason=CUSTOMER_REQUEST')
        expect(init).toMatchObject({ method: 'POST', keepalive: true })
        expect(posted('END_CHAT_DONE')).toHaveLength(1)
    })

    it('still answers END_CHAT_DONE when there is no session to close', async () => {
        const { fetchMock } = await mountAttached()
        fetchMock.mockClear()

        await postFromParent(wrapper, { type: 'END_CHAT' })

        expect(fetchMock).not.toHaveBeenCalled()
        expect(posted('END_CHAT_DONE')).toHaveLength(1)
    })

    it('is ignored by a frame embedded without the loader, which shares no identity', async () => {
        ;(window as any).__CM_FRAME__ = { widgetId: 'w-1' }
        const { fetchMock } = await mountAttached()
        fetchMock.mockClear()

        await postFromParent(wrapper, { type: 'END_CHAT', sessionId: 'session-9' })

        expect(fetchMock).not.toHaveBeenCalled()
        expect(posted('END_CHAT_DONE')).toHaveLength(0)
    })
})

/** The authorize calls the widget made, newest last. */
const authorizeCalls = (fetchMock: any) =>
    fetchMock.mock.calls.filter(([url]: any[]) => /\/widgets\/w-1(\?|$)/.test(String(url)))
const bearerOf = (call: any[]) => call[1]?.headers?.Authorization

describe('TOKEN_REFRESH', () => {
    it('adopts the host token, tells the socket and the host, and authorizes with it', async () => {
        const { fetchMock } = await mountAttached()
        socket.messages.value = [{ message: 'Hi', message_type: 'user' }]
        const before = authorizeCalls(fetchMock).length

        await postFromParent(wrapper, { type: 'TOKEN_REFRESH', token: 'tok-2' })
        await settle(wrapper, 6)

        const calls = authorizeCalls(fetchMock)
        expect(calls).toHaveLength(before + 1)
        expect(bearerOf(calls.at(-1))).toBe('Bearer tok-2')
        expect(socketCalls.setToken).toHaveBeenCalledWith('tok-2')
        expect(posted('TOKEN_UPDATE')).toEqual([{ type: 'TOKEN_UPDATE', token: 'tok-2' }])
        // Re-authorized in place: the conversation on screen stays.
        expect(wrapper.text()).toContain('Hi')

        // The same token again is a no-op.
        await postFromParent(wrapper, { type: 'TOKEN_REFRESH', token: 'tok-2' })
        await settle(wrapper, 6)
        expect(authorizeCalls(fetchMock)).toHaveLength(before + 1)
    })
})

describe('IDENTITY_UNAVAILABLE', () => {
    it('drops the identity and authorizes again as an anonymous visitor', async () => {
        const { fetchMock } = await mountAttached()
        expect(bearerOf(authorizeCalls(fetchMock).at(-1))).toBe('Bearer tok-1')
        const before = authorizeCalls(fetchMock).length

        await postFromParent(wrapper, { type: 'IDENTITY_UNAVAILABLE' })
        await settle(wrapper, 6)

        const calls = authorizeCalls(fetchMock)
        expect(calls).toHaveLength(before + 1)
        expect(bearerOf(calls.at(-1))).toBeUndefined()
        // No error card: the visitor carries on chatting, just not signed in.
        expect(wrapper.text()).not.toContain('Authentication Error')
        expect(chatComposer(wrapper).exists()).toBe(true)
    })
})

describe('WIDGET_DISPLAY', () => {
    it("takes the loader's display geometry: a search-bar trigger opens the palette", async () => {
        await mountAttached()
        expect(wrapper.find('[role="log"][aria-label="Messages"]').exists()).toBe(true)
        expect(posted('WIDGET_SURFACE').at(-1)).toEqual({ type: 'WIDGET_SURFACE', palette: false })

        await postFromParent(wrapper, { type: 'WIDGET_DISPLAY', mode: 'search-bar', width: 640, height: 72, hotkey: true })
        await settle(wrapper)

        expect(wrapper.find('input[aria-label="Type a message..."]').exists()).toBe(true)
        expect(wrapper.find('[role="log"][aria-label="Messages"]').exists()).toBe(false)
        expect(posted('WIDGET_SURFACE').at(-1)).toEqual({ type: 'WIDGET_SURFACE', palette: true })
    })
})

describe('a message posted while the widget is still starting', () => {
    it('is handled: the listener is in place as soon as the widget mounts', async () => {
        // No settle: the loader posts on iframe load, before authorizing has finished.
        ;({ wrapper } = await mountWidget())
        document.body.appendChild(wrapper.element)
        await postFromParent(wrapper, { type: 'PREFILL_MESSAGE', text: 'Early bird' })
        await settle(wrapper, 6)

        expect((chatComposer(wrapper).element as HTMLInputElement).value).toBe('Early bird')
    })
})

describe('messages the widget does not act on', () => {
    it('ignores unknown types, payloads without a type, and senders other than the parent', async () => {
        const { fetchMock } = await mountAttached()
        fetchMock.mockClear()
        hostPost.mockClear()

        await postFromParent(wrapper, { type: 'SOMETHING_NEW', text: 'hi' })
        await postFromParent(wrapper, { text: 'no type' })
        // postFromStranger sends no event.source, as a sibling frame's message would look.
        await postFromStranger(wrapper, { type: 'PREFILL_MESSAGE', text: 'from a sibling' })
        await postFromStranger(wrapper, { type: 'END_CHAT', sessionId: 'session-9' })

        expect((chatComposer(wrapper).element as HTMLInputElement).value).toBe('')
        expect(fetchMock).not.toHaveBeenCalled()
        expect(hostPost).not.toHaveBeenCalled()
    })
})

describe('the Escape forwarder', () => {
    const pressEscape = (init: KeyboardEventInit = {}) =>
        document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true, ...init }))

    it('tells the host about Escape when framed on our origin', async () => {
        ;(window as any).__CM_FRAME__ = { widgetId: 'w-1' }
        await mountAttached()

        pressEscape()

        expect(posted('WIDGET_ESCAPE')).toHaveLength(1)
    })

    it('stays quiet when not framed', async () => {
        await mountAttached()

        pressEscape()

        expect(posted('WIDGET_ESCAPE')).toHaveLength(0)
    })

    it('stays quiet for other keys, and when something already handled Escape', async () => {
        ;(window as any).__CM_FRAME__ = { widgetId: 'w-1' }
        await mountAttached()

        document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
        const swallow = (event: Event) => event.preventDefault()
        document.addEventListener('keydown', swallow)
        pressEscape()
        document.removeEventListener('keydown', swallow)

        expect(posted('WIDGET_ESCAPE')).toHaveLength(0)
    })

    it('in the Ask AI palette, posts WIDGET_ESCAPE as well as closing the palette', async () => {
        // Pinned current behaviour (bug): the frame's listener runs before the palette calls
        // preventDefault, so one key press posts both WIDGET_ESCAPE and WIDGET_MINIMIZE.
        ;(window as any).__CM_FRAME__ = { widgetId: 'w-1' }
        await mountAttached({ customization: { chat_style: 'ASK_ANYTHING' } })

        pressEscape()

        expect(posted('WIDGET_ESCAPE')).toHaveLength(1)
        expect(posted('WIDGET_MINIMIZE')).toHaveLength(1)
    })
})
