<!--
ChatterMate - Widget Builder
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
// @ts-nocheck
import { ref, onMounted, computed, onUnmounted, watch, nextTick } from 'vue'
import {
    isValidEmail} from '../types/widget'
import { marked } from 'marked'
import { widgetEnv } from './widget-env'
import { useWidgetStyles } from '../composables/useWidgetStyles'
import { useWidgetSocket } from '../composables/useWidgetSocket'
import { useWidgetCustomization } from '../composables/useWidgetCustomization'
import { formatDistanceToNow } from 'date-fns'
// Add marked configuration before the props definition
marked.setOptions({
    renderer: new marked.Renderer(),
    gfm: true,
    breaks: true
})

// Configure marked renderer to add target="_blank" to links
const renderer = new marked.Renderer();
const linkRenderer = renderer.link;
// @ts-ignore
renderer.link = (href, title, text) => {
    // @ts-ignore
    const html = linkRenderer.call(renderer, href, title, text);
    return html.replace(/^<a /, '<a target="_blank" rel="nofollow" ');
};

marked.use({ renderer })

const props = defineProps<{
    widgetId: string
}>()

// Get widget ID from props or initial data
const widgetId = computed(() => props.widgetId || window.__INITIAL_DATA__?.widgetId)

const {
    customization,
    agentName,
    applyCustomization,
    initializeFromData
} = useWidgetCustomization()

const {
    messages,
    loading,
    errorMessage,
    showError,
    loadingHistory,
    hasStartedChat,
    connectionStatus,
    sendMessage: socketSendMessage,
    loadChatHistory,
    connect,
    reconnect,
    cleanup,
    customer,
    onTakeover
} = useWidgetSocket()

const newMessage = ref('')
const isExpanded = ref(true)
const emailInput = ref('')
const hasConversationToken = ref(false)

// Add loading state
const isInitializing = ref(true)

// Add these to the script setup section after the imports
const TOKEN_KEY = 'ctid'
// @ts-ignore
const token = ref(window.__INITIAL_DATA__?.initialToken || localStorage.getItem(TOKEN_KEY))
const hasToken = computed(() => !!token.value)

// Initialize from initial data
initializeFromData()
const initialData = window.__INITIAL_DATA__

if (initialData?.initialToken) {
    token.value = initialData.initialToken
    // Notify parent window to store token
    window.parent.postMessage({ 
        type: 'TOKEN_UPDATE', 
        token: initialData.initialToken 
    }, '*')
    hasConversationToken.value = true
}

// Add after socket initialization
const messagesContainer = ref<HTMLElement | null>(null)

// Computed styles
const {
    chatStyles,
    chatIconStyles,
    agentBubbleStyles,
    userBubbleStyles,
    messageNameStyles,
    headerBorderStyles,
    photoUrl,
    shadowStyle
} = useWidgetStyles(customization)

// Update the computed property for message input enabled state
const isMessageInputEnabled = computed(() => {
    return (hasToken.value || isValidEmail(emailInput.value.trim())) && 
           connectionStatus.value === 'connected'
})

// Update the sendMessage function
const sendMessage = async () => {
    if (!newMessage.value.trim()) return

    // If first message, fetch customization with email first
    if (!hasStartedChat.value && emailInput.value) {
        await checkAuthorization()
    }

    await socketSendMessage(newMessage.value, emailInput.value)
    newMessage.value = ''
}

// Handle enter key
const handleKeyPress = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault()
        sendMessage()
    }
}

