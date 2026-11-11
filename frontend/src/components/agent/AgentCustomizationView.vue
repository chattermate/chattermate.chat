<!--
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
-->

<script setup lang="ts">
import { ref, watch, onMounted, computed, onUnmounted, nextTick } from 'vue'
import type { AgentWithCustomization, AgentCustomization, ChatStyle, WidgetUiVersion } from '@/types/agent'
import { agentService } from '@/services/agent'
import WebFont from 'webfontloader'
import { useSubscriptionStorage } from '@/utils/storage'
import { useEnterpriseFeatures } from '@/composables/useEnterpriseFeatures'
import { getGoogleFontsApiKey } from '@/config/api'
import { AI_DISCLAIMER_TEXT } from '@/utils/aiDisclaimer'
import { LAUNCHER_SWATCHES, launcherPreview, launcherSummary, useLauncherSettings, type LauncherPreview } from '@/composables/useLauncherSettings'
import { DEFAULT_LAUNCHER_COLOR } from '@/webclient/launcher-style'
import { WINDOW_PRESETS, WINDOW_STANDARD, useWindowSize } from '@/composables/useWindowSize'
import LauncherSection from './LauncherSection.vue'
import CustomizationSection from './CustomizationSection.vue'
import ColorSwatchPicker from './ColorSwatchPicker.vue'
import WidgetDesignChoice from './WidgetDesignChoice.vue'
import { widgetUiVersion } from '@/webclient/widget-ui'

const props = withDefaults(defineProps<{
    agent: AgentWithCustomization
    /** The host page has its own save (the Shopify app's title-bar Save). */
    hideActions?: boolean
}>(), { hideActions: false })

const emit = defineEmits<{
    (e: 'cancel'): void
    (e: 'preview', customization: AgentCustomization & { showBubblePreview?: boolean; showInitiationPreview?: boolean }): void
    (e: 'chat-style-changed', oldStyle: ChatStyle, newStyle: ChatStyle): void
    (e: 'launcher-preview', preview: LauncherPreview): void
    (e: 'launcher-editing'): void
    (e: 'preview-mode', mode: 'chat' | 'launcher'): void
}>()

// Predefined chat initiation messages
const DEFAULT_CHAT_INITIATIONS = [
    "👋 Hi! Need help? Ask me anything!",
    "💬 Have a question? I'm here to help!",
    "🤝 Welcome! How can I assist you today?",
    "✨ Got questions? Let's chat!",
    "👨‍💼 Need support? Click to chat with us!"
]

// Predefined quick-action buttons (clicking sends the label as a message)
const DEFAULT_QUICK_ACTIONS = [
    "Track my order",
    "Start a return",
    "Talk to a human"
]

// Subscription and feature checking
const subscriptionStorage = useSubscriptionStorage()
const { hasEnterpriseModule } = useEnterpriseFeatures()
const currentSubscription = computed(() => subscriptionStorage.getCurrentSubscription())
const isSubscriptionActive = computed(() => subscriptionStorage.isSubscriptionActive())

// Check if chat initiations feature is locked (only if enterprise module exists)
const isChatInitiationsLocked = computed(() => {
    // Only lock if enterprise module exists
    if (!hasEnterpriseModule) {
        return false
    }
    
    if (!currentSubscription.value || !isSubscriptionActive.value) {
        return true
    }
    
    // Check if chat_initiation feature exists in subscription
    const hasChatInitiationFeature = subscriptionStorage.hasFeature('chat_initiation')
    if (!hasChatInitiationFeature) {
        return true // Lock chat initiations if feature doesn't exist
    }
    
    return false
})

// Upgrade handler
const handleUpgrade = () => {
    // Only redirect to subscription page if enterprise module exists
    if (hasEnterpriseModule) {
        window.location.href = '/settings/subscription'
    }
}

const customization = ref<AgentCustomization>({
    id: props.agent.customization?.id ?? 0,
    agent_id: props.agent.id,
    chat_background_color: props.agent.customization?.chat_background_color ?? '#F8F9FA',
    chat_text_color: props.agent.customization?.chat_text_color ?? '#212529',
    chat_bubble_color: props.agent.customization?.chat_bubble_color ?? DEFAULT_LAUNCHER_COLOR,
    icon_color: props.agent.customization?.icon_color ?? '#6C757D',
    accent_color: props.agent.customization?.accent_color ?? '#C9F24E',
    font_family: props.agent.customization?.font_family ?? 'Inter, system-ui, sans-serif',
    photo_url: props.agent.customization?.photo_url,
    icon_url: props.agent.customization?.icon_url,
    custom_css: props.agent.customization?.custom_css,
    customization_metadata: props.agent.customization?.customization_metadata ?? {},
    chat_style: props.agent.customization?.chat_style ?? 'CHATBOT',
    welcome_title: props.agent.customization?.welcome_title ?? '',
    welcome_subtitle: props.agent.customization?.welcome_subtitle ?? '',
    welcome_message: props.agent.customization?.welcome_message ?? '',
    chat_initiation_messages: props.agent.customization?.chat_initiation_messages ?? [],
    quick_actions: props.agent.customization?.quick_actions ?? [],
    show_citations: props.agent.customization?.show_citations ?? false,
    collect_email: props.agent.customization?.collect_email ?? false,
    show_ai_disclaimer: props.agent.customization?.show_ai_disclaimer ?? true,
    allow_new_chat: props.agent.customization?.allow_new_chat ?? false,
})

// Chat style options grouped into Classic (existing looks) and New (premium presets)
const chatStyleOptions = [
    {
        value: 'CHATBOT' as ChatStyle,
        label: 'Classic',
        description: 'The original look: light, neutral and simple.',
        group: 'legacy' as const,
    },
    {
        value: 'ASK_ANYTHING' as ChatStyle,
        label: 'Ask Anything',
        description: 'Modern AI assistant style for general queries.',
        group: 'legacy' as const,
    },
    {
        value: 'GLASS' as ChatStyle,
        label: 'Glass',
        description: 'Frosted dark glass with soft glow and rounded bubbles.',
        group: 'new' as const,
    },
    {
        value: 'TERMINAL' as ChatStyle,
        label: 'Terminal',
        description: 'Monospace developer style, square corners.',
        group: 'new' as const,
    },
    {
        value: 'PLAYFUL' as ChatStyle,
        label: 'Playful',
        description: 'Light, friendly and very rounded with warm accents.',
        group: 'new' as const,
    },
    {
        value: 'CALM_MINT' as ChatStyle,
        label: 'Calm Mint',
        description: 'Clean dark-teal with subtle borders.',
        group: 'new' as const,
    },
    {
        value: 'AURORA' as ChatStyle,
        label: 'Aurora',
        description: 'The new ask-me-anything — dark, with a glowing aurora orb avatar.',
        group: 'new' as const,
    },
    {
        value: 'SUNRISE' as ChatStyle,
        label: 'Sunrise',
        description: 'Bright, warm and airy — a light theme with a soft coral accent.',
        group: 'new' as const,
    },
]

const legacyStyleOptions = computed(() => chatStyleOptions.filter(o => o.group === 'legacy'))
const newStyleOptions = computed(() => chatStyleOptions.filter(o => o.group === 'new'))

// Default palette per design. Selecting a design seeds these color fields so the look
// matches the marketing presets; the user can still recolor afterwards.
// Per-theme text colours copied from the design comp (Terminal greenish, Glass lavender, …).
const THEME_PRESETS: Record<string, { chat_background_color: string; chat_text_color: string; chat_bubble_color: string; accent_color: string; font_family: string }> = {
    CHATBOT: { chat_background_color: '#FFFFFF', chat_text_color: '#212529', chat_bubble_color: '#C9F24E', accent_color: '#C9F24E', font_family: 'Inter, system-ui, sans-serif' },
    ASK_ANYTHING: { chat_background_color: '#F8F9FA', chat_text_color: '#2A2A33', chat_bubble_color: DEFAULT_LAUNCHER_COLOR, accent_color: '#C9F24E', font_family: 'Inter, system-ui, sans-serif' },
    GLASS: { chat_background_color: '#17151F', chat_text_color: '#ECEAFA', chat_bubble_color: '#9D8CFF', accent_color: '#9D8CFF', font_family: 'Instrument Sans, sans-serif' },
    TERMINAL: { chat_background_color: '#070907', chat_text_color: '#D7F7C8', chat_bubble_color: '#C9F24E', accent_color: '#C9F24E', font_family: 'JetBrains Mono, monospace' },
    PLAYFUL: { chat_background_color: '#FFFFFF', chat_text_color: '#2A2730', chat_bubble_color: '#FF7A6B', accent_color: '#FF7A6B', font_family: 'Instrument Sans, sans-serif' },
    CALM_MINT: { chat_background_color: '#0E1A1A', chat_text_color: '#DDF7F3', chat_bubble_color: '#5FE3D6', accent_color: '#5FE3D6', font_family: 'Instrument Sans, sans-serif' },
    AURORA: { chat_background_color: '#14111C', chat_text_color: '#F2F3F8', chat_bubble_color: '#9D8CFF', accent_color: '#9D8CFF', font_family: 'Instrument Sans, sans-serif' },
    SUNRISE: { chat_background_color: '#FFFFFF', chat_text_color: '#2A2A33', chat_bubble_color: '#FF8A73', accent_color: '#FF8A73', font_family: 'Instrument Sans, sans-serif' },
}

