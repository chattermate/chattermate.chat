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
import { ref, computed } from 'vue'
import type { ChatDetail } from '@/types/chat'
import { chatService } from '@/services/chat'
import { userService } from '@/services/user'
import { socketService } from '@/services/socket'
import { toast } from 'vue-sonner'
import api from '@/services/api'
import { canRequestRating, endChatMessage as endChatMessageFor } from '@/utils/endChat'

interface Props {
  chatInfo: ChatDetail | null
  users: Array<{id: string, full_name: string, email: string}>
  isLoading?: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'refresh'): void
  (e: 'chatUpdated', chatInfo: ChatDetail): void
  (e: 'chatClosed', sessionId: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const showEndChatConfirm = ref(false)
const actionLoading = ref(false)
const reassigning = ref(false)
const showReassign = ref(false)
const selectedUserId = ref('')
const users = ref<Array<{id: string, full_name: string, email: string}>>([])
const loadingUsers = ref(false)

// Chat action functions
const currentUserId = userService.getUserId()

// Only the web widget can render a rating; on external channels (WhatsApp,
// Messenger, ...) the ask is dropped, so the confirmation must not promise it.
const askRating = computed(() => canRequestRating(props.chatInfo?.channel))

const canTakeOver = computed(() => {
  if (!props.chatInfo) return false
  return (
    (props.chatInfo.status === 'transferred' && 
     (!props.chatInfo.user_id || props.chatInfo.user_id !== currentUserId)) ||
    (props.chatInfo.status === 'open' && !props.chatInfo.user_id)
  )
})

const canEndChat = computed(() => {
  if (!props.chatInfo) return false
  return (
    props.chatInfo.status !== 'closed' && 
    props.chatInfo.user_id === currentUserId
  )
})

const handleTakeover = async () => {
  if (!props.chatInfo) return
  
  try {
    actionLoading.value = true
    await chatService.takeoverChat(props.chatInfo.session_id)
    
    toast.success('Chat taken over successfully', {
      description: 'You can now send messages in this chat',
      duration: 4000,
      closeButton: true
    })
    
    const userName = userService.getUserName()
    const userId = userService.getUserId()

    // Update local chat info state
    const updatedChatInfo = {
      ...props.chatInfo,
      status: 'open' as const,
      user_id: userId,
      user_name: userName
    }

    socketService.emit('taken_over', { 
      session_id: props.chatInfo.session_id, 
      user_name: userName, 
      profile_picture: userService.getCurrentUser()?.profile_pic || '' 
    })
    
    // Emit updated chat info to parent components
    emit('chatUpdated', updatedChatInfo)
    
    // Refresh conversations list
    emit('refresh')
  } catch (err: any) {
    console.error('Failed to takeover chat:', err)
    toast.error('Failed to take over chat', {
      description: err.response?.data?.detail || 'Please try again',
      duration: 4000,
      closeButton: true
    })
  } finally {
    actionLoading.value = false
  }
}

const handleEndChatRequest = () => {
  showEndChatConfirm.value = true
}

const confirmEndChat = async () => {
  if (!props.chatInfo) return
  
  try {
    actionLoading.value = true
    
    const timestamp = new Date().toISOString()
    const endChatMessage = {
      message: endChatMessageFor(props.chatInfo.channel),
      message_type: "system",
      created_at: timestamp,
      session_id: props.chatInfo.session_id,
      end_chat: true,
      request_rating: askRating.value,
      end_chat_reason: "AGENT_REQUEST",
      end_chat_description: "Agent manually ended the chat"
    }

    // Emit message through socket to end chat
    socketService.emit('agent_message', {
      message: endChatMessage.message,
      session_id: props.chatInfo.session_id,
      message_type: endChatMessage.message_type,
      created_at: timestamp,
      end_chat: true,
      request_rating: askRating.value,
      end_chat_reason: "AGENT_REQUEST",
      end_chat_description: "Agent manually ended the chat"
    })

    toast.success('Chat ended successfully', {
      description: askRating.value ? 'Customer will be asked for feedback' : 'Chat has been closed',
      duration: 4000,
      closeButton: true
    })
    
    showEndChatConfirm.value = false
    
    // Refresh conversations list
    emit('refresh')

    // Inform parent to close chat views
    emit('chatClosed', props.chatInfo.session_id)
  } catch (err: any) {
    console.error('Failed to end chat:', err)
    toast.error('Failed to end chat', {
      description: err.response?.data?.detail || 'Please try again',
      duration: 4000,
      closeButton: true
    })
  } finally {
    actionLoading.value = false
  }
}

const cancelEndChat = () => {
  showEndChatConfirm.value = false
}

// Helper function to get user name by ID
const getUserNameById = (userId: string | null): string => {
  if (!userId) {
    // If no user_id, use agent name from chat detail or fallback to 'AI Agent'
    return props.chatInfo?.agent?.name || 'AI Agent'
  }
  const user = props.users.find(u => u.id === userId)
  return user ? user.full_name : 'Unknown User'
}

// Helper function to format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
}

