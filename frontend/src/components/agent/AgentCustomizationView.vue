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
    accent_color: props.agent.customization?.accent_color ?? '#f34611',
    font_family: props.agent.customization?.font_family ?? 'Inter, system-ui, sans-serif',
    photo_url: props.agent.customization?.photo_url,
    custom_css: props.agent.customization?.custom_css,
    customization_metadata: props.agent.customization?.customization_metadata ?? {},
    chat_style: props.agent.customization?.chat_style ?? 'CHATBOT',
    welcome_title: props.agent.customization?.welcome_title ?? '',
    welcome_subtitle: props.agent.customization?.welcome_subtitle ?? '',
    chat_initiation_messages: props.agent.customization?.chat_initiation_messages ?? [],
})

// Chat style options with descriptions
const chatStyleOptions = [
    {
        value: 'CHATBOT' as ChatStyle,
        label: 'Chatbot',
        description: 'Traditional customer support style with agent branding',
        icon: '💬'
    },
    {
        value: 'ASK_ANYTHING' as ChatStyle,
        label: 'Ask Anything',
        description: 'Modern AI assistant style for general queries',
        icon: '🤖'
    }
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
            accent_color: newCustomization.accent_color ?? '#f34611',
            font_family: newCustomization.font_family ?? 'Inter, system-ui, sans-serif',
            photo_url: newCustomization.photo_url,
            custom_css: newCustomization.custom_css,
            customization_metadata: newCustomization.customization_metadata ?? {},
            chat_style: newCustomization.chat_style ?? 'CHATBOT',
            welcome_title: newCustomization.welcome_title ?? '',
            welcome_subtitle: newCustomization.welcome_subtitle ?? '',
            chat_initiation_messages: newCustomization.chat_initiation_messages ?? [],
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
            <!-- Chat Style Section -->
            <div class="form-section collapsible" :class="{ 'expanded': isSectionExpanded('chat-style') }">
                <div class="section-header-collapsible" @click="toggleSection('chat-style')">
                    <h4>
                        <font-awesome-icon 
                            :icon="isSectionExpanded('chat-style') ? 'fa-solid fa-chevron-down' : 'fa-solid fa-chevron-right'" 
                            class="collapse-icon"
                        />
                        Chat Style
                    </h4>
                </div>
                
                <div v-show="isSectionExpanded('chat-style')" class="section-content">
                <div class="form-group">
                    <label class="section-label">Choose Your Chat Style</label>
                    <div class="style-cards">
                        <div 
                            v-for="option in chatStyleOptions" 
                            :key="option.value"
                            class="style-card"
                            :class="{ 'active': customization.chat_style === option.value }"
                            @click="customization.chat_style = option.value"
                        >
                            <div class="style-card-header">
                                <div class="style-icon">{{ option.icon }}</div>
                                <div class="style-check" v-if="customization.chat_style === option.value">
                                    <font-awesome-icon icon="fa-solid fa-circle-check" />
                                </div>
                            </div>
                            <div class="style-card-body">
                                <h5 class="style-title">{{ option.label }}</h5>
                                <p class="style-description">{{ option.description }}</p>
                            </div>
                        </div>
                    </div>
                </div>
                </div>
            </div>

            <!-- Colors Section -->
            <div class="form-section collapsible" :class="{ 'expanded': isSectionExpanded('colors') }">
                <div class="section-header-collapsible" @click="toggleSection('colors')">
                    <h4>
                        <font-awesome-icon 
                            :icon="isSectionExpanded('colors') ? 'fa-solid fa-chevron-down' : 'fa-solid fa-chevron-right'" 
                            class="collapse-icon"
                        />
                        Colors
                    </h4>
                </div>
                
                <div v-show="isSectionExpanded('colors')" class="section-content">
                <div class="color-grid">

                    <div class="color-picker">
                        <label>Background</label>
                        <div class="color-input">
                            <input type="color" v-model="customization.chat_background_color">
                            <span class="color-value">{{ customization.chat_background_color }}</span>
                        </div>
                    </div>

                    <div class="color-picker">
                        <label>Chat Bubble</label>
                        <div class="color-input">
                            <input type="color" v-model="customization.chat_bubble_color"
                                @input="emit('preview', { ...customization, showBubblePreview: true })"
                                @focus="emit('preview', { ...customization, showBubblePreview: true })"
                                @blur="emit('preview', { ...customization, showBubblePreview: false })">
                            <span class="color-value">{{ customization.chat_bubble_color }}</span>
                        </div>
                    </div>

                    <div class="color-picker">
                        <label>Accent</label>
                        <div class="color-input">
                            <input type="color" v-model="customization.accent_color">
                            <span class="color-value">{{ customization.accent_color }}</span>
                        </div>
                    </div>
                </div>
                </div>
            </div>

            <!-- Typography Section -->
            <div class="form-section collapsible" :class="{ 'expanded': isSectionExpanded('typography') }">
                <div class="section-header-collapsible" @click="toggleSection('typography')">
                    <h4>
                        <font-awesome-icon 
                            :icon="isSectionExpanded('typography') ? 'fa-solid fa-chevron-down' : 'fa-solid fa-chevron-right'" 
                            class="collapse-icon"
                        />
                        Typography
                    </h4>
                </div>
                
                <div v-show="isSectionExpanded('typography')" class="section-content">
                <div class="form-group">
                    <label>Font Family</label>
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
                </div>
                </div>
            </div>

            <!-- Welcome Message Section (only for ASK_ANYTHING style) -->
            <div v-if="customization.chat_style === 'ASK_ANYTHING'" class="form-section collapsible" :class="{ 'expanded': isSectionExpanded('welcome-message') }">
                <div class="section-header-collapsible" @click="toggleSection('welcome-message')">
                    <h4>
                        <font-awesome-icon 
                            :icon="isSectionExpanded('welcome-message') ? 'fa-solid fa-chevron-down' : 'fa-solid fa-chevron-right'" 
                            class="collapse-icon"
                        />
                        Welcome Message
                    </h4>
                </div>
                
                <div v-show="isSectionExpanded('welcome-message')" class="section-content">
                <p class="section-description">
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
            </div>

            <!-- Chat Initiation Messages Section -->
            <div class="form-section collapsible chat-initiation-section" :class="{ 'locked': isChatInitiationsLocked, 'expanded': isSectionExpanded('chat-initiation') }">
                <div class="section-header-collapsible" @click="toggleSection('chat-initiation')">
                    <div class="section-title-group">
                        <h4>
                            <font-awesome-icon 
                                :icon="isSectionExpanded('chat-initiation') ? 'fa-solid fa-chevron-down' : 'fa-solid fa-chevron-right'" 
                                class="collapse-icon"
                            />
                            Chat Initiation Messages
                        </h4>
                        <div v-if="isChatInitiationsLocked" class="premium-badge-small">
                            <font-awesome-icon icon="fa-solid fa-crown" />
                            <span>Premium</span>
                        </div>
                    </div>
                </div>
                
                <div v-show="isSectionExpanded('chat-initiation')" class="section-content">
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
                    <div class="section-description-with-preview">
                        <p class="section-description-compact">
                            Messages appear above the chat bubble to encourage conversations.
                            <button 
                                v-if="!customization.chat_initiation_messages || customization.chat_initiation_messages.length === 0"
                                type="button" 
                                class="load-defaults-link" 
                                @click="loadDefaultInitiations"
                            >
                                Load defaults
                            </button>
                        </p>
                        <button 
                            v-if="customization.chat_initiation_messages && customization.chat_initiation_messages.length > 0"
                            type="button" 
                            class="preview-btn-initiation"
                            @mouseenter="showInitiationPreview"
                            @mouseleave="hideInitiationPreview"
                            @focus="showInitiationPreview"
                            @blur="hideInitiationPreview"
                            title="Preview initiation message"
                        >
                            <font-awesome-icon icon="fa-solid fa-eye" />
                            <span>Preview</span>
                        </button>
                    </div>

                    <!-- Add New Message - Compact -->
                    <div class="add-message-compact">
                        <input 
                            type="text" 
                            v-model="newInitiationMessage"
                            placeholder="Add new message (e.g., 👋 Hi! Need help?)"
                            class="message-input"
                            maxlength="100"
                            @keyup.enter="addInitiationMessage"
                        >
                        <button 
                            type="button" 
                            class="add-btn-icon" 
                            @click="addInitiationMessage"
                            :disabled="!newInitiationMessage.trim()"
                            title="Add message"
                        >
                            <font-awesome-icon icon="fa-solid fa-plus" />
                        </button>
                    </div>

                    <!-- Messages List - Compact -->
                    <div v-if="customization.chat_initiation_messages && customization.chat_initiation_messages.length > 0" class="messages-compact">
                        <div class="messages-header">
                            <span class="messages-count">{{ customization.chat_initiation_messages.length }} message{{ customization.chat_initiation_messages.length !== 1 ? 's' : '' }}</span>
                        </div>
                        <div class="message-chips">
                            <div 
                                v-for="(message, index) in customization.chat_initiation_messages" 
                                :key="index" 
                                class="message-chip"
                            >
                                <div v-if="editingInitiationIndex === index" class="message-edit-inline">
                                    <input 
                                        type="text" 
                                        v-model="editingInitiationMessage"
                                        class="message-input-small"
                                        maxlength="100"
                                        @keyup.enter="saveEditInitiationMessage"
                                        @keyup.esc="cancelEditInitiationMessage"
                                        ref="editInput"
                                    >
                                    <button type="button" class="chip-btn save" @click="saveEditInitiationMessage" title="Save">
                                        <font-awesome-icon icon="fa-solid fa-check" />
                                    </button>
                                    <button type="button" class="chip-btn cancel" @click="cancelEditInitiationMessage" title="Cancel">
                                        <font-awesome-icon icon="fa-solid fa-times" />
                                    </button>
                                </div>
                                <div v-else class="message-chip-content">
                                    <span class="chip-text">{{ message }}</span>
                                    <div class="chip-actions">
                                        <button 
                                            type="button" 
                                            class="chip-btn" 
                                            @click="startEditInitiationMessage(index)"
                                            title="Edit"
                                        >
                                            <font-awesome-icon icon="fa-solid fa-pen" />
                                        </button>
                                        <button 
                                            type="button" 
                                            class="chip-btn delete" 
                                            @click="removeInitiationMessage(index)"
                                            title="Delete"
                                        >
                                            <font-awesome-icon icon="fa-solid fa-trash" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div v-else-if="customization.chat_initiation_messages && customization.chat_initiation_messages.length === 0" class="empty-hint">
                        <font-awesome-icon icon="fa-solid fa-info-circle" />
                        <span>No messages yet. Add your first message above.</span>
                    </div>
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

.form-section {
    margin-bottom: var(--space-md);
    padding: 0;
    background: var(--background-base);
    border-radius: var(--radius-lg);
    border: 1px solid var(--border-color);
    overflow: hidden;
    transition: all var(--transition-fast);
}

/* Collapsible Section Styles */
.form-section.collapsible {
    cursor: default;
}

.section-header-collapsible {
    padding: var(--space-md);
    cursor: pointer;
    user-select: none;
    transition: all var(--transition-fast);
    background: var(--background-base);
}

.section-header-collapsible:hover {
    background: var(--background-soft);
}

.form-section.expanded .section-header-collapsible {
    border-bottom: 1px solid var(--border-color);
}

.section-header-collapsible h4 {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    color: var(--text-color);
    margin: 0;
    font-size: var(--text-base);
    font-weight: 600;
    text-transform: none;
    letter-spacing: 0;
}

.collapse-icon {
    font-size: 0.75rem;
    color: var(--text-muted);
    transition: transform var(--transition-fast);
}

.section-content {
    padding: var(--space-md);
    animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.form-section h4 {
    color: var(--text-muted);
    margin-bottom: var(--space-sm);
    font-size: var(--text-sm);
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.form-group {
    margin-bottom: var(--space-md);
}

.form-group label {
    display: block;
    margin-bottom: var(--space-sm);
    color: var(--text-muted);
    font-weight: 500;
    font-size: var(--text-sm);
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
    padding: var(--space-lg) var(--space-md);
    border-top: 1px solid var(--border-color);
    background: var(--background-base);
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
    background: rgba(16, 185, 129, 0.1);
    color: var(--success-color);
    border: 1px solid rgba(16, 185, 129, 0.3);
}

.save-message.error {
    background: rgba(239, 68, 68, 0.1);
    color: var(--error-color);
    border: 1px solid rgba(239, 68, 68, 0.3);
}

.message-icon {
    font-size: 1rem;
}

/* Button Actions */
.button-actions {
    display: flex;
    gap: var(--space-sm);
}

.save-button,
.cancel-button {
    padding: var(--space-sm) var(--space-lg);
    border: none;
    border-radius: var(--radius-md);
    cursor: pointer;
    font-weight: 500;
    flex: 1;
    min-width: 120px;
    transition: var(--transition-fast);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-xs);
}

.save-button {
    background: var(--accent-ink);
    color: #0B0C10;
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
    padding: var(--space-sm);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    background: var(--background-soft);
    color: var(--text-color);
    font-size: var(--text-sm);
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

.color-picker label {
    font-size: var(--text-sm);
    margin-bottom: var(--space-xs);
}

/* Chat Style Cards - Compact */
.section-label {
    display: block;
    margin-bottom: var(--space-sm);
    color: var(--text-color);
    font-weight: 500;
    font-size: var(--text-sm);
}

.style-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--space-sm);
}

.style-card {
    background: var(--background-soft);
    border: 2px solid var(--border-color);
    border-radius: var(--radius-md);
    padding: var(--space-md);
    cursor: pointer;
    transition: all var(--transition-normal);
    position: relative;
    overflow: hidden;
}

.style-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: var(--primary-color);
    transform: scaleX(0);
    transition: transform var(--transition-normal);
}