const themePreset = (value: string) => THEME_PRESETS[value] || THEME_PRESETS.CHATBOT

// Select a design and seed its preset palette into the editable color fields
const selectChatStyle = (value: ChatStyle) => {
    customization.value.chat_style = value
    const preset = THEME_PRESETS[value]
    if (preset) {
        customization.value.chat_background_color = preset.chat_background_color
        customization.value.chat_text_color = preset.chat_text_color
        customization.value.chat_bubble_color = preset.chat_bubble_color
        customization.value.accent_color = preset.accent_color
        customization.value.font_family = preset.font_family
    }
    emit('preview', { ...customization.value })
}

// ---- Widget design (customization_metadata.widget_ui): classic or the redesign ----
// Saved with the rest of the form; the preview switches at once. Reassigned
// wholesale, like the placement below, so the preview's watcher sees the change.
const widgetDesign = computed<WidgetUiVersion>({
    get: () => widgetUiVersion(customization.value),
    set: (version) => {
        const meta = { ...((customization.value.customization_metadata as Record<string, any>) ?? {}) }
        meta.widget_ui = { ...(meta.widget_ui ?? {}), version }
        customization.value.customization_metadata = meta
        emit('preview-mode', 'chat')
    },
})

// Whether this server serves the redesign at all: read-only, on every agent the
// dashboard loads (the agent's choice is still saved when it is off). An older
// server says nothing: no note.
const redesignServed = computed(() => props.agent.widget_ui_v2_enabled !== false)

// ---- Widget placement (stored in customization_metadata.widget_display) ----
// The embed loader reads these as site-wide defaults; options set in the install
// snippet (window.chattermateConfig / ChatterMate.init) override them per page.
const displayModeOptions = [
    { value: 'floating', label: 'Floating bubble', description: 'Classic corner launcher opening a chat window.' },
    { value: 'sidebar-right', label: 'Right drawer', description: 'Full-height panel sliding in from the right edge.' },
    { value: 'sidebar-left', label: 'Left drawer', description: 'Full-height panel sliding in from the left edge.' },
    { value: 'search-bar', label: 'Search bar', description: 'An "Ask anything" bar that opens the Ask AI panel.', askAiOnly: true },
]

// The search bar opens the Ask AI answer panel, which is what the Ask Anything and
// Aurora designs are; offering it with a chat-bubble design would promise a surface
// that design doesn't have.
const ASK_AI_CHAT_STYLES = ['ASK_ANYTHING', 'AURORA']
const isAskAiTheme = computed(() => ASK_AI_CHAT_STYLES.includes(customization.value.chat_style as string))
const isModeAvailable = (option: { askAiOnly?: boolean }) => !option.askAiOnly || isAskAiTheme.value

// Numeric bounds per field — must mirror WidgetDisplayConfig (backend schema),
// which rejects values outside these ranges.
const PLACEMENT_BOUNDS: Record<string, [number, number]> = {
    width: [280, 800],
    height: [400, 900],
    sidebar_width: [320, 640],
    offset_bottom: [0, 200],
    offset_side: [0, 200],
}

const widgetDisplay = computed<Record<string, any>>(() =>
    (customization.value.customization_metadata as Record<string, any> | undefined)?.widget_display ?? {})

const activeDisplayMode = computed(() => widgetDisplay.value.mode ?? 'floating')
const isSidebarMode = computed(() =>
    activeDisplayMode.value === 'sidebar-left' || activeDisplayMode.value === 'sidebar-right')

// Reassigns metadata wholesale (never mutates in place) so the deep watcher and
// save round-trip always see a fresh object; unset values are removed entirely,
// letting the loader fall back to its defaults.
const setDisplay = (key: string, value: unknown) => {
    const meta = { ...((customization.value.customization_metadata as Record<string, any>) ?? {}) }
    const display = { ...(meta.widget_display ?? {}) }
    if (value === null || value === undefined || value === '') {
        delete display[key]
    } else {
        display[key] = value
    }
    meta.widget_display = display
    customization.value.customization_metadata = meta
}

// Switching to a chat-bubble design leaves the search bar pointing at an Ask AI panel
// that design doesn't have, so fall back to the floating launcher.
watch(isAskAiTheme, (askAi) => {
    if (!askAi && widgetDisplay.value.mode === 'search-bar') {
        setDisplay('mode', null)
    }
})

// Clamp on change (not on input — clamping mid-typing fights the user).
const setDisplayNumber = (key: string, event: Event) => {
    const [min, max] = PLACEMENT_BOUNDS[key]
    const input = event.target as HTMLInputElement
    const parsed = Number(input.value)
    if (!input.value || Number.isNaN(parsed)) {
        setDisplay(key, null)
        return
    }
    const clamped = Math.min(max, Math.max(min, Math.round(parsed)))
    setDisplay(key, clamped)
    input.value = String(clamped)
}

const windowSize = useWindowSize(widgetDisplay, setDisplay)
// Ask AI designs keep the plain number fields: their palette has no presets to match.
const showWindowFields = computed(() =>
    activeDisplayMode.value === 'floating' && (isAskAiTheme.value || windowSize.active.value === 'custom'))

// The window size shows on the chat preview, which takes it.
const pickWindowPreset = (preset: typeof WINDOW_PRESETS[number]) => {
    windowSize.pickPreset(preset)
    emit('preview-mode', 'chat')
}

const pickCustomWindow = () => {
    windowSize.pickCustom()
    emit('preview-mode', 'chat')
}

// Launcher (customization_metadata.launcher + the logo)
const isLauncherLogoLocked = computed(() => {
    if (!hasEnterpriseModule) return false
    if (!currentSubscription.value || !isSubscriptionActive.value) return true
    return !subscriptionStorage.hasFeature('custom_branding')
})
const launcher = useLauncherSettings(customization, () => props.agent.id, () => isLauncherLogoLocked.value)

const launcherHiddenNote = computed(() =>
    widgetDisplay.value.launcher === false ? "The launcher is hidden. You're using your own button." : null)
const launcherPhoneOnlyNote = computed(() =>
    activeDisplayMode.value === 'search-bar' ? 'On desktop the search bar replaces the launcher. These apply on phones.' : null)

const launcherPreviewProps = computed<LauncherPreview>(() => launcherPreview(
    launcher, customization.value, widgetDisplay.value, WINDOW_STANDARD, isChatInitiationsLocked.value))
watch(launcherPreviewProps, (preview) => emit('launcher-preview', preview), { immediate: true })

// ---- Sections: one open at a time, each closed one summed up in a line ----
type SectionId = 'design' | 'launcher' | 'placement' | 'messages' | 'behaviour'
// Only the launcher shows on the launcher preview; everything else, window size
// included, shows on the chat.
const LAUNCHER_PREVIEW_SECTIONS: SectionId[] = ['launcher']
const openSection = ref<SectionId | null>('design')

const toggleSection = (section: SectionId) => {
    openSection.value = openSection.value === section ? null : section
    if (openSection.value) {
        emit('preview-mode', LAUNCHER_PREVIEW_SECTIONS.includes(openSection.value) ? 'launcher' : 'chat')
    }
}

const BEHAVIOUR_SWITCHES: { key: keyof AgentCustomization; label: string }[] = [
    { key: 'show_citations', label: 'Citations' },
    { key: 'collect_email', label: 'Email first' },
    { key: 'show_ai_disclaimer', label: 'AI disclaimer' },
    { key: 'allow_new_chat', label: 'New chat' },
]

