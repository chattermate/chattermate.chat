import { ref, computed, watch, nextTick } from 'vue'
import type { ChatDetail, Message } from '@/types/chat'
import { formatDistanceToNow } from 'date-fns'
import { chatService } from '@/services/chat'
import { userService } from '@/services/user'
import { socketService } from '@/services/socket'
import { toast } from 'vue-sonner'

// Define valid chat statuses
type ChatStatus = 'open' | 'closed' | 'transferred'

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

  const showTakeoverButton = computed(() => {
    // Show takeover button if:
    // 1. Chat is transferred
    // 2. No user has taken over yet OR the current user is not the one who took over
    // 3. Chat is not closed
    return (
      chat.value.status === 'transferred' && 
      (!chat.value.user_id || chat.value.user_id !== currentUserId) &&
      !isChatClosed.value
    )
  })

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
    //await nextTick()
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  }

  // Watch for changes in messages and scroll to bottom
  watch(() => chat.value.messages, () => {
    scrollToBottom()
  }, { deep: true })

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
      
      // Create end chat message
      const timestamp = new Date().toISOString()
      const endChatMessage = {
        message: "Thank you for contacting us. Do you mind rating our service?",
        message_type: "system",
        created_at: timestamp,
        session_id: chat.value.session_id,
        end_chat: true,
        request_rating: requestRating,
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
        request_rating: requestRating,
        end_chat_reason: "AGENT_REQUEST",
        end_chat_description: "Agent manually ended the chat"
      })
      
      // Show success toast
      toast.success('Chat ended successfully', {
        description: requestRating ? 'Customer will be asked for feedback' : 'Chat has been closed',
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
    endChat
  }
} 