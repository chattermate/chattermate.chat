<template>
  <div class="inbox-wrapper">
    <!-- Header with filters -->
    <div class="inbox-header">
      <div class="header-content">
        <div class="header-left">
          <h2 class="conversations-title">Conversations</h2>
          <p class="conversations-count">
            {{ conversations.length }} {{ localStatus }} conversation{{ conversations.length !== 1 ? 's' : '' }}
          </p>
        </div>
        <!-- Filter controls matching ConversationsList design -->
        <div class="filter-controls">
          <button 
            class="filter-btn" 
            :class="{ active: localStatus === 'open' }"
            @click="handleStatusChange('open')"
          >
            Open
          </button>
          <button 
            class="filter-btn" 
            :class="{ active: localStatus === 'closed' }"
            @click="handleStatusChange('closed')"
          >
            Closed
          </button>
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <s-text v-if="loading" alignment="center" tone="subdued" class="state-message">
      Loading conversations...
    </s-text>

    <!-- Empty state -->
    <div v-else-if="conversations.length === 0" class="empty-state-container">
      <s-empty-state heading="No conversations">
        <s-text>No {{ localStatus }} conversations yet.</s-text>
      </s-empty-state>
    </div>

    <!-- Conversations grid -->
    <div v-else class="conversations-grid">
      <!-- Conversations List -->
      <div class="conversations-list">
        <div
          v-for="conv in conversations"
          :key="conv.session_id"
          class="conversation-item"
          :class="{ active: selectedId === conv.session_id }"
          @click="emit('select-conversation', conv.session_id)"
        >
          <div class="conv-header">
            <div class="conv-title">{{ conv.customer.full_name || conv.customer.email }}</div>
            <div class="conv-time">{{ formatTimeAgo(conv.updated_at) }}</div>
          </div>
          
          <div class="conv-preview">
            <span class="conv-agent">{{ conv.agent.name }}:</span>
            <span class="conv-message">{{ conv.last_message }}</span>
          </div>
          
          <div class="conv-footer">
            <span class="conv-count">{{ conv.message_count }} messages</span>
            <div class="conversation-status" :class="conv.status">
              {{ conv.status }}
            </div>
          </div>
        </div>
      </div>

      <!-- Conversation Detail -->
      <div class="conversation-detail">
        <template v-if="selectedConversation">
          <!-- Chat Header -->
          <div class="chat-header">
            <div class="chat-title">
              {{ selectedConversation.customer.full_name || selectedConversation.customer.email }}
            </div>
            <div class="conversation-status" :class="selectedConversation.status">
              {{ selectedConversation.status }}
            </div>
          </div>
          
          <!-- Messages Container -->
          <div class="messages-container">
            <div
              v-for="(message, index) in selectedConversation.messages"
              :key="index"
              class="message-item"
              :class="message.message_type === 'user' ? 'user-message' : 'agent-message'"
            >
              <div class="message-sender">
                {{ message.message_type === 'user' ? (selectedConversation.customer.full_name || 'Customer') : (message.agent_name || 'Agent') }}
              </div>
              <div class="message-bubble">
                {{ message.message }}
              </div>
              <div class="message-time">
                {{ formatMessageTime(message.created_at) }}
              </div>
            </div>
          </div>
        </template>
        
        <div v-else class="no-selection">
          <s-text alignment="center" tone="subdued">
            Select a conversation to view details
          </s-text>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Conversation, ChatDetail } from '@/types/chat'

const props = defineProps<{
  conversations: Conversation[]
  loading: boolean
  status: 'open' | 'closed'
  selectedId: string | null
  selectedConversation: ChatDetail | null
}>()

const emit = defineEmits<{
  (e: 'update:status', value: 'open' | 'closed'): void
  (e: 'select-conversation', sessionId: string): void
}>()

const localStatus = ref<'open' | 'closed'>(props.status)

// Watch for status prop changes and sync with local state
watch(() => props.status, (newStatus) => {
  localStatus.value = newStatus
}, { immediate: true })

const handleStatusChange = (status: 'open' | 'closed') => {
  localStatus.value = status
  emit('update:status', status)
}

const formatTimeAgo = (timestamp: string): string => {
  const now = new Date()
  const past = new Date(timestamp)
  const diffMs = now.getTime() - past.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  return `${diffDays}d ago`
}

const formatMessageTime = (timestamp: string): string => {
  const date = new Date(timestamp)
  const hours = date.getHours()
  const minutes = date.getMinutes()
  const ampm = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours % 12 || 12
  const displayMinutes = minutes.toString().padStart(2, '0')
  
  return `${displayHours}:${displayMinutes} ${ampm}`
}
</script>