const countOf = (count: number, one: string) => `${count} ${one}${count === 1 ? '' : 's'}`

const sectionSummaries = computed<Record<SectionId, string>>(() => {
    const c = customization.value
    const style = chatStyleOptions.find((option) => option.value === c.chat_style)?.label ?? c.chat_style ?? ''
    const font = (c.font_family ?? '').split(',')[0]
    const mode = displayModeOptions.find((option) => option.value === activeDisplayMode.value)?.label ?? ''
    const windowLabel = WINDOW_PRESETS.find((preset) => preset.value === windowSize.active.value)?.label ?? 'Custom'
    const switchedOn = BEHAVIOUR_SWITCHES.filter((option) => c[option.key]).map((option) => option.label)
    return {
        design: [style, font].filter(Boolean).join(' · '),
        launcher: widgetDisplay.value.launcher === false ? 'Hidden' : launcherSummary(launcher.allowed.value),
        placement: [mode, widgetDisplay.value.side === 'left' ? 'Left' : 'Right',
            isSidebarMode.value ? null : `${windowLabel} window`].filter(Boolean).join(' · '),
        messages: [countOf(c.chat_initiation_messages?.length ?? 0, 'greeting'),
            countOf(c.quick_actions?.length ?? 0, 'quick action')].join(' · '),
        behaviour: switchedOn.length ? switchedOn.join(' · ') : 'All off',
    }
})

// Brand color swatch presets (design grid)
const accentSwatchColors = ['#C9F24E', '#9D8CFF', '#5FE3D6', '#FF8A73', '#6EA8FF', '#F34611']

// Font picker chip presets (design typography picker)
const fontPresets = [
    { value: 'Instrument Sans, sans-serif', label: 'Instrument Sans' },
    { value: 'Space Grotesk, sans-serif', label: 'Space Grotesk' },
    { value: 'JetBrains Mono, monospace', label: 'JetBrains Mono' },
    { value: 'system-ui, sans-serif', label: 'System' },
]

// Save state management
const isSaving = ref(false)
const saveMessage = ref<{ type: 'success' | 'error', text: string } | null>(null)

/** Saves the customization. True when it saved. */
const handleSave = async (): Promise<boolean> => {
    isSaving.value = true
    saveMessage.value = null
    
    try {
        // Update local customization with the response
        customization.value = await agentService.updateCustomization(
            props.agent.id,
            customization.value,
        )
        // Last, so a failed save above never puts a new logo live.
        await launcher.commitLogo()

        // Emit preview to update the preview panel
        emit('preview', customization.value)
        
        // Show success message
        saveMessage.value = { type: 'success', text: 'Customization saved successfully!' }
        
        // Auto-hide success message after 3 seconds
        setTimeout(() => {
            saveMessage.value = null
        }, 3000)
        return true
    } catch (error) {
        console.error('Failed to update customization:', error)
        saveMessage.value = { 
            type: 'error', 
            text: error instanceof Error ? error.message : 'Failed to save customization. Please try again.' 
        }
        return false
    } finally {
        isSaving.value = false
    }
}

defineExpose({ save: handleSave })

// Watch for changes and emit preview event
const isInternalUpdate = ref(false)

watch(customization, (newValue) => {
    if (isInternalUpdate.value) {
        return // Skip if this is an internal update to prevent loops
    }
    console.log('AgentCustomizationView - Customization changed, emitting preview:', newValue)
    emit('preview', newValue)
}, { deep: true })

// A photo uploaded beside the form (it saves itself) changes photo_url in
// place: take it without dropping the form's other unsaved edits, so the next
// save keeps the new photo instead of sending the old one back
watch(() => props.agent.customization?.photo_url, (photoUrl) => {
    if (photoUrl !== undefined && customization.value.photo_url !== photoUrl) {
        customization.value = { ...customization.value, photo_url: photoUrl }
    }
})

// Watch for prop changes to update local customization
watch(() => props.agent.customization, (newCustomization) => {
    if (newCustomization) {
        isInternalUpdate.value = true
        customization.value = {
            id: newCustomization.id ?? 0,
            agent_id: props.agent.id,
            chat_background_color: newCustomization.chat_background_color ?? '#F8F9FA',
            chat_text_color: newCustomization.chat_text_color ?? '#212529',
            chat_bubble_color: newCustomization.chat_bubble_color ?? DEFAULT_LAUNCHER_COLOR,
            icon_color: newCustomization.icon_color ?? '#6C757D',
            accent_color: newCustomization.accent_color ?? '#C9F24E',
            font_family: newCustomization.font_family ?? 'Inter, system-ui, sans-serif',
            photo_url: newCustomization.photo_url,
            icon_url: newCustomization.icon_url,
            custom_css: newCustomization.custom_css,
            customization_metadata: newCustomization.customization_metadata ?? {},
            chat_style: newCustomization.chat_style ?? 'CHATBOT',
            welcome_title: newCustomization.welcome_title ?? '',
            welcome_subtitle: newCustomization.welcome_subtitle ?? '',
            welcome_message: newCustomization.welcome_message ?? '',
            chat_initiation_messages: newCustomization.chat_initiation_messages ?? [],
            quick_actions: newCustomization.quick_actions ?? [],
            show_citations: newCustomization.show_citations ?? false,
            collect_email: newCustomization.collect_email ?? false,
            show_ai_disclaimer: newCustomization.show_ai_disclaimer ?? true,
            allow_new_chat: newCustomization.allow_new_chat ?? false,
        }
        nextTick(() => {
            isInternalUpdate.value = false
        })
    }
}, { deep: true })

// Shown when no Google Fonts API key is configured (self-hosted deployments
// usually have none). Without it the font picker would just be empty.
const FALLBACK_FONTS = [
    'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins',
    'Source Sans 3', 'Nunito', 'Raleway', 'Work Sans', 'DM Sans', 'Merriweather'
].map(family => ({ family, variants: ['regular'] }))

// Add state for Google Fonts
const googleFonts = ref<Array<{ family: string, variants: string[] }>>([])
const isLoadingFonts = ref(true)

// Watch for chat style changes specifically
const previousChatStyle = ref(customization.value.chat_style)
watch(() => customization.value.chat_style, (newStyle, oldStyle) => {
    if (newStyle !== oldStyle && !isInternalUpdate.value) {
        console.log('Chat style changed:', oldStyle, '->', newStyle)
        emit('chat-style-changed', oldStyle || 'CHATBOT', newStyle || 'CHATBOT')
        previousChatStyle.value = newStyle
    }
})

// Load Google Fonts
onMounted(async () => {
    // No key configured (the common self-host case) — skip the request rather
    // than firing one that can only 400, and offer the built-in list instead.
    const fontsApiKey = getGoogleFontsApiKey()
    if (!fontsApiKey) {
        googleFonts.value = FALLBACK_FONTS
        isLoadingFonts.value = false
    } else {
        try {
            const response = await fetch(`https://www.googleapis.com/webfonts/v1/webfonts?key=${fontsApiKey}&sort=popularity`)
            const data = await response.json()
            googleFonts.value = data.items
        } catch (error) {
            console.error('Failed to load Google Fonts:', error)
        } finally {
            isLoadingFonts.value = false
        }
    }
    
    // Emit initial preview to ensure preview panel gets the customization data
    console.log('AgentCustomizationView - Emitting initial preview:', customization.value)
    emit('preview', customization.value)
})

// Update font preview when selection changes
watch(() => customization.value.font_family, (newFont) => {
    if (!newFont) return

    // Create a style element for this specific font
    const styleId = 'preview-font-style'
    let styleEl = document.getElementById(styleId)

    if (!styleEl) {
        styleEl = document.createElement('style')
        styleEl.id = styleId
        document.head.appendChild(styleEl)
    }

    // Load font but scope it to the chat panel
    WebFont.load({
        google: {
            families: [newFont]
        },
        active: () => {
            if (styleEl) {
                styleEl.textContent = `
                    .chat-panel {
                        font-family: "${newFont}", system-ui, sans-serif;
                    }
                `
            }
        }
    })
})

// Clean up the style element when component is unmounted
onUnmounted(() => {
    const styleEl = document.getElementById('preview-font-style')
    if (styleEl) {
        styleEl.remove()
    }
})

