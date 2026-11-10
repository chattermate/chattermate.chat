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

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import AskAiPanel from '@/webclient/AskAiPanel.vue'
import widgetSource from '@/webclient/WidgetBuilder.vue?raw'

/**
 * "Powered by ChatterMate" comes off only when the server says the plan removes
 * it. A page with no answer, such as an older bootstrap, keeps it.
 */

const socket = {
    messages: ref<any[]>([]),
    loading: ref(false),
    errorMessage: ref(''),
    showError: ref(false),
    loadingHistory: ref(false),
    hasStartedChat: ref(true),
    connectionStatus: ref('connected'),
    humanAgent: ref({}),
    currentForm: ref(null),
    currentSessionId: ref('session-1'),
    refusal: ref(null)
}

vi.mock('@/composables/useWidgetSocket', () => ({
    useWidgetSocket: () => ({
        ...socket,
        sendMessage: vi.fn(),
        sendFileAttachments: vi.fn(),
        endChat: vi.fn(),
        loadChatHistory: vi.fn(),
        connect: vi.fn().mockResolvedValue(true),
        reconnect: vi.fn(),
        cleanup: vi.fn(),
        onTakeover: vi.fn(),
        onSessionState: vi.fn(),
        onReauthorize: vi.fn(),
        submitRating: vi.fn(),
        submitForm: vi.fn(),
        getWorkflowState: vi.fn(),
        proceedWorkflow: vi.fn(),
        onWorkflowState: vi.fn(),
        onWorkflowProceeded: vi.fn(),
        setToken: vi.fn(),
        setWidgetId: vi.fn(),
        on: vi.fn(),
        emit: vi.fn()
    })
}))

describe('the widget footer', () => {
    const mountWith = async (hideBranding?: boolean) => {
        ;(window as any).__INITIAL_DATA__ = {
            widgetId: 'w-1',
            agentName: 'Ada',
            customization: {},
            customerId: 'c-1',
            customer: {},
            initialToken: 'tok-1',
            hideBranding
        }
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => ({ agent: { name: 'Ada' } })
        }))
        vi.resetModules()
        const WidgetBuilder = (await import('@/webclient/WidgetBuilder.vue')).default
        return mount(WidgetBuilder, { props: { widgetId: 'w-1', token: 'tok-1' } })
    }

    beforeEach(() => {
        vi.unstubAllGlobals()
    })

    it('keeps the branding by default', async () => {
        const wrapper = await mountWith(undefined)
        expect(wrapper.find('.cm-powered-link').exists()).toBe(true)
        wrapper.unmount()
    })

    it('keeps the branding when the plan does not remove it', async () => {
        const wrapper = await mountWith(false)
        expect(wrapper.find('.cm-powered-link').exists()).toBe(true)
        wrapper.unmount()
    })

    it('drops the footer when the plan removes it', async () => {
        const wrapper = await mountWith(true)
        expect(wrapper.find('.cm-powered-link').exists()).toBe(false)
        wrapper.unmount()
    })

    // Welcome, landing, form and chat are a v-else-if chain, so one mount only
    // reaches one of them. Whatever screen is added next must take the check too.
    it('has no branded footer outside the check, on any screen', () => {
        const template = widgetSource.slice(widgetSource.indexOf('<template>'), widgetSource.lastIndexOf('</template>'))
        const links = template.match(/class="cm-powered-link"/g) ?? []
        const guarded = template.match(/v-if="showBranding"/g) ?? []
        expect(links.length).toBeGreaterThan(0)
        expect(guarded.length).toBe(links.length)
    })
})

describe('the Ask AI footer', () => {
    const panel = (showBranding: boolean, disclaimer = '') => mount(AskAiPanel, {
        props: {
            messages: [],
            draft: '',
            agentName: 'Ada',
            suggestions: [],
            placeholder: 'Ask',
            inputEnabled: true,
            loading: false,
            showCitations: false,
            disclaimer,
            showBranding,
            active: false,
            hotkey: false,
            citationLabel: () => '',
            citationTooltip: () => '',
            displayText: (_index: number, text: string) => text,
            isStreaming: () => false
        } as any
    })

    it('shows the branding', () => {
        expect(panel(true).find('.askai__brand').exists()).toBe(true)
    })

    it('keeps the disclaimer without the branding', () => {
        const wrapper = panel(false, 'AI can make mistakes')
        expect(wrapper.find('.askai__brand').exists()).toBe(false)
        expect(wrapper.find('.askai__foot').text()).toBe('AI can make mistakes')
    })

    it('leaves no empty footer behind', () => {
        expect(panel(false).find('.askai__foot').exists()).toBe(false)
    })
})
