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
import { computed, onMounted, onUnmounted, ref, watch, nextTick } from 'vue'
import type { AgentCustomization } from '@/types/agent'
import { isAbsoluteUrl } from '@/utils/avatars'
import { orbSvgDataUri, resolveOrbStyle } from '@/utils/orb'
import { themeCssVars } from '@/webclient/widget-theme'
import '@/webclient/widget-surface.css'
import { useAgentChat } from '@/composables/useAgentChat'
import WebFont from 'webfontloader'
import { marked } from 'marked'
import { sanitizeHtml } from '@/utils/sanitize'

const props = defineProps<{
    isActive: boolean
    customization: AgentCustomization & { showBubblePreview?: boolean; showInitiationPreview?: boolean }
    agentType: string
    agentName: string
    agentId: string
    // Seed for the fallback orb; pass the agent slug so it matches the list and
    // detail header. Falls back to agentName when not given.
    orbSeed?: string
}>()
console.log('AgentChatPreviewPanel props:', props.customization)
const isExpanded = ref(true)
const emailInput = ref('')
const hasStartedChat = ref(false)

// Chat initiation message state
const showInitiationMessage = ref(false)
const initiationMessageText = ref('')
const isTyping = ref(false)
const previewMessage = ref('') // Store the message selected for preview
const isShowingPreview = ref(false) // Prevent multiple simultaneous animations

// Store original messages for restoration when switching back to CHATBOT
const originalMessages = ref<any[]>([])
const hasStoredMessages = ref(false)

// Watch for customization changes to debug
watch(() => props.customization, (newCustomization) => {
    console.log('Customization changed:', newCustomization)
}, { deep: true, immediate: true })

// Sample conversation shown in the preview for every (non Ask-AI) design
const sampleConversation = (): any[] => ([
    { role: 'bot', content: 'Hi! How can I help you today?' },
    { role: 'user', content: 'Do you offer free returns?' },
    { role: 'bot', content: 'Yes — free 30-day returns on everything.' },
])

// Handle chat style changes
const handleChatStyleChange = (oldStyle: string, newStyle: string) => {
    console.log('🔄 Processing chat style change:', { oldStyle, newStyle, currentMessages: messages.value.length })

    // Ask-style designs (Ask Anything + Aurora) show the centered welcome with no conversation
    const isAskStyle = (s: string) => s === 'ASK_ANYTHING' || s === 'AURORA'

    if (isAskStyle(newStyle)) {
        // Entering an ask-style design (from any other): store current messages and clear them
        if (messages.value.length > 0 && !hasStoredMessages.value) {
            originalMessages.value = [...messages.value]
            hasStoredMessages.value = true
        }
        messages.value.splice(0)

    } else if (isAskStyle(oldStyle)) {
        // Leaving an ask-style design (to a conversation design): restore or seed the sample
        if (hasStoredMessages.value && originalMessages.value.length > 0) {
            messages.value.splice(0, messages.value.length, ...originalMessages.value)
        } else {
            messages.value.splice(0, messages.value.length, ...sampleConversation())
        }
    }
    
    // Force reactivity update
    nextTick(() => {
        console.log('✅ Chat style change completed:', {
            newStyle,
            messagesCount: messages.value.length,
            shouldShowWelcome: shouldShowWelcomeMessage.value,
            shouldShowChat: shouldShowChatPanel.value
        })
    })
}

// Track previous chat style to avoid infinite loops
const previousChatStyle = ref(props.customization.chat_style)
const isChangingStyle = ref(false)

// Watch for chat style changes to manage messages
watch(() => props.customization.chat_style, async (newStyle) => {
    // Prevent multiple rapid changes
    if (isChangingStyle.value) {
        console.log('Style change already in progress, skipping')
        return
    }
    
    const oldStyle = previousChatStyle.value
    
    if (oldStyle && newStyle && newStyle !== oldStyle) {
        console.log('Valid chat style change detected:', oldStyle, '->', newStyle)
        isChangingStyle.value = true
        
        try {
            handleChatStyleChange(oldStyle, newStyle)
            previousChatStyle.value = newStyle
        } finally {
            // Allow next change after a short delay
            nextTick(() => {
                isChangingStyle.value = false
                console.log('Style change completed, ready for next change')
            })
        }
    }
}, { immediate: false })

// Initialize chat composable
const {
    messages,
    isLoading,
    error,
    currentInput,
    initChat,
    sendMessage,
    cleanup
} = useAgentChat(props.agentId)

// Handle message submit - dummy for preview only
const handleSubmit = () => {
    // Do nothing - this is just a preview
    return
}

// Handle enter key - dummy for preview only
const handleKeyPress = (event: KeyboardEvent) => {
    // Do nothing - this is just a preview
    return
}

// Watch for showInitiationPreview flag
watch(() => props.customization.showInitiationPreview, async (newValue) => {
    // Prevent multiple simultaneous animations
    if (isShowingPreview.value) {
        return
    }
    
    if (newValue && hasChatInitiationMessages.value) {
        isShowingPreview.value = true
        try {
            // Pick ONE message for preview and show it with typewriter effect
            previewMessage.value = getRandomInitiationMessage()
            if (previewMessage.value) {
                showInitiationMessage.value = true
                initiationMessageText.value = ''
                // Wait for animation then start typing
                await new Promise(resolve => setTimeout(resolve, 300))
                await typeWriteMessage(previewMessage.value, 40)
            }
        } finally {
            isShowingPreview.value = false
        }
    } else {
        // Reset when exiting preview
        hideInitiation()
        previewMessage.value = ''
        isShowingPreview.value = false
    }
})