.style-card:hover {
    border-color: var(--primary-color);
    box-shadow: var(--shadow-sm);
    transform: translateY(-1px);
}

.style-card.active {
    border-color: var(--accent-ink);
    background: rgba(201, 242, 78, 0.05);
    box-shadow: var(--shadow-md);
}

.style-card.active::before {
    transform: scaleX(1);
}

.style-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--space-sm);
}

.style-icon {
    font-size: 1.5rem;
    line-height: 1;
}

.style-check {
    color: var(--primary-color);
    font-size: 1rem;
    animation: scaleIn 0.2s ease-out;
}

@keyframes scaleIn {
    from {
        transform: scale(0);
    }
    to {
        transform: scale(1);
    }
}

.style-card-body {
    text-align: left;
}

.style-title {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--text-color);
    margin: 0 0 4px 0;
}

.style-description {
    font-size: var(--text-xs);
    color: var(--text-muted);
    line-height: 1.3;
    margin: 0;
}

.style-card.active .style-title {
    color: var(--primary-color);
}

/* Welcome text customization styles */
.section-description {
    color: var(--text-muted);
    font-size: var(--text-sm);
    margin-bottom: var(--space-md);
    line-height: 1.5;
}

.text-input,
.text-textarea {
    width: 100%;
    padding: var(--space-sm) var(--space-md);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    background: var(--background-soft);
    color: var(--text-color);
    font-size: var(--text-sm);
    font-family: inherit;
    transition: var(--transition-fast);
    resize: vertical;
}

