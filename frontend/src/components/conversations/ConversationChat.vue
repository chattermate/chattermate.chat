<!--
ChatterMate - Conversation Chat
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
import { onMounted, watch, nextTick, ref, computed, onBeforeUnmount } from 'vue'
import type { ChatDetail } from '@/types/chat'
import { useConversationChat } from '@/composables/useConversationChat'
import { useConversationFiles } from '@/composables/useConversationFiles'
import { useJiraTicket } from '@/composables/useJiraTicket'
import JiraTicketModal from '@/components/jira/JiraTicketModal.vue'
import FileUpload from '@/components/common/FileUpload.vue'
import sendIcon from '@/assets/sendbutton.svg'
import { userService } from '@/services/user'
import { marked } from 'marked'
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
          :class="message.message_type === 'bot' || message.message_type === 'agent' || message.message_type === 'product' ? 'bot' : 'user'"
        >
          <div class="message-content">
            <div class="message-bubble">
              <!-- Product message -->
              <template v-if="message.message_type === 'product' && message.attributes?.shopify_output?.products?.length">
                <div class="products-carousel">
                  <div v-html="marked(message.message || '')" class="product-message-text"></div>
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
                <div v-html="marked(message.message || '')"></div>
                
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
          >
            <img :src="sendIcon" alt="Send" />
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
  background: var(--background-color);
  position: relative;
  overflow: hidden;
}

.chat-header {
  flex: 0 0 auto;
  padding: 16px 24px;
  border-bottom: 1px solid var(--border-color);
  background: var(--background-color);
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
  padding: 16px 24px;
  border-top: 1px solid var(--border-color);
  background: var(--background-color);
  width: 100%;
}

.user-info h2 {
  font-size: 16px;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.status {
  font-size: 12px;
  color: var(--text-muted);
}

.header-actions {
  display: flex;
  gap: 16px;
}

.action-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
}

.action-btn:hover {
  background: var(--background-mute);
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

.message.user {
  margin-left: auto;
  justify-content: flex-end;
}

.message.bot {
  margin-right: auto;
  justify-content: flex-start;
}

.message-bubble {
  background: var(--background-soft);
  padding: 12px 16px;
  border-radius: 16px;
  border-bottom-left-radius: 4px;
  color: var(--text-primary);
  position: relative;
  max-width: 100%;
  word-wrap: break-word;
}

.message.user .message-bubble {
  background: var(--primary-color);
  color: var(--background-color);
  border-radius: 16px;
  border-bottom-right-radius: 4px;
}

.agent-name {
  font-size: 12px;
  color: var(--text-muted);
  padding-left: 4px;
  margin-top: 2px;
}

.message-time {
  font-size: 11px;
  color: var(--text-color-light);
  margin-top: 4px;
  display: block;
  text-align: right;
}

.message.user .message-time {
  color: rgba(255, 255, 255, 0.7);
}

.message.bot .message-time {
  color: var(--text-muted);
}

.input-container {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  background: var(--background-soft);
  padding: 8px 16px;
  border-radius: 24px;
  border: 1px solid var(--border-color);
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
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  opacity: 0.7;
  transition: opacity 0.2s;
  display: flex;
  align-items: center;
}

.send-button:hover {
  opacity: 1;
}

.send-button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.send-button img {
  width: 24px;
  height: 24px;
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
  padding: 16px 24px;
  border-top: 1px solid var(--border-color);
  background: var(--background-color);
  width: 100%;
}

.chat-closed-message {
  text-align: center;
  color: var(--text-muted);
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.chat-closed-message i {
  font-size: 16px;
}





.create-ticket-btn {
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: 4px;
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
  background-color: white;
  border: 1px solid rgba(0, 0, 0, 0.08);
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
  background-color: white;
  color: var(--text-primary);
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

.message.user .attachment-link {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
  color: var(--background-color);
}

.message.user .attachment-link:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
}

.message.user .attachment-link i,
.message.user .attachment-size {
  color: rgba(255, 255, 255, 0.9);
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

.message.user .attachment-image {
  border-color: rgba(255, 255, 255, 0.3);
}

.message.user .attachment-image:hover {
  border-color: rgba(255, 255, 255, 0.6);
  box-shadow: 0 2px 8px rgba(255, 255, 255, 0.2);
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