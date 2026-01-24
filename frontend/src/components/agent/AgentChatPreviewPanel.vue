<!--
ChatterMate - Agent Chat Preview Panel
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
import { computed, onMounted, onUnmounted, ref, watch, nextTick } from 'vue'
import type { AgentCustomization } from '@/types/agent'
import { getAvatarUrl } from '@/utils/avatars'
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

// Handle chat style changes
const handleChatStyleChange = (oldStyle: string, newStyle: string) => {
    console.log('🔄 Processing chat style change:', { oldStyle, newStyle, currentMessages: messages.value.length })
    
    if (oldStyle === 'CHATBOT' && newStyle === 'ASK_ANYTHING') {
        // Store current messages and clear them
        if (messages.value.length > 0 && !hasStoredMessages.value) {
            console.log('💾 Storing messages for later restoration:', messages.value.length)
            originalMessages.value = [...messages.value]
            hasStoredMessages.value = true
        }
        console.log('🧹 Clearing messages for ASK_ANYTHING style')
        messages.value.splice(0) // Clear all messages more efficiently
        
    } else if (oldStyle === 'ASK_ANYTHING' && newStyle === 'CHATBOT') {
        // Restore original messages or initialize chat
        if (hasStoredMessages.value && originalMessages.value.length > 0) {
            console.log('📥 Restoring original messages:', originalMessages.value.length)
            messages.value.splice(0, messages.value.length, ...originalMessages.value)
        } else {
            console.log('🆕 No stored messages, initializing new chat')
            // Clear any existing messages first
            messages.value.splice(0)
            // Initialize chat if no stored messages
            initChat()
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

// Function to adjust color brightness
const adjustColorBrightness = (color: string, amount: number) => {
    const hex = color.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)

    // Darken or lighten based on background brightness
    const isBackgroundDark = isColorDark(color)
    const newR = isBackgroundDark ? Math.min(255, r + amount) : Math.max(0, r - amount)
    const newG = isBackgroundDark ? Math.min(255, g + amount) : Math.max(0, g - amount)
    const newB = isBackgroundDark ? Math.min(255, b + amount) : Math.max(0, b - amount)

    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`
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

const chatStyles = computed(() => ({
    backgroundColor: props.customization.chat_background_color,
    color: "#000000"
}))

const chatIconStyles = computed(() => ({
    backgroundColor: props.customization.chat_bubble_color,
    color: isColorDark(props.customization.chat_bubble_color ?? '#000000') ? '#FFFFFF' : '#000000'
}))

const agentBubbleStyles = computed(() => {
    const backgroundColor = props.customization.chat_background_color ?? '#F8F9FA'
    const adjustedBackground = adjustColorBrightness(backgroundColor, 20) // Adjust by 20 units
    return {
        backgroundColor: adjustedBackground,
        color: isColorDark(adjustedBackground) ? '#FFFFFF' : '#000000'
    }
})

const userBubbleStyles = computed(() => ({
    backgroundColor: props.customization.accent_color,
    color: isColorDark(props.customization.accent_color ?? '#000000') ? '#FFFFFF' : '#000000'
}))

const accentStyles = computed(() => ({
    backgroundColor: props.customization.accent_color
}))

const messageNameStyles = computed(() => ({
    color: isColorDark(props.customization.chat_background_color ?? '#F8F9FA') ? '#FFFFFF' : '#000000'
}))

const photoUrl = computed(() => {
    if (!props.customization.photo_url) {
        return getAvatarUrl(props.agentType.toLowerCase())
    }
    
    // Use signed URL if available (for S3)
    if (props.customization.photo_url_signed) {
        return props.customization.photo_url_signed
    }
    
    // If it's an S3 URL, use it directly
    if (props.customization.photo_url.includes('amazonaws.com')) {
        return props.customization.photo_url
    }
    
    // For local storage, prepend the API URL
    return import.meta.env.VITE_API_URL + props.customization.photo_url
})

// Add new computed property
const headerBorderStyles = computed(() => ({
    borderBottom: `1px solid ${isColorDark(props.customization.chat_background_color ?? '#F8F9FA') ?
        'rgba(255, 255, 255, 0.1)' :
        'rgba(0, 0, 0, 0.1)'}`
}))

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

// Add computed property for ASK_ANYTHING style detection
const isAskAnythingStyle = computed(() => {
    return props.customization.chat_style === 'ASK_ANYTHING'
})

// Computed property for container styles
const containerStyles = computed(() => {
    const baseStyles = {
        width: '400px',
        height: '600px',
        borderRadius: '24px'
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
    <div class="chat-container" :class="{ collapsed: !isExpanded, 'ask-anything-style': isAskAnythingStyle }" :style="containerStyles">
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
                <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M45 15H15C13.3431 15 12 16.3431 12 18V42C12 43.6569 13.3431 45 15 45H25L30 52L35 45H45C46.6569 45 48 43.6569 48 42V18C48 16.3431 46.6569 15 45 15Z"
                        fill="white" />
                    <path
                        d="M36 27C36 27 32.5 26 30 26C27.5 26 24 27 24 31C24 35 27.5 36 30 36C32.5 36 36 35 36 35V33C36 33 33 34 31.5 34C30 34 27 33 27 31C27 29 30 28 31.5 28C33 28 36 29 36 29V27Z"
                        :fill="customization.chat_bubble_color ? customization.chat_bubble_color : '#ffffff'" />
                </svg>
            </button>
        </div>

        <!-- Welcome Message for ASK_ANYTHING Style -->
        <div v-if="shouldShowWelcomeMessage && isExpanded && !customization.showBubblePreview && !customization.showInitiationPreview" class="welcome-message-section" :style="chatStyles">
            <div class="welcome-content">
                <div class="welcome-header">
                    <img 
                        v-if="photoUrl" 
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
                        :style="accentStyles" 
                        @click="() => {}"
                        :disabled="true"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 12L3 21L21 12L3 3L5 12ZM5 12L13 12" stroke="currentColor" stroke-width="2"
                                stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </button>
                </div>
            </div>
            
            <!-- Powered by footer for welcome message -->
            <div class="powered-by-welcome" :style="messageNameStyles">
                Powered by ChatterMate
            </div>
        </div>

        <!-- Chat Panel -->
        <div class="chat-panel" :class="[
            { disabled: !isActive, 'ask-anything-chat': isAskAnythingStyle },
            `chat-panel-${agentId}`
        ]" :style="chatStyles" v-if="isExpanded && !customization.showBubblePreview && !customization.showInitiationPreview && shouldShowChatPanel">
            <div v-if="!isAskAnythingStyle" class="chat-header" :style="{
                background: customization.chat_background_color,
                ...headerBorderStyles
            }">
                <div class="header-content">
                    <img :src="photoUrl" :alt="agentName" class="header-avatar">
                    <div class="header-info">
                        <h3 :style="messageNameStyles">{{ agentName }}</h3>
                        <div class="status">
                            <span class="status-indicator" :class="{ online: isActive }"></span>
                            <span class="status-text" :style="messageNameStyles">{{ isActive ? 'Online' : 'Offline'
                                }}</span>
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
                <div v-for="(message, index) in messages" :key="index" :class="['message', `${message.role}-message`]">
                    <img v-if="message.role === 'bot'" :src="photoUrl" :alt="agentName" class="message-avatar">
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
                <!-- Hide email input for ASK_ANYTHING style -->
                <div class="email-input" v-if="!hasStartedChat && !isAskAnythingStyle">
                    <input 
                        v-model="emailInput"
                        type="email" 
                        placeholder="Enter your email address to begin" 
                        :disabled="true"
                        :class="{ 'invalid': false }"
                    >
                </div>
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
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 12L3 21L21 12L3 3L5 12ZM5 12L13 12" stroke="currentColor" stroke-width="2"
                                stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </button>
                </div>
            </div>

            <!-- Add powered by footer -->
            <div class="powered-by" :style="messageNameStyles">
                Powered by ChatterMate
            </div>
        </div>


    </div>
</template>

<style scoped>
.chat-container {
    width: 400px;
    height: 600px;
    display: flex;
    flex-direction: column;
    background: transparent;
    border-radius: 24px;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
    margin-left: auto;
    position: relative;
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
    width: 48px;
    height: 48px;
    border-radius: 50%;
    border: none;
    color: white;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transition: all 0.3s ease;
}

.chat-toggle:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
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
    background: var(--background-base);
    display: flex;
    flex-direction: column;
    height: 600px;
    transition: all 0.3s ease;
    border-radius: 24px;
}

.chat-container.collapsed .chat-panel,
.chat-container.collapsed .welcome-message-section {
    display: none !important;
}

.chat-header {
    padding: var(--space-md);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.chat-header h3 {
    margin: 0;
    font-size: var(--text-lg);
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
    padding: 2px 14px;
    border-radius: 20px;
    line-height: 1.4;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    max-width: 85%;
}

.user-message {
    align-self: flex-end;
    flex-direction: row-reverse;
}

.user-message .message-bubble {
    border-bottom-right-radius: 4px;
}

.assistant-message .message-bubble {
    border-bottom-left-radius: 4px;
    background-color: #f5f5f5;
}

.chat-input {
    padding: var(--space-md);
    border-top: 1px solid var(--border-color);
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
}

.email-input {
    width: 85%;
}

.email-input input {
    width: 100%;
    padding: var(--space-sm) var(--space-md);
    border: 2px solid var(--border-color);
    border-radius: var(--radius-lg);
}

.message-input {
    display: flex;
    gap: var(--space-sm);
}

.message-input input {
    flex: 1;
    padding: var(--space-sm) var(--space-md);
    border: 2px solid var(--border-color);
    border-radius: var(--radius-lg);
}

.send-button {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-sm);
    min-width: 40px;
    height: 40px;
    border: none;
    border-radius: var(--radius-lg);
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
    gap: var(--space-sm);
}

.header-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: cover;
}

.header-info {
    display: flex;
    flex-direction: column;
}

.header-info h3 {
    margin: 0;
    font-size: var(--text-md);
}

.status {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    font-size: var(--text-sm);
}

.status-indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--error-color);
}

.status-indicator.online {
    background: var(--success-color);
}

.status-text {
    color: var(--text-muted);
}

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
    text-align: center;
    padding: var(--space-xs);
    font-size: 0.75rem;
    opacity: 0.7;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.message-input input:disabled {
    background-color: rgba(0, 0, 0, 0.05);
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
    box-shadow: 0 0 0 4px rgba(243, 70, 17, 0.1), 0 8px 16px rgba(0, 0, 0, 0.1);
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
    box-shadow: 0 0 0 4px rgba(243, 70, 17, 0.1), 0 8px 16px rgba(0, 0, 0, 0.1);
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
    box-shadow: 0 4px 14px rgba(243, 70, 17, 0.3);
}

.welcome-send-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(243, 70, 17, 0.4);
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
    opacity: 0.6;
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
.chat-container.ask-anything-style .chat-messages .message.bot-message,
.chat-container.ask-anything-style .chat-messages .message.assistant-message,
.chat-container.ask-anything-style .message.bot-message,
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
    box-shadow: 0 0 0 4px rgba(243, 70, 17, 0.1), 0 8px 16px rgba(0, 0, 0, 0.1) !important;
    transform: translateY(-1px) !important;
}

.send-button.ask-anything-send {
    padding: 16px !important;
    min-width: 48px !important;
    height: 48px !important;
    border-radius: 12px !important;
    transition: all 0.3s ease !important;
    box-shadow: 0 4px 14px rgba(243, 70, 17, 0.3) !important;
}

.send-button.ask-anything-send:hover:not(:disabled) {
    transform: translateY(-2px) !important;
    box-shadow: 0 8px 25px rgba(243, 70, 17, 0.4) !important;
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
    background: white;
    padding: 12px 36px 12px 14px;
    border-radius: 14px;
    box-shadow: 0 3px 16px rgba(0, 0, 0, 0.1);
    z-index: 9;
    cursor: pointer;
    opacity: 0;
    visibility: hidden;
    transform: translateY(10px) scale(0.95);
    transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
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

.chat-initiation-message::after {
    content: '';
    position: absolute;
    bottom: -7px;
    right: 30px;
    width: 14px;
    height: 14px;
    background: white;
    transform: rotate(45deg);
    box-shadow: 3px 3px 5px rgba(0, 0, 0, 0.06);
    clip-path: polygon(0 0, 100% 0, 100% 100%);
}

.initiation-message-text {
    font-size: 13px;
    line-height: 1.4;
    color: #374151;
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
    color: v-bind('customization.accent_color || "#f34611"');
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
    top: 10px;
    right: 10px;
    width: 20px;
    height: 20px;
    background: rgba(0, 0, 0, 0.04);
    border: none;
    border-radius: 5px;
    cursor: pointer;
    opacity: 0.5;
    transition: all 0.2s ease;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
}

.initiation-close:hover {
    opacity: 1;
    background: rgba(0, 0, 0, 0.08);
    transform: scale(1.05);
}

.initiation-close::before,
.initiation-close::after {
    content: '';
    position: absolute;
    width: 9px;
    height: 1.5px;
    background: #4a5568;
    border-radius: 1px;
}

.initiation-close::before {
    transform: rotate(45deg);
}

.initiation-close::after {
    transform: rotate(-45deg);
}
</style>