.text-input:focus,
.text-textarea:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 1px var(--primary-color);
    background: var(--background-base);
}

.text-input::placeholder,
.text-textarea::placeholder {
    color: var(--text-muted);
    opacity: 0.7;
}

.input-hint {
    display: block;
    margin-top: var(--space-xs);
    color: var(--text-muted);
    font-size: var(--text-xs);
    line-height: 1.4;
}

.text-textarea {
    min-height: 80px;
    line-height: 1.5;
}

/* Chat Initiation Messages Styles - Compact Design */
.chat-initiation-section {
    position: relative;
}

.section-title-group {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    flex: 1;
}

.section-title-group h4 {
    margin: 0;
    flex: 1;
}

.premium-badge-small {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: linear-gradient(135deg, var(--c-purple), #7C6AE6);
    color: #F5F6F8;
    padding: 2px 8px;
    border-radius: var(--radius-full);
    font-size: 10px;
    font-weight: 600;
}

.premium-badge-small svg {
    font-size: 9px;
    color: #ffd700;
}

/* Compact Locked State */
.locked-overlay-compact {
    background: var(--background-soft);
    border: 1px dashed var(--border-color);
    border-radius: var(--radius-md);
    padding: var(--space-md);
    margin-top: var(--space-sm);
}

.locked-content-compact {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    flex-wrap: wrap;
}

.lock-icon-small {
    font-size: 1rem;
    color: var(--text-muted);
    opacity: 0.6;
}

.locked-text {
    flex: 1;
    min-width: 200px;
    font-size: var(--text-sm);
    color: var(--text-muted);
    margin: 0;
}

.upgrade-btn-compact {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: var(--accent-ink);
    color: #0B0C10;
    border: none;
    border-radius: var(--radius-md);
    padding: 6px 12px;
    font-size: var(--text-xs);
    font-weight: 600;
    cursor: pointer;
    transition: all var(--transition-fast);
    white-space: nowrap;
}

.upgrade-btn-compact:hover {
    background: var(--primary-dark);
}

.upgrade-btn-compact svg {
    font-size: 10px;
    color: #ffd700;
}

/* Compact Description */
.section-description-with-preview {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--space-md);
    margin-bottom: var(--space-sm);
}

