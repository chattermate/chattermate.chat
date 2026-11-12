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

import { mountWidget, resetSocket, settle, socket, socketCalls } from './widgetHarness'

/**
 * Which surface the widget puts on screen. The ask-anything styles answer in the
 * Ask AI palette, but the palette cannot host forms, ratings, product cards or
 * attachments, so a conversation containing one falls back to the full chat panel
 * rather than silently dropping it.
 */

let hostPost: ReturnType<typeof vi.spyOn>
let wrapper: any

beforeEach(() => {
    resetSocket()
    hostPost = vi.spyOn(window, 'postMessage').mockImplementation(() => {})
})

afterEach(() => {
    wrapper?.unmount()
    wrapper = undefined
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
})

const mountStyle = async (chat_style?: string, options: Parameters<typeof mountWidget>[0] = {}) => {
    const mounted = await mountWidget({
        ...options,
        customization: { ...(chat_style ? { chat_style } : {}), ...(options.customization || {}) },
    })
    wrapper = mounted.wrapper
    await settle(wrapper, 6)
    return mounted
}

// The palette's input is labelled by its placeholder: "Ask me anything..." for the
// ask-anything styles, "Type a message..." for a search-bar trigger on a chat style.
// Matched by that exact label, so the chat panel's composer ("Message") can't pass
// for it. The panel's message list is a log, drawn once there is a message.
const PALETTE_LABEL = 'Ask me anything...'
const palette = (wrapper: any, label = PALETTE_LABEL) => wrapper.find(`input[aria-label="${label}"]`)
const chatLog = (wrapper: any) => wrapper.find('[role="log"][aria-label="Messages"]')
const chatComposer = (wrapper: any) => wrapper.find('textarea[aria-label="Message"]')
const surfaces = () => hostPost.mock.calls.map(([m]) => m as any).filter((m) => m?.type === 'WIDGET_SURFACE')

const showMessages = async (wrapper: any, messages: any[]) => {
    socket.messages.value = messages
    await settle(wrapper, 4)
}

const question = { message: 'Do you ship to Canada?', message_type: 'user' }

describe('the ask-anything styles', () => {
    it.each(['ASK_ANYTHING', 'AURORA'])('%s answers in the Ask AI palette, not the chat panel', async (style) => {
        await mountStyle(style)

        expect(palette(wrapper).exists()).toBe(true)
        expect(chatLog(wrapper).exists()).toBe(false)
        expect(surfaces().at(-1)).toEqual({ type: 'WIDGET_SURFACE', palette: true })
    })

    it('keeps plain questions and answers in the palette', async () => {
        await mountStyle('ASK_ANYTHING')

        await showMessages(wrapper, [question, { message: 'We do.', message_type: 'bot' }])

        expect(palette(wrapper).exists()).toBe(true)
        expect(wrapper.text()).toContain('Do you ship to Canada?')
    })
})

describe('falling back to the chat panel', () => {
    // Pinned current behaviour (odd): 'shopify_output' is in the list, but the socket
    // never sends that kind (products arrive as 'product'); see the test further down.
    it.each(['form', 'user_input', 'rating', 'product', 'shopify_output'])(
        'switches to the chat panel once a %s message arrives',
        async (message_type) => {
            await mountStyle('AURORA')

            await showMessages(wrapper, [question, { message: 'One moment', message_type }])

            expect(palette(wrapper).exists()).toBe(false)
            expect(chatLog(wrapper).exists()).toBe(true)
            // The loader resizes from the palette box to the chat window on this.
            expect(surfaces().at(-1)).toEqual({ type: 'WIDGET_SURFACE', palette: false })
        }
    )

    it('switches for a message carrying attachments, but not for an empty attachment list', async () => {
        await mountStyle('ASK_ANYTHING')

        await showMessages(wrapper, [{ ...question, attachments: [] }])
        expect(palette(wrapper).exists()).toBe(true)

        await showMessages(wrapper, [{ ...question, attachments: [{ filename: 'invoice.pdf', file_url: '/api/v1/files/1', content_type: 'application/pdf' }] }])
        expect(palette(wrapper).exists()).toBe(false)
        expect(chatLog(wrapper).exists()).toBe(true)
    })

    it('does not switch for a bot message that only carries shopify_output', async () => {
        // Pinned current behaviour (odd): 'shopify_output' is listed as a chat-only kind but
        // the socket never sends it (products arrive as 'product'), so this stays in the
        // palette, which drops the product cards and renders the text only.
        await mountStyle('ASK_ANYTHING')

        await showMessages(wrapper, [question, {
            message: 'Here are some boots',
            message_type: 'bot',
            shopify_output: { products: [{ id: 'p1', title: 'Trail boot' }] },
        }])

        expect(palette(wrapper).exists()).toBe(true)
        expect(wrapper.text()).not.toContain('Trail boot')
    })

    it('returns to the palette when the chat-only message leaves the conversation', async () => {
        // Nothing latches the fallback: it is recomputed from the current messages.
        await mountStyle('ASK_ANYTHING')
        await showMessages(wrapper, [question, { message: 'Rate us', message_type: 'rating' }])
        expect(palette(wrapper).exists()).toBe(false)

        await showMessages(wrapper, [])

        expect(palette(wrapper).exists()).toBe(true)
        expect(surfaces().at(-1)).toEqual({ type: 'WIDGET_SURFACE', palette: true })
    })
})

