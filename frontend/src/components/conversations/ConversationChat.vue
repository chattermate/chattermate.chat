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
import { onMounted, watch, nextTick, ref, computed, onBeforeUnmount } from 'vue'
import type { ChatDetail } from '@/types/chat'
import { useConversationChat } from '@/composables/useConversationChat'
import { useConversationFiles } from '@/composables/useConversationFiles'
import { useJiraTicket } from '@/composables/useJiraTicket'
import JiraTicketModal from '@/components/jira/JiraTicketModal.vue'
import FileUpload from '@/components/common/FileUpload.vue'
import { userService } from '@/services/user'
import ChannelBadge from '@/components/common/ChannelBadge.vue'
import { marked } from 'marked'
import { sanitizeHtml } from '@/utils/sanitize'
import type { Renderer } from 'marked'

const props = defineProps<{
  chat: ChatDetail
}>()

const emit = defineEmits<{
  (e: 'refresh'): void
  (e: 'chatUpdated', data: ChatDetail): void
  (e: 'clearUnread', sessionId: string): void
  (e: 'view-product', productId: string): void
}>()

// Create a local ref to track the current chat state
const currentChat = ref(props.chat)

const {
  newMessage,
  messagesContainer,
  formattedMessages,
  isLoading,
  showTakeoverButton,
  showTakenOverStatus,
  isChatClosed,
  canSendMessage,
  scrollToBottom,
  sendMessage,
  handleTakeover,
  updateChat,
  replaceChatFromProps,
  handledByAI,
  endChat
} = useConversationChat(props.chat, emit)

// Add file handling functionality
const {
  fileUploadRef,
  uploadedFiles,
  handleFilesUploaded,
  handleFileUploadError,
  handleChatPaste,
  handleSendMessageWithAttachments,
  formatFileSize,
  isImageAttachment,
  getDownloadUrl,
  getImageUrl
} = useConversationFiles(currentChat, newMessage, canSendMessage, scrollToBottom)

// Add Jira ticket functionality
const {
  jiraConnected,
  checkJiraStatus
} = useJiraTicket()

// State for Jira ticket modal
const showJiraTicketModal = ref(false)
const ticketSummary = ref('')


// Add marked configuration
marked.setOptions({
  renderer: new marked.Renderer(),
  gfm: true,
  breaks: true
})

// Configure marked renderer to add target="_blank" to links
const renderer = new marked.Renderer() as Renderer
renderer.link = function({ href, title, text }) {
  if (!href) return text || ''
  const link = `<a href="${href}"${title ? ` title="${title}"` : ''}>${text}</a>`
  return link.replace(/^<a /, '<a target="_blank" rel="nofollow" ')
}
marked.use({ renderer })

// Create helper function to render and sanitize markdown
const renderMarkdown = (text: string) => {
  return sanitizeHtml(marked.parse(text, { async: false }) as string)
}





// Computed property to determine if the current user can create a ticket
const canCreateTicket = computed(() => {
  // Can only create ticket if:
  // 1. User can send messages (already handled by canSendMessage)
  // 2. Chat is not closed
  // 3. Current user is the one who took over the chat
  return canSendMessage.value && 
         !isChatClosed.value && 
         currentChat.value.user_id === userService.getUserId();
})



// Function to handle create ticket
const handleCreateTicket = async () => {
  // Get a summary from the last few messages
  const lastMessages = formattedMessages.value.slice(-3)
  const summary = lastMessages.map(m => m.message).join(' ').substring(0, 100) + '...'
  
  ticketSummary.value = summary
  showJiraTicketModal.value = true
}

// Function to handle ticket created
const handleTicketCreated = (ticketKey: string) => {
  // Add ticket key to message input
  newMessage.value = `Jira ticket created: ${ticketKey}`
  // Close the modal
  showJiraTicketModal.value = false
}



// Watch for chat changes and update the internal state
watch(() => props.chat, (newChat) => {
  if (newChat) {
    // Only sync local state to avoid emitting events back to parent
    currentChat.value = newChat
    replaceChatFromProps(newChat)
  }
}, { immediate: true })

