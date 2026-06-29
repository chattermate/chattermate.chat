<!--
ChatterMate - Conversations View
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
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import ConversationsList from '@/components/conversations/ConversationsList.vue'
import ConversationFilters from '@/components/conversations/ConversationFilters.vue'
import ChatInfoPanel from '@/components/conversations/ChatInfoPanel.vue'
import type { Conversation, ChatDetail } from '@/types/chat'
import { chatService } from '@/services/chat'
import { agentService } from '@/services/agent'
import api from '@/services/api'

const route = useRoute()
// Deep-link target session (e.g. from analytics "Sessions Needing Attention")
const initialSessionId = ref<string | null>(
  typeof route.query.session === 'string' ? route.query.session : null
)

const conversations = ref<Conversation[]>([])
const loading = ref(true)
const error = ref('')
// Select the matching tab when deep-linking (closed sessions live under the "Closed" tab)
const statusFilter = ref<'open' | 'closed'>(
  route.query.status === 'closed' ? 'closed' : 'open'
)
const currentPage = ref(1)
const pageSize = ref(20)
const hasMore = ref(true)
const totalCount = ref<number | null>(null)

// Filter states
const filterValues = ref({
  customerEmailFilter: '',
  dateFromFilter: '',
  dateToFilter: '',
  agentFilter: '',
  userFilter: ''
})
const showFilters = ref(false)
const users = ref<Array<{id: string, full_name: string, email: string}>>([])
const loadingUsers = ref(false)
const agents = ref<Array<{id: string, name: string, display_name: string | null}>>([])
const loadingAgents = ref(false)

// Chat info states
const selectedChatInfo = ref<ChatDetail | null>(null)
const showChatInfo = ref(false)

// Ref for ConversationsList component
const conversationsListRef = ref<InstanceType<typeof ConversationsList> | null>(null)

// Computed property to show how many conversations are loaded
const loadedCount = computed(() => conversations.value?.length || 0)
const totalItems = computed(() => totalCount.value || loadedCount.value)

const loadConversations = async (page = 1, loadMore = false) => {
  error.value = ''
  
  if (page === 1 || !loadMore) {
    loading.value = true
  }
  
  const skip = (page - 1) * pageSize.value
  
  let newConversations: Conversation[] = []
  
  try {
    const params: any = {
      skip,
      limit: pageSize.value,
      status: statusFilter.value === 'open' ? 'open,transferred' : statusFilter.value
    }
    
    // Add filters if they have values
    if (filterValues.value.customerEmailFilter.trim()) {
      params.customer_email = filterValues.value.customerEmailFilter.trim()
    }
    if (filterValues.value.agentFilter.trim()) {
      params.agent_id = filterValues.value.agentFilter.trim()
    }
    if (filterValues.value.userFilter.trim()) {
      params.user_id = filterValues.value.userFilter.trim()
    }
    if (filterValues.value.dateFromFilter) {
      params.date_from = new Date(filterValues.value.dateFromFilter).toISOString()
    }
    if (filterValues.value.dateToFilter) {
      params.date_to = new Date(filterValues.value.dateToFilter).toISOString()
    }
    
    newConversations = await chatService.getRecentChats(params)
    
    // If we're loading more, append to existing conversations
    if (loadMore && page > 1) {
      conversations.value = [...(conversations.value || []), ...newConversations]
    } else {
      conversations.value = newConversations
    }
    
    // Check if there might be more conversations to load
    hasMore.value = newConversations?.length === pageSize.value
    currentPage.value = page
    
    // If we received fewer items than the page size, we can calculate the total
    if (newConversations?.length < pageSize.value) {
      totalCount.value = skip + (newConversations?.length || 0)
    }
    
  } catch (err) {
    error.value = 'Failed to load conversations'
    console.error(err)
  } finally {
    loading.value = false
  }
}

const loadMoreConversations = () => {
  if (!loading.value && hasMore.value) {
    loadConversations(currentPage.value + 1, true)
  }
}

const updateFilter = (status: 'open' | 'closed') => {
  statusFilter.value = status
  currentPage.value = 1
  hasMore.value = true
  totalCount.value = null
  loadConversations(1)
}

// Filter handlers
const handleApplyFilters = () => {
  currentPage.value = 1
  hasMore.value = true
  totalCount.value = null
  loadConversations(1)
  // Auto-close filter panel after applying
  showFilters.value = false
}

const handleClearFilters = () => {
  filterValues.value = {
    customerEmailFilter: '',
    dateFromFilter: '',
    dateToFilter: '',
    agentFilter: '',
    userFilter: ''
  }
  handleApplyFilters()
}

const toggleFilters = () => {
  showFilters.value = !showFilters.value
}

const loadUsers = async () => {
  if (loadingUsers.value) return
  
  loadingUsers.value = true
  try {
    const response = await api.get('/users')
    users.value = response.data
  } catch (error) {
    console.error('Failed to load users:', error)
  } finally {
    loadingUsers.value = false
  }
}

const loadAgents = async () => {
  if (loadingAgents.value) return
  
  loadingAgents.value = true
  try {
    const agentsList = await agentService.getOrganizationAgents()
    agents.value = agentsList
  } catch (error) {
    console.error('Failed to load agents:', error)
  } finally {
    loadingAgents.value = false
  }
}

onMounted(() => {
  loadConversations(1)
  loadUsers()
  loadAgents()
})