// Lifecycle hooks
onMounted(() => {
    // Set initial chat style
    previousChatStyle.value = props.customization.chat_style
    
    // Don't initialize chat for ASK_ANYTHING style to avoid adding initial messages
    if (!isAskAnythingStyle.value) {
        initChat()
        // Seed a short sample conversation so the preview shows real bubbles for every design
        messages.value = sampleConversation()
    }

    // Load initial font
    if (props.customization.font_family) {
        const styleId = `chat-panel-font-${props.agentId}`
        let styleEl = document.getElementById(styleId)

        if (!styleEl) {
            styleEl = document.createElement('style')
            styleEl.id = styleId
            document.head.appendChild(styleEl)
        }

        WebFont.load({
            google: {
                families: [props.customization.font_family]
            },
            active: () => {
                if (styleEl) {
                    styleEl.textContent = `
                        .chat-panel-${props.agentId} {
                            font-family: "${props.customization.font_family}", system-ui, sans-serif;
                        }
                    `
                }
            }
        })
    }
    
    // Show initiation message if available
    if (hasChatInitiationMessages.value) {
        setTimeout(() => {
            showInitiation()
        }, 2000)
    }
})

onUnmounted(() => {
    cleanup()
    const styleEl = document.getElementById(`chat-panel-font-${props.agentId}`)
    if (styleEl) {
        styleEl.remove()
    }
})

// Function to determine if background is dark
const isColorDark = (color: string) => {
    const hex = color.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000
    return brightness < 128
}

// Watch for font family changes and load the font
watch(() => props.customization.font_family, (newFont) => {
    if (!newFont) return

    // Create a style element for this specific chat panel
    const styleId = `chat-panel-font-${props.agentId}`
    let styleEl = document.getElementById(styleId)

    if (!styleEl) {
        styleEl = document.createElement('style')
        styleEl.id = styleId
        document.head.appendChild(styleEl)
    }

    // Load font and scope it to this chat panel
    WebFont.load({
        google: {
            families: [newFont]
        },
        active: () => {
            if (styleEl) {
                styleEl.textContent = `
                    .chat-panel-${props.agentId} {
                        font-family: "${newFont}", system-ui, sans-serif;
                    }
                `
            }
        }
    })
})

// Premium design presets → CSS theme class on the preview container
const THEME_CLASS_MAP: Record<string, string> = {
    GLASS: 'theme-glass',
    TERMINAL: 'theme-terminal',
    PLAYFUL: 'theme-playful',
    CALM_MINT: 'theme-calm',
}
const themeClass = computed(() => THEME_CLASS_MAP[props.customization.chat_style as string] || '')

// Themed colours come from the shared design tokens (widget-theme.ts) — identical to
// the real widget — so the preview can never drift. These return `var(--cm-*)` refs.
const themeVars = computed(() => themeCssVars(props.customization.chat_style as string, {
    chat_background_color: props.customization.chat_background_color,
    chat_text_color: props.customization.chat_text_color,
    accent_color: props.customization.accent_color,
    font_family: props.customization.font_family,
}))

const chatStyles = computed(() => ({
    backgroundColor: 'var(--cm-card)',
    color: 'var(--cm-text)'
}))

const chatIconStyles = computed(() => ({
    backgroundColor: props.customization.chat_bubble_color,
    color: isColorDark(props.customization.chat_bubble_color ?? '#000000') ? '#FFFFFF' : '#000000'
}))

const agentBubbleStyles = computed(() => ({
    backgroundColor: 'var(--cm-agent-bg)',
    color: 'var(--cm-text)'
}))

const userBubbleStyles = computed(() => ({
    backgroundColor: 'var(--cm-accent)',
    color: 'var(--cm-on-accent)'
}))

const accentStyles = computed(() => ({
    backgroundColor: 'var(--cm-accent)',
    color: 'var(--cm-on-accent)'
}))

const messageNameStyles = computed(() => ({
    color: 'var(--cm-text)'
}))

const photoUrl = computed(() => {
    // These are <img> slots in chat bubbles, so the fallback has to be an image:
    // the orb as an SVG data URI. Previously the retired /avatars/*.svg artwork.
    // Seeded off orbSeed (the agent slug) so it matches the orb on the detail
    // header and in the list, which use the same seed.
    if (!props.customization.photo_url) {
        return orbSvgDataUri(
            props.orbSeed || props.agentName,
            props.customization.customization_metadata?.orb_variant,
        )
    }
    
    // Use signed URL if available (for S3)
    if (props.customization.photo_url_signed) {
        return props.customization.photo_url_signed
    }
    
    // Absolute S3/CDN URL — use it directly
    if (isAbsoluteUrl(props.customization.photo_url)) {
        return props.customization.photo_url
    }
    
    // For local storage, prepend the API URL
    return import.meta.env.VITE_API_URL + props.customization.photo_url
})

// Function to format message content
const formatMessage = (content: string) => {
    // Configure marked options and sanitize to prevent XSS attacks
    return sanitizeHtml(marked(content) as string)
}

// Add this function near the top of the script section with other utility functions
const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

// Update the isMessageInputEnabled computed property
const isMessageInputEnabled = computed(() => {
    return props.isActive && !isLoading.value && isValidEmail(emailInput.value.trim())
})

