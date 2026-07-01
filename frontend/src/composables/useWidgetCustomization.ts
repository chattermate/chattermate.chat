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
import WebFont from 'webfontloader'

// Design fonts the redesigned widget always needs (display / body / mono), with
// the weights it actually uses. The user's custom font_family is layered on top.
const DESIGN_FONT_FAMILIES = [
    'Space Grotesk:400,500,600,700',
    'Instrument Sans:400,500,600',
    'JetBrains Mono:400,500,600',
]

// Load the design fonts plus any custom body font, and apply the custom font to
// the chat container once available.
const loadFonts = (customFontFamily?: string) => {
    const families = [...DESIGN_FONT_FAMILIES]

    const primary = customFontFamily?.split(',')[0].trim().replace(/['"]/g, '') || ''
    const alreadyLoaded = DESIGN_FONT_FAMILIES.some(
        f => f.toLowerCase().startsWith(primary.toLowerCase())
    )
    if (primary && !alreadyLoaded) {
        families.push(primary)
    }

    WebFont.load({
        google: { families },
        active: () => {
            if (!customFontFamily) return
            const chatContainer = document.querySelector('.chat-container') as HTMLElement
            if (chatContainer) {
                chatContainer.style.fontFamily = customFontFamily.includes(',')
                    ? customFontFamily
                    : `"${customFontFamily}", system-ui, sans-serif`
            }
        }
    })
}

export function useWidgetCustomization() {
    const customization = ref<Partial<AgentCustomization>>({})
    const agentName = ref('')

    const applyCustomization = (newCustomization: Partial<AgentCustomization>) => {
        customization.value = newCustomization


        if (newCustomization.photo_url) {
            customization.value.photo_url = newCustomization.photo_url
        }

        // Always load the design fonts; layer the custom font_family on top.
        loadFonts(newCustomization.font_family)

        // Send customization update to parent
        window.parent.postMessage({
            type: 'CUSTOMIZATION_UPDATE',
            data: {
                chat_bubble_color: newCustomization.chat_bubble_color || '#C9F24E',
                chat_style: newCustomization.chat_style,
                chat_initiation_messages: newCustomization.chat_initiation_messages || []
            }
        }, '*')
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