// Check Jira status on mount
onMounted(async () => {
  scrollToBottom()
  await checkJiraStatus()
})
</script>

<template>
  <div class="chat-layout">
    <header class="chat-header">
      <div class="user-info">
        <h2>{{ chat.customer.full_name || chat.customer.email }}</h2>
        <ChannelBadge :channel="chat.channel" />
        <div v-if="handledByAI" class="chat-closed-status">
          <i class="fas fa-lock"></i>
          Handled by AI
        </div>
        <div v-if="showTakenOverStatus" class="taken-over-status">
          <i class="fas fa-user-clock"></i>
          Taken over by {{ chat.user_name || 'another agent' }}
        </div>
        <div v-if="isChatClosed" class="chat-closed-status">
          <i class="fas fa-lock"></i>
          Chat closed
        </div>
      </div>
      <div class="header-actions">
        <!-- Add Create Ticket button -->
        <button 
          v-if="canCreateTicket && jiraConnected" 
          class="create-ticket-btn"
          @click="handleCreateTicket"
        >
          <i class="fas fa-ticket-alt"></i>
          Create Ticket
        </button>
      </div>
    </header>

    <main class="chat-content">
      <div class="messages" ref="messagesContainer">
        <div 
          v-for="(message, idx) in formattedMessages" 
          :key="idx"
          class="message"
          :class="message.message_type === 'agent' ? 'agent' : ((message.message_type === 'bot' || message.message_type === 'product') ? 'bot' : 'user')"
        >
          <div class="message-content">
            <div class="message-bubble">
              <!-- Product message -->
              <template v-if="message.message_type === 'product' && message.attributes?.shopify_output?.products?.length">
                <div class="products-carousel">
                  <div v-html="renderMarkdown(message.message || '')" class="product-message-text"></div>
                  <div class="carousel-items">
                    <div 
                      v-for="product in message.attributes.shopify_output.products" 
                      :key="product.id" 
                      class="product-card-compact"
                    >
                      <div class="product-image-compact" v-if="product.image?.src">
                        <img :src="product.image.src" :alt="product.title || ''" class="product-thumbnail">
                      </div>
                      <div class="product-info-compact">
                        <div class="product-text-area">
                          <div class="product-title-compact">{{ product.title }}</div>
                          <div class="product-variant-compact" v-if="product.variant_title">{{ product.variant_title }}</div>
                          <div class="product-price-compact">{{ product.price }}</div>
                        </div>
                        <div class="product-actions-compact">
                          <button 
                            class="view-details-button-compact"
                            @click="$emit('view-product', String(product?.id || 'unknown'))"
                          >
                            View product <span class="external-link-icon">↗</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
              <!-- Regular message with markdown -->
              <template v-else>
                <div v-html="renderMarkdown(message.message || '')"></div>
                
                <!-- Display attachments if present -->
                <div v-if="message.attachments && message.attachments.length > 0" class="message-attachments">
                  <div 
                    v-for="attachment in message.attachments" 
                    :key="attachment.id"
                    class="attachment-item"
                  >
                    <!-- Image attachment - render as image -->
                    <template v-if="isImageAttachment(attachment.content_type)">
                      <div class="attachment-image-container">
                        <img 
                          :src="getImageUrl(attachment.file_url)" 
                          :alt="attachment.filename"
                          class="attachment-image"
                        />
                        <div class="attachment-image-info">
                          <a 
                            :href="getDownloadUrl(attachment.file_url)" 
                            target="_blank"
                            class="attachment-link"
                          >
                            <i class="fas fa-download"></i>
                            {{ attachment.filename }}
                            <span class="attachment-size">({{ formatFileSize(attachment.file_size) }})</span>
                          </a>
                        </div>
                      </div>
                    </template>
                    <!-- Other file types - render as download link -->
                    <template v-else>
                      <a 
                        :href="getDownloadUrl(attachment.file_url)" 
                        target="_blank"
                        class="attachment-link"
                      >
                        <i class="fas fa-paperclip"></i>
                        {{ attachment.filename }}
                        <span class="attachment-size">({{ formatFileSize(attachment.file_size) }})</span>
                      </a>
                    </template>
                  </div>
                </div>
              </template>
              <span class="message-time">{{ message.timeAgo }}</span>
              <span v-if="message.attributes?.delivery_status" class="delivery-failed">
                <i class="fas fa-circle-exclamation"></i> Not delivered
              </span>
            </div>
            <span v-if="message.message_type === 'bot' || message.message_type === 'agent'" class="agent-name">
              {{ message.message_type === 'bot' ? (message.agent_name || chat.agent.name || 'AI Agent') : (message.user_name || 'Agent') }}
            </span>
          </div>
        </div>
      </div>
    </main>



    <!-- Jira Ticket Modal -->
    <JiraTicketModal
      v-if="showJiraTicketModal"
      :chat-id="currentChat.session_id"
      :initial-summary="ticketSummary"
      @close="showJiraTicketModal = false"
      @ticket-created="handleTicketCreated"
    />

    <footer class="chat-input" v-if="!isChatClosed && !handledByAI">
      <div class="input-container" :class="{ disabled: !canSendMessage }" @paste="handleChatPaste">
        <FileUpload
          ref="fileUploadRef"
          :max-files="3"
          @filesUploaded="handleFilesUploaded"
          @error="handleFileUploadError"
        />
        <div class="message-input-wrapper">
          <input 
            v-model="newMessage"
            type="text" 
            placeholder="Type a message or paste a screenshot" 
            class="message-input"
            @keyup.enter="handleSendMessageWithAttachments"
            :disabled="!canSendMessage"
          >
          <button
            class="send-button"
            @click="handleSendMessageWithAttachments"
            :disabled="(!newMessage.trim() && uploadedFiles.length === 0) || !canSendMessage"
            aria-label="Send"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 11 13"></path><path d="M22 2l-7 20-4-9-9-4 20-7z"></path></svg>
          </button>
        </div>
      </div>
      <div v-if="!canSendMessage" class="input-message">
        {{ handledByAI ? 'This chat is being handled by AI' : 
           isChatClosed  ? 'This chat has been closed' : 
           'Chat is being handled by ' + chat.user_name }}
      </div>
    </footer>

    <footer v-else-if="handledByAI" class="chat-closed-footer">
      <div class="chat-closed-message">
        <i class="fas fa-lock"></i>
        This chat is being handled by AI
      </div>
    </footer>
    <footer v-else class="chat-closed-footer">
      <div class="chat-closed-message">
        <i class="fas fa-lock"></i>
        This chat has been closed
      </div>
    </footer>
  </div>