<style scoped>
.inbox-wrapper {
  max-width: 100%;
}

.inbox-header {
  margin-bottom: 20px;
  padding: var(--space-md) 0;
  border-bottom: 1px solid var(--border-color);
  background: var(--background-color);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.conversations-title {
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  font-family: var(--font-family);
}

.conversations-count {
  font-size: var(--text-sm);
  color: var(--text-muted);
  margin: 0;
}

/* Filter controls matching ConversationsList exactly */
.filter-controls {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.filter-btn {
  flex: 1;
  min-width: 70px;
  padding: 8px 6px;
  background: var(--background-color);
  border: 1px solid var(--border-color);
  color: var(--text-muted);
  font-size: 11px;
  cursor: pointer;
  transition: all var(--transition-fast);
  margin: 0 -1px;
  font-family: var(--font-family);
}

.filter-btn:first-child {
  border-radius: var(--radius-sm) 0 0 var(--radius-sm);
  margin-left: 0;
}

.filter-btn:last-child {
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  margin-right: 0;
}

.filter-btn:not(:first-child) {
  border-left: none;
}

.filter-btn.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
  z-index: 1;
  position: relative;
}

.state-message {
  padding: 40px 0;
}

.empty-state-container {
  padding: 40px 0;
}

.conversations-grid {
  display: grid;
  grid-template-columns: 420px 1fr;
  gap: 20px;
  margin-top: 0;
  max-width: 100%;
}

.conversations-list {
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  overflow-y: auto;
  height: calc(100vh - 280px);
  min-height: 550px;
  background: var(--background-color);
}

.conversation-item {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
  cursor: pointer;
  transition: all var(--transition-fast);
  min-height: 85px;
}

.conversation-item:hover {
  background: var(--background-soft);
}

.conversation-item.active {
  background: var(--background-soft);
  border-left: 2px solid var(--primary-color);
}

.conv-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-xs);
}

.conv-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 220px;
}

.conv-time {
  font-size: 12px;
  color: var(--text-muted);
}

.conv-preview {
  display: flex;
  gap: 6px;
  margin-bottom: 6px;
  font-size: 13px;
  align-items: center;
}

.conv-agent {
  font-weight: 500;
  color: var(--text-muted);
  flex-shrink: 0;
}

.conv-message {
  font-size: 13px;
  color: var(--text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 200px;
}

.conv-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.conv-count {
  font-size: 11px;
  color: var(--text-muted);
}

/* Conversation status matching ConversationsList design */
.conversation-status {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: var(--radius-full);
  text-transform: uppercase;
  margin-top: 4px;
  display: inline-block;
  font-weight: 500;
}

.conversation-status.open {
  background-color: rgba(16, 185, 129, 0.1);
  color: var(--success-color);
}

.conversation-status.closed {
  background-color: rgba(239, 68, 68, 0.1);
  color: var(--error-color);
}

.conversation-status.transferred {
  background-color: rgba(245, 158, 11, 0.1);
  color: var(--warning-color);
}

.conversation-detail {
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--background-color);
  display: flex;
  flex-direction: column;
  height: calc(100vh - 280px);
  min-height: 550px;
  overflow: hidden;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--background-soft);
}

.chat-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-width: 70%;
}

.user-message {
  align-self: flex-start;
}

.agent-message {
  align-self: flex-end;
}

.message-sender {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  padding: 0 8px;
}

.message-bubble {
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 15px;
  line-height: 1.5;
  word-wrap: break-word;
}

.user-message .message-bubble {
  background-color: var(--background-mute);
  color: var(--text-primary);
  border-bottom-left-radius: 4px;
}

.agent-message .message-bubble {
  background-color: var(--primary-color);
  color: white;
  border-bottom-right-radius: 4px;
}

.message-time {
  font-size: 11px;
  color: var(--text-muted);
  padding: 0 8px;
}

.no-selection {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 40px 20px;
}

@media (max-width: 1024px) {
  .conversations-grid {
    grid-template-columns: 1fr;
  }

  .conversations-list {
    height: 400px;
    min-height: 350px;
  }

  .conversation-detail {
    height: 500px;
    min-height: 450px;
  }
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .filter-controls {
    width: 100%;
    justify-content: space-between;
  }
  
  .filter-buttons {
    flex: 1;
    max-width: 200px;
  }
  
  .filter-button {
    flex: 1;
    min-width: auto;
  }
}
</style>

