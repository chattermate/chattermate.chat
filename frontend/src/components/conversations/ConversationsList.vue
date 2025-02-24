<!--
ChatterMate - Conversations List
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
import type { Conversation, ChatDetail } from '@/types/chat'
import ConversationChat from '@/components/conversations/ConversationChat.vue'
import { useConversationsList } from '@/composables/useConversationsList'

const props = defineProps<{
  conversations: Conversation[]
  loading: boolean
  error: string
}>()

const emit = defineEmits<{
  (e: 'refresh'): void
  (e: 'chatUpdated', data: ChatDetail): void
  (e: 'clearUnread', sessionId: string): void
}>()

const {
  selectedChat,
  selectedId,
  chatLoading,
  formattedConversations,
  loadChatDetail,
  unreadMessages,
  clearUnread
} = useConversationsList(props, emit)
</script>

<template>
  <div class="conversations-container">
    <!-- Sidebar with conversation list -->
    <div class="conversations-sidebar">
      <div v-if="loading" class="loading-state">
        Loading conversations...
      </div>

      <div v-else-if="error" class="error-state">
        {{ error }}
        <button @click="emit('refresh')" class="refresh-button">Retry</button>
      </div>

      <div v-else-if="conversations.length === 0" class="empty-state">
        No conversations yet
      </div>

      <div v-else class="conversations-list">
        <div 
          v-for="conv in formattedConversations" 
          :key="conv.session_id"
          class="conversation-item"
          :class="{ active: selectedId === conv.session_id }"
          @click="loadChatDetail(conv.session_id)"
        >
          <div class="conversation-item-header">
            <h3>{{ conv.customer.full_name || conv.customer.email }}</h3>
            <span class="timestamp">{{ conv.timeAgo }}</span>
          </div>
          <div class="conversation-preview">
            <span class="agent-name">{{ conv.agent_name }}:</span>
            <p class="last-message">{{ conv.last_message }}</p>
            <div v-if="unreadMessages[conv.session_id]" class="unread-bubble">
              {{ unreadMessages[conv.session_id] }}
            </div>
          </div>
          <div class="message-count">{{ conv.message_count }} messages</div>
        </div>
      </div>
    </div>

    <!-- Chat view -->
    <div class="chat-view">
      <div v-if="chatLoading" class="loading-state">
        Loading chat...
      </div>
      <ConversationChat 
        v-else-if="selectedChat"
        :chat="selectedChat"
        @refresh="() => {
          selectedChat && loadChatDetail(selectedChat.session_id);
          emit('refresh');
        }"
        @chatUpdated="selectedChat = $event"
        @clearUnread="clearUnread"
      />
    </div>
  </div>
</template>

<style scoped>
.conversations-container {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 0;
  height: 100%;
  width: 100%;
  background: var(--background-color);
  color: var(--text-primary);
  position: relative;
}

.conversations-sidebar {
  border-right: 1px solid var(--border-color);
  background: var(--background-color);
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  min-width: 0;
}

.conversations-list {
  overflow-y: auto;
  flex: 1;
  padding: 0;
  margin: 0;
}

.chat-view {
  height: 100%;
  width: 100%;
  overflow: hidden;
  position: relative;
  min-width: 0;
}

.sidebar-header {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sidebar-header h2 {
  font-size: 14px;
  font-weight: 500;
}

.conversation-item {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
  cursor: pointer;
  transition: all var(--transition-fast);
  min-height: 72px;
}

.conversation-item:hover {
  background: var(--background-soft);
}

.conversation-item.active {
  background: var(--background-soft);
  border-left: 2px solid var(--primary-color);
}

.conversation-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-xs);
}

.conversation-item-header h3 {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 170px;
}

.timestamp {
  font-size: 11px;
  color: var(--text-muted);
}

.conversation-preview {
  display: flex;
  gap: 4px;
  margin-bottom: 4px;
  font-size: 12px;
  align-items: center;
}

.agent-name {
  font-weight: 500;
  color: var(--text-muted);
}

.last-message {
  font-size: 12px;
  color: var(--text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 140px;
}

.message-count {
  font-size: 11px;
  color: var(--text-muted);
}

.no-chat-selected {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-muted);
  opacity: 0.7;
}

.loading-state,
.error-state,
.empty-state {
  padding: 16px;
  text-align: center;
  color: var(--text-muted);
  font-size: 12px;
}

.refresh-button {
  padding: 4px 8px;
  background: var(--background-soft);
  border: none;
  border-radius: var(--radius-sm);
  color: var(--text-muted);
  cursor: pointer;
  font-size: 12px;
}

.refresh-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.unread-bubble {
  flex-shrink: 0;
  background: var(--primary-color);
  color: var(--background-color);
  font-size: 12px;
  min-width: 20px;
  height: 20px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 6px;
  margin-left: auto;
}
</style> 