.section-description-compact {
    font-size: var(--text-sm);
    color: var(--text-muted);
    margin-bottom: 0;
    line-height: 1.4;
    flex: 1;
}

.preview-btn-initiation {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: var(--background-soft);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all var(--transition-fast);
    white-space: nowrap;
}

.preview-btn-initiation:hover {
    background: var(--accent-ink);
    color: #0B0C10;
    border-color: var(--accent-ink);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(201, 242, 78, 0.2);
}

.preview-btn-initiation:focus {
    outline: none;
    background: var(--accent-ink);
    color: #0B0C10;
    border-color: var(--accent-ink);
    box-shadow: 0 0 0 3px rgba(201, 242, 78, 0.1);
}

.preview-btn-initiation svg {
    font-size: 14px;
}

.load-defaults-link {
    display: inline;
    background: none;
    border: none;
    color: var(--primary-color);
    font-size: var(--text-sm);
    font-weight: 500;
    cursor: pointer;
    text-decoration: underline;
    padding: 0;
    margin-left: 4px;
}

.load-defaults-link:hover {
    color: var(--primary-dark);
}

/* Compact Add Message */
.add-message-compact {
    display: flex;
    gap: var(--space-xs);
    margin-bottom: var(--space-sm);
}

.message-input {
    flex: 1;
    padding: 8px 12px;
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    background: var(--background-soft);
    color: var(--text-color);
    font-size: var(--text-sm);
    transition: var(--transition-fast);
}