const handleChatUpdated = (chatDetail: ChatDetail) => {
  // Update the conversation in the list if it exists
  const index = conversations.value.findIndex(c => c.session_id === chatDetail.session_id)
  if (index !== -1) {
    // Create a new conversation object with updated data
    const updatedConversation: Conversation = {
      ...conversations.value[index],
      last_message: chatDetail.messages[chatDetail.messages.length - 1]?.message || '',
      updated_at: chatDetail.updated_at,
      message_count: chatDetail.messages.length,
      status: chatDetail.status
    }
    
    // Create a new array with the updated conversation
    const updatedConversations = [...conversations.value]
    updatedConversations[index] = updatedConversation
    conversations.value = updatedConversations
  }
  
  // Update chat info panel if this is the selected chat
  if (selectedChatInfo.value && selectedChatInfo.value.session_id === chatDetail.session_id) {
    selectedChatInfo.value = chatDetail
  }
  
  // Update the selected chat in ConversationsList to refresh ConversationChat
  if (conversationsListRef.value) {
    conversationsListRef.value.updateSelectedChat(chatDetail)
  }
}

const handleChatSelected = (chatDetail: ChatDetail) => {
  selectedChatInfo.value = chatDetail
  // Only auto-show if not already visible
  if (!showChatInfo.value) {
    showChatInfo.value = true
  }
}

const closeChatInfo = () => {
  showChatInfo.value = false
  // Don't clear selectedChatInfo so we can reopen it
}

const toggleChatInfo = () => {
  if (selectedChatInfo.value) {
    showChatInfo.value = !showChatInfo.value
  }
}

// Handle chat closed from ChatInfoPanel
const handleChatClosed = (_sessionId?: string) => {
  showChatInfo.value = false
  selectedChatInfo.value = null
  if (conversationsListRef.value) {
    conversationsListRef.value.clearSelectedChat()
  }
}


</script>

<template>
  <DashboardLayout :hideHeader="true">
    <header class="page-header">
      <div class="header-content">
        <h1>Conversations</h1>
        <div class="header-actions">
          <ConversationFilters
            :showFilters="showFilters"
            :filterValues="filterValues"
            :users="users"
            :agents="agents"
            :loadingUsers="loadingUsers"
            :loadingAgents="loadingAgents"
            @toggle="toggleFilters"
            @apply="handleApplyFilters"
            @clear="handleClearFilters"
            @update:filterValues="filterValues = $event"
          />
          
          <button 
            @click="toggleChatInfo" 
            class="info-toggle-btn"
            :class="{ active: showChatInfo }"
            aria-label="Toggle chat information"
            :disabled="!selectedChatInfo"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
          </button>
        </div>
      </div>
    </header>
    
    <div class="main-content">
      <ConversationsList 
        ref="conversationsListRef"
        :conversations="conversations"
        :loading="loading"
        :error="error"
        :status-filter="statusFilter"
        :has-more="hasMore"
        :loading-more="loading && currentPage > 1"
        :loaded-count="loadedCount"
        :total-count="totalItems"
        :show-chat-info="showChatInfo && !!selectedChatInfo"
        :initial-session-id="initialSessionId"
        @refresh="loadConversations(1)"
        @update-filter="updateFilter"
        @load-more="loadMoreConversations"
        @chat-updated="handleChatUpdated"
        @chat-selected="handleChatSelected"
        @clear-unread="() => {}"
      />
      
      <ChatInfoPanel
        v-if="showChatInfo"
        :chatInfo="selectedChatInfo"
        :users="users"
        @close="closeChatInfo"
        @refresh="loadConversations(1)"
        @chatUpdated="handleChatUpdated"
        @chatClosed="handleChatClosed"
      />
    </div>
  </DashboardLayout>
</template>

<style scoped>
.main-content {
  display: grid;
  grid-template-columns: 1fr 350px;
  height: calc(100vh - 80px);
  width: 100%;
  overflow: hidden;
  position: relative;
  background: var(--bg);
  transition: all 0.3s ease;
}

.main-content:not(:has(.chat-info-sidebar)) {
  grid-template-columns: 1fr;
}

.page-header {
  padding: 14px var(--space-lg);
  border-bottom: 1px solid var(--o08);
  background: var(--bg2);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content h1 {
  margin: 0;
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--text);
}

.header-actions {
  display: flex;
  gap: var(--space-sm);
  align-items: center;
}

.info-toggle-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border: 1px solid var(--o10);
  border-radius: 10px;
  background: var(--o05);
  color: var(--muted);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.info-toggle-btn:hover {
  background: var(--o10);
  color: var(--text);
}

.info-toggle-btn.active {
  background: rgba(201,242,78,.12);
  color: var(--accent-ink);
  border-color: rgba(201,242,78,.3);
}

.info-toggle-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.info-toggle-btn:disabled:hover {
  background: var(--o05);
  color: var(--muted);
  border-color: var(--o10);
}

/* Responsive design */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: var(--space-sm);
    align-items: flex-start;
  }
  
  .header-actions {
    align-self: flex-end;
  }
  
  .main-content {
    height: calc(100vh - 120px);
    grid-template-columns: 1fr !important;
  }
}

@media (max-width: 480px) {
  .page-header {
    padding: var(--space-md);
  }
  
  .header-content h1 {
    font-size: 20px;
  }
}
</style> 