// Aurora is the new dark ask-me-anything design. It reuses the ASK_ANYTHING
// welcome/input flow but with a dark, polished theme and an orb avatar.
const isAuroraStyle = computed(() => props.customization.chat_style === 'AURORA')

// Add computed property for ASK_ANYTHING style detection (includes Aurora, which
// shares the same welcome-screen + ask-anything input behavior)
const isAskAnythingStyle = computed(() => {
    return props.customization.chat_style === 'ASK_ANYTHING' || isAuroraStyle.value
})

// Show the generated aurora orb when the user explicitly picked "orb", or as the Aurora
// fallback when no profile photo is set. A selected profile picture always takes precedence.
const orbMeta = computed(() => props.customization.customization_metadata as Record<string, unknown> | undefined)
const useOrbAvatar = computed(() => {
    const avatarStyle = orbMeta.value?.avatar_style
    if (avatarStyle === 'orb') return true
    if (avatarStyle === 'photo') return false
    return isAuroraStyle.value && !props.customization.photo_url
})

const orbStyle = computed(() => resolveOrbStyle(props.agentName, orbMeta.value?.orb_variant))

// Computed property for container styles
const containerStyles = computed(() => {
    const baseStyles = {
        width: '384px',
        height: '560px',
        borderRadius: 'var(--cm-radius, 24px)'
    }

    if (isAskAnythingStyle.value) {
        return {
            ...baseStyles,
            width: '500px',  // Increased width for ASK_ANYTHING style
            minWidth: '450px'
        }
    }

    return baseStyles
})

// Computed property for welcome message display
const shouldShowWelcomeMessage = computed(() => {
    const showWelcome = isAskAnythingStyle.value && messages.value.length === 0
    console.log('shouldShowWelcomeMessage:', {
        isAskAnythingStyle: isAskAnythingStyle.value,
        messagesLength: messages.value.length,
        showWelcome,
        chatStyle: props.customization.chat_style
    })
    return showWelcome
})

// Computed property for showing chat panel
const shouldShowChatPanel = computed(() => {
    const showChat = !shouldShowWelcomeMessage.value
    console.log('shouldShowChatPanel:', {
        shouldShowWelcomeMessage: shouldShowWelcomeMessage.value,
        showChat,
        isAskAnythingStyle: isAskAnythingStyle.value,
        messagesLength: messages.value.length
    })
    return showChat
})

// Computed properties for welcome text with reactive updates
const welcomeTitle = computed(() => {
    const title = props.customization.welcome_title
    console.log('Welcome title computed:', title)
    return title || `Welcome to ${props.agentName}`
})

const welcomeSubtitle = computed(() => {
    const subtitle = props.customization.welcome_subtitle
    console.log('Welcome subtitle computed:', subtitle)
    return subtitle || "I'm here to help you with anything you need. What can I assist you with today?"
})

// Computed property to check if chat initiation messages are available
const hasChatInitiationMessages = computed(() => {
    return props.customization.chat_initiation_messages && 
           Array.isArray(props.customization.chat_initiation_messages) && 
           props.customization.chat_initiation_messages.length > 0
})

// Sanitize message to remove corrupted emoji characters
const sanitizeMessage = (message: string): string => {
    if (!message) return ''
    // Remove replacement characters and other common corruption patterns
    return message
        .replace(/\uFFFD/g, '') // Remove replacement character
        .replace(/[��]/g, '') // Remove common corruption symbols
        .replace(/[\x00-\x1F\x7F-\x9F]/g, '') // Remove control characters
        .trim()
}

// Get a random initiation message
const getRandomInitiationMessage = () => {
    if (!hasChatInitiationMessages.value) return ''
    const messages = props.customization.chat_initiation_messages || []
    const randomIndex = Math.floor(Math.random() * messages.length)
    const message = messages[randomIndex] || ''
    return sanitizeMessage(message)
}

// Typewriting effect
const typeWriteMessage = async (text: string, speed = 50) => {
    // Check if we should continue typing
    if (!showInitiationMessage.value || !isShowingPreview.value) {
        return
    }
    
    isTyping.value = true
    initiationMessageText.value = ''
    
    for (let i = 0; i < text.length; i++) {
        // Stop if preview was cancelled
        if (!showInitiationMessage.value || !isShowingPreview.value) {
            break
        }
        initiationMessageText.value += text.charAt(i)
        await new Promise(resolve => setTimeout(resolve, speed))
    }
    
    isTyping.value = false
}

// Show initiation message (for non-preview mode - actual chat bubble)
const showInitiation = async () => {
    if (!hasChatInitiationMessages.value) return
    
    // Don't show if we're in preview mode (preview is handled by watcher)
    if (props.customization.showInitiationPreview) return
    
    const message = getRandomInitiationMessage()
    if (!message) return
    
    showInitiationMessage.value = true
    
    // Wait for animation then start typing
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // For actual chat bubble (non-preview), we need different typing logic
    isTyping.value = true
    initiationMessageText.value = ''
    
    for (let i = 0; i < message.length; i++) {
        // Stop if message was hidden
        if (!showInitiationMessage.value) {
            break
        }
        initiationMessageText.value += message.charAt(i)
        await new Promise(resolve => setTimeout(resolve, 40))
    }
    
    isTyping.value = false
}