const fontSearch = ref('')
const filteredFonts = computed(() => {
    if (!fontSearch.value) return googleFonts.value
    return googleFonts.value.filter(font =>
        font.family.toLowerCase().includes(fontSearch.value.toLowerCase())
    )
})

const showFontDropdown = ref(false)

const handleFontSelect = (font: string) => {
    customization.value.font_family = font
    showFontDropdown.value = false
}

// Chat initiation messages management
const newInitiationMessage = ref('')
const editingInitiationIndex = ref<number | null>(null)
const editingInitiationMessage = ref('')

const addInitiationMessage = () => {
    if (!newInitiationMessage.value.trim()) return
    
    if (!customization.value.chat_initiation_messages) {
        customization.value.chat_initiation_messages = []
    }
    
    customization.value.chat_initiation_messages.push(newInitiationMessage.value.trim())
    newInitiationMessage.value = ''
}

const removeInitiationMessage = (index: number) => {
    if (customization.value.chat_initiation_messages) {
        customization.value.chat_initiation_messages.splice(index, 1)
    }
}

const startEditInitiationMessage = (index: number) => {
    editingInitiationIndex.value = index
    editingInitiationMessage.value = customization.value.chat_initiation_messages?.[index] || ''
}

const saveEditInitiationMessage = () => {
    if (editingInitiationIndex.value !== null && customization.value.chat_initiation_messages && editingInitiationMessage.value.trim()) {
        customization.value.chat_initiation_messages[editingInitiationIndex.value] = editingInitiationMessage.value.trim()
        editingInitiationIndex.value = null
        editingInitiationMessage.value = ''
    }
}

const cancelEditInitiationMessage = () => {
    editingInitiationIndex.value = null
    editingInitiationMessage.value = ''
}

const loadDefaultInitiations = () => {
    customization.value.chat_initiation_messages = [...DEFAULT_CHAT_INITIATIONS]
}

// Quick actions management (mirrors chat initiation messages)
const newQuickAction = ref('')
const editingQuickActionIndex = ref<number | null>(null)
const editingQuickAction = ref('')

const addQuickAction = () => {
    if (!newQuickAction.value.trim()) return
    if (!customization.value.quick_actions) {
        customization.value.quick_actions = []
    }
    customization.value.quick_actions.push(newQuickAction.value.trim())
    newQuickAction.value = ''
}

const removeQuickAction = (index: number) => {
    if (customization.value.quick_actions) {
        customization.value.quick_actions.splice(index, 1)
    }
}

const startEditQuickAction = (index: number) => {
    editingQuickActionIndex.value = index
    editingQuickAction.value = customization.value.quick_actions?.[index] || ''
}

const saveEditQuickAction = () => {
    if (editingQuickActionIndex.value !== null && customization.value.quick_actions && editingQuickAction.value.trim()) {
        customization.value.quick_actions[editingQuickActionIndex.value] = editingQuickAction.value.trim()
        editingQuickActionIndex.value = null
        editingQuickAction.value = ''
    }
}

const cancelEditQuickAction = () => {
    editingQuickActionIndex.value = null
    editingQuickAction.value = ''
}

const loadDefaultQuickActions = () => {
    customization.value.quick_actions = [...DEFAULT_QUICK_ACTIONS]
}

// Initiation message preview handlers
const showInitiationPreview = () => {
    emit('preview', { 
        ...customization.value, 
        showBubblePreview: false,
        showInitiationPreview: true 
    })
}

const hideInitiationPreview = () => {
    emit('preview', { 
        ...customization.value, 
        showBubblePreview: false,
        showInitiationPreview: false 
    })
}



</script>

