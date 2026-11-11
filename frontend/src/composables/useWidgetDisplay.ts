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

import { computed, ref, watch, type Ref } from 'vue'
import type { AgentCustomization } from '../types/agent'

/** The display geometry the embed loader reports with WIDGET_DISPLAY. */
export interface WidgetDisplay {
    mode?: string
    width?: number
    height?: number
    hotkey?: boolean
}

/** The fields the surface choice reads on a chat message. */
export interface DisplayMessage {
    message_type?: string
    attributes?: unknown
    attachments?: unknown[]
}

export interface WidgetDisplayOptions {
    customization: Ref<Partial<AgentCustomization>>
    isAskAnythingStyle: Readonly<Ref<boolean>>
    allowAttachments: Ref<boolean>
    isExpanded: Ref<boolean>
    messages: Ref<DisplayMessage[]>
    /** Screens that gate the conversation (workflow screens, the email gate, ...). */
    gatingScreens: Readonly<Ref<boolean>>[]
    /** The frame's viewport width, read when the Ask AI size is worked out. */
    viewportWidth: () => number
    /** Tells the embedder which surface is on screen (true: the Ask AI palette). */
    reportSurface: (palette: boolean) => void
}

// Classic floating-window geometry: must mirror the chattermate.js config defaults
// (displayMode/containerWidth/containerHeight); at these values the loader behaves
// exactly as before display modes existed.
export const CLASSIC_DISPLAY = { mode: 'floating', width: 400, height: 560 }

// Message kinds the palette deliberately doesn't render: they need the chat panel's
// interactive UI (forms, rating, product cards) or its attachment rendering. Rather
// than silently dropping them, the whole conversation falls back to the chat panel.
export const CHAT_ONLY_MESSAGE_TYPES = ['form', 'user_input', 'rating', 'product', 'shopify_output']

/** Whether the host container has geometry beyond the classic floating window. */
export const isCustomDisplay = (display: WidgetDisplay | null): boolean => {
    if (!display) return false
    return (
        (typeof display.mode === 'string' && display.mode !== CLASSIC_DISPLAY.mode) ||
        (typeof display.width === 'number' && display.width !== CLASSIC_DISPLAY.width) ||
        (typeof display.height === 'number' && display.height !== CLASSIC_DISPLAY.height)
    )
}

const BASE_STYLES = { width: '100%', height: '100%', borderRadius: 'var(--radius-lg)' }

// The fixed Ask AI sizes for a frame the loader does not size, by viewport width.
const askAnythingStyles = (viewportWidth: number) => {
    if (viewportWidth <= 768) {
        return {
            ...BASE_STYLES,
            width: '100vw',
            height: '100vh',
            maxWidth: '100vw',
            maxHeight: '100vh',
            minWidth: 'unset',
            borderRadius: '0'
        }
    }
    if (viewportWidth <= 1024) {
        return { ...BASE_STYLES, width: '95%', maxWidth: '700px', minWidth: '500px', height: '650px' }
    }
    return { ...BASE_STYLES, width: '100%', maxWidth: '400px', minWidth: '400px', height: '580px' }
}

/**
 * Where and how the widget is shown: the loader's display geometry, whether the
 * host shows the frame at all, the container size, and which surface (the Ask AI
 * palette or the chat panel) is on screen. The embedder hears about the surface.
 */
export function useWidgetDisplay({
    customization,
    isAskAnythingStyle,
    allowAttachments,
    isExpanded,
    messages,
    gatingScreens,
    viewportWidth,
    reportSurface,
}: WidgetDisplayOptions) {
    // Pushed by the embed loader (WIDGET_DISPLAY). Falls back to the dashboard
    // metadata for direct-iframe embeds where no loader is present.
    const parentDisplay = ref<WidgetDisplay | null>(null)

    // Whether the embedder shows the widget. True for direct iframe embeds (dashboard
    // preview, raw <iframe>), where nobody reports visibility; the loader corrects it
    // immediately with WIDGET_VISIBILITY on load.
    const hostVisible = ref(true)

    const resolvedDisplay = computed<WidgetDisplay | null>(() =>
        parentDisplay.value
        || customization.value.customization_metadata?.widget_display
        || null
    )

    const hasCustomDisplay = computed(() => isCustomDisplay(resolvedDisplay.value))

    // Always fill the embed iframe exactly: chattermate.js sizes the iframe itself.
    const containerStyles = computed(() => {
        // Sidebar / custom-size embeds: the loader drives the geometry, so fill it.
        if (hasCustomDisplay.value) {
            const mode = resolvedDisplay.value?.mode
            const isSidebar = mode === 'sidebar-left' || mode === 'sidebar-right'
            return isSidebar ? { ...BASE_STYLES, borderRadius: '0' } : { ...BASE_STYLES }
        }
        if (isAskAnythingStyle.value) return askAnythingStyles(viewportWidth())
        return { ...BASE_STYLES }
    })

    const conversationNeedsChatPanel = computed(() =>
        messages.value.some(m =>
            CHAT_ONLY_MESSAGE_TYPES.includes(m.message_type as string)
            || (Array.isArray(m.attachments) && m.attachments.length > 0)
        )
    )

    // The Ask AI palette is the surface for the ask-anything styles AND for the
    // search-bar trigger whatever the style. The loader reports the palette as mode
    // 'ask-ai'; 'search-bar' covers direct-iframe embeds, where no loader is involved.
    const isAskAiSurface = computed(() => {
        if (isAskAnythingStyle.value) return true
        const searchBarTrigger = resolvedDisplay.value?.mode === 'ask-ai'
            || resolvedDisplay.value?.mode === 'search-bar'
        // Not when the agent accepts file uploads: the palette has no attach control,
        // and silently removing an enabled feature is worse than an odd trigger.
        return searchBarTrigger && !allowAttachments.value
    })

    // Workflow screens and the email gate still win: they gate the conversation,
    // and the palette has nowhere to host them.
    const useAskAiPanel = computed(() =>
        isAskAiSurface.value
        && isExpanded.value
        && !gatingScreens.some(screen => screen.value)
        && !conversationNeedsChatPanel.value
    )

    // Tell the embedder which surface is on screen, or it keeps the palette's
    // content-hugged geometry after the widget falls back to the chat panel.
    watch(useAskAiPanel, (palette) => {
        reportSurface(palette)
    }, { immediate: true })

    // The embedder owns the ⌘K chord and can turn it off (loader `hotkey: false`).
    const askAiHotkey = computed(() => parentDisplay.value?.hotkey !== false)

    return {
        parentDisplay,
        hostVisible,
        resolvedDisplay,
        hasCustomDisplay,
        containerStyles,
        conversationNeedsChatPanel,
        isAskAiSurface,
        useAskAiPanel,
        askAiHotkey,
    }
}
