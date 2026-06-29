<!--
ChatterMate - Agent Customization View
Copyright (C) 2024 ChatterMate

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>
-->

<script setup lang="ts">
import { ref, watch, onMounted, computed, onUnmounted, nextTick } from 'vue'
import type { AgentWithCustomization, AgentCustomization, ChatStyle } from '@/types/agent'
import { agentService } from '@/services/agent'
import WebFont from 'webfontloader'
import { useSubscriptionStorage } from '@/utils/storage'
import { useEnterpriseFeatures } from '@/composables/useEnterpriseFeatures'

const props = defineProps<{
    agent: AgentWithCustomization
}>()

const emit = defineEmits<{
    (e: 'cancel'): void
    (e: 'preview', customization: AgentCustomization & { showBubblePreview?: boolean; showInitiationPreview?: boolean }): void
    (e: 'chat-style-changed', oldStyle: ChatStyle, newStyle: ChatStyle): void
}>()

// Predefined chat initiation messages
const DEFAULT_CHAT_INITIATIONS = [
    "👋 Hi! Need help? Ask me anything!",
    "💬 Have a question? I'm here to help!",
    "🤝 Welcome! How can I assist you today?",
    "✨ Got questions? Let's chat!",
    "👨‍💼 Need support? Click to chat with us!"
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
    chat_bubble_color: props.agent.customization?.chat_bubble_color ?? '#E9ECEF',
    icon_color: props.agent.customization?.icon_color ?? '#6C757D',
    accent_color: props.agent.customization?.accent_color ?? '#C9F24E',
    font_family: props.agent.customization?.font_family ?? 'Inter, system-ui, sans-serif',
    photo_url: props.agent.customization?.photo_url,
    custom_css: props.agent.customization?.custom_css,
    customization_metadata: props.agent.customization?.customization_metadata ?? {},
    chat_style: props.agent.customization?.chat_style ?? 'CHATBOT',
    welcome_title: props.agent.customization?.welcome_title ?? '',
    welcome_subtitle: props.agent.customization?.welcome_subtitle ?? '',
    chat_initiation_messages: props.agent.customization?.chat_initiation_messages ?? [],
    show_citations: props.agent.customization?.show_citations ?? true,
    collect_email: props.agent.customization?.collect_email ?? false,
})

