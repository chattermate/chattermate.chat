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

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { nextTick, ref } from 'vue'

const postToHost = vi.fn()
vi.mock('@/webclient/host-bridge', () => ({ postToHost: (msg: unknown) => postToHost(msg) }))

import { useWidgetDisplay, isCustomDisplay, CLASSIC_DISPLAY, type DisplayMessage } from '@/composables/useWidgetDisplay'

const setup = (chatStyle = 'CHATBOT', allowAttachments = false, metadata?: Record<string, unknown>) => {
    const messages = ref<DisplayMessage[]>([])
    const gate = ref(false)
    const display = useWidgetDisplay({
        customization: ref({ chat_style: chatStyle as any, customization_metadata: metadata as any }),
        isAskAnythingStyle: ref(chatStyle === 'ASK_ANYTHING'),
        allowAttachments: ref(allowAttachments),
        isExpanded: ref(true),
        messages,
        gatingScreens: [gate],
    })
    return { ...display, messages, gate }
}

describe('useWidgetDisplay', () => {
    beforeEach(() => postToHost.mockReset())
    afterEach(() => vi.unstubAllGlobals())

    it('treats only geometry beyond the classic window as custom', () => {
        expect(isCustomDisplay(null)).toBe(false)
        expect(isCustomDisplay({ ...CLASSIC_DISPLAY })).toBe(false)
        expect(isCustomDisplay({ mode: 'sidebar-right' })).toBe(true)
        expect(isCustomDisplay({ width: 520 })).toBe(true)
    })

    it('uses the palette for ask-anything and tells the host at once', () => {
        const display = setup('ASK_ANYTHING')
        expect(display.useAskAiPanel.value).toBe(true)
        expect(postToHost).toHaveBeenCalledWith({ type: 'WIDGET_SURFACE', palette: true })
    })

    it('tells the host at once that the classic chat panel is on screen', () => {
        const display = setup('CHATBOT')
        expect(display.useAskAiPanel.value).toBe(false)
        expect(postToHost).toHaveBeenCalledOnce()
        expect(postToHost).toHaveBeenCalledWith({ type: 'WIDGET_SURFACE', palette: false })
    })

    it('falls back to the chat panel for chat-only messages and gating screens', async () => {
        const display = setup('ASK_ANYTHING')
        display.messages.value = [{ message_type: 'rating' }]
        await nextTick()
        expect(display.useAskAiPanel.value).toBe(false)
        expect(postToHost).toHaveBeenLastCalledWith({ type: 'WIDGET_SURFACE', palette: false })

        display.messages.value = []
        display.gate.value = true
        expect(display.useAskAiPanel.value).toBe(false)
    })

    it('moves to the chat panel while a gating screen is up, and back after', async () => {
        const display = setup('ASK_ANYTHING')
        postToHost.mockReset()

        display.gate.value = true
        await nextTick()
        expect(display.useAskAiPanel.value).toBe(false)
        expect(postToHost).toHaveBeenLastCalledWith({ type: 'WIDGET_SURFACE', palette: false })

        display.gate.value = false
        await nextTick()
        expect(display.useAskAiPanel.value).toBe(true)
        expect(postToHost).toHaveBeenLastCalledWith({ type: 'WIDGET_SURFACE', palette: true })
        expect(postToHost).toHaveBeenCalledTimes(2)
    })

    it('promotes the palette for a search-bar trigger unless attachments are on', () => {
        const plain = setup()
        plain.parentDisplay.value = { mode: 'ask-ai' }
        expect(plain.isAskAiSurface.value).toBe(true)

        const withFiles = setup('CHATBOT', true)
        withFiles.parentDisplay.value = { mode: 'ask-ai' }
        expect(withFiles.isAskAiSurface.value).toBe(false)
    })

    it('fills a sidebar with square corners', () => {
        const display = setup()
        display.parentDisplay.value = { mode: 'sidebar-left' }
        expect(display.containerStyles.value).toMatchObject({ width: '100%', height: '100%', borderRadius: '0' })
    })

    it('sizes the Ask AI window full screen on a phone-width viewport', () => {
        vi.stubGlobal('innerWidth', 768)
        const display = setup('ASK_ANYTHING')
        expect(display.containerStyles.value).toMatchObject({
            width: '100vw', height: '100vh', maxWidth: '100vw', maxHeight: '100vh', borderRadius: '0',
        })
    })

    it('sizes the Ask AI window for a tablet-width viewport', () => {
        vi.stubGlobal('innerWidth', 1024)
        const display = setup('ASK_ANYTHING')
        expect(display.containerStyles.value).toMatchObject({
            width: '95%', maxWidth: '700px', minWidth: '500px', height: '650px',
        })
    })

    it('sizes the Ask AI window at a fixed size on a desktop viewport', () => {
        vi.stubGlobal('innerWidth', 1280)
        const display = setup('ASK_ANYTHING')
        expect(display.containerStyles.value).toMatchObject({
            width: '100%', maxWidth: '400px', minWidth: '400px', height: '580px',
        })
    })

    it('falls back to the dashboard display settings when no loader reports one', () => {
        const display = setup('CHATBOT', false, { widget_display: { mode: 'sidebar-right' } })
        expect(display.resolvedDisplay.value).toEqual({ mode: 'sidebar-right' })
        expect(display.hasCustomDisplay.value).toBe(true)
        expect(display.containerStyles.value).toMatchObject({ borderRadius: '0' })

        display.parentDisplay.value = { ...CLASSIC_DISPLAY }
        expect(display.resolvedDisplay.value).toEqual(CLASSIC_DISPLAY)
        expect(display.hasCustomDisplay.value).toBe(false)
    })

    it('keeps the Ask AI hotkey on unless the loader turns it off', () => {
        const display = setup()
        expect(display.askAiHotkey.value).toBe(true)
        display.parentDisplay.value = { mode: 'ask-ai', hotkey: true }
        expect(display.askAiHotkey.value).toBe(true)
        display.parentDisplay.value = { mode: 'ask-ai', hotkey: false }
        expect(display.askAiHotkey.value).toBe(false)
    })
})