describe('the other chat styles', () => {
    it.each([undefined, 'CHATBOT', 'GLASS', 'TERMINAL'])('%s shows the chat panel and never the palette', async (style) => {
        await mountStyle(style)

        expect(chatComposer(wrapper).exists()).toBe(true)
        expect(palette(wrapper).exists()).toBe(false)
        expect(surfaces().at(-1)).toEqual({ type: 'WIDGET_SURFACE', palette: false })

        await showMessages(wrapper, [question, { message: 'We do.', message_type: 'bot' }])
        expect(chatLog(wrapper).exists()).toBe(true)
        expect(palette(wrapper).exists()).toBe(false)
    })

    // The one exception: a box labelled "Ask anything" opens the palette whatever the
    // style, but not when it would hide an enabled attach control.
    const searchBar = { customization_metadata: { widget_display: { mode: 'search-bar' } } }

    it('do show the palette behind a search-bar trigger', async () => {
        await mountStyle('CHATBOT', { customization: searchBar })

        expect(palette(wrapper, 'Type a message...').exists()).toBe(true)
        expect(chatComposer(wrapper).exists()).toBe(false)
        expect(surfaces().at(-1)).toEqual({ type: 'WIDGET_SURFACE', palette: true })
    })

    it('keep the chat panel behind a search-bar trigger when the agent takes attachments', async () => {
        await mountStyle('CHATBOT', {
            customization: searchBar,
            fetchBody: { agent: { name: 'Ada', allow_attachments: true } },
        })

        expect(palette(wrapper, 'Type a message...').exists()).toBe(false)
        expect(chatComposer(wrapper).exists()).toBe(true)
    })
})

describe('the chat panel of an ask-anything style', () => {
    // The palette steps aside for a workflow landing page or a chat-only message;
    // the panel that takes its place keeps the ask-anything wording.
    const showLandingPage = async (wrapper: any) => {
        const onWorkflowState = socketCalls.onWorkflowState.mock.calls[0][0]
        onWorkflowState({ type: 'landing_page', landing_page_data: { heading: 'Spring sale', content: 'Ask us' } })
        await settle(wrapper, 4)
    }
    const rating = { message: 'Rate us', message_type: 'rating' }

    it('is hidden by the palette when nothing displaces it', async () => {
        await mountStyle('ASK_ANYTHING')

        expect(wrapper.text()).toContain('Ask Ada')
        expect(chatComposer(wrapper).exists()).toBe(false)
    })

    it('shows a workflow landing page in place of the palette', async () => {
        await mountStyle('ASK_ANYTHING')
        await showLandingPage(wrapper)

        expect(palette(wrapper).exists()).toBe(false)
        expect(wrapper.text()).toContain('Spring sale')
    })

    it('keeps the ask-anything placeholder in its composer', async () => {
        await mountStyle('ASK_ANYTHING')
        await showMessages(wrapper, [question, rating])

        expect(chatComposer(wrapper).attributes('placeholder')).toBe('Ask me anything...')
    })

    it('says "Connecting..." until the socket is connected', async () => {
        socket.connectionStatus.value = 'connecting'
        await mountStyle('ASK_ANYTHING')
        await showMessages(wrapper, [question, rating])

        expect(chatComposer(wrapper).attributes('placeholder')).toBe('Connecting...')
    })

    it('keeps the landing page up when a message arrives', async () => {
        await mountStyle('ASK_ANYTHING')
        await showLandingPage(wrapper)

        await showMessages(wrapper, [question])

        // The landing page stands in front of the chat until the visitor moves on.
        expect(wrapper.text()).toContain('Spring sale')
        expect(chatLog(wrapper).exists()).toBe(false)
        expect(palette(wrapper).exists()).toBe(false)
    })

    it('is "Type a message..." for the chat styles', async () => {
        await mountStyle('CHATBOT')

        expect(chatComposer(wrapper).attributes('placeholder')).toBe('Type a message...')
    })
})
