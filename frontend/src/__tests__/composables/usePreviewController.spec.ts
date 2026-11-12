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
import { effectScope, isRef, nextTick, ref } from 'vue'
import type { AgentCustomization } from '@/types/agent'
import { usePreviewController, type PreviewContext } from '@/composables/usePreviewController'
import { previewSampleConversation } from '@/webclient/panel/preview-sample'
import { PREVIEW_SAMPLE_COPY } from '@/webclient/copy'
import { fakeController } from '../webclient/panelFakeController'

/**
 * The dashboard preview's widget controller: the whole WidgetController (vue-tsc
 * checks its shape against the interface), drawn from the unsaved customization and
 * the sample conversation, and inert: nothing is sent, stored or posted anywhere.
 */


function setUp(customization: Partial<AgentCustomization> = {}, context: Partial<PreviewContext> = {}) {
    const look = ref<Partial<AgentCustomization>>({ chat_style: 'SUNRISE', ...customization })
    const scope = effectScope()
    const ctrl = scope.run(() => usePreviewController(look, previewSampleConversation(), {
        widgetId: ref('agent-1'),
        agentName: ref('Ada'),
        photoUrl: ref('https://cdn.test/ada.png'),
        showBranding: ref(true),
        width: ref(400),
        height: ref(600),
        ...context,
    }))!
    return { ctrl, look, stop: () => scope.stop() }
}

let fetchSpy: ReturnType<typeof vi.fn>
let postSpy: ReturnType<typeof vi.spyOn>
beforeEach(() => {
    fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)
    postSpy = vi.spyOn(window, 'postMessage')
})
afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
})