</template>

<style scoped>
.chat-layout {
  display: flex;
  flex-direction: column;
  height: 70vh;
  width: 100%;
  background: var(--bg);
  position: relative;
  overflow: hidden;
}

.chat-header {
  flex: 0 0 auto;
  padding: 14px 20px;
  border-bottom: 1px solid var(--o08);
  background: var(--bg2);
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.chat-content {
  flex: 1 1 auto;
  min-height: 0;
  position: relative;
  width: 100%;
  overflow: hidden;
}

.messages {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  scroll-behavior: smooth;
}

.chat-input {
  flex: 0 0 auto;
  padding: 14px 20px;
  border-top: 1px solid var(--o08);
  background: var(--bg2);
  width: 100%;
}

.user-info h2 {
  font-size: 15px;
  font-family: var(--font-display);
  font-weight: 600;
  color: var(--text);
  margin-bottom: 3px;
}

.status {
  font-size: 12px;
  color: var(--muted);
}

.header-actions {
  display: flex;
  gap: 16px;
}

.action-btn {
  background: none;
  border: none;
  color: var(--muted);
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
}

.action-btn:hover {
  background: var(--o08);
  color: var(--text);
}

.message {
  max-width: 70%;
  display: flex;
  margin-bottom: 12px;
}

.message-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-width: 100%;
}

