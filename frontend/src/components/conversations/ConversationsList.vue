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
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'

const props = defineProps<{
  conversations: Conversation[]
  loading: boolean
  error: string
  statusFilter: 'open' | 'closed'
  hasMore: boolean
  loadingMore: boolean
  showChatInfo?: boolean
  initialSessionId?: string | null
}>()

const emit = defineEmits<{
  (e: 'refresh'): void
  (e: 'chatUpdated', data: ChatDetail): void
  (e: 'chatSelected', data: ChatDetail): void
  (e: 'clearUnread', sessionId: string): void
  (e: 'updateFilter', status: 'open' | 'closed'): void
  (e: 'loadMore'): void
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

// Enhanced loadChatDetail to also emit chat-selected event
const loadChatDetailWithSelection = async (sessionId: string) => {
  await loadChatDetail(sessionId)
  // Emit the chat-selected event with the loaded chat detail
  if (selectedChat.value) {
    emit('chatSelected', selectedChat.value)
  }
}

// Function to update the selected chat from parent
const updateSelectedChat = (updatedChat: ChatDetail) => {
  console.log('updateSelectedChat', updatedChat)
  if (selectedChat.value && selectedChat.value.session_id === updatedChat.session_id) {
    selectedChat.value = updatedChat
  }
}

// Function to clear the selected chat from parent
const clearSelectedChat = () => {
  selectedChat.value = null
  selectedId.value = null
}

// Expose the function to parent component
defineExpose({
  updateSelectedChat,
  clearSelectedChat
})

// Intersection observer for infinite scrolling
const listContainer = ref<HTMLElement | null>(null)
const loadMoreTrigger = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

// Scroll to top functionality
const showScrollToTop = ref(false)
const scrollThreshold = 300 // Show button after scrolling down 300px

// Handle scroll event to show/hide scroll-to-top button
const handleScroll = () => {
  if (listContainer.value) {
    showScrollToTop.value = listContainer.value.scrollTop > scrollThreshold
  }
}

// Scroll to top function
const scrollToTop = () => {
  if (listContainer.value) {
    listContainer.value.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }
}

// Flag to track filter changes
const filterChanged = ref(false)

// Watch for filter changes to set the flag
watch(() => props.statusFilter, () => {
  filterChanged.value = true
})

// Watch for loading state changes to select first conversation after filter change
watch(() => props.loading, (isLoading, prevLoading) => {
  // Only proceed if loading has just completed (was true, now false)
  if (prevLoading === true && isLoading === false && filterChanged.value) {
    // Reset the flag
    filterChanged.value = false
    
    // When loading completes after filter change, select the first conversation if available
    if (props.conversations.length > 0) {
      loadChatDetailWithSelection(props.conversations[0].session_id)
    } else {
      // If no conversations available, clear the selected chat
      selectedChat.value = null
      selectedId.value = null
    }
  }
})

// Deep-link: open a specific session directly (e.g. from analytics "Sessions Needing
// Attention"). Fetches the chat detail by id, so it works even if the session isn't
// in the currently loaded/filtered list.
const initialSessionHandled = ref(false)
watch(
  () => props.initialSessionId,
  (sessionId) => {
    if (sessionId && !initialSessionHandled.value) {
      initialSessionHandled.value = true
      loadChatDetailWithSelection(sessionId)
    }
  },
  { immediate: true }
)

// Setup intersection observer for infinite scrolling
onMounted(() => {
  setupIntersectionObserver()
  
  // Add scroll event listener
  if (listContainer.value) {
    listContainer.value.addEventListener('scroll', handleScroll)
  }
})

// Watch for changes in the loadMoreTrigger ref
watch(loadMoreTrigger, (newValue) => {
  if (newValue && observer) {
    observer.observe(newValue)
  }
})

// Watch for changes in the listContainer ref to add scroll listener
watch(listContainer, (newValue) => {
  if (newValue) {
    newValue.addEventListener('scroll', handleScroll)
  }
})

// Setup intersection observer
const setupIntersectionObserver = () => {
  if (window.IntersectionObserver) {
    // Disconnect previous observer if it exists
    if (observer) {
      observer.disconnect()
    }
    
    observer = new IntersectionObserver((entries) => {
      const entry = entries[0]
      if (entry.isIntersecting && props.hasMore && !props.loadingMore) {
        emit('loadMore')
      }
    }, { threshold: 0.5 })
    
    if (loadMoreTrigger.value) {
      observer.observe(loadMoreTrigger.value)
    }
  }
}

// Cleanup intersection observer and event listeners
onBeforeUnmount(() => {
  if (observer) {
    observer.disconnect()
    observer = null
  }
  
  // Remove scroll event listener
  if (listContainer.value) {
    listContainer.value.removeEventListener('scroll', handleScroll)
  }
})
</script>

<template>
  <div class="conversations-container" :class="{ 'with-chat-info': showChatInfo }">
    <!-- Sidebar with conversation list -->
    <div class="conversations-sidebar">
      <!-- Filter controls -->
      <div class="filter-controls">
        <button 
          class="filter-btn" 
          :class="{ active: statusFilter === 'open' }"
          @click="emit('updateFilter', 'open')"
        >
          Open
        </button>
        <button 
          class="filter-btn" 
          :class="{ active: statusFilter === 'closed' }"
          @click="emit('updateFilter', 'closed')"
        >
          Closed
        </button>
      </div>

      <div v-if="loading && !loadingMore" class="loading-state">
        Loading conversations...
      </div>

      <div v-else-if="error" class="error-state">
        {{ error }}
        <button @click="emit('refresh')" class="refresh-button">Retry</button>
      </div>

      <div v-else-if="conversations.length === 0" class="empty-state">
        No conversations yet
      </div>

      <div v-else class="conversations-list" ref="listContainer">
        <div 
          v-for="conv in formattedConversations" 
          :key="conv.session_id"
          class="conversation-item"
          :class="{ active: selectedId === conv.session_id }"
          @click="loadChatDetailWithSelection(conv.session_id)"
        >
          <div class="conversation-item-header">
            <h3>{{ conv.customer.full_name || conv.customer.email }}</h3>
            <span class="timestamp">{{ conv.timeAgo }}</span>
          </div>
          <div class="conversation-preview">
            <span class="agent-name">{{ conv.agent.name }}:</span>
            <!-- Product message preview -->
            <template v-if="conv.message_type === 'product' && conv.shopify_output?.products?.length">
              <p class="last-message product-preview">
                <span class="product-icon">🛍️</span>
                {{ conv.shopify_output.products.length }} product{{ conv.shopify_output.products.length > 1 ? 's' : '' }} shared
              </p>
            </template>
            <!-- Regular message preview -->
            <template v-else>
              <p class="last-message">{{ conv.last_message }}</p>
            </template>
            <div v-if="unreadMessages[conv.session_id]" class="unread-bubble">
              {{ unreadMessages[conv.session_id] }}
            </div>
          </div>
          <div class="message-count">{{ conv.message_count }} messages</div>
          <div class="conversation-status" :class="conv.status">
            {{ conv.status }}
          </div>
        </div>
        
        <!-- Loading more indicator -->
        <div 
          v-if="hasMore || loadingMore" 
          class="load-more-trigger" 
          ref="loadMoreTrigger"
        >
          <div v-if="loadingMore" class="loading-more">
            <div class="loading-spinner"></div>
            <span>Loading more conversations...</span>
          </div>
          <div v-else-if="hasMore" class="load-more-container">
            <span class="load-more-hint">Scroll down to load more</span>
            <button 
              class="load-more-button"
              @click="emit('loadMore')"
              :disabled="loadingMore"
            >
              Load More
            </button>
          </div>
        </div>
      </div>
      
      <!-- Scroll to top button -->
      <button 
        v-if="showScrollToTop" 
        class="scroll-to-top-btn"
        @click="scrollToTop"
        aria-label="Scroll to top"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 15l-6-6-6 6"/>
        </svg>
      </button>
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

.conversations-container.with-chat-info {
  grid-template-columns: 320px 1fr;
}

.conversations-sidebar {
  border-right: 1px solid var(--border-color);
  background: var(--background-color);
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  min-width: 0;
  position: relative;
}

.filter-controls {
  display: flex;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
  background: var(--background-soft);
  flex-wrap: wrap;
  gap: 4px;
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

.conversations-list {
  overflow-y: auto;
  flex: 1;
  padding: 0;
  margin: 0;
  height: calc(100vh - 120px); /* Fixed height calculation: viewport height minus header and filter controls */
  max-height: calc(100vh - 120px); /* Fixed height calculation: viewport height minus header and filter controls */
  scrollbar-width: thin; /* For Firefox */
  scrollbar-color: var(--border-color) transparent; /* For Firefox */
}

/* Webkit scrollbar styling */
.conversations-list::-webkit-scrollbar {
  width: 6px;
}

.conversations-list::-webkit-scrollbar-track {
  background: transparent;
}

.conversations-list::-webkit-scrollbar-thumb {
  background-color: var(--border-color);
  border-radius: 3px;
}

.conversation-status {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: var(--radius-full);
  text-transform: uppercase;
  margin-top: 4px;
  display: inline-block;
}

.conversation-status.open {
  background-color: var(--success-color-soft);
  color: var(--success-color);
}

.conversation-status.closed {
  background-color: var(--error-color-soft);
  color: var(--error-color);
}

.conversation-status.transferred {
  background-color: var(--warning-color-soft);
  color: var(--warning-color);
}

.chat-view {
  height: 100%;
  width: 100%;
  overflow: hidden;
  position: relative;
  min-width: 0;
  max-height: 100vh; /* Fixed height to viewport height */
  display: flex;
  flex-direction: column;
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

.unread-bubble {
  background: var(--primary-color);
  color: white;
  border-radius: 50%;
  min-width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 600;
  margin-left: auto;
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
  max-height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
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

.load-more-trigger {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 0;
  margin: 8px 0;
}

.loading-more {
  font-size: 12px;
  color: var(--text-muted);
  text-align: center;
  display: flex;
  align-items: center;
  gap: 8px;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid var(--primary-color);
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 1s linear infinite;
}

.load-more-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.load-more-hint {
  font-size: 12px;
  color: var(--text-muted);
  opacity: 0.7;
}

.load-more-button {
  padding: 6px 12px;
  background-color: var(--background-soft);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-size: 12px;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.load-more-button:hover {
  background-color: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.load-more-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.scroll-to-top-btn {
  position: absolute;
  bottom: 16px;
  right: 16px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--primary-color);
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transition: all var(--transition-fast);
  z-index: 10;
}

.scroll-to-top-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.scroll-to-top-btn:active {
  transform: translateY(0);
}

.product-preview {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--primary-color);
  font-weight: 500;
}

.product-icon {
  font-size: 14px;
  line-height: 1;
}

.last-message.product-preview {
  color: var(--primary-color);
  max-width: 160px;
}
</style> 