// Update the checkAuthorization function
const checkAuthorization = async () => {
    try {
        if (!widgetId.value) {
            console.error('Widget ID is not available')
            return false
        }

        const url = new URL(`${widgetEnv.API_URL}/widgets/${widgetId.value}`)
        if (emailInput.value.trim() && isValidEmail(emailInput.value.trim())) {
            url.searchParams.append('email', emailInput.value.trim())
        }

        const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }

        if (token.value) {
            headers['Authorization'] = `Bearer ${token.value}`
        }

        const response = await fetch(url, {
            headers
        })

        if (response.status === 401) {
            hasConversationToken.value = false
            return false
        }
        
        const data = await response.json()
        
        // Update token if new one is provided
        if (data.token) {
            token.value = data.token
            console.log('Token updated:', data.token)
            localStorage.setItem(TOKEN_KEY, data.token)
            // Notify parent window of token update
            window.parent.postMessage({ type: 'TOKEN_UPDATE', token: data.token }, '*')
        }

        hasConversationToken.value = true
        
        // Connect socket and verify connection success
        const connected = await connect()
        if (!connected) {
            console.error('Failed to connect to chat service')
            return false
        }

        await fetchChatHistory()
        
        if (data.agent?.customization) {
            customer.value = data.customer
            applyCustomization(data.agent.customization, data.agent.display_name, data.customer)
        }
        return true
    } catch (error) {
        console.error('Error checking authorization:', error)
        hasConversationToken.value = false
        return false
    } finally {
        isInitializing.value = false
    }
}

// Load history when chat starts
const fetchChatHistory = async () => {
    if (!hasStartedChat.value && hasConversationToken.value) {
        hasStartedChat.value = true
        await loadChatHistory()
    }
}

// Add this after messagesContainer ref definition
const scrollToBottom = () => {
    if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
}

// Add watch effect for messages
watch(() => messages.value, (newMessages) => {
    // Scroll to bottom when new messages arrive
    nextTick(() => {
        scrollToBottom()
    })
}, { deep: true })

// Add reconnect handler
const handleReconnect = async () => {
    const connected = await reconnect()
    if (connected) {
        await checkAuthorization()
    }
}

onMounted(async () => {
    const isAuthorized = await checkAuthorization()
    if (!isAuthorized) {
        connectionStatus.value = 'connected'
        return
    }

    // Register takeover callback
    onTakeover(async () => {
        await checkAuthorization()
    })

    // Listen for scroll message from parent
    window.addEventListener('message', (event) => {
        if (event.data.type === 'SCROLL_TO_BOTTOM') {
            scrollToBottom()
        }
        if (event.data.type === 'TOKEN_RECEIVED') {
            // Parent confirmed token storage
            localStorage.setItem(TOKEN_KEY, event.data.token)
        }
    })
})

onUnmounted(() => {
    window.removeEventListener('message', (event) => {
        if (event.data.type === 'SCROLL_TO_BOTTOM') {
            scrollToBottom()
        }
    })
    cleanup()
})
</script>