/* Customer (incoming) — left */
.message.user {
  margin-right: auto;
  justify-content: flex-start;
}

/* AI + human agent (outbound) — right */
.message.bot,
.message.agent {
  margin-left: auto;
  justify-content: flex-end;
}

.message-bubble {
  padding: 11px 15px;
  position: relative;
  max-width: 100%;
  word-wrap: break-word;
  font-size: 14px;
  line-height: 1.55;
}

/* Customer bubble — neutral, sharp top-left */
.message.user .message-bubble {
  background: var(--bubble-customer-bg);
  color: var(--bubble-customer-fg);
  border-radius: 4px 15px 15px 15px;
}

/* AI bubble — teal tint, sharp top-right */
.message.bot .message-bubble {
  background: var(--bubble-ai-bg);
  border: 1px solid var(--bubble-ai-border);
  color: var(--bubble-ai-fg);
  border-radius: 15px 15px 4px 15px;
}

/* Human agent bubble — lime, sharp top-right */
.message.agent .message-bubble {
  background: var(--bubble-agent-bg);
  color: var(--bubble-agent-fg);
  border-radius: 15px 15px 4px 15px;
}

.agent-name {
  font-size: 12px;
  color: var(--text-muted);
  padding-left: 4px;
  margin-top: 2px;
}

.message-time {
  font-size: 11px;
  color: var(--muted);
  margin-top: 4px;
  display: block;
  text-align: right;
}

.message.user .message-time,
.message.bot .message-time {
  color: var(--muted);
}

.message.agent .message-time {
  color: color-mix(in srgb, var(--on-accent) 55%, transparent);
}

.delivery-failed {
  font-size: 11px;
  color: var(--c-danger);
  margin-top: 2px;
  display: block;
  text-align: right;
}

/* The agent bubble is accent-filled: lift --c-danger toward the bubble's own
   foreground for contrast while keeping it readably red, not just a timestamp */
.message.agent .delivery-failed {
  color: color-mix(in srgb, var(--c-danger) 65%, var(--on-accent));
}

.input-container {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  background: var(--surface);
  padding: 8px 16px;
  border-radius: 14px;
  border: 1px solid var(--o10);
}

.input-container.disabled {
  opacity: 0.7;
  background: var(--background-mute);
}

.message-input-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.message-input {
  flex: 1;
  background: none;
  border: none;
  color: var(--text-primary);
  font-size: 14px;
  padding: 8px 0;
  outline: none;
}

.message-input::placeholder {
  color: var(--text-placeholder);
}

.emoji-btn,
.attach-btn,
.send-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  font-size: 18px;
}

.send-button {
  flex-shrink: 0;
  width: 38px;
  height: 38px;
  padding: 0;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-input);
  background: var(--accent-solid);
  color: var(--on-accent-solid);
  transition: filter 0.2s, opacity 0.2s;
}

.send-button:hover:not(:disabled) {
  filter: brightness(1.05);
}

.send-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.send-button svg {
  display: block;
}



.taken-over-status {
  font-size: 12px;
  color: var(--primary-color);
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
}

.taken-over-status i {
  font-size: 14px;
}

.input-message {
  text-align: center;
  color: var(--text-muted);
  font-size: 12px;
  margin-top: 8px;
}

.message-input:disabled {
  cursor: not-allowed;
}

.chat-closed-status {
  font-size: 12px;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
}

.chat-closed-status i {
  font-size: 14px;
}

.chat-closed-footer {
  flex: 0 0 auto;
  padding: 14px 20px;
  border-top: 1px solid var(--o08);
  background: var(--bg2);
  width: 100%;
}

