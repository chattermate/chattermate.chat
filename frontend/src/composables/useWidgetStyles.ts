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

import { computed } from 'vue'
import type { AgentCustomization } from '../types/widget'
import { isColorDark } from '../types/widget'
import { widgetEnv } from '../webclient/widget-env'
import { isAbsoluteUrl } from '../utils/avatars'

// Themed colours now come from the shared design tokens (widget-theme.ts →
// `--cm-*` vars set on `.chat-container`). These computeds return `var(--cm-*)`
// references so the widget's existing inline styles resolve to the token values,
// while user overrides are folded into the vars by `themeCssVars()`.
export function useWidgetStyles(customization: { value: AgentCustomization }) {
    const chatStyles = computed(() => ({
        backgroundColor: 'var(--cm-card)',
        color: 'var(--cm-text)'
    }))

    // Launcher icon still follows the dedicated chat_bubble_color.
    const chatIconStyles = computed(() => ({
        backgroundColor: customization.value.chat_bubble_color || '#C9F24E',
        color: isColorDark(customization.value.chat_bubble_color || '#C9F24E') ? '#FFFFFF' : '#000000'
    }))

    const agentBubbleStyles = computed(() => ({
        backgroundColor: 'var(--cm-agent-bg)',
        color: 'var(--cm-text)'
    }))

    const userBubbleStyles = computed(() => ({
        backgroundColor: 'var(--cm-accent)',
        color: 'var(--cm-on-accent)'
    }))

    const messageNameStyles = computed(() => ({
        color: 'var(--cm-text)'
    }))

    const headerBorderStyles = computed(() => ({
        borderBottom: '1px solid var(--cm-hairline)'
    }))

    const photoUrl = computed(() => {

        if (!customization.value.photo_url) {
            return ''
        }
        // Use signed URL if available
        if (isAbsoluteUrl(customization.value.photo_url)) {
            return customization.value.photo_url
        }
        
        // For local storage, prepend the API URL
        return `${widgetEnv.API_URL}${customization.value.photo_url}`
    })

    const shadowStyle = computed(() => {
        const bgColor = customization.value.chat_background_color || '#ffffff'
        return {
            boxShadow: `0 8px 5px ${isColorDark(bgColor) ? 'rgba(0, 0, 0, 0.24)' : 'rgba(0, 0, 0, 0.12)'}`
        }
    })

    return {
        chatStyles,
        chatIconStyles,
        agentBubbleStyles,
        userBubbleStyles,
        messageNameStyles,
        headerBorderStyles,
        photoUrl,
        shadowStyle
    }
} 