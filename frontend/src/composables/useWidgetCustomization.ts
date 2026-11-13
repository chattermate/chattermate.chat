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

import { ref } from 'vue'
import type { AgentCustomization } from '../types/agent'
import { postToHost } from '../webclient/host-bridge'
import { DEFAULT_LAUNCHER_COLOR } from '../webclient/launcher-style'
import { chatFontStack, loadWidgetFonts } from '../webclient/widget-fonts'
import { panelLookFor } from '../webclient/widget-theme'

// Load the design fonts plus any custom body font, and apply the custom font to
// the chat container once available.
const loadFonts = (customFontFamily?: string) => {
    loadWidgetFonts(customFontFamily, () => {
        if (!customFontFamily) return
        const chatContainer = document.querySelector('.chat-container') as HTMLElement
        if (chatContainer) chatContainer.style.fontFamily = chatFontStack(customFontFamily)
    })
}

/**
 * What the embed loader is told about the panel: its framing (panelLookFor), which
 * the loader validates (panel-style.ts) before any of it reaches the page's CSS.
 * `ui: 2` stays for a loader a page cached before the classic widget was removed.
 */
export const panelFrameFor = (customization: Partial<AgentCustomization>) => ({
    ui: 2 as const,
    ...panelLookFor(customization.chat_style, {
        chat_background_color: customization.chat_background_color,
        chat_text_color: customization.chat_text_color,
        accent_color: customization.accent_color,
        font_family: customization.font_family,
    }),
})

export function useWidgetCustomization() {
    const customization = ref<Partial<AgentCustomization>>({})
    const agentName = ref('')

    const applyCustomization = (newCustomization: Partial<AgentCustomization>) => {
        customization.value = newCustomization

        if (newCustomization.photo_url) {
            customization.value.photo_url = newCustomization.photo_url
        }

        // The design fonts (linked by the frame page) plus any custom font_family.
        loadFonts(newCustomization.font_family)

        // Send customization update to parent
        postToHost({
            type: 'CUSTOMIZATION_UPDATE',
            data: {
                chat_bubble_color: newCustomization.chat_bubble_color || DEFAULT_LAUNCHER_COLOR,
                chat_style: newCustomization.chat_style,
                chat_initiation_messages: newCustomization.chat_initiation_messages || [],
                // Dashboard "Widget placement" defaults — the embed loader merges these
                // under any options the installing developer set.
                widget_display: newCustomization.customization_metadata?.widget_display,
                launcher: newCustomization.customization_metadata?.launcher,
                launcher_logo_url: newCustomization.launcher_logo_url,
                // How the loader frames the panel: radius, shadow, glow, frosted backdrop.
                panel: panelFrameFor(newCustomization)
            }
        })
    }

    // Initialize from window.__INITIAL_DATA__
    const initializeFromData = () => {
        const initialData = window.__INITIAL_DATA__
        if (initialData) {
            applyCustomization(initialData.customization || {})
            agentName.value = initialData.agentName || ''
        }
    }

    return {
        customization,
        agentName,
        applyCustomization,
        initializeFromData
    }
} 