<template>
    <div class="chat-container" :class="{ collapsed: !isExpanded }" :style="shadowStyle">
        <!-- Loading State -->
        <div v-if="isInitializing" class="initializing-overlay">
            <div class="loading-spinner">
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
            </div>
            <div class="loading-text">Initializing chat...</div>
        </div>

        <!-- Connection Status -->
        <div v-if="!isInitializing && connectionStatus !== 'connected'" class="connection-status" :class="connectionStatus">
            <div v-if="connectionStatus === 'connecting'" class="connecting-message">
                Connecting to chat service...
                <div class="loading-dots">
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                </div>
            </div>
            <div v-else-if="connectionStatus === 'failed'" class="failed-message">
                Connection failed. 
                <button @click="handleReconnect" class="reconnect-button">
                    Click here to reconnect
                </button>
            </div>
        </div>

        <!-- Error Alert -->
        <div v-if="showError" class="error-alert" :style="chatIconStyles">
            {{ errorMessage }}
        </div>

        <!-- Chat Panel -->
        <div class="chat-panel" :style="chatStyles" v-if="isExpanded">
            <div class="chat-header" :style="headerBorderStyles">
                <div class="header-content">
                    <img 
                        v-if="customer.agent_profile_pic || photoUrl" 
                        :src="customer.agent_profile_pic || photoUrl" 
                        :alt="customer.agent_name || agentName" 
                        class="header-avatar"
                    >
                    <div class="header-info">
                        <h3 :style="messageNameStyles">{{ customer.agent_name || agentName }}</h3>
                        <div class="status">
                            <span class="status-indicator online"></span>
                            <span class="status-text" :style="messageNameStyles">Online</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Loading indicator for history -->
            <div v-if="loadingHistory" class="loading-history">
                <div class="loading-spinner">
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                </div>
            </div>

            <div class="chat-messages" ref="messagesContainer">
                <template v-for="(message, index) in messages" :key="index">
                    <div 
                        :class="[
                            'message',
                            message.message_type === 'bot' ? 'agent-message' : 
                            message.message_type === 'agent' ? 'agent-message' : 
                            message.message_type === 'system' ? 'system-message' :
                            'user-message'
                        ]"
                    >
                        <div class="message-bubble" 
                            :style="message.message_type === 'system' ? {} : 
                                   message.message_type === 'user' ? userBubbleStyles : 
                                   agentBubbleStyles"
                        >
                            <div v-html="marked(message.message, { renderer })"></div>
                        </div>
                        <div class="message-info">
                            <span v-if="message.message_type === 'user'" class="agent-name">
                                You
                            </span>
                        </div>
                    </div>
                </template>

                <!-- Typing indicator -->
                <div v-if="loading" class="typing-indicator">
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                </div>
            </div>

            <div class="chat-input" :style="agentBubbleStyles">
                <div class="email-input" v-if="!hasStartedChat && !hasConversationToken">
                    <input 
                        v-model="emailInput"
                        type="email" 
                        placeholder="Enter your email address to begin" 
                        :disabled="loading || connectionStatus !== 'connected'"
                        :class="{ 
                            'invalid': emailInput.trim() && !isValidEmail(emailInput.trim()),
                            'disabled': connectionStatus !== 'connected'
                        }"
                    >
                </div>
                <div class="message-input">
                    <input 
                        v-model="newMessage" 
                        type="text" 
                        :placeholder="connectionStatus === 'connected' ? 'Type a message...' : 'Connecting...'" 
                        @keypress="handleKeyPress"
                        :disabled="!isMessageInputEnabled"
                        :class="{ 'disabled': connectionStatus !== 'connected' }"
                    >
                    <button 
                        class="send-button" 
                        :style="userBubbleStyles" 
                        @click="sendMessage"
                        :disabled="!newMessage.trim() || !isMessageInputEnabled"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 12L3 21L21 12L3 3L5 12ZM5 12L13 12" stroke="currentColor" stroke-width="2"
                                stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </button>
                </div>
            </div>

            <!-- Powered by footer -->
            <div class="powered-by" :style="messageNameStyles">
                Powered by ChatterMate
            </div>
        </div>
    </div>
</template>

<style scoped>
.chat-container {
    width: 100%;
    height: 580px;
    display: flex;
    flex-direction: column;
    background: transparent;
    overflow: hidden;
    position: relative;
    border-radius: var(--radius-lg);
}