// Integrator-supplied fields (e.g. student_name, center_name) passed via
// POST /generate-token's `custom_data`. Shown as a label/value list below the
// customer's name and email; snake_case keys are prettified for display.
const metaDataEntries = computed(() => {
  const metaData = props.chatInfo?.customer?.meta_data
  if (!metaData || typeof metaData !== 'object') return []
  return Object.entries(metaData)
    .filter(([, value]) => value !== null && value !== undefined && value !== '')
    .map(([key, value]) => ({
      key,
      label: key.replace(/[_-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      value: typeof value === 'object' ? JSON.stringify(value) : String(value)
    }))
})

// Load users for reassign dropdown
const loadUsers = async () => {
  if (loadingUsers.value) return
  loadingUsers.value = true
  try {
    const response = await api.get('/users')
    users.value = response.data
  } catch (e) {
    console.error('Failed to load users', e)
  } finally {
    loadingUsers.value = false
  }
}

const openReassign = async () => {
  await loadUsers()
  showReassign.value = true
}

const cancelReassign = () => {
  showReassign.value = false
  selectedUserId.value = ''
}

const confirmReassign = async () => {
  if (!props.chatInfo || !selectedUserId.value) return
  try {
    reassigning.value = true
    const updated = await chatService.reassignChat(props.chatInfo.session_id, selectedUserId.value)
    toast.success('Chat reassigned successfully')
    emit('chatUpdated', updated)
    emit('refresh')
    showReassign.value = false
  } catch (err: any) {
    console.error('Failed to reassign chat:', err)
    toast.error('Failed to reassign chat', { description: err.response?.data?.detail || 'Please try again' })
  } finally {
    reassigning.value = false
  }
}
</script>

<template>
  <div v-if="chatInfo" class="chat-info-sidebar">
    <div class="chat-info-header">
      <h3>Chat Information</h3>
      <button @click="emit('close')" class="close-btn" aria-label="Close chat info">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
    
    <div class="chat-info-content">
      <div class="info-section">
        <h4>Customer</h4>
        <div class="info-item">
          <span class="label">Name:</span>
          <span class="value">{{ chatInfo.customer.full_name || 'N/A' }}</span>
        </div>
        <div class="info-item">
          <span class="label">Email:</span>
          <span class="value">{{ chatInfo.customer.email || 'N/A' }}</span>
        </div>
        <div v-for="entry in metaDataEntries" :key="entry.key" class="info-item">
          <span class="label">{{ entry.label }}:</span>
          <span class="value">{{ entry.value }}</span>
        </div>
      </div>

      <div class="info-section">
        <h4>Assignment</h4>
        <div class="info-item">
          <span class="label">Assigned to:</span>
          <span class="value">{{ getUserNameById(chatInfo.user_id) }}</span>
        </div>
      </div>
      
      <div class="info-section">
        <h4>Timeline</h4>
        <div class="info-item">
          <span class="label">Created:</span>
          <span class="value">{{ formatDate(chatInfo.created_at) }}</span>
        </div>
        <div class="info-item">
          <span class="label">Updated:</span>
          <span class="value">{{ formatDate(chatInfo.updated_at) }}</span>
        </div>
      </div>
      
      <div class="info-section">
        <h4>Status</h4>
        <div class="info-item">
          <span class="label">Current Status:</span>
          <span class="value status-badge" :class="chatInfo.status">
            {{ chatInfo.status.toUpperCase() }}
          </span>
        </div>
        <div class="info-item">
          <span class="label">Messages:</span>
          <span class="value">{{ chatInfo.messages.length }}</span>
        </div>
      </div>
      
      <!-- Chat Actions Section -->
      <div class="info-section">
        <h4>Actions</h4>
        <div class="chat-actions">
          <button 
            v-if="canTakeOver"
            class="action-btn takeover-btn"
            :disabled="actionLoading"
            @click="handleTakeover"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            {{ actionLoading ? 'Taking over...' : 'Take Over Chat' }}
          </button>
          
          <button 
            v-if="canEndChat"
            class="action-btn end-chat-btn"
            :disabled="actionLoading"
            @click="handleEndChatRequest"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16,17 21,12 16,7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            End Chat
          </button>
          
          <button 
            v-if="chatInfo.status === 'open' && chatInfo.user_id"
            class="action-btn"
            :disabled="reassigning || loadingUsers"
            @click="openReassign"
          >
            Reassign Chat
          </button>
          

        </div>
      </div>
    </div>
    
    <!-- End Chat Confirmation Modal -->
    <div v-if="showEndChatConfirm" class="end-chat-modal">
      <div class="end-chat-modal-content">
        <h3>End Chat</h3>
        <p v-if="askRating">Are you sure you want to end this chat and request customer feedback?</p>
        <p v-else>Are you sure you want to end this chat?</p>
        <div class="end-chat-modal-actions">
          <button class="cancel-btn" @click="cancelEndChat">Cancel</button>
          <button class="confirm-btn" @click="confirmEndChat" :disabled="actionLoading">
            {{ actionLoading ? 'Ending...' : (askRating ? 'End Chat & Request Rating' : 'End Chat') }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- Reassign Modal -->
    <div v-if="showReassign" class="end-chat-modal">
      <div class="end-chat-modal-content">
        <h3>Reassign Chat</h3>
        <p>Select a user to assign this chat to.</p>
        <div style="margin-bottom: 12px;">
          <select v-model="selectedUserId" class="filter-input" style="width: 100%;">
            <option value="" disabled>Select user</option>
            <option v-for="u in users" :key="u.id" :value="u.id">{{ u.full_name }} ({{ u.email }})</option>
          </select>
        </div>
        <div class="end-chat-modal-actions">
          <button class="cancel-btn" @click="cancelReassign">Cancel</button>
          <button class="confirm-btn" :disabled="!selectedUserId || reassigning" @click="confirmReassign">
            {{ reassigning ? 'Reassigning...' : 'Confirm Reassign' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat-info-sidebar {
  background: var(--bg2);
  border-left: 1px solid var(--o08);
  overflow-y: auto;
  animation: slideInRight 0.3s ease-out;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

.chat-info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-md) var(--space-lg);
  border-bottom: 1px solid var(--o07);
  background: var(--bg2);
}

.chat-info-header h3 {
  margin: 0;
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid var(--o10);
  border-radius: 8px;
  background: var(--o05);
  color: var(--muted);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.close-btn:hover {
  background: var(--o10);
  color: var(--text);
}

.chat-info-content {
  padding: var(--space-lg);
}

.info-section {
  margin-bottom: var(--space-lg);
}

.info-section:last-child {
  margin-bottom: 0;
}

.info-section h4 {
  margin: 0 0 var(--space-md) 0;
  font-family: var(--font-mono);
  font-size: 10.5px;
  font-weight: 600;
  color: var(--faint);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  border-bottom: 1px solid var(--o07);
  padding-bottom: var(--space-xs);
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-sm);
  gap: var(--space-sm);
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-item .label {
  font-size: 12px;
  font-weight: 500;
  color: var(--muted);
  min-width: 80px;
  flex-shrink: 0;
}

.info-item .value {
  font-size: 13px;
  color: var(--text);
  text-align: right;
  word-break: break-word;
  flex: 1;
}

.status-badge {
  padding: 4px 8px;
  border-radius: var(--radius-full);
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
}

/* Higher specificity than ".info-item .value" so the pill hugs the status text
   instead of inheriting .value's flex:1 and stretching its background across
   the rest of the row. */
.info-item .value.status-badge {
  flex: none;
}

.status-badge.open {
  background: rgba(201,242,78,.12);
  color: var(--accent-ink);
}

.status-badge.closed {
  background: var(--o06);
  color: var(--muted);
}

.status-badge.transferred {
  background: var(--warning-bg);
  color: var(--warning-color);
}

/* Chat Actions */
.chat-actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.action-btn {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--o10);
  border-radius: 10px;
  background: var(--o05);
  color: var(--text3);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  text-align: left;
  width: 100%;
}

.action-btn:hover:not(:disabled) {
  background: var(--o10);
  border-color: var(--o14);
  color: var(--text);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.takeover-btn {
  border-color: rgba(201,242,78,.3);
  color: var(--accent-ink);
}

.takeover-btn:hover:not(:disabled) {
  background: rgba(201,242,78,.1);
}

.end-chat-btn {
  border-color: rgba(255,138,115,.3);
  color: var(--c-coral);
}

.end-chat-btn:hover:not(:disabled) {
  background: rgba(255,138,115,.1);
}



/* End Chat Modal */
.end-chat-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.end-chat-modal-content {
  background: var(--surface);
  border: 1px solid var(--o10);
  border-radius: 20px;
  padding: var(--space-xl);
  max-width: 400px;
  width: 90%;
  box-shadow: var(--shadow-lg);
  animation: slideInUp 0.3s ease-out;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.end-chat-modal-content h3 {
  margin: 0 0 var(--space-md) 0;
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 600;
  color: var(--text);
}

.end-chat-modal-content p {
  margin: 0 0 var(--space-lg) 0;
  color: var(--muted);
  line-height: 1.5;
}

.end-chat-modal-actions {
  display: flex;
  gap: var(--space-sm);
  justify-content: flex-end;
}

.cancel-btn, .confirm-btn {
  padding: var(--space-sm) var(--space-lg);
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  border: 1px solid transparent;
  min-width: 80px;
}

.cancel-btn {
  background: var(--o06);
  color: var(--text3);
  border-color: var(--o10);
}

.cancel-btn:hover {
  background: var(--o10);
  color: var(--text);
}

.confirm-btn {
  background: var(--error-color);
  color: white;
  border-color: transparent;
}

.confirm-btn:hover:not(:disabled) {
  filter: brightness(1.1);
  transform: translateY(-1px);
}

.confirm-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}
</style>
