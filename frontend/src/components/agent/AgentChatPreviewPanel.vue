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
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import type { AgentCustomization } from '@/types/agent'
import { getAvatarUrl } from '@/utils/avatars'
import { useAgentChat } from '@/composables/useAgentChat'
import WebFont from 'webfontloader'
import { marked } from 'marked'

const props = defineProps<{
    isActive: boolean
    customization: AgentCustomization & { showBubblePreview?: boolean }
    agentType: string
    agentName: string
    agentId: string
}>()
console.log(props.customization.font_family)
const isExpanded = ref(true)
const emailInput = ref('')
const hasStartedChat = ref(false)

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

// Handle message submit
const handleSubmit = () => {
    if (currentInput.value.trim()) {
        sendMessage(currentInput.value)
        hasStartedChat.value = true
    }
}

// Handle enter key
const handleKeyPress = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault()
        handleSubmit()
    }
}

// Lifecycle hooks
onMounted(() => {
    initChat()

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
    // Configure marked options


    return marked(content)
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
</script>

<template>
    <div class="chat-container" :class="{ collapsed: !isExpanded }">
        <!-- Chat Toggle Button -->
        <div class="toggle-container" v-if="!isExpanded || customization.showBubblePreview">
            <button class="chat-toggle" :class="{ preview: customization.showBubblePreview }" :style="chatIconStyles"
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

        <!-- Chat Panel -->
        <div class="chat-panel" :class="[
            { disabled: !isActive },
            `chat-panel-${agentId}`
        ]" :style="chatStyles" v-if="isExpanded && !customization.showBubblePreview">
            <div class="chat-header" :style="{
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

            <div class="chat-input" :style="agentBubbleStyles">
                <div class="email-input" v-if="!hasStartedChat">
                    <input 
                        v-model="emailInput"
                        type="email" 
                        placeholder="Enter your email address to begin" 
                        :disabled="!isActive || isLoading"
                        :class="{ 'invalid': emailInput.trim() && !isValidEmail(emailInput.trim()) }"
                    >
                </div>
                <div class="message-input">
                    <input 
                        v-model="currentInput" 
                        type="text" 
                        :placeholder="'Type a message...'"
                        @keypress="handleKeyPress"
                        :disabled="true"
                    >
                    <button 
                        class="send-button" 
                        :style="accentStyles" 
                        @click="handleSubmit"
                        :disabled="!currentInput.trim() || !isMessageInputEnabled"
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
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: transparent;
    border-radius: 24px;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
    margin-left: auto;
    position: relative;
    margin-top: 50px;
}

.chat-container.collapsed {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
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
</style>