.message-input:focus {
    outline: none;
    border-color: var(--primary-color);
    background: var(--background-base);
}

.add-btn-icon {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--accent-ink);
    color: #0B0C10;
    border: none;
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all var(--transition-fast);
    flex-shrink: 0;
}

.add-btn-icon:hover:not(:disabled) {
    background: var(--primary-dark);
}

.add-btn-icon:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* Compact Messages List */
.messages-compact {
    margin-top: var(--space-sm);
}

.messages-header {
    margin-bottom: var(--space-xs);
}

.messages-count {
    font-size: var(--text-xs);
    color: var(--text-muted);
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.message-chips {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.message-chip {
    background: var(--background-soft);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    overflow: hidden;
    transition: all var(--transition-fast);
}

.message-chip:hover {
    border-color: var(--border-color-hover);
    box-shadow: var(--shadow-sm);
}

.message-chip-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    gap: var(--space-sm);
}

.chip-text {
    flex: 1;
    font-size: var(--text-sm);
    color: var(--text-color);
    line-height: 1.4;
}

.chip-actions {
    display: flex;
    gap: 4px;
    opacity: 0;
    transition: opacity var(--transition-fast);
}

.message-chip:hover .chip-actions {
    opacity: 1;
}

.chip-btn {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    border-radius: var(--radius-sm);
    transition: all var(--transition-fast);
    font-size: 11px;
}

.chip-btn:hover {
    background: var(--background-mute);
    color: var(--primary-color);
}

.chip-btn.delete:hover {
    color: var(--error-color);
}

.chip-btn.save {
    color: var(--success-color);
}

.chip-btn.save:hover {
    background: rgba(16, 185, 129, 0.1);
}

.chip-btn.cancel:hover {
    background: var(--background-mute);
    color: var(--text-color);
}

/* Inline Edit */
.message-edit-inline {
    display: flex;
    align-items: center;
    padding: 6px 8px;
    gap: 6px;
}

.message-input-small {
    flex: 1;
    padding: 6px 8px;
    border: 1px solid var(--primary-color);
    border-radius: var(--radius-sm);
    background: var(--background-base);
    color: var(--text-color);
    font-size: var(--text-sm);
}

.message-input-small:focus {
    outline: none;
    box-shadow: 0 0 0 1px var(--primary-color);
}

/* Empty State */
.empty-hint {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    padding: var(--space-sm);
    background: var(--background-soft);
    border-radius: var(--radius-md);
    font-size: var(--text-xs);
    color: var(--text-muted);
    margin-top: var(--space-sm);
}

.empty-hint svg {
    font-size: 12px;
    opacity: 0.7;
}

/* Responsive Styles */
@media (max-width: 640px) {
    .section-description-with-preview {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--space-sm);
    }
    
    .preview-btn-initiation {
        align-self: flex-start;
        font-size: 0.8125rem;
        padding: 5px 10px;
    }
    
    .preview-btn-initiation span {
        display: inline;
    }
}
</style>