<template>
    <div class="customization-form">
        <div class="form-content">
            <CustomizationSection id="design" title="Design" :summary="sectionSummaries.design"
                :open="openSection === 'design'" @toggle="toggleSection('design')">
                <!-- Chat design Section -->
                <div class="subsection">
                    <WidgetDesignChoice v-model="widgetDesign" :served="redesignServed" />
                    <h4 class="subsection-heading">Style</h4>
                    <p class="section-subtext">Pick the look that fits your store.</p>

                    <div class="chat-style-group-label">Classic</div>
                    <div class="chat-style-grid">
                        <button
                            v-for="option in legacyStyleOptions"
                            :key="option.value"
                            type="button"
                            class="chat-style-card"
                            :class="{ 'active': customization.chat_style === option.value }"
                            @click="selectChatStyle(option.value)"
                        >
                            <div class="chat-style-thumb" :style="{ background: themePreset(option.value).chat_background_color }">
                                <span class="thumb-bubble agent"></span>
                                <span class="thumb-bubble user" :style="{ background: themePreset(option.value).accent_color }"></span>
                            </div>
                            <div class="chat-style-title">
                                <span>{{ option.label }}</span>
                                <span v-if="customization.chat_style === option.value" class="chat-style-check" aria-hidden="true">✓</span>
                            </div>
                            <div class="chat-style-desc">{{ option.description }}</div>
                        </button>
                    </div>

                    <div class="chat-style-group-label">New <span class="chat-style-group-badge">premium</span></div>
                    <div class="chat-style-grid">
                        <button
                            v-for="option in newStyleOptions"
                            :key="option.value"
                            type="button"
                            class="chat-style-card"
                            :class="{ 'active': customization.chat_style === option.value }"
                            @click="selectChatStyle(option.value)"
                        >
                            <div class="chat-style-thumb" :style="{ background: themePreset(option.value).chat_background_color }">
                                <span class="thumb-bubble agent"></span>
                                <span class="thumb-bubble user" :style="{ background: themePreset(option.value).accent_color }"></span>
                            </div>
                            <div class="chat-style-title">
                                <span>{{ option.label }}</span>
                                <span v-if="customization.chat_style === option.value" class="chat-style-check" aria-hidden="true">✓</span>
                            </div>
                            <div class="chat-style-desc">{{ option.description }}</div>
                        </button>
                    </div>

                </div>

                <!-- Colors + typography -->
                <div class="subsection">
                    <h4 class="subsection-heading">Colors</h4>
                    <span class="color-label">Brand color</span>
                    <ColorSwatchPicker v-model="customization.accent_color" :swatches="accentSwatchColors" label="Brand color" />

                    <div class="aux-color-row">
                        <label class="aux-color">
                            <span class="aux-color-label">Background</span>
                            <span class="aux-color-input">
                                <input type="color" v-model="customization.chat_background_color">
                                <span class="aux-color-value">{{ customization.chat_background_color }}</span>
                            </span>
                        </label>
                        <label class="aux-color">
                            <span class="aux-color-label">Text color</span>
                            <span class="aux-color-input">
                                <input type="color" v-model="customization.chat_text_color">
                                <span class="aux-color-value">{{ customization.chat_text_color }}</span>
                            </span>
                        </label>
                    </div>

                    <h4 class="subsection-heading">Typography</h4>
                    <div class="font-picker">
                        <div class="font-dropdown" :class="{ 'active': showFontDropdown }">
                            <input type="text" :value="showFontDropdown ? fontSearch : customization.font_family"
                                @input="e => fontSearch = (e.target as HTMLInputElement).value"
                                placeholder="Search fonts..." class="font-search"
                                :style="!showFontDropdown ? { fontFamily: customization.font_family } : {}"
                                :disabled="isLoadingFonts" @focus="showFontDropdown = true">
                            <div v-if="showFontDropdown" class="font-options">
                                <div v-for="font in filteredFonts" :key="font.family" class="font-option"
                                    :style="{ fontFamily: font.family }" @click="handleFontSelect(font.family)">
                                    {{ font.family }}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="font-chips">
                        <button
                            v-for="preset in fontPresets"
                            :key="preset.value"
                            type="button"
                            class="font-chip"
                            :class="{ 'active': customization.font_family === preset.value }"
                            :style="{ fontFamily: preset.value }"
                            @click="handleFontSelect(preset.value)"
                        >{{ preset.label }}</button>
                    </div>
                </div>
            </CustomizationSection>

            <CustomizationSection id="launcher" title="Launcher" :summary="sectionSummaries.launcher"
                :open="openSection === 'launcher'" @toggle="toggleSection('launcher')">
                <LauncherSection
                    :settings="launcher"
                    :locked="isLauncherLogoLocked"
                    :hidden-note="launcherHiddenNote"
                    :phone-only-note="launcherPhoneOnlyNote"
                    @click="emit('launcher-editing')"
                    @focusin="emit('launcher-editing')"
                    @upgrade="handleUpgrade"
                >
                    <template #color>
                        <ColorSwatchPicker v-model="customization.chat_bubble_color" :swatches="LAUNCHER_SWATCHES" label="Launcher color" />
                    </template>
                    <label class="citations-toggle">
                        <input type="checkbox" :checked="widgetDisplay.launcher === false"
                            @change="setDisplay('launcher', ($event.target as HTMLInputElement).checked ? false : null)">
                        <span class="citations-toggle-track"><span class="citations-toggle-thumb"></span></span>
                        <span class="citations-toggle-text">
                            <span class="citations-toggle-title">Hide launcher — I'll use my own button</span>
                            <span class="citations-toggle-desc">Open the chat from any element with <code>data-chattermate-open</code>, or call <code>ChatterMate.open()</code>.</span>
                        </span>
                    </label>
                </LauncherSection>
            </CustomizationSection>

            <CustomizationSection id="placement" title="Placement" :summary="sectionSummaries.placement"
                :open="openSection === 'placement'" @toggle="toggleSection('placement')">
                <!-- Widget placement Section -->
                <div class="subsection">
                    <p class="section-subtext">How the widget sits on your site — preview it there. Options set in the embed snippet override these.</p>

                    <div class="chat-style-grid">
                        <button
                            v-for="option in displayModeOptions"
                            :key="option.value"
                            type="button"
                            class="chat-style-card"
                            :class="{ 'active': activeDisplayMode === option.value, 'locked': !isModeAvailable(option) }"
                            :disabled="!isModeAvailable(option)"
                            :title="isModeAvailable(option) ? undefined : 'Available with the Ask Anything or Aurora design'"
                            @click="setDisplay('mode', option.value)"
                        >
                            <div class="chat-style-thumb placement-thumb">
                                <span class="placement-shape" :class="`placement-shape-${option.value}`"></span>
                            </div>
                            <div class="chat-style-title">
                                <span>{{ option.label }}</span>
                                <span v-if="activeDisplayMode === option.value" class="chat-style-check" aria-hidden="true">✓</span>
                            </div>
                            <div class="chat-style-desc">
                                {{ option.description }}
                                <template v-if="!isModeAvailable(option)"><br>Needs the Ask Anything or Aurora design.</template>
                            </div>
                        </button>
                    </div>

                    <div v-if="!isSidebarMode" class="placement-side-row">
                        <span class="placement-label">Side</span>
                        <div class="placement-side-chips">
                            <button type="button" class="font-chip" :class="{ 'active': (widgetDisplay.side ?? 'right') === 'left' }"
                                @click="setDisplay('side', 'left')">Left</button>
                            <button type="button" class="font-chip" :class="{ 'active': (widgetDisplay.side ?? 'right') === 'right' }"
                                @click="setDisplay('side', 'right')">Right</button>
                        </div>
                    </div>

                    <div v-if="activeDisplayMode === 'floating' && !isAskAiTheme" class="placement-side-row">
                        <span id="window-size" class="placement-label">Window</span>
                        <div class="placement-side-chips window-chips" role="radiogroup" aria-labelledby="window-size">
                            <button v-for="preset in WINDOW_PRESETS" :key="preset.value" type="button" role="radio"
                                class="font-chip chip-tick" :class="{ 'active': windowSize.active.value === preset.value }"
                                :aria-checked="windowSize.active.value === preset.value"
                                @click="pickWindowPreset(preset)">{{ preset.label }}</button>
                            <button type="button" role="radio" class="font-chip chip-tick"
                                :class="{ 'active': windowSize.active.value === 'custom' }"
                                :aria-checked="windowSize.active.value === 'custom'"
                                @click="pickCustomWindow">Custom</button>
                        </div>
                    </div>

                    <div class="placement-fields">
                        <label v-if="showWindowFields" class="placement-field">
                            <span>Window width (px)</span>
                            <input type="number" class="text-input" :value="widgetDisplay.width" placeholder="400"
                                :min="PLACEMENT_BOUNDS.width[0]" :max="PLACEMENT_BOUNDS.width[1]"
                                @change="setDisplayNumber('width', $event)">
                        </label>
                        <label v-if="showWindowFields" class="placement-field">
                            <span>Window height (px)</span>
                            <input type="number" class="text-input" :value="widgetDisplay.height" placeholder="560"
                                :min="PLACEMENT_BOUNDS.height[0]" :max="PLACEMENT_BOUNDS.height[1]"
                                @change="setDisplayNumber('height', $event)">
                        </label>
                        <label v-if="isSidebarMode" class="placement-field">
                            <span>Drawer width (px)</span>
                            <input type="number" class="text-input" :value="widgetDisplay.sidebar_width" placeholder="420"
                                :min="PLACEMENT_BOUNDS.sidebar_width[0]" :max="PLACEMENT_BOUNDS.sidebar_width[1]"
                                @change="setDisplayNumber('sidebar_width', $event)">
                        </label>
                        <label v-if="activeDisplayMode === 'search-bar'" class="placement-field placement-field-wide">
                            <span>Search bar text</span>
                            <input type="text" class="text-input" maxlength="80" :value="widgetDisplay.search_placeholder"
                                placeholder="Ask anything..."
                                @change="setDisplay('search_placeholder', ($event.target as HTMLInputElement).value)">
                        </label>
                        <label class="placement-field">
                            <span>Bottom offset (px)</span>
                            <input type="number" class="text-input" :value="widgetDisplay.offset_bottom" placeholder="20"
                                :min="PLACEMENT_BOUNDS.offset_bottom[0]" :max="PLACEMENT_BOUNDS.offset_bottom[1]"
                                @change="setDisplayNumber('offset_bottom', $event)">
                        </label>
                        <label class="placement-field">
                            <span>Side offset (px)</span>
                            <input type="number" class="text-input" :value="widgetDisplay.offset_side" placeholder="20"
                                :min="PLACEMENT_BOUNDS.offset_side[0]" :max="PLACEMENT_BOUNDS.offset_side[1]"
                                @change="setDisplayNumber('offset_side', $event)">
                        </label>
                    </div>

                </div>
            </CustomizationSection>

            <CustomizationSection id="messages" title="Messages" :summary="sectionSummaries.messages"
                :open="openSection === 'messages'" @toggle="toggleSection('messages')">
                <!-- Welcome message + quick actions Section -->
                <div class="subsection">
                    <h4 class="subsection-heading">Welcome message &amp; quick actions</h4>
                    <p class="section-subtext">
                        Shown <strong>inside the chat when it opens</strong> — a greeting bubble and one-tap action buttons. The buttons disappear after the visitor's first message.
                    </p>

                    <div class="form-group">
                        <label for="welcome-message">Welcome message</label>
                        <textarea
                            id="welcome-message"
                            v-model="customization.welcome_message"
                            placeholder="e.g., Hey! 👋 I can track orders, handle returns, or connect you with a human. What can I help with?"
                            class="text-textarea"
                            rows="3"
                            maxlength="300"
                        ></textarea>
                        <small class="input-hint">Leave empty to let the agent's first reply greet the visitor.</small>
                    </div>

                    <div class="section-head-row">
                        <h4 class="subsection-heading">Quick actions</h4>
                        <button type="button" class="load-defaults-link" @click="loadDefaultQuickActions">Load defaults</button>
                    </div>

                    <div class="init-add-row">
                        <input
                            type="text"
                            v-model="newQuickAction"
                            placeholder="Track my order"
                            class="init-input"
                            maxlength="60"
                            @keyup.enter="addQuickAction"
                        >
                        <button
                            type="button"
                            class="init-add-btn"
                            @click="addQuickAction"
                            :disabled="!newQuickAction.trim()"
                            title="Add quick action"
                        >+</button>
                    </div>

                    <div v-if="customization.quick_actions && customization.quick_actions.length > 0" class="init-list">
                        <div
                            v-for="(action, index) in customization.quick_actions"
                            :key="index"
                            class="init-item"
                        >
                            <div v-if="editingQuickActionIndex === index" class="init-edit-inline">
                                <input
                                    type="text"
                                    v-model="editingQuickAction"
                                    class="init-edit-input"
                                    maxlength="60"
                                    @keyup.enter="saveEditQuickAction"
                                    @keyup.esc="cancelEditQuickAction"
                                >
                                <button type="button" class="init-icon-btn save" @click="saveEditQuickAction" title="Save">
                                    <font-awesome-icon icon="fa-solid fa-check" />
                                </button>
                                <button type="button" class="init-icon-btn cancel" @click="cancelEditQuickAction" title="Cancel">
                                    <font-awesome-icon icon="fa-solid fa-times" />
                                </button>
                            </div>
                            <template v-else>
                                <span class="init-handle">☰</span>
                                <span class="init-text">{{ action }}</span>
                                <button type="button" class="init-icon-btn edit" @click="startEditQuickAction(index)" title="Edit">
                                    <font-awesome-icon icon="fa-solid fa-pen" />
                                </button>
                                <button type="button" class="init-remove" @click="removeQuickAction(index)" title="Remove">✕</button>
                            </template>
                        </div>
                    </div>
                    <div v-else class="init-empty">
                        <span class="init-empty-icon">ⓘ</span>
                        <span>No quick actions yet. Add one above.</span>
                    </div>
                </div>

                <!-- Greeting messages Section -->
                <div class="subsection chat-initiation-section" :class="{ 'locked': isChatInitiationsLocked }">
                    <div class="section-head-row">
                        <h4 class="subsection-heading">Greeting messages</h4>
                        <button
                            v-if="!isChatInitiationsLocked"
                            type="button"
                            class="load-defaults-link"
                            @click="loadDefaultInitiations"
                        >Load defaults</button>
                        <div v-if="isChatInitiationsLocked" class="premium-badge-small">
                            <font-awesome-icon icon="fa-solid fa-crown" />
                            <span>Premium</span>
                        </div>
                    </div>
                    <p class="section-subtext">
                        Proactive nudges the agent shows <strong>above the chat launcher</strong> — before a visitor opens the widget.
                    </p>

                    <!-- Locked State -->
                    <div v-if="isChatInitiationsLocked" class="locked-overlay-compact">
                        <div class="locked-content-compact">
                            <font-awesome-icon icon="fa-solid fa-lock" class="lock-icon-small" />
                            <p class="locked-text">Engage visitors with custom messages above the chat bubble.</p>
                            <button class="upgrade-btn-compact" @click="handleUpgrade">
                                <font-awesome-icon icon="fa-solid fa-crown" />
                                <span>Upgrade</span>
                            </button>
                        </div>
                    </div>
                
                    <!-- Unlocked State -->
                    <div v-else>
                        <!-- Add New Message -->
                        <div class="init-add-row">
                            <input
                                type="text"
                                v-model="newInitiationMessage"
                                placeholder="👋 Hi! Need help?"
                                class="init-input"
                                maxlength="100"
                                @keyup.enter="addInitiationMessage"
                            >
                            <button
                                type="button"
                                class="init-add-btn"
                                @click="addInitiationMessage"
                                :disabled="!newInitiationMessage.trim()"
                                title="Add message"
                            >+</button>
                        </div>

                        <!-- Messages List -->
                        <div v-if="customization.chat_initiation_messages && customization.chat_initiation_messages.length > 0" class="init-list">
                            <div
                                v-for="(message, index) in customization.chat_initiation_messages"
                                :key="index"
                                class="init-item"
                            >
                                <div v-if="editingInitiationIndex === index" class="init-edit-inline">
                                    <input
                                        type="text"
                                        v-model="editingInitiationMessage"
                                        class="init-edit-input"
                                        maxlength="100"
                                        @keyup.enter="saveEditInitiationMessage"
                                        @keyup.esc="cancelEditInitiationMessage"
                                        ref="editInput"
                                    >
                                    <button type="button" class="init-icon-btn save" @click="saveEditInitiationMessage" title="Save">
                                        <font-awesome-icon icon="fa-solid fa-check" />
                                    </button>
                                    <button type="button" class="init-icon-btn cancel" @click="cancelEditInitiationMessage" title="Cancel">
                                        <font-awesome-icon icon="fa-solid fa-times" />
                                    </button>
                                </div>
                                <template v-else>
                                    <span class="init-handle">☰</span>
                                    <span class="init-text">{{ message }}</span>
                                    <button
                                        type="button"
                                        class="init-icon-btn edit"
                                        @click="startEditInitiationMessage(index)"
                                        title="Edit"
                                    >
                                        <font-awesome-icon icon="fa-solid fa-pen" />
                                    </button>
                                    <button
                                        type="button"
                                        class="init-remove"
                                        @click="removeInitiationMessage(index)"
                                        title="Remove"
                                    >✕</button>
                                </template>
                            </div>
                        </div>

                        <div v-else-if="customization.chat_initiation_messages && customization.chat_initiation_messages.length === 0" class="init-empty">
                            <span class="init-empty-icon">ⓘ</span>
                            <span>No messages yet. Add your first message above.</span>
                        </div>
                    </div>
                </div>


                <!-- Welcome Message Section (only for ASK_ANYTHING style) -->
                <div v-if="customization.chat_style === 'ASK_ANYTHING'" class="subsection">
                    <h4 class="subsection-heading">Ask anything welcome</h4>
                    <p class="section-subtext">
                        Customize the welcome message shown when users first open the chat.
                    </p>

                    <div class="form-group">
                        <label for="welcome-title">Welcome Title</label>
                        <input
                            id="welcome-title"
                            type="text"
                            v-model="customization.welcome_title"
                            placeholder="e.g., Welcome to our AI Assistant"
                            class="text-input"
                            maxlength="100"
                        >
                        <small class="input-hint">
                            Leave empty to use default: "Welcome to {{ props.agent.display_name || props.agent.name }}"
                        </small>
                    </div>

                    <div class="form-group">
                        <label for="welcome-subtitle">Welcome Subtitle</label>
                        <textarea
                            id="welcome-subtitle"
                            v-model="customization.welcome_subtitle"
                            placeholder="e.g., I'm here to help you with anything you need. What can I assist you with today?"
                            class="text-textarea"
                            rows="3"
                            maxlength="250"
                        ></textarea>
                        <small class="input-hint">
                            Leave empty to use default message
                        </small>
                    </div>
                </div>
            </CustomizationSection>

            <CustomizationSection id="behaviour" title="Behaviour" :summary="sectionSummaries.behaviour"
                :open="openSection === 'behaviour'" @toggle="toggleSection('behaviour')">
                <div class="subsection">
                    <label class="citations-toggle">
                        <input type="checkbox" v-model="customization.show_citations">
                        <span class="citations-toggle-track"><span class="citations-toggle-thumb"></span></span>
                        <span class="citations-toggle-text">
                            <span class="citations-toggle-title">Show citations</span>
                            <span class="citations-toggle-desc">Shows the sources behind each answer.</span>
                        </span>
                    </label>

                    <label class="citations-toggle">
                        <input type="checkbox" v-model="customization.collect_email">
                        <span class="citations-toggle-track"><span class="citations-toggle-thumb"></span></span>
                        <span class="citations-toggle-text">
                            <span class="citations-toggle-title">Collect email before chat</span>
                            <span class="citations-toggle-desc">Visitors give their email before they can chat.</span>
                        </span>
                    </label>

                    <label class="citations-toggle">
                        <input type="checkbox" v-model="customization.show_ai_disclaimer">
                        <span class="citations-toggle-track"><span class="citations-toggle-thumb"></span></span>
                        <span class="citations-toggle-text">
                            <span class="citations-toggle-title">Show AI disclaimer</span>
                            <span class="citations-toggle-desc">Shows “{{ AI_DISCLAIMER_TEXT }}” under the chat while the AI answers.</span>
                        </span>
                    </label>

                    <label class="citations-toggle">
                        <input type="checkbox" v-model="customization.allow_new_chat">
                        <span class="citations-toggle-track"><span class="citations-toggle-thumb"></span></span>
                        <span class="citations-toggle-text">
                            <span class="citations-toggle-title">Let visitors start a new chat</span>
                            <span class="citations-toggle-desc">Adds a “New chat” button that starts a fresh conversation.</span>
                        </span>
                    </label>
                </div>
            </CustomizationSection>

        </div>

        <div v-if="!hideActions" class="button-group">
            <!-- Save Message -->
            <div v-if="saveMessage" class="save-message" :class="saveMessage.type">
                <font-awesome-icon 
                    :icon="saveMessage.type === 'success' ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-exclamation'" 
                    class="message-icon"
                />
                <span>{{ saveMessage.text }}</span>
            </div>
            
            <div class="button-actions">
                <button class="cancel-button" @click="emit('cancel')" :disabled="isSaving">Cancel</button>
                <button class="save-button" @click="handleSave" :disabled="isSaving">
                    <font-awesome-icon 
                        v-if="isSaving" 
                        icon="fa-solid fa-spinner" 
                        class="spinner"
                    />
                    <span>{{ isSaving ? 'Saving...' : 'Save Changes' }}</span>
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.customization-form {
    padding: 0;
    max-width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.form-content {
    flex: 1;
    overflow-y: auto;
    padding: var(--space-md);
}

/* Section cards (design spec) */
:deep(.form-section) {
    margin-bottom: 18px;
    background: var(--surface);
    border: 1px solid var(--o08);
    border-radius: var(--radius-card);
    padding: 24px;
}

:deep(.section-heading) {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 16px;
    color: var(--text);
    margin: 0 0 4px;
}

.subsection + .subsection {
    margin-top: 24px;
    padding-top: 24px;
    border-top: 1px solid var(--o08);
}

.subsection-heading {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 14px;
    color: var(--text);
    margin: 0 0 10px;
}

.subsection-heading:not(:first-child) {
    margin-top: 24px;
}

.color-label {
    display: block;
    font-size: 12px;
    font-weight: 600;
    color: var(--muted);
    margin-bottom: 8px;
}

.section-heading-gap {
    margin-top: 24px;
    margin-bottom: 12px;
}

:deep(.section-subtext) {
    font-size: 13.5px;
    color: var(--muted);
    line-height: 1.5;
    margin: 0 0 18px;
}

.section-subtext strong {
    color: var(--text3);
    font-weight: 600;
}

.section-head-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 6px;
}