// Hide initiation message
const hideInitiation = () => {
    showInitiationMessage.value = false
    initiationMessageText.value = ''
    isTyping.value = false
}

// Handle initiation message click
const handleInitiationClick = () => {
    hideInitiation()
    isExpanded.value = true
}
</script>

<template>
    <div class="chat-container cm-surface" :class="[{ collapsed: !isExpanded, 'ask-anything-style': isAskAnythingStyle }, themeClass]" :style="{ ...containerStyles, ...themeVars }">
        <!-- Chat Initiation Message -->
        <div 
            v-if="showInitiationMessage && hasChatInitiationMessages && (customization.showBubblePreview || customization.showInitiationPreview || !isExpanded)" 
            class="chat-initiation-message"
            :class="{ show: showInitiationMessage }"
            @click="handleInitiationClick"
        >
            <button class="initiation-close" @click.stop="hideInitiation" aria-label="Close">
            </button>
            <p class="initiation-message-text" :class="{ 'typing-complete': !isTyping }">
                {{ initiationMessageText }}
            </p>
        </div>
        
        <!-- Chat Toggle Button -->
        <div class="toggle-container" v-if="!isExpanded || customization.showBubblePreview || customization.showInitiationPreview">
            <button class="chat-toggle" :class="{ preview: customization.showBubblePreview || customization.showInitiationPreview }" :style="chatIconStyles"
                @click="isExpanded = !isExpanded">
                <!-- New launcher mark: 3 dots in the contrast ink (matches chattermate.js) -->
                <div class="cm-toggle-dots"><span></span><span></span><span></span></div>
            </button>
        </div>

        <!-- Welcome Message for ASK_ANYTHING Style -->
        <div v-if="shouldShowWelcomeMessage && isExpanded && !customization.showBubblePreview && !customization.showInitiationPreview" class="welcome-message-section" :class="{ aurora: isAuroraStyle }" :style="chatStyles">
            <div class="welcome-content">
                <div class="welcome-header">
                    <div v-if="useOrbAvatar" class="welcome-orb" :style="orbStyle"></div>
                    <img
                        v-else-if="photoUrl"
                        :src="photoUrl"
                        :alt="agentName"
                        class="welcome-avatar"
                    >
                    <h1 class="welcome-title">{{ welcomeTitle }}</h1>
                    <p class="welcome-subtitle">{{ welcomeSubtitle }}</p>
                </div>
            </div>

            <!-- ASK_ANYTHING Input directly in welcome section -->
            <div class="welcome-input-container">
                <div class="welcome-message-input">
                    <input
                        v-model="currentInput"
                        type="text"
                        placeholder="Ask me anything..."
                        @keypress="() => {}"
                        :disabled="true"
                        class="welcome-message-field"
                    >
                    <button
                        class="welcome-send-button"
                        :class="{ 'aurora-send': isAuroraStyle }"
                        :style="accentStyles"
                        @click="() => {}"
                        :disabled="true"
                    >
                        <svg v-if="isAuroraStyle" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 19V5M12 5L5 12M12 5L19 12" stroke="currentColor" stroke-width="2"
                                stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                        <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 12L3 21L21 12L3 3L5 12ZM5 12L13 12" stroke="currentColor" stroke-width="2"
                                stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </button>
                </div>
            </div>
            
            <!-- Powered by footer for welcome message -->
            <div class="powered-by-welcome" :style="messageNameStyles">
                <svg class="chattermate-logo" width="15" height="15" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 3H41A16 16 0 0 1 57 19V41A16 16 0 0 1 41 57H9A6 6 0 0 1 3 51V19A16 16 0 0 1 19 3Z" fill="#C9F24E"/>
                    <circle cx="19.7" cy="30" r="4.3" fill="#0B0C10"/>
                    <circle cx="30" cy="30" r="4.3" fill="#0B0C10"/>
                    <circle cx="40.3" cy="30" r="4.3" fill="#0B0C10"/>
                </svg>
                <span class="cm-powered-prefix">Powered by </span><strong class="cm-brand">ChatterMate</strong>
            </div>
        </div>

        <!-- Chat Panel -->
        <div class="chat-panel" :class="[
            { disabled: !isActive, 'ask-anything-chat': isAskAnythingStyle },
            `chat-panel-${agentId}`
        ]" :style="chatStyles" v-if="isExpanded && !customization.showBubblePreview && !customization.showInitiationPreview && shouldShowChatPanel">
            <div v-if="!isAskAnythingStyle" class="chat-header">
                <div class="header-content">
                    <img :src="photoUrl" :alt="agentName" class="header-avatar">
                    <div class="header-info">
                        <h3 :style="messageNameStyles">{{ agentName }}</h3>
                        <div class="status">
                            <span class="status-indicator" :class="{ online: isActive }"></span>
                            <span class="status-text cm-presence">{{ isActive ? 'Online · replies instantly' : 'Offline' }}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div v-if="!isActive" class="disabled-overlay">
                <div class="disabled-content">
                    <div class="disabled-icon">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M12 15V17M12 7V13M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </div>
                    <h4 class="disabled-content-title">Agent is Offline</h4>
                    <p>Enable the agent to start testing conversations</p>
                </div>
            </div>
            <div class="chat-messages">
                <div v-for="(message, index) in messages" :key="index" :class="['message', message.role === 'bot' ? 'agent-message' : `${message.role}-message`]">
                    <div v-if="message.role === 'bot'" class="cm-msg-avatar">
                        <div v-if="useOrbAvatar" class="cm-msg-avatar-orb" :style="orbStyle"></div>
                        <img v-else :src="photoUrl" :alt="agentName" class="cm-msg-avatar-img">
                    </div>
                    <div class="message-bubble"
                        :style="message.role === 'bot' ? agentBubbleStyles : userBubbleStyles"
                        v-html="formatMessage(message.content)">
                    </div>
                </div>

                <!-- Loading indicator -->
                <div v-if="isLoading" class="message assistant-message">
                    <div class="message-content">
                        <div class="message-bubble loading" :style="agentBubbleStyles">
                            <span class="dot"></span>
                            <span class="dot"></span>
                            <span class="dot"></span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Error message -->
            <div v-if="error" class="error-message">
                {{ error }}
            </div>

            <div class="chat-input" :class="{ 'ask-anything-input': isAskAnythingStyle }" :style="agentBubbleStyles">
                <!-- Email gate is intentionally omitted in the preview -->
                <div class="message-input">
                    <input 
                        v-model="currentInput" 
                        type="text" 
                        :placeholder="isAskAnythingStyle ? 'Ask me anything...' : 'Type a message...'"
                        @keypress="() => {}"
                        :disabled="true"
                        :class="{ 'ask-anything-field': isAskAnythingStyle }"
                    >
                    <button 
                        class="send-button" 
                        :class="{ 'ask-anything-send': isAskAnythingStyle }"
                        :style="accentStyles" 
                        @click="() => {}"
                        :disabled="true"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 19V5M5 12l7-7 7 7" stroke="currentColor" stroke-width="2.2"
                                stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </button>
                </div>
            </div>

            <!-- Add powered by footer -->
            <div class="powered-by" :style="messageNameStyles">
                <svg class="chattermate-logo" width="15" height="15" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 3H41A16 16 0 0 1 57 19V41A16 16 0 0 1 41 57H9A6 6 0 0 1 3 51V19A16 16 0 0 1 19 3Z" fill="#C9F24E"/>
                    <circle cx="19.7" cy="30" r="4.3" fill="#0B0C10"/>
                    <circle cx="30" cy="30" r="4.3" fill="#0B0C10"/>
                    <circle cx="40.3" cy="30" r="4.3" fill="#0B0C10"/>
                </svg>
                <span class="cm-powered-prefix">Powered by </span><strong class="cm-brand">ChatterMate</strong>
            </div>
        </div>


    </div>
