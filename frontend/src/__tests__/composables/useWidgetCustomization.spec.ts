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

import { describe, it, expect, vi, afterEach } from 'vitest'


import { panelFrameFor, useWidgetCustomization } from '@/composables/useWidgetCustomization'

describe('useWidgetCustomization', () => {
    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('forwards widget_display to the parent in CUSTOMIZATION_UPDATE', () => {
        const postMessage = vi.spyOn(window.parent, 'postMessage').mockImplementation(() => {})
        const { applyCustomization } = useWidgetCustomization()

        applyCustomization({
            chat_bubble_color: '#123456',
            customization_metadata: { widget_display: { mode: 'sidebar-left', width: 420 } },
        } as any)

        const message = postMessage.mock.calls.at(-1)![0] as any
        expect(message.type).toBe('CUSTOMIZATION_UPDATE')
        expect(message.data.chat_bubble_color).toBe('#123456')
        expect(message.data.widget_display).toEqual({ mode: 'sidebar-left', width: 420 })
    })

    it('forwards the launcher and its logo', () => {
        const postMessage = vi.spyOn(window.parent, 'postMessage').mockImplementation(() => {})
        const { applyCustomization } = useWidgetCustomization()

        applyCustomization({
            customization_metadata: { launcher: { size: 'sm' } },
            launcher_logo_url: 'https://cdn.example/logo.webp',
        } as any)

        const message = postMessage.mock.calls.at(-1)![0] as any
        expect(message.data.launcher).toEqual({ size: 'sm' })
        expect(message.data.launcher_logo_url).toBe('https://cdn.example/logo.webp')
    })

    it('sends no widget_display when the metadata has none', () => {
        const postMessage = vi.spyOn(window.parent, 'postMessage').mockImplementation(() => {})
        const { applyCustomization } = useWidgetCustomization()

        applyCustomization({ customization_metadata: { avatar_style: 'orb' } } as any)

        const message = postMessage.mock.calls.at(-1)![0] as any
        expect(message.type).toBe('CUSTOMIZATION_UPDATE')
        expect(message.data.widget_display).toBeUndefined()
    })

    it.each([
        [{ widget_ui: { version: 2 } }, 2],
        [{ widget_ui: { version: 1 } }, 1],
        [{}, 1],
    ])('tells the loader which widget design to frame (%j → %i)', (metadata, ui) => {
        const postMessage = vi.spyOn(window.parent, 'postMessage').mockImplementation(() => {})
        const { applyCustomization } = useWidgetCustomization()

        applyCustomization({ customization_metadata: metadata } as any)

        const message = postMessage.mock.calls.at(-1)![0] as any
        expect(message.data.panel.ui).toBe(ui)
        // The classic widget says only which design; the redesign adds its framing.
        if (ui === 1) expect(message.data.panel).toEqual({ ui: 1 })
    })

    it('frames the redesign with its theme\'s radius, shadow, glow and backdrop', () => {
        const postMessage = vi.spyOn(window.parent, 'postMessage').mockImplementation(() => {})
        const { applyCustomization } = useWidgetCustomization()
        applyCustomization({ chat_style: 'GLASS', customization_metadata: { widget_ui: { version: 2 } } } as any)
        const panel = (postMessage.mock.calls.at(-1)![0] as any).data.panel
        expect(panel).toEqual({ ui: 2, radius: 22, elevation: 'dark', glow: 'rgba(157,140,255,.26)', glass: true })

        applyCustomization({ chat_style: 'SUNRISE', customization_metadata: { widget_ui: { version: 2 } } } as any)
        const sunrise = (postMessage.mock.calls.at(-1)![0] as any).data.panel
        expect(sunrise).toMatchObject({ ui: 2, radius: 24, elevation: 'light', glass: false })
        expect(panelFrameFor(1, {})).toEqual({ ui: 1 })
    })

})