.section-head-row .subsection-heading,
.section-head-row .section-heading {
    margin: 0;
}

/* Chat design grid (design spec) */
.chat-style-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
}

.chat-style-card {
    text-align: left;
    padding: 10px;
    border-radius: 14px;
    border: 1px solid var(--o10);
    background: var(--bg);
    cursor: pointer;
    font-family: var(--font-sans);
    transition: all var(--transition-fast);
}

.chat-style-card.active {
    background: var(--accent-bg-08);
    border-color: var(--accent-border);
}

.chat-style-thumb {
    position: relative;
    height: 64px;
    border-radius: 10px;
    background: var(--surface);
    border: 1px solid var(--o08);
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 7px;
    padding: 12px;
    overflow: hidden;
}

.chat-style-thumb .thumb-bubble {
    height: 12px;
    border-radius: 7px;
    display: block;
}
.chat-style-thumb .thumb-bubble.agent {
    width: 62%;
    align-self: flex-start;
    background: rgba(255, 255, 255, 0.18);
}
.chat-style-thumb .thumb-bubble.user {
    width: 46%;
    align-self: flex-end;
}

/* Widget placement: mini viewport illustrations per display mode */
.placement-thumb {
    padding: 0;
}
.placement-shape {
    position: absolute;
    inset: 0;
}
.placement-shape::before,
.placement-shape::after {
    content: '';
    position: absolute;
    background: var(--accent-ink);
    opacity: 0.8;
    border-radius: 4px;
}
.placement-shape-floating::before {
    right: 10px;
    bottom: 18px;
    width: 26px;
    height: 32px;
}
.placement-shape-floating::after {
    right: 10px;
    bottom: 6px;
    width: 9px;
    height: 9px;
    border-radius: 50%;
}
.placement-shape-sidebar-right::before {
    top: 5px;
    bottom: 5px;
    right: 5px;
    width: 30%;
}
.placement-shape-sidebar-left::before {
    top: 5px;
    bottom: 5px;
    left: 5px;
    width: 30%;
}
.placement-shape-search-bar::before {
    left: 15%;
    right: 15%;
    bottom: 8px;
    height: 11px;
    border-radius: 999px;
}