</template>

<style scoped>
.chat-container {
    width: 384px;
    height: 600px;
    display: flex;
    flex-direction: column;
    background: transparent;
    border-radius: var(--radius-xl, 20px);
    overflow: hidden;
    box-shadow: 0 30px 70px -25px rgba(0, 0, 0, 0.7);
    margin-left: auto;
    position: relative;
    font-family: var(--font-sans);
}

.chat-container.collapsed {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    box-shadow: none;
    overflow: visible;
}

.toggle-container {
    position: absolute;
    bottom: 150px;
    right: 20px;
    z-index: 10;
}

.chat-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 62px;
    height: 62px;
    border-radius: 20px 20px 20px 6px;
    border: none;
    color: white;
    cursor: pointer;
    box-shadow: 0 16px 36px -8px v-bind('customization.chat_bubble_color || "var(--accent-ink)"');
    transition: all 0.3s ease;
}

.cm-toggle-dots {
    display: flex;
    gap: 5px;
    align-items: center;
    justify-content: center;
}
.cm-toggle-dots span {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: currentColor;
}

.chat-toggle:hover {
    transform: scale(1.05);
    box-shadow: 0 18px 40px -8px v-bind('customization.chat_bubble_color || "var(--accent-ink)"');
}

.chat-toggle.preview {
    animation: pulse 2s infinite;
}

@keyframes pulse {

    0%,
    100% {
        transform: scale(1);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }

    50% {
        transform: scale(1.1);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }
}

.chat-panel {
    background: var(--surface);
    border: 1px solid var(--o08);
    display: flex;
    flex-direction: column;
    height: 600px;
    transition: all 0.3s ease;
    border-radius: var(--radius-xl, 20px);
    overflow: hidden;
}

.chat-container.collapsed .chat-panel,
.chat-container.collapsed .welcome-message-section {
    display: none !important;
}

.chat-header {
    padding: 14px 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.chat-header h3 {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    line-height: 1.1;
}



.chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: var(--space-md);
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
}

.message {
    display: flex;
    gap: var(--space-sm);
    max-width: 80%;
    align-items: flex-start;
    margin-bottom: var(--space-md);
}

.message-avatar {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    object-fit: cover;
    margin-top: 4px;
}

.message-bubble {
    padding: 10px 14px;
    border-radius: 4px 14px 14px 14px;
    font-size: 13.5px;
    line-height: 1.5;
    max-width: 85%;
}

.agent-message .message-bubble,
.assistant-message .message-bubble {
    border-radius: 4px 14px 14px 14px;
}

.user-message {
    align-self: flex-end;
    flex-direction: row-reverse;
}

.user-message .message-bubble {
    border-radius: 14px 14px 4px 14px;
}

