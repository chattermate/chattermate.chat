/*
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
*/

import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import type { ChatDetail, Message } from '@/types/chat'
import { formatDistanceToNow } from 'date-fns'
import { chatService } from '@/services/chat'
import { userService } from '@/services/user'
import { socketService } from '@/services/socket'
import { toast } from 'vue-sonner'
import { canRequestRating, endChatMessage as endChatMessageFor } from '@/utils/endChat'
import { canTakeOverChat } from '@/utils/chatState'
import { permissionChecks } from '@/utils/permissions'

// Define valid chat statuses
type ChatStatus = 'open' | 'closed' | 'transferred'

/** Emitted by the backend when a reply was saved but never reached the customer. */
interface DeliveryErrorEvent {
  error?: string
  type?: string
  session_id?: string
  can_template?: boolean
}

export function useConversationChat(
  initialChat: ChatDetail,
  emit: {
    (event: 'refresh'): void
    (event: 'chatUpdated', data: ChatDetail): void
    (event: 'clearUnread', sessionId: string): void
  }
) {
  const chat = ref<ChatDetail>(initialChat)
  const newMessage = ref('')
  const messagesContainer = ref<HTMLElement | null>(null)
  const isLoading = ref(false)
  const currentUserId = userService.getUserId()
  // Set once a send is refused because the messaging window closed and a
  // template would reopen it. The frontend can't tell the window has expired on
  // its own — it never sees the customer's last inbound time — so this is only
  // known after the backend refuses a send.
  const templateCanReopen = ref(false)

  // Claimable and allowed to claim. Shared with ChatInfoPanel via
  // canTakeOverChat so the chat screen and the info panel can't disagree —
  // this pane used to require status 'transferred', which left an AI-handled
  // chat claimable only from the info panel.
  const showTakeoverButton = computed(
    () => canTakeOverChat(chat.value) && permissionChecks.canTakeOverChats()
  )

  const showTakenOverStatus = computed(() => {
    // Show taken over status if:
    // 1. Chat is open
    // 2. A user has taken over
    // 3. The user who took over is not the current user
    return (
      chat.value.status === 'open' && 
      chat.value.user_id && 
      chat.value.user_id !== currentUserId
    )
  })

  const handledByAI = computed(() => {
    // Chat is handled by AI if:
    // 1. Chat is open
    // 2. No user has taken over
    // 3. No group is assigned
    return (
      chat.value.status === 'open' && 
      !chat.value.user_id && 
      !chat.value.group_id
    )
  })

  const isChatClosed = computed(() => {
    return chat.value.status === 'closed'
  })

  const canSendMessage = computed(() => {
    // Cannot send if chat is closed
    if (isChatClosed.value) return false
    
    // Cannot send if needs takeover or taken by another user
    return !showTakeoverButton.value && !showTakenOverStatus.value
  })

  const scrollToBottom = async () => {
    // Wait for the new message to render, otherwise scrollHeight is still the
    // pre-append height and the list stops short of the bottom.
    await nextTick()
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  }

  // Watch for changes in messages and scroll to bottom
  watch(() => chat.value.messages, (messages) => {
    scrollToBottom()
    // A customer message reopens the messaging window, so the closed-window
    // notice must go — otherwise it sits above a composer that now works.
    if (messages?.[messages.length - 1]?.message_type === 'user') {
      templateCanReopen.value = false
    }
  }, { deep: true })

  // The same composable instance serves whichever chat is selected, so a
  // closed window learned about in one conversation must not follow us to the
  // next. Sending a template reopens the window, which also clears it.
  watch(() => chat.value.session_id, () => {
    templateCanReopen.value = false
  })

  const clearTemplateSuggestion = () => {
    templateCanReopen.value = false
  }

  const updateChat = (newChat: ChatDetail) => {
    chat.value = { ...newChat }
    // Emit event to clear unreads
    emit('clearUnread', newChat.session_id)
    // Emit chatUpdated event to ensure the parent component updates
    emit('chatUpdated', chat.value)
  }

  // Replace chat state from parent props without emitting events
  const replaceChatFromProps = (newChat: ChatDetail) => {
    chat.value = { ...newChat }
  }

  const sendMessage = async () => {
    if (!newMessage.value.trim() || !canSendMessage.value) return

    try {
      const messageText = newMessage.value
      // Clear input immediately for better UX
      newMessage.value = ''

      // Add message locally first
      const timestamp = new Date().toISOString()
      const localMessage: Message = {
        message: messageText,
        message_type: 'agent',
        created_at: timestamp,
        session_id: chat.value.session_id
      }

      // Update chat with new message
      chat.value.messages.push(localMessage)
      chat.value.updated_at = timestamp

      // Emit message through socket
      socketService.emit('agent_message', {
        message: messageText,
        session_id: chat.value.session_id,
        message_type: 'agent',
        created_at: timestamp
      })

      scrollToBottom()
    } catch (err) {
      console.error('Failed to send message:', err)
      toast.error('Failed to send message', {
        description: 'Please try again',
        duration: 4000,
        closeButton: true
      })
    }
  }

  const handleTakeover = async () => {
    try {
      isLoading.value = true
      await chatService.takeoverChat(chat.value.session_id)
      
      // Show success toast
      toast.success('Chat taken over successfully', {
        description: 'You can now send messages in this chat',
        duration: 4000,
        closeButton: true
      })
      const userName = userService.getUserName()
      const userId = userService.getUserId()

      // Update local chat state
      chat.value = {
        ...chat.value,
        status: 'open',
        user_id: userId,
        user_name: userName
      }

      socketService.emit('taken_over', { session_id: chat.value.session_id, user_name: userName, profile_picture: userService.getCurrentUser()?.profile_pic ? userService.getCurrentUser()?.profile_pic : '' })
      
      // Emit refresh event to update chat status
      emit('refresh')
      // Also emit chatUpdated event to ensure the parent component updates
      emit('chatUpdated', chat.value)
    } catch (err: any) {
      console.error('Failed to takeover chat:', err)
      
      // Show error toast with specific message if available
      toast.error('Failed to take over chat', {
        description: err.response?.data?.detail || 'Please try again',
        duration: 4000,
        closeButton: true
      })
    } finally {
      isLoading.value = false
    }
  }

  // Add endChat function
  const endChat = async (requestRating = true) => {
    try {
      isLoading.value = true

      // Only the web widget can render a rating; on external channels the ask
      // is dropped and the closing message says nothing about rating.
      const askRating = requestRating && canRequestRating(chat.value.channel)

      // Create end chat message
      const timestamp = new Date().toISOString()
      const endChatMessage = {
        message: endChatMessageFor(chat.value.channel),
        message_type: "system",
        created_at: timestamp,
        session_id: chat.value.session_id,
        end_chat: true,
        request_rating: askRating,
        end_chat_reason: "AGENT_REQUEST",
        end_chat_description: "Agent manually ended the chat"

      }

      // Add message locally
      chat.value.messages.push(endChatMessage)

      // Update chat status locally
      chat.value.status = 'closed'
      chat.value.updated_at = timestamp

      // Emit message through socket to end chat
      socketService.emit('agent_message', {
        message: endChatMessage.message,
        session_id: chat.value.session_id,
        message_type: endChatMessage.message_type,
        created_at: timestamp,
        end_chat: true,
        request_rating: askRating,
        end_chat_reason: "AGENT_REQUEST",
        end_chat_description: "Agent manually ended the chat"
      })

      // Show success toast
      toast.success('Chat ended successfully', {
        description: askRating ? 'Customer will be asked for feedback' : 'Chat has been closed',
        duration: 4000,
        closeButton: true
      })
      
      // Emit refresh event to update chat status
      emit('refresh')
      emit('chatUpdated', chat.value)
      
      scrollToBottom()
    } catch (err) {
      console.error('Failed to end chat:', err)
      toast.error('Failed to end chat', {
        description: 'Please try again',
        duration: 4000,
        closeButton: true
      })
    } finally {
      isLoading.value = false
    }
  }

  // Mark the message this failure belongs to. It was pushed optimistically and
  // has no id yet, so it is matched as the newest agent message not already
  // marked — the one that was just sent. The backend stamps the stored row too,
  // so a later refetch carries the real reason.
  const markLatestAgentMessageUndelivered = () => {
    for (let i = chat.value.messages.length - 1; i >= 0; i--) {
      const message = chat.value.messages[i]
      if (message.message_type !== 'agent' || message.attributes?.delivery_status) continue
      message.attributes = { ...message.attributes, delivery_status: 'failed' }
      return
    }
  }

  // On external channels a send can fail after the message is already stored
  // (typically once WhatsApp's 24h window closes). Without this the agent sees
  // their message sitting in the thread and assumes it arrived.
  const handleDeliveryError = (data: DeliveryErrorEvent) => {
    if (data?.type !== 'delivery_error' || data.session_id !== chat.value.session_id) return
    markLatestAgentMessageUndelivered()
    if (data.can_template) templateCanReopen.value = true
    toast.error('Message not delivered', {
      description: data.error,
      duration: 6000,
      closeButton: true
    })
  }

  const setupSocketListeners = () => {
    socketService.on('error', handleDeliveryError)
  }

  const cleanupSocketListeners = () => {
    socketService.off('error', handleDeliveryError)
  }

  const handleSocketReconnect = () => {
    cleanupSocketListeners()
    setupSocketListeners()
  }

  onMounted(() => {
    setupSocketListeners()
    socketService.onReconnect(handleSocketReconnect)
  })

  onBeforeUnmount(() => {
    cleanupSocketListeners()
    socketService.offReconnect(handleSocketReconnect)
  })

  const formattedMessages = computed(() => {
    const formatted = chat.value.messages.map(msg => ({
      ...msg,
      timeAgo: formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })
    }))
    
    // Debug: Log messages with attachments
    formatted.forEach((msg, idx) => {
      if (msg.attachments && msg.attachments.length > 0) {
        console.log(`[Message ${idx}] Has ${msg.attachments.length} attachments:`, msg.attachments)
      }
    })
    
    return formatted
  })

  return {
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
    endChat,
    templateCanReopen,
    clearTemplateSuggestion
  }
} 