.chat-style-card.locked {
    opacity: 0.45;
    cursor: not-allowed;
}

.placement-side-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 16px;
}
:deep(.placement-label) {
    font-size: 12px;
    font-weight: 600;
    color: var(--muted);
}
.placement-side-chips {
    display: flex;
    gap: 8px;
}

.placement-fields {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    margin-top: 16px;
}
.placement-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
}
.placement-field > span {
    font-size: 12px;
    font-weight: 500;
    color: var(--muted);
}
.placement-field-wide {
    grid-column: 1 / -1;
}

.citations-toggle-desc code {
    background: var(--o06);
    padding: 1px 5px;
    border-radius: 4px;
    font-family: var(--font-mono);
    font-size: 0.9em;
    color: var(--accent-ink);
}

.chat-style-group-label {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--muted2);
    margin: 18px 0 10px;
    display: flex;
    align-items: center;
    gap: 8px;
}
.chat-style-group-label:first-of-type { margin-top: 4px; }
.chat-style-group-badge {
    text-transform: none;
    letter-spacing: 0;
    font-size: 10.5px;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 999px;
    background: var(--accent-bg-08);
    color: var(--accent-ink);
    border: 1px solid var(--accent-border);
}

.citations-toggle {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    margin-top: 18px;
    padding: 12px 14px;
    border: 1px solid var(--o10);
    border-radius: 12px;
    background: var(--bg);
    cursor: pointer;
}
.citations-toggle input { display: none; }
.citations-toggle-track {
    position: relative;
    flex-shrink: 0;
    width: 38px;
    height: 22px;
    border-radius: 999px;
    background: var(--o10);
    transition: background var(--transition-fast);
    margin-top: 2px;
}
.citations-toggle-thumb {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
    transition: transform var(--transition-fast);
}
.citations-toggle input:checked + .citations-toggle-track {
    background: var(--accent-solid, var(--accent-border));
}
.citations-toggle input:checked + .citations-toggle-track .citations-toggle-thumb {
    transform: translateX(16px);
}
.citations-toggle-text { display: flex; flex-direction: column; gap: 2px; }
.citations-toggle-title { font-size: 13.5px; font-weight: 600; color: var(--text); }
.citations-toggle-desc { font-size: 12px; color: var(--muted2); line-height: 1.4; }

.chat-style-title {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 10px;
    font-size: 13.5px;
    font-weight: 600;
    color: var(--text);
}

.chat-style-card.active .chat-style-title {
    color: var(--accent-ink);
}

.chat-style-check {
    color: var(--accent-ink);
}

.chat-style-desc {
    font-size: 12px;
    color: var(--muted2);
    margin-top: 2px;
}

/* Brand color swatches (design spec) */
/* Auxiliary color pickers (background + bubble) */
.aux-color-row {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    margin-bottom: 4px;
    margin-top: 18px;
}

.aux-color {
    display: flex;
    flex-direction: column;
    gap: 6px;
    flex: 1;
    min-width: 140px;
}

.aux-color-label {
    font-size: 12px;
    color: var(--muted2);
}

.aux-color-input {
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--bg);
    border: 1px solid var(--o12);
    border-radius: var(--radius-btn);
    padding: 6px 10px;
}

.aux-color-input input[type="color"] {
    width: 26px;
    height: 26px;
    padding: 0;
    border: none;
    border-radius: 6px;
    background: none;
    cursor: pointer;
}

.aux-color-value {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--muted);
}

/* Typography chips (design spec) */
:deep(.font-chips) {
    display: flex;
    gap: 9px;
    flex-wrap: wrap;
    margin-top: 12px;
}

:deep(.font-chip) {
    padding: 9px 15px;
    border-radius: var(--radius-chip);
    cursor: pointer;
    font-size: 13.5px;
    font-weight: 500;
    background: var(--bg);
    border: 1px solid var(--o12);
    color: var(--text3);
    transition: all var(--transition-fast);
}

:deep(.chip-tick.active)::after {
    content: '✓';
    /* Decoration only: a screen reader hears "checked", not the tick's name. */
    content: '✓' / '';
    margin-left: 6px;
    font-size: 12px;
    font-weight: 700;
}

:deep(.font-chip):focus-visible {
    outline: 2px solid var(--accent-ink);
    outline-offset: 2px;
}

:deep(.font-chip.active) {
    background: var(--accent-bg-12);
    border: 1px solid var(--accent-border);
    color: var(--accent-ink);
}

.form-group {
    margin-bottom: var(--space-md);
}

.form-group label {
    display: block;
    margin-bottom: var(--space-sm);
    color: var(--text3);
    font-weight: 500;
    font-size: 13.5px;
}

