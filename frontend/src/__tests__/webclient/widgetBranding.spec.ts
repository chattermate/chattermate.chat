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
import { mount } from '@vue/test-utils'
import { mountWidget, resetSocket } from './widgetHarness'
import AskAiPanel from '@/webclient/AskAiPanel.vue'
import widgetSource from '@/webclient/WidgetBuilder.vue?raw'

/**
 * "Powered by ChatterMate" comes off only when the server says the plan removes
 * it. A page with no answer, such as an older bootstrap, keeps it.
 */

vi.mock('@/composables/useWidgetSocket', async () => (await import('./widgetHarness')).socketModule())

let wrapper: any

afterEach(() => {
    wrapper?.unmount()
    wrapper = undefined
})

describe('the widget footer', () => {
    const mountWith = async (hideBranding?: boolean) => {
        wrapper = (await mountWidget({ initialData: { hideBranding } })).wrapper
        return wrapper
    }

    beforeEach(() => {
        vi.unstubAllGlobals()
        resetSocket()
    })

    it('keeps the branding by default', async () => {
        await mountWith(undefined)
        expect(wrapper.find('.cm-powered-link').exists()).toBe(true)
    })

    it('keeps the branding when the plan does not remove it', async () => {
        await mountWith(false)
        expect(wrapper.find('.cm-powered-link').exists()).toBe(true)
    })

    it('drops the footer when the plan removes it', async () => {
        await mountWith(true)
        expect(wrapper.find('.cm-powered-link').exists()).toBe(false)
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
    const panel = (showBranding: boolean, disclaimer = '') => (wrapper = mount(AskAiPanel, {
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
    }))

    it('shows the branding', () => {
        expect(panel(true).find('.askai__brand').exists()).toBe(true)
    })

    it('keeps the disclaimer without the branding', () => {
        const footed = panel(false, 'AI can make mistakes')
        expect(footed.find('.askai__brand').exists()).toBe(false)
        expect(footed.find('.askai__foot').text()).toBe('AI can make mistakes')
    })

    it('leaves no empty footer behind', () => {
        expect(panel(false).find('.askai__foot').exists()).toBe(false)
    })
})