.chat-closed-message {
  text-align: center;
  color: var(--muted);
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.chat-closed-message i {
  font-size: 16px;
}





.create-ticket-btn {
  background: var(--accent-solid);
  color: var(--on-accent-solid);
  border: none;
  border-radius: var(--radius-sm);
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.2s;
  margin-right: 16px;
}

.create-ticket-btn:hover {
  transform: translateY(-1px);
  filter: brightness(1.1);
}

/* Add product carousel styles */
.products-carousel {
  margin: var(--space-xs) 0;
  width: 100%;
  padding: var(--space-xs);
  background: rgba(0, 0, 0, 0.02);
  border-radius: 20px;
}

.product-message-text {
  margin-bottom: var(--space-sm);
}

.carousel-items {
  display: flex;
  flex-direction: row;
  gap: var(--space-sm);
  margin-top: var(--space-xs);
  overflow-x: auto;
  padding: var(--space-xs);
  padding-bottom: var(--space-md);
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.3) rgba(0, 0, 0, 0.1);
}

.product-card-compact {
  background-color: var(--surface);
  border: 1px solid var(--o10);
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06),
              0 1px 2px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  width: 180px;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.product-card-compact:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08),
              0 2px 4px rgba(0, 0, 0, 0.06);
}

.product-image-compact {
  width: 100%;
  aspect-ratio: 1;
  overflow: hidden;
}

.product-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.2s;
}

.product-thumbnail:hover {
  transform: scale(1.05);
}

.product-info-compact {
  padding: var(--space-sm);
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.product-title-compact {
  font-size: var(--text-sm);
  font-weight: 500;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  min-height: 2.8em;
  color: black;
}

.product-variant-compact {
  font-size: var(--text-xs);
  color: var(--text-muted);
}

.product-price-compact {
  font-size: var(--text-sm);
  font-weight: 600;
  color: black;
}

.view-details-button-compact {
  width: 100%;
  padding: 8px 12px;
  background-color: var(--bg2);
  color: var(--text);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  font-size: var(--text-xs);
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  gap: 4px;
}

.view-details-button-compact:hover {
  background-color: var(--background-soft);
  border-color: var(--border-color-hover);
}

.external-link-icon {
  font-size: 1em;
  line-height: 1;
}

/* Add styles for markdown content */
.message-bubble :deep(img) {
  max-width: 100%;
  border-radius: 8px;
  margin: 8px 0;
}

.message-bubble :deep(p) {
  margin: 0;
}

.message-bubble :deep(a) {
  color: var(--primary-color);
  text-decoration: none;
}

.message-bubble :deep(a:hover) {
  text-decoration: underline;
}

/* Attachment styles */
.message-attachments {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.attachment-item {
  display: flex;
  align-items: center;
}

.attachment-link {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: var(--background-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  text-decoration: none;
  font-size: 13px;
  transition: all 0.2s;
  max-width: 100%;
  overflow: hidden;
}

.attachment-link:hover {
  background: var(--background-mute);
  border-color: var(--primary-color);
}

.attachment-link i {
  font-size: 14px;
  color: var(--text-muted);
}

.attachment-size {
  color: var(--text-muted);
  font-size: 11px;
  margin-left: 4px;
}

.message.agent .attachment-link {
  background: color-mix(in srgb, var(--on-accent) 12%, transparent);
  border-color: color-mix(in srgb, var(--on-accent) 22%, transparent);
  color: var(--on-accent);
}

.message.agent .attachment-link:hover {
  background: color-mix(in srgb, var(--on-accent) 18%, transparent);
  border-color: color-mix(in srgb, var(--on-accent) 32%, transparent);
}

.message.agent .attachment-link i,
.message.agent .attachment-size {
  color: var(--on-accent);
}

/* Image attachment styles */
.attachment-image-container {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-width: 350px;
}

.attachment-image {
  width: 100%;
  max-height: 400px;
  border-radius: 8px;
  object-fit: contain;
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: all 0.2s;
}

.attachment-image:hover {
  border-color: var(--primary-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.message.agent .attachment-image {
  border-color: color-mix(in srgb, var(--on-accent) 22%, transparent);
}

.message.agent .attachment-image:hover {
  border-color: color-mix(in srgb, var(--on-accent) 40%, transparent);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.attachment-image-info {
  display: flex;
  align-items: center;
  font-size: 12px;
}

.attachment-image-info .attachment-link {
  margin: 0;
  padding: 4px 8px;
  font-size: 12px;
}
</style> 