.chat-input {
    padding: 12px 14px;
    border-top: 1px solid var(--o08);
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.email-input {
    width: 100%;
}

.email-input input {
    width: 100%;
    padding: 9px 12px;
    border: 1px solid var(--o12);
    border-radius: var(--radius-input);
    background: var(--o05);
    color: var(--text);
    font-size: 12.5px;
}

.message-input {
    display: flex;
    align-items: center;
    gap: 8px;
}

.message-input input {
    flex: 1;
    padding: 9px 12px;
    border: 1px solid var(--o12);
    border-radius: 12px;
    background: var(--o05);
    color: var(--text);
    font-size: 12.5px;
}

.message-input input::placeholder {
    color: var(--muted);
}

.send-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    min-width: 36px;
    height: 36px;
    flex-shrink: 0;
    padding: 0;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    color: white;
}

.send-button svg {
    transition: transform 0.2s ease;
}

.send-button:hover svg {
    transform: translateX(2px);
}

.chat-panel.disabled {
    opacity: 0.7;
    pointer-events: none;
    position: relative;
}

.disabled-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
    border-radius: 24px;
}

.disabled-content {
    text-align: center;
    padding: var(--space-xl);
    max-width: 300px;
}

.disabled-icon {
    width: 64px;
    height: 64px;
    background: var(--background-soft);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto var(--space-lg);
    color: var(--text-muted);
}

.disabled-content h3 {
    font-size: 1.25rem;
    margin: 0 0 var(--space-sm);
    color: var(--text-color);
}

.disabled-content p {
    color: var(--text-muted);
    margin: 0 0 var(--space-lg);
    line-height: 1.5;
}

.disabled-content-title {
    font-size: var(--text-lg);
    margin: 0 0 var(--space-sm);
    color: var(--error-color);
}

/* For mobile responsiveness */
@media (max-width: 768px) {
    .chat-container {
        width: 100%;
        height: 100%;
    }

    .chat-panel {
        height: 100%;
    }
}

/* Add new styles for loading animation */
.loading {
    display: flex;
    gap: 4px;
    padding: 12px 16px;
}

.dot {
    width: 8px;
    height: 8px;
    background: currentColor;
    border-radius: 50%;
    opacity: 0.6;
    animation: bounce 1.4s infinite ease-in-out;
}

.dot:nth-child(1) {
    animation-delay: -0.32s;
}

.dot:nth-child(2) {
    animation-delay: -0.16s;
}

@keyframes bounce {

    0%,
    80%,
    100% {
        transform: scale(0);
    }

    40% {
        transform: scale(1);
    }
}

.error-message {
    padding: var(--space-sm);
    color: var(--error-color);
    text-align: center;
    font-size: 0.875rem;
}

.header-content {
    display: flex;
    align-items: center;
    gap: 10px;
}

.header-avatar {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    object-fit: cover;
}

.header-info {
    display: flex;
    flex-direction: column;
}

.header-info h3 {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    line-height: 1.1;
}

.status {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 11px;
    margin-top: 2px;
}

.status-indicator {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--error-color);
}

/* Presence dot + text colour come from the shared widget-surface.css (accent). */

/* Add styles for markdown content */
:deep(.message-bubble) {

    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
        margin: 1em 0 0.5em 0;
        font-weight: 600;
    }

    h3 {
        font-size: 1.17em;
    }

    a {
        color: inherit;
        text-decoration: underline;
    }

    ul,
    ol {
        margin: 0.5em 0;
        padding-left: 1.5em;
    }

    li {
        margin: 0.25em 0;
    }

    p {
        margin: 0.5em 0;
    }

    strong {
        font-weight: 600;
    }
}

.powered-by {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: var(--space-xs);
    font-size: 0.75rem;
    border-top: 1px solid var(--o08);
}
.powered-by .chattermate-logo,
.powered-by-welcome .chattermate-logo {
    flex-shrink: 0;
}
/* "Powered by" is muted; "ChatterMate" is emphasized (comp). Both inherit the footer's
   own colour (white on dark themes) so ChatterMate stays visible — dimming is on the
   prefix only, never a dark app token that would vanish on the dark panel. */
.cm-powered-prefix { opacity: 0.6; }
.cm-brand { font-weight: 700; }

.message-input input:disabled {
    cursor: not-allowed;
}

.send-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.email-input input.invalid {
    border-color: var(--error-color);
}

.email-input input.invalid:focus {
    outline-color: var(--error-color);
}

/* ===== Message entrance animation ===== */
.chat-messages .message {
    animation: cm-msg-in 0.34s cubic-bezier(0.2, 0.7, 0.2, 1) both;
}
@keyframes cm-msg-in {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: none; }
}
@media (prefers-reduced-motion: reduce) {
    .chat-messages .message { animation: none; }
}

/* ===== Theme-adaptive inputs (legible on light & dark designs) ===== */
.message-input input,
.email-input input {
    background: rgba(127, 127, 127, 0.08);
    background: color-mix(in srgb, currentColor 7%, transparent);
    border: 1.5px solid rgba(127, 127, 127, 0.3);
    border: 1.5px solid color-mix(in srgb, currentColor 24%, transparent);
    color: inherit;
}
.message-input input::placeholder {
    color: currentColor;
    opacity: 0.5;
}

/* Per-theme appearance is owned by the shared widget-surface.css (token-driven);
   the preview keeps only its ASK_ANYTHING chrome below. */

/* Terminal: keep the mock's single-line paragraph rendering. */
.chat-container.theme-terminal :deep(.message-bubble p) { display: inline; margin: 0; }