describe('usePreviewController', () => {
    it('has every member the views use, none left undefined', () => {
        const { ctrl } = setUp()
        const members = Object.keys(fakeController())
        expect(members.length).toBeGreaterThan(100)
        for (const member of members) expect(ctrl, member).toHaveProperty(member)
        for (const [member, value] of Object.entries(ctrl)) expect(value, member).not.toBeUndefined()
        expect(ctrl.widgetId.value).toBe('agent-1')
    })

    it('shows the sample: the question, the answer with its sources, and the action it took', () => {
        const { ctrl } = setUp()
        expect(ctrl.messages.value.map(m => [m.message_type, m.message])).toEqual([
            ['user', PREVIEW_SAMPLE_COPY.question],
            ['bot', PREVIEW_SAMPLE_COPY.answer],
        ])
        expect(ctrl.messages.value[1].sources).toHaveLength(2)
        expect(ctrl.receiptsAfter(2)).toEqual([{ text: PREVIEW_SAMPLE_COPY.receipt, tone: 'done' }])
        expect(ctrl.receiptsAfter(1)).toEqual([])
        expect(ctrl.receiptCount.value).toBe(1)
        // Fully revealed, never streaming.
        expect(ctrl.displayText(1, 'full text')).toBe('full text')
        expect(ctrl.isStreaming(1)).toBe(false)
    })

    it('follows the unsaved customization as it is edited', () => {
        const { ctrl, look } = setUp()
        const sunrise = JSON.stringify(ctrl.themeVars.value)
        look.value = { ...look.value, chat_style: 'GLASS' }
        expect(JSON.stringify(ctrl.themeVars.value)).not.toBe(sunrise)

        expect(ctrl.showCitations.value).toBe(false)
        look.value = { ...look.value, show_citations: true }
        expect(ctrl.showCitations.value).toBe(true)

        const glass = JSON.stringify(ctrl.themeVars.value)
        look.value = { ...look.value, accent_color: '#FF5500' }
        expect(JSON.stringify(ctrl.themeVars.value)).not.toBe(glass)
    })

    it('goes to the start state when the welcome text or quick actions change, and back on a quick action', async () => {
        const { ctrl, look } = setUp()
        look.value = { ...look.value, quick_actions: ['Track my order'] }
        await nextTick()
        expect(ctrl.messages.value).toEqual([])
        expect(ctrl.quickActions.value).toEqual(['Track my order'])

        ctrl.sendQuickAction('Track my order')
        expect(ctrl.messages.value).toHaveLength(2)

        look.value = { ...look.value, welcome_message: 'Hi there' }
        await nextTick()
        expect(ctrl.messages.value).toEqual([])
        expect(ctrl.welcomeMessageText.value).toBe('Hi there')
    })

    it('keeps the sample when the form or a save only fills in empty welcome text and quick actions', async () => {
        const { ctrl, look } = setUp()
        // On load: the dashboard starts without them, the form sends them as '' and [].
        look.value = { ...look.value, welcome_title: '', welcome_subtitle: '', welcome_message: '', quick_actions: [] }
        await nextTick()
        // After a save: the server sends them back as null.
        look.value = { ...look.value, welcome_title: null, welcome_message: null, quick_actions: null } as never
        await nextTick()
        look.value = { ...look.value, quick_actions: ['  '.trim()] }
        await nextTick()
        expect(ctrl.messages.value).toHaveLength(2)
    })

    it('opens the Ask AI designs on their palette with nothing asked yet', () => {
        const { ctrl } = setUp({ chat_style: 'ASK_ANYTHING' })
        expect(ctrl.useAskAiPanel.value).toBe(true)
        expect(ctrl.messages.value).toEqual([])
        expect(ctrl.askAiHotkey.value).toBe(false)
    })

    it('takes branding, the photo and the help center from the dashboard, never the widget\'s startup data', () => {
        ;(window as any).__INITIAL_DATA__ = { hideBranding: true, helpCenterUrl: 'https://help.example' }
        try {
            const { ctrl } = setUp({}, { showBranding: ref(true), helpCenterUrl: ref('https://acme.help') })
            expect(ctrl.showBranding.value).toBe(true)
            expect(ctrl.helpCenterUrl.value).toBe('https://acme.help')
            expect(ctrl.photoUrl.value).toBe('https://cdn.test/ada.png')
        } finally {
            delete (window as any).__INITIAL_DATA__
        }
        expect(setUp().ctrl.helpCenterUrl.value).toBeNull()
    })

    it('is never "shown by a host", so the panel never takes the dashboard\'s focus', () => {
        expect(setUp().ctrl.hostVisible.value).toBe(false)
    })

    it('shows follow-up questions under the sample answer only when they are on', async () => {
        const { ctrl, look } = setUp()
        const answer = () => ctrl.messages.value[1]
        expect(answer().attributes?.quick_replies).toBeUndefined()
        look.value = {
            ...look.value,
            customization_metadata: { ...look.value.customization_metadata, answers: { follow_ups: true } },
        }
        await nextTick()
        expect(answer().attributes?.quick_replies).toHaveLength(2)
    })

    it('is inert: typing works, nothing is sent, stored or posted to a host', async () => {
        const { ctrl } = setUp({ allow_new_chat: true })
        ctrl.newMessage.value = 'Hello?'
        await ctrl.sendMessage()
        expect(ctrl.newMessage.value).toBe('Hello?')
        expect(ctrl.messages.value).toHaveLength(2)

        const enter = new KeyboardEvent('keydown', { key: 'Enter', cancelable: true })
        ctrl.handleKeyPress(enter)
        expect(enter.defaultPrevented).toBe(true)

        // Every action runs without effect.
        ctrl.minimizeWidget()
        await ctrl.handleReconnect()
        await ctrl.handleStarClick(5)
        await ctrl.submitEmailOnce()
        ctrl.approveAction()
        await ctrl.handleFormSubmit({} as never)
        await ctrl.ready
        expect(fetchSpy).not.toHaveBeenCalled()
        expect(postSpy).not.toHaveBeenCalled()
        expect(ctrl.connectionStatus.value).toBe('connected')
        expect(ctrl.hostCapabilities.value).toEqual({ expand: false, backdrop: false, navigate: false, swipe: false })
        ctrl.sendFeedback(ctrl.messages.value[1], 'up')

        // "New chat" goes back to the start state; nothing is ended.
        expect(ctrl.canStartNewChat.value).toBe(true)
        ctrl.requestNewChat()
        expect(ctrl.messages.value).toEqual([])
        expect(ctrl.canStartNewChat.value).toBe(false)
    })

    it('sizes its box from the dashboard\'s window size', () => {
        const width = ref(360)
        const { ctrl } = setUp({}, { width, height: ref(520) })
        expect(ctrl.containerStyles.value).toMatchObject({ width: '360px', height: '520px' })
        width.value = 420
        expect(ctrl.containerStyles.value.width).toBe('420px')
        expect(isRef(ctrl.newMessage)).toBe(true)
    })
})