.form-group input[type="file"],
.form-group select,
.form-group textarea {
    width: 100%;
    padding: var(--space-sm);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    background: var(--background-soft);
}

.file-input {
    position: relative;
}

.file-input input[type="file"] {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    border: 0;
}

.file-label {
    display: block;
    padding: var(--space-xs) var(--space-sm);
    background: var(--background-soft);
    border: 1px dashed var(--border-color);
    border-radius: var(--radius-md);
    cursor: pointer;
    text-align: center;
    color: var(--text-muted);
    font-size: var(--text-sm);
}

.color-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-sm);
}

.color-picker {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
}

.color-input {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    background: var(--background-soft);
    padding: var(--space-xs);
    border-radius: var(--radius-md);
    border: 1px solid var(--border-color);
}

.color-input input[type="color"] {
    width: 32px;
    height: 32px;
    padding: 0;
    border: none;
    border-radius: var(--radius-sm);
    cursor: pointer;
}

.color-value {
    font-family: monospace;
    color: var(--text-muted);
    font-size: var(--text-xs);
}

.button-group {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
    padding: var(--space-md);
    border-top: 1px solid var(--o08);
    background: transparent;
    margin-top: auto;
    flex-shrink: 0;
}

/* Save Message Styles */
.save-message {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-sm) var(--space-md);
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
    font-weight: 500;
    animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.save-message.success {
    background: color-mix(in srgb, var(--success-color) 10%, transparent);
    color: var(--success-color);
    border: 1px solid color-mix(in srgb, var(--success-color) 30%, transparent);
}

.save-message.error {
    background: color-mix(in srgb, var(--error-color) 10%, transparent);
    color: var(--error-color);
    border: 1px solid color-mix(in srgb, var(--error-color) 30%, transparent);
}

.message-icon {
    font-size: 1rem;
}

/* Button Actions */
.button-actions {
    display: flex;
    justify-content: flex-end;
    gap: var(--space-sm);
}

.save-button,
.cancel-button {
    padding: var(--space-sm) var(--space-xl);
    border: none;
    border-radius: var(--radius-md);
    cursor: pointer;
    font-weight: 500;
    min-width: 120px;
    transition: var(--transition-fast);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-xs);
}

.save-button {
    background: var(--accent-solid);
    color: var(--on-accent-solid);
}

.save-button:hover:not(:disabled) {
    background: var(--primary-dark);
}

.save-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.cancel-button {
    background: var(--background-soft);
    color: var(--text-color);
}

.cancel-button:hover:not(:disabled) {
    background: var(--background-mute);
}

.cancel-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* Spinner Animation */
.spinner {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}

.font-picker {
    position: relative;
}

.font-dropdown {
    position: relative;
}

.font-search {
    width: 100%;
    padding: 11px 14px;
    border: 1px solid var(--o12);
    border-radius: var(--radius-btn);
    background: var(--bg);
    color: var(--text);
    font-size: 14px;
    outline: none;
}

.font-search:focus {
    border-color: var(--accent-border);
}

.font-options {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    max-height: 200px;
    overflow-y: auto;
    background: var(--surface);
    border: 1px solid var(--o12);
    border-radius: var(--radius-md);
    margin-top: var(--space-xs);
    z-index: 10;
    box-shadow: var(--shadow-lg);
}

.font-option {
    padding: var(--space-sm);
    cursor: pointer;
    transition: var(--transition-fast);
}

.font-option:hover {
    background: var(--background-soft);
}

/* Welcome text customization styles */
.text-input,
.text-textarea {
    width: 100%;
    padding: 13px 15px;
    border: 1px solid var(--o12);
    border-radius: 11px;
    background: var(--bg);
    color: var(--text);
    font-size: 14px;
    font-family: inherit;
    transition: var(--transition-fast);
    resize: vertical;
}

.text-input:focus,
.text-textarea:focus {
    outline: none;
    border-color: var(--accent-border);
}

.text-input::placeholder,
.text-textarea::placeholder {
    color: var(--muted2);
}

.input-hint {
    display: block;
    margin-top: var(--space-xs);
    color: var(--muted);
    font-size: 12px;
    line-height: 1.4;
}

.text-textarea {
    min-height: 80px;
    line-height: 1.5;
}

/* Greeting messages (design spec) */
.chat-initiation-section {
    position: relative;
}

.load-defaults-link {
    background: none;
    border: none;
    color: var(--accent-ink);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    font-family: var(--font-sans);
    padding: 0;
    white-space: nowrap;
}

.load-defaults-link:hover {
    text-decoration: underline;
}

.premium-badge-small {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: var(--grad-generate);
    color: var(--on-dark);
    padding: 2px 8px;
    border-radius: 999px;
    font-size: 10px;
    font-weight: 600;
}

.premium-badge-small svg {
    font-size: 9px;
    color: #ffd700;
}

/* Locked State */
.window-chips {
    flex-wrap: wrap;
}

:deep(.locked-overlay-compact) {
    background: var(--bg);
    border: 1px dashed var(--o12);
    border-radius: var(--radius-btn);
    padding: 14px 16px;
    margin-top: 6px;
}

:deep(.locked-content-compact) {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
}

.lock-icon-small {
    font-size: 1rem;
    color: var(--muted);
    opacity: 0.7;
}

:deep(.locked-text) {
    flex: 1;
    min-width: 200px;
    font-size: 13.5px;
    color: var(--muted);
    margin: 0;
}

:deep(.upgrade-btn-compact) {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: var(--accent-solid);
    color: var(--on-accent-solid);
    border: none;
    border-radius: var(--radius-btn);
    padding: 8px 14px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all var(--transition-fast);
    white-space: nowrap;
}

:deep(.upgrade-btn-compact:hover) {
    filter: brightness(1.05);
}

:deep(.upgrade-btn-compact svg) {
    font-size: 10px;
    color: #ffd700;
}

/* Greeting input row */
.init-add-row {
    display: flex;
    gap: 10px;
    margin-bottom: 14px;
}

.init-input {
    flex: 1;
    padding: 13px 15px;
    background: var(--bg);
    border: 1px solid var(--o12);
    border-radius: 11px;
    color: var(--text);
    font-size: 14px;
    outline: none;
    font-family: var(--font-sans);
    transition: var(--transition-fast);
}

.init-input:focus {
    border-color: var(--accent-border);
}

.init-add-btn {
    flex-shrink: 0;
    width: 46px;
    border-radius: 11px;
    background: var(--accent-solid);
    border: none;
    color: var(--on-accent-solid);
    font-size: 22px;
    line-height: 1;
    cursor: pointer;
    transition: all var(--transition-fast);
}

.init-add-btn:hover:not(:disabled) {
    filter: brightness(1.05);
}

.init-add-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* Greeting list */
.init-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.init-item {
    display: flex;
    align-items: center;
    gap: 11px;
    padding: 11px 14px;
    border-radius: 11px;
    background: var(--bg);
    border: 1px solid var(--o08);
}

.init-handle {
    color: var(--faint);
    font-size: 14px;
    cursor: grab;
    line-height: 1;
}

.init-text {
    flex: 1;
    font-size: 14px;
    color: var(--text2);
}

.init-remove {
    background: none;
    border: none;
    color: var(--muted2);
    cursor: pointer;
    font-size: 14px;
    line-height: 1;
    padding: 0;
    transition: color var(--transition-fast);
}

.init-remove:hover {
    color: var(--text2);
}

.init-icon-btn {
    width: 26px;
    height: 26px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    color: var(--muted2);
    cursor: pointer;
    border-radius: var(--radius-sm);
    transition: all var(--transition-fast);
    font-size: 12px;
    flex-shrink: 0;
}

.init-icon-btn:hover {
    color: var(--accent-ink);
}

.init-icon-btn.save {
    color: var(--c-teal);
}

.init-icon-btn.cancel:hover {
    color: var(--text2);
}

/* Inline edit */
.init-edit-inline {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
}

.init-edit-input {
    flex: 1;
    padding: 8px 12px;
    border: 1px solid var(--accent-border);
    border-radius: var(--radius-btn);
    background: var(--surface);
    color: var(--text);
    font-size: 14px;
    outline: none;
}

/* Empty state */
.init-empty {
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 14px 16px;
    border-radius: 11px;
    background: var(--o03);
    border: 1px solid var(--o06);
    color: var(--muted2);
    font-size: 13.5px;
}

.init-empty-icon {
    font-size: 14px;
    opacity: 0.8;
}
</style>