/* ========== ASK_ANYTHING CHAT STYLE ========== */

.chat-container.ask-anything-style {
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
}

/* Welcome Message Section for ASK_ANYTHING Style */
.welcome-message-section {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    background: var(--background-base);
    border-radius: 24px;
    position: relative;
    overflow: hidden;
    padding: var(--space-xl) var(--space-xl) var(--space-lg);
    box-sizing: border-box;
}

.welcome-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    max-width: 400px;
    text-align: center;
    flex: 1;
}

.welcome-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-lg);
}

.welcome-avatar {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    object-fit: cover;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
    border: 3px solid white;
}

.welcome-title {
    font-size: 1.75rem;
    font-weight: 700;
    color: #1f2937;
    margin: 0;
    line-height: 1.2;
    letter-spacing: -0.02em;
 
}

.welcome-subtitle {
    font-size: 0.9rem;
    color: var(--text-secondary);
    margin: 0;
    line-height: 1.6;
    max-width: 350px;
    font-weight: 400;
}

/* Welcome Input Section */
.welcome-input-section {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    background: var(--background-base);
    border-radius: 24px;
    position: relative;
}

.welcome-input-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-lg);
    max-width: 400px;
    margin: 0 auto;
    width: 100%;
    padding: 0;
}

.welcome-input-container .email-input {
    width: 100%;
    margin-bottom: var(--space-md);
}

.welcome-email-input {
    width: 100%;
    padding: 16px 20px;
    border: 2px solid var(--border-color);
    border-radius: 12px;
    font-size: 0.9rem;
    font-weight: 500;
    background: var(--background-base);
    color: var(--text-primary);
    transition: all 0.3s ease;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.welcome-email-input:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 4px rgba(201, 242, 78, 0.1), 0 8px 16px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
}

.welcome-email-input.invalid {
    border-color: var(--error-color);
    box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1);
}

.welcome-email-input.disabled {
    background-color: rgba(0, 0, 0, 0.05);
    cursor: not-allowed;
    opacity: 0.7;
}

.welcome-message-input {
    display: flex;
    gap: var(--space-md);
    width: 100%;
    align-items: center;
}

.welcome-message-field {
    flex: 1;
    padding: 16px 20px;
    border: 2px solid var(--border-color);
    border-radius: 12px;
    font-size: 0.9rem;
    font-weight: 500;
    background: var(--background-base);
    color: var(--text-primary);
    transition: all 0.3s ease;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.welcome-message-field:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 4px rgba(201, 242, 78, 0.1), 0 8px 16px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
}

.welcome-message-field::placeholder {
    color: var(--text-muted);
    font-weight: 400;
}

.welcome-send-button {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    min-width: 48px;
    height: 48px;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    color: white;
    transition: all 0.3s ease;
    box-shadow: 0 4px 14px rgba(201, 242, 78, 0.2);
}

.welcome-send-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(201, 242, 78, 0.3);
}

.welcome-send-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.powered-by-welcome {
    text-align: center;
    font-size: 0.75rem;
    color: var(--text-muted);
    padding: var(--space-md);
    background: transparent;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    margin-top: auto;
}

/* ===== AURORA style: dark ask-me-anything with glowing orb avatar =====
   Scoped to .welcome-message-section.aurora so legacy ASK_ANYTHING is untouched. */
.welcome-orb {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    flex-shrink: 0;
}
.welcome-message-section.aurora .welcome-avatar {
    width: 120px;
    height: 120px;
    border: none;
    box-shadow: 0 8px 40px rgba(157, 140, 255, 0.35);
}
.welcome-message-section.aurora .welcome-title {
    color: #ffffff;
}
.welcome-message-section.aurora .welcome-subtitle {
    color: rgba(255, 255, 255, 0.6);
}
.welcome-message-section.aurora .welcome-message-input {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 999px;
    padding: 6px 6px 6px 8px;
}
.welcome-message-section.aurora .welcome-message-field {
    background: transparent;
    border: none;
    box-shadow: none;
    color: #ffffff;
    border-radius: 999px;
}
.welcome-message-section.aurora .welcome-message-field:focus {
    border: none;
    box-shadow: none;
    transform: none;
}
.welcome-message-section.aurora .welcome-message-field::placeholder {
    color: rgba(255, 255, 255, 0.45);
}
.welcome-message-section.aurora .welcome-send-button.aurora-send {
    border-radius: 50%;
    min-width: 44px;
    width: 44px;
    height: 44px;
    padding: 0;
}
/* Orb avatar shown inside the conversation (bot message rows) */
.message-orb {
    border-radius: 50%;
}

/* ASK_ANYTHING Chat Panel Modifications */
.chat-panel.ask-anything-chat {
    background: var(--background-base);
    border-radius: 24px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}

/* ASK_ANYTHING: Complete chat messages container override */
.chat-container.ask-anything-style .chat-messages {
    flex: 1 !important;
    overflow-y: auto !important;
    padding: var(--space-lg) !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: flex-start !important;
    justify-content: flex-start !important;
    gap: var(--space-md) !important;
    max-width: 450px !important;
    margin: 0 auto !important;
    width: 100% !important;
    box-sizing: border-box !important;
}

/* ASK_ANYTHING: Reset all message base styles */
.chat-container.ask-anything-style .chat-messages .message {
    display: flex !important;
    gap: var(--space-sm) !important;
    max-width: 85% !important;
    align-items: flex-start !important;
    margin-bottom: var(--space-md) !important;
    margin-left: 0 !important;
    margin-right: 0 !important;
    width: auto !important;
    align-self: unset !important;
    justify-content: unset !important;
    text-align: unset !important;
}