// Chat style options grouped into Legacy (existing looks) and New (premium presets)
const chatStyleOptions = [
    {
        value: 'CHATBOT' as ChatStyle,
        label: 'Legacy',
        description: 'The original look — light, neutral, classic chatbot.',
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
]

const legacyStyleOptions = computed(() => chatStyleOptions.filter(o => o.group === 'legacy'))
const newStyleOptions = computed(() => chatStyleOptions.filter(o => o.group === 'new'))

// Default palette per design. Selecting a design seeds these color fields so the look
// matches the marketing presets; the user can still recolor afterwards.
const THEME_PRESETS: Record<string, { chat_background_color: string; chat_bubble_color: string; accent_color: string; font_family: string }> = {
    CHATBOT: { chat_background_color: '#FFFFFF', chat_bubble_color: '#C9F24E', accent_color: '#C9F24E', font_family: 'Inter, system-ui, sans-serif' },
    ASK_ANYTHING: { chat_background_color: '#F8F9FA', chat_bubble_color: '#E9ECEF', accent_color: '#C9F24E', font_family: 'Inter, system-ui, sans-serif' },
    GLASS: { chat_background_color: '#17151F', chat_bubble_color: '#9D8CFF', accent_color: '#9D8CFF', font_family: 'Instrument Sans, sans-serif' },
    TERMINAL: { chat_background_color: '#070907', chat_bubble_color: '#C9F24E', accent_color: '#C9F24E', font_family: 'JetBrains Mono, monospace' },
    PLAYFUL: { chat_background_color: '#FFFFFF', chat_bubble_color: '#FF7A6B', accent_color: '#FF7A6B', font_family: 'Instrument Sans, sans-serif' },
    CALM_MINT: { chat_background_color: '#0E1A1A', chat_bubble_color: '#5FE3D6', accent_color: '#5FE3D6', font_family: 'Instrument Sans, sans-serif' },
    AURORA: { chat_background_color: '#14111C', chat_bubble_color: '#9D8CFF', accent_color: '#9D8CFF', font_family: 'Instrument Sans, sans-serif' },
}

const themePreset = (value: string) => THEME_PRESETS[value] || THEME_PRESETS.CHATBOT

// Select a design and seed its preset palette into the editable color fields
const selectChatStyle = (value: ChatStyle) => {
    customization.value.chat_style = value
    const preset = THEME_PRESETS[value]
    if (preset) {
        customization.value.chat_background_color = preset.chat_background_color
        customization.value.chat_bubble_color = preset.chat_bubble_color
        customization.value.accent_color = preset.accent_color
        customization.value.font_family = preset.font_family
    }
    emit('preview', { ...customization.value })
}

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

const handleSave = async () => {
    isSaving.value = true
    saveMessage.value = null
    
    try {
        const updatedCustomization = await agentService.updateCustomization(
            props.agent.id,
            customization.value,
        )
        
        // Update local customization with the response
        customization.value = updatedCustomization
        
        // Emit preview to update the preview panel
        emit('preview', updatedCustomization)
        
        // Show success message
        saveMessage.value = { type: 'success', text: 'Customization saved successfully!' }
        
        // Auto-hide success message after 3 seconds
        setTimeout(() => {
            saveMessage.value = null
        }, 3000)
    } catch (error) {
        console.error('Failed to update customization:', error)
        saveMessage.value = { 
            type: 'error', 
            text: error instanceof Error ? error.message : 'Failed to save customization. Please try again.' 
        }
    } finally {
        isSaving.value = false
    }
}

// Watch for changes and emit preview event
const isInternalUpdate = ref(false)

watch(customization, (newValue) => {
    if (isInternalUpdate.value) {
        return // Skip if this is an internal update to prevent loops
    }
    console.log('AgentCustomizationView - Customization changed, emitting preview:', newValue)
    emit('preview', newValue)
}, { deep: true })

// Watch for prop changes to update local customization
watch(() => props.agent.customization, (newCustomization) => {
    if (newCustomization) {
        isInternalUpdate.value = true
        customization.value = {
            id: newCustomization.id ?? 0,
            agent_id: props.agent.id,
            chat_background_color: newCustomization.chat_background_color ?? '#F8F9FA',
            chat_bubble_color: newCustomization.chat_bubble_color ?? '#E9ECEF',
            icon_color: newCustomization.icon_color ?? '#6C757D',
            accent_color: newCustomization.accent_color ?? '#C9F24E',
            font_family: newCustomization.font_family ?? 'Inter, system-ui, sans-serif',
            photo_url: newCustomization.photo_url,
            custom_css: newCustomization.custom_css,
            customization_metadata: newCustomization.customization_metadata ?? {},
            chat_style: newCustomization.chat_style ?? 'CHATBOT',
            welcome_title: newCustomization.welcome_title ?? '',
            welcome_subtitle: newCustomization.welcome_subtitle ?? '',
            chat_initiation_messages: newCustomization.chat_initiation_messages ?? [],
            show_citations: newCustomization.show_citations ?? true,
            collect_email: newCustomization.collect_email ?? false,
        }
        nextTick(() => {
            isInternalUpdate.value = false
        })
    }
}, { deep: true })

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
    try {
        const response = await fetch(`https://www.googleapis.com/webfonts/v1/webfonts?key=${import.meta.env.VITE_GOOGLE_FONTS_API_KEY}&sort=popularity`)
        const data = await response.json()
        googleFonts.value = data.items
    } catch (error) {
        console.error('Failed to load Google Fonts:', error)
    } finally {
        isLoadingFonts.value = false
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

// Collapsible sections state
const expandedSections = ref<Set<string>>(new Set(['chat-style', 'colors']))

const toggleSection = (sectionId: string) => {
    if (expandedSections.value.has(sectionId)) {
        expandedSections.value.delete(sectionId)
    } else {
        expandedSections.value.add(sectionId)
    }
}

const isSectionExpanded = (sectionId: string) => {
    return expandedSections.value.has(sectionId)
}


</script>

<template>
    <div class="customization-form">
        <div class="form-content">
            <!-- Chat design Section -->
            <div class="form-section">
                <h3 class="section-heading">Chat design</h3>
                <p class="section-subtext">Every look from the marketing site — pick one, match it to your brand.</p>

                <div class="chat-style-group-label">Legacy</div>
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
                            <span v-if="customization.chat_style === option.value" class="chat-style-check">✓</span>
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
                            <span v-if="customization.chat_style === option.value" class="chat-style-check">✓</span>
                        </div>
                        <div class="chat-style-desc">{{ option.description }}</div>
                    </button>
                </div>

                <label class="citations-toggle">
                    <input type="checkbox" v-model="customization.show_citations">
                    <span class="citations-toggle-track"><span class="citations-toggle-thumb"></span></span>
                    <span class="citations-toggle-text">
                        <span class="citations-toggle-title">Show citations</span>
                        <span class="citations-toggle-desc">Display the knowledge-base sources used to answer, as chips under each reply.</span>
                    </span>
                </label>

                <label class="citations-toggle">
                    <input type="checkbox" v-model="customization.collect_email">
                    <span class="citations-toggle-track"><span class="citations-toggle-thumb"></span></span>
                    <span class="citations-toggle-text">
                        <span class="citations-toggle-title">Collect email before chat</span>
                        <span class="citations-toggle-desc">Require visitors to enter their email before they can start chatting. Off by default.</span>
                    </span>
                </label>
            </div>

            <!-- Brand color + Typography Section -->
            <div class="form-section">
                <h3 class="section-heading">Brand color</h3>
                <div class="accent-row">
                    <button
                        v-for="swatch in accentSwatchColors"
                        :key="swatch"
                        type="button"
                        class="accent-swatch"
                        :class="{ 'active': customization.accent_color?.toUpperCase() === swatch }"
                        :title="swatch"
                        :style="{ background: swatch, boxShadow: customization.accent_color?.toUpperCase() === swatch ? '0 0 0 2px ' + swatch : 'none' }"
                        @click="customization.accent_color = swatch"
                    ></button>
                    <label class="accent-custom" title="Custom color">
                        <input type="color" v-model="customization.accent_color">
                        <span class="accent-custom-icon">+</span>
                    </label>
                    <span class="accent-hex">{{ customization.accent_color }}</span>
                </div>

                <div class="aux-color-row">
                    <label class="aux-color">
                        <span class="aux-color-label">Background</span>
                        <span class="aux-color-input">
                            <input type="color" v-model="customization.chat_background_color">
                            <span class="aux-color-value">{{ customization.chat_background_color }}</span>
                        </span>
                    </label>
                    <label class="aux-color">
                        <span class="aux-color-label">Chat bubble</span>
                        <span class="aux-color-input">
                            <input type="color" v-model="customization.chat_bubble_color"
                                @input="emit('preview', { ...customization, showBubblePreview: true })"
                                @focus="emit('preview', { ...customization, showBubblePreview: true })"
                                @blur="emit('preview', { ...customization, showBubblePreview: false })">
                            <span class="aux-color-value">{{ customization.chat_bubble_color }}</span>
                        </span>
                    </label>
                </div>

                <h3 class="section-heading section-heading-gap">Typography</h3>
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

            <!-- Welcome Message Section (only for ASK_ANYTHING style) -->
            <div v-if="customization.chat_style === 'ASK_ANYTHING'" class="form-section">
                <h3 class="section-heading">Welcome message</h3>
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

            <!-- Greeting messages Section -->
            <div class="form-section chat-initiation-section" :class="{ 'locked': isChatInitiationsLocked }">
                <div class="section-head-row">
                    <h3 class="section-heading">Greeting messages</h3>
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
        </div>

        <div class="button-group">
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
.form-section {
    margin-bottom: 18px;
    background: var(--surface);
    border: 1px solid var(--o08);
    border-radius: var(--radius-card);
    padding: 24px;
}

.section-heading {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 16px;
    color: var(--text);
    margin: 0 0 4px;
}

.section-heading-gap {
    margin-top: 24px;
    margin-bottom: 12px;
}

.section-subtext {
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
.accent-row {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
    margin-bottom: 18px;
}

.accent-swatch {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    border: 2px solid transparent;
    cursor: pointer;
    padding: 0;
    transition: box-shadow var(--transition-fast);
}

.accent-swatch.active {
    border-color: var(--surface);
}

.accent-custom {
    position: relative;
    width: 34px;
    height: 34px;
    border-radius: 50%;
    border: 1px dashed var(--o12);
    background: var(--bg);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    overflow: hidden;
}

.accent-custom input[type="color"] {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
    border: none;
    padding: 0;
}

.accent-custom-icon {
    color: var(--muted);
    font-size: 18px;
    line-height: 1;
    pointer-events: none;
}

.accent-hex {
    font-family: var(--font-mono);
    font-size: 13px;
    color: var(--muted);
    margin-left: 4px;
}

/* Auxiliary color pickers (background + bubble) */
.aux-color-row {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    margin-bottom: 4px;
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
.font-chips {
    display: flex;
    gap: 9px;
    flex-wrap: wrap;
    margin-top: 12px;
}

.font-chip {
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

.font-chip.active {
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
.locked-overlay-compact {
    background: var(--bg);
    border: 1px dashed var(--o12);
    border-radius: var(--radius-btn);
    padding: 14px 16px;
    margin-top: 6px;
}

.locked-content-compact {
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

.locked-text {
    flex: 1;
    min-width: 200px;
    font-size: 13.5px;
    color: var(--muted);
    margin: 0;
}

.upgrade-btn-compact {
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

.upgrade-btn-compact:hover {
    filter: brightness(1.05);
}

.upgrade-btn-compact svg {
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
