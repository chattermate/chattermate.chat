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

import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { mountWidget, resetSocket } from './widgetHarness'
import AskAiPanel from '@/webclient/AskAiPanel.vue'

// Every panel component's source, read from disk.
const PANEL_DIR = resolve(__dirname, '../../webclient/panel')
const panelSources = Object.fromEntries(
    (readdirSync(PANEL_DIR, { recursive: true }) as string[])
        .filter(name => name.endsWith('.vue'))
        .map(name => [name, readFileSync(resolve(PANEL_DIR, name), 'utf8')]),
) as Record<string, string>
const templateOf = (source: string) =>
    source.slice(source.indexOf('<template>'), source.lastIndexOf('</template>'))

/**
 * "Powered by ChatterMate" shows on every plan, in the chat panel and in Ask AI.
 */

vi.mock('@/composables/useWidgetSocket', async () => (await import('./widgetHarness')).socketModule())

let wrapper: any

afterEach(() => {
    wrapper?.unmount()
    wrapper = undefined
})

describe('the widget footer', () => {
    beforeEach(() => {
        vi.unstubAllGlobals()
        resetSocket()
    })

    // The "Powered by ChatterMate" link, by where it goes and what it says.
    const brandLink = () => wrapper.findAll('a[href="https://chattermate.chat"]')
        .find((link: any) => link.text().replace(/\s+/g, ' ').includes('Powered by ChatterMate'))

    it('shows the branding', async () => {
        wrapper = (await mountWidget()).wrapper
        expect(brandLink()).toBeDefined()
    })

    // The chat, the workflow screens and the unavailable screen each draw the footer,
    // and one mount only reaches one of them. The link lives in PanelFooter alone,
    // with nothing hiding it, so every screen shows it.
    it('draws the link from PanelFooter only, unconditionally', () => {
        const withLink = Object.entries(panelSources)
            .filter(([, source]) => templateOf(source).includes('href="https://chattermate.chat"'))
            .map(([name]) => name)
        expect(withLink).toEqual(['PanelFooter.vue'])

        const template = templateOf(panelSources['PanelFooter.vue'])
        const links = template.match(/<a\b[^>]*href="https:\/\/chattermate\.chat"[^>]*>/g) ?? []
        expect(links.length).toBeGreaterThan(0)
        links.forEach(link => expect(link).not.toContain('v-if'))
    })
})

describe('the Ask AI footer', () => {
    const panel = (disclaimer = '') => (wrapper = mount(AskAiPanel, {
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
            active: false,
            hotkey: false,
            citationLabel: () => '',
            citationTooltip: () => '',
            displayText: (_index: number, text: string) => text,
            isStreaming: () => false
        } as any
    }))

    it('shows the branding', () => {
        expect(panel().find('.askai__brand').exists()).toBe(true)
    })

    it('shows the disclaimer beside the branding', () => {
        const footed = panel('AI can make mistakes')
        expect(footed.find('.askai__brand').exists()).toBe(true)
        expect(footed.find('.askai__foot').text()).toContain('AI can make mistakes')
    })
})