.chat-container.collapsed {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.chat-panel {
    background: var(--background-base);
    display: flex;
    flex-direction: column;
    height: 100%;
    transition: all 0.3s ease;
    border-radius: 0;
}

.chat-header {
    padding: var(--space-md);
    display: flex;
    justify-content: flex-start;
    align-items: center;
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

.chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: var(--space-md);
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    -webkit-overflow-scrolling: touch;
    scroll-behavior: smooth;
    margin-top: var(--space-sm);
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
    /* Light gray background for assistant messages */
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

.email-input input.invalid {
    border-color: var(--error-color);
}

.email-input input.invalid:focus {
    outline-color: var(--error-color);
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

.message-input input:disabled {
    background-color: rgba(0, 0, 0, 0.05);
    cursor: not-allowed;
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

.send-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

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

.powered-by {
    text-align: center;
    padding: var(--space-xs);
    font-size: 0.75rem;
    opacity: 0.7;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
    margin-top: auto;
}

.error-alert {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    padding: 12px;
    text-align: center;
    color: white;
    z-index: 100;
    animation: slideDown 0.3s ease-out;
    border-radius: 24px 24px 0 0;
}

@keyframes slideDown {
    from {
        transform: translateY(-100%);
    }
    to {
        transform: translateY(0);
    }
}

.chat-container.collapsed .error-alert {
    display: none;
}

@media (max-width: 768px) {

    .chat-container,
    .chat-container.collapsed {
        width: 100%;
        height: 580px;
        border-radius: var(--radius-lg);
    }

    .chat-panel {
        height: 100%;
        border-radius: 0;
    }

    .chat-messages {
        padding: var(--space-sm);
    }

    .chat-toggle {
        width: 48px;
        height: 48px;
        font-size: 14px;
    }
}

.loading-history {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: var(--space-sm);
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    background: rgba(255, 255, 255, 0.9);
    z-index: 10;
}

.loading-spinner {
    display: flex;
    gap: 4px;
}

.message-time {
    font-size: 0.75rem;
    opacity: 0.7;
    margin-top: 4px;
    text-align: right;
}

.typing-indicator {
    display: flex;
    gap: 4px;
    padding: 12px 16px;
    margin-top: var(--space-md);
}

.connection-status {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    padding: 12px;
    text-align: center;
    z-index: 100;
    background: rgba(255, 255, 255, 0.95);
    border-bottom: 1px solid var(--border-color);
}

.connecting-message {
    color: var(--text-color);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
}

.failed-message {
    color: var(--error-color);
}

.reconnect-button {
    background: none;
    border: none;
    color: var(--primary-color);
    text-decoration: underline;
    cursor: pointer;
    padding: 4px 8px;
    margin-left: 8px;
}

.reconnect-button:hover {
    color: var(--primary-dark);
}

.loading-dots {
    display: flex;
    gap: 4px;
    margin-left: 4px;
}

.loading-dots .dot {
    width: 6px;
    height: 6px;
    background: currentColor;
    border-radius: 50%;
    animation: bounce 1.4s infinite ease-in-out;
}

.loading-dots .dot:nth-child(1) { animation-delay: -0.32s; }
.loading-dots .dot:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
    0%, 80%, 100% { transform: scale(0); }
    40% { transform: scale(1); }
}

.message-input input.disabled,
.email-input input.disabled {
    background-color: rgba(0, 0, 0, 0.05) !important;
    cursor: not-allowed;
    color: var(--text-muted);
}

.message-input input.disabled::placeholder,
.email-input input.disabled::placeholder {
    color: var(--text-muted);
}

/* Add styles for agent messages */
.message.agent-message {
    margin-right: auto;
    justify-content: flex-start;
}

.agent-name {
    font-size: 12px;
    color: #9ca3af;
    margin-top: 4px;
    margin-left: 8px;
}

.message-info {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
    margin-top: 4px;
}

/* Add system message styles */
.message.system-message {
    align-self: center;
    max-width: 100%;
    margin: var(--space-sm) 0;
}

.system-message .message-bubble {
    background: rgba(0, 0, 0, 0.05);
    color: var(--text-muted);
    font-size: 0.85em;
    padding: var(--space-xs) var(--space-md);
    border-radius: var(--radius-lg);
    text-align: center;
}

.initializing-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.95);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    border-radius: var(--radius-lg);
}

.loading-text {
    margin-top: var(--space-md);
    color: var(--text-color);
    font-size: var(--text-md);
}

.loading-spinner {
    display: flex;
    gap: 6px;
}

.loading-spinner .dot {
    width: 10px;
    height: 10px;
    background: var(--primary-color);
    border-radius: 50%;
    animation: bounce 1.4s infinite ease-in-out;
}

.loading-spinner .dot:nth-child(1) { animation-delay: -0.32s; }
.loading-spinner .dot:nth-child(2) { animation-delay: -0.16s; }
</style>