/* ASK_ANYTHING: User messages - force right alignment */
.chat-container.ask-anything-style .chat-messages .message.user-message,
.chat-container.ask-anything-style .message.user-message {
    align-self: flex-end !important;
    margin-left: auto !important;
    margin-right: 0 !important;
    flex-direction: row-reverse !important;
    text-align: right !important;
    justify-content: flex-start !important;
    width: auto !important;
    max-width: 85% !important;
}

/* ASK_ANYTHING: Bot messages - force left alignment */
.chat-container.ask-anything-style .chat-messages .message.agent-message,
.chat-container.ask-anything-style .chat-messages .message.assistant-message,
.chat-container.ask-anything-style .message.agent-message,
.chat-container.ask-anything-style .message.assistant-message,
.chat-container.ask-anything-style .chat-messages .message.bot,
.chat-container.ask-anything-style .message.bot {
    align-self: flex-start !important;
    margin-left: 0 !important;
    margin-right: auto !important;
    flex-direction: row !important;
    text-align: left !important;
    justify-content: flex-start !important;
    width: auto !important;
    max-width: 85% !important;
}

/* ASK_ANYTHING Input Styling */
.chat-input.ask-anything-input {
    padding: var(--space-lg) !important;
    background: var(--background-base) !important;
    border-top: 1px solid var(--border-color) !important;
    border-radius: 0 0 24px 24px !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
}

.chat-input.ask-anything-input .message-input {
    max-width: 450px !important;
    margin: 0 auto !important;
    gap: var(--space-md) !important;
    display: flex !important;
    align-items: center !important;
    width: 100% !important;
}

.ask-anything-field {
    padding: 16px 20px !important;
    border: 2px solid var(--border-color) !important;
    border-radius: 12px !important;
    font-size: 0.9rem !important;
    font-weight: 500 !important;
    background: var(--background-base) !important;
    color: var(--text-primary) !important;
    transition: all 0.3s ease !important;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05) !important;
}

.ask-anything-field:focus {
    outline: none !important;
    border-color: var(--primary-color) !important;
    box-shadow: 0 0 0 4px rgba(201, 242, 78, 0.1), 0 8px 16px rgba(0, 0, 0, 0.1) !important;
    transform: translateY(-1px) !important;
}

.send-button.ask-anything-send {
    padding: 16px !important;
    min-width: 48px !important;
    height: 48px !important;
    border-radius: 12px !important;
    transition: all 0.3s ease !important;
    box-shadow: 0 4px 14px rgba(201, 242, 78, 0.2) !important;
}

.send-button.ask-anything-send:hover:not(:disabled) {
    transform: translateY(-2px) !important;
    box-shadow: 0 8px 25px rgba(201, 242, 78, 0.3) !important;
}

/* ASK_ANYTHING: Typing indicator alignment */
.chat-container.ask-anything-style .typing-indicator,
.chat-container.ask-anything-style .message.loading {
    align-self: flex-start !important;
    margin-left: 0 !important;
    margin-right: auto !important;
    justify-content: flex-start !important;
}

/* Chat Initiation Message Styles */
.chat-initiation-message {
    position: absolute;
    bottom: 215px;
    right: 20px;
    max-width: 240px;
    background: #FFFFFF;
    padding: 11px 32px 11px 14px;
    border-radius: 16px 16px 16px 4px;
    box-shadow: 0 14px 32px -12px rgba(0, 0, 0, 0.7);
    z-index: 9;
    cursor: pointer;
    opacity: 0;
    visibility: hidden;
    transform: translateY(10px) scale(0.95);
    transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
    font-family: var(--font-sans);
}

.chat-initiation-message.show {
    opacity: 1;
    visibility: visible;
    transform: translateY(0) scale(1);
    animation: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes bounce-in {
    0% {
        opacity: 0;
        transform: translateY(20px) scale(0.8);
    }
    50% {
        transform: translateY(-5px) scale(1.02);
    }
    100% {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

.chat-initiation-message:hover {
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.14);
}

.initiation-message-text {
    font-size: 13.5px;
    line-height: 1.4;
    color: #1A1A22;
    margin: 0;
    position: relative;
    z-index: 1;
    padding-right: 4px;
    min-height: 18px;
}

.initiation-message-text::after {
    content: '|';
    animation: blink 1s step-end infinite;
    margin-left: 2px;
    color: v-bind('customization.accent_color || "var(--accent-ink)"');
    font-weight: 500;
}

.initiation-message-text.typing-complete::after {
    display: none;
}

@keyframes blink {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0; }
}

.initiation-close {
    position: absolute;
    top: 7px;
    right: 9px;
    width: 14px;
    height: 14px;
    background: transparent;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    opacity: 0.8;
    transition: all 0.2s ease;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
}

.initiation-close:hover {
    opacity: 1;
    transform: scale(1.1);
}

.initiation-close::before,
.initiation-close::after {
    content: '';
    position: absolute;
    width: 9px;
    height: 1.5px;
    background: #9A9AA6;
    border-radius: 1px;
}

.initiation-close::before {
    transform: rotate(45deg);
}

.initiation-close::after {
    transform: rotate(-45deg);
}
</style>