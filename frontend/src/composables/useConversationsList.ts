import { ref, computed, watch, onMounted, onBeforeUnmount, reactive } from 'vue'
import type { Conversation, ChatDetail, Message } from '@/types/chat'
import { formatDistanceToNow } from 'date-fns'
import { chatService } from '@/services/chat'
import { socketService } from '@/services/socket'
import { userService } from '@/services/user'

export function useConversationsList(props: {
  conversations: Conversation[]
  loading: boolean
  error: string
  hasMore?: boolean
  loadingMore?: boolean
}, emit: {
  (e: 'refresh'): void
  (e: 'chatUpdated', data: ChatDetail): void
  (e: 'clearUnread', sessionId: string): void
  (e: 'updateFilter', status: 'open' | 'closed'): void
  (e: 'loadMore'): void
}) {
  const selectedChat = ref<ChatDetail | null>(null)
  const selectedId = ref<string | null>(null)
  const chatLoading = ref<boolean>(false)
  const currentUserId = ref(userService.getUserId())
  const unreadMessages = reactive<Record<string, number>>({})
  const processedMessages = reactive<Set<string>>(new Set())

  // Socket event handlers
  const handleChatReply = (data: {
    message: string
    type: string
    agent_name?: string
    created_at: string
    session_id: string
    attributes?: any
    attachments?: any[]
  }) => {
    // Create unique message identifier
    const messageKey = `${data.session_id}-${data.created_at}`;
    // Skip if already processed
    if (processedMessages.has(messageKey)) return;
    processedMessages.add(messageKey);

    // Add unread counter if not current chat
    if (selectedId.value !== data.session_id) {
      if (!unreadMessages[data.session_id]) {
        unreadMessages[data.session_id] = 0
      }
      unreadMessages[data.session_id]++
    }

    if (selectedChat.value && selectedId.value === data.session_id) {
      // Ensure created_at is a valid ISO string
      const created_at = new Date(data.created_at).toISOString()

      // Base message structure
      const newMessage: Message = {
        message: data.message,
        message_type: data.type === 'agent_message' ? 'agent' : data.type,
        created_at,
        session_id: data.session_id,
        attributes: data.attributes || {},
        agent_name: data.agent_name,
        attachments: data.attachments || undefined
      }

      // Check if message has Shopify data in attributes
      if (data.attributes?.shopify_output && typeof data.attributes.shopify_output === 'object') {
        newMessage.message_type = 'product'
        newMessage.shopify_output = data.attributes.shopify_output
      }

      // Create a completely new chat object with all properties
      const updatedChat: ChatDetail = {
        ...selectedChat.value,
        messages: [...(selectedChat.value.messages || []), newMessage],
        updated_at: created_at,
        customer: { ...selectedChat.value.customer },
        agent: { ...selectedChat.value.agent },
        status: selectedChat.value.status,
        user_id: selectedChat.value.user_id,
        user_name: selectedChat.value.user_name,
        session_id: selectedChat.value.session_id,
      }

      // Use Promise.resolve().then() to break the reactive chain
      // This prevents the recursive update error by deferring the state update
      Promise.resolve().then(() => {
        // Update the selected chat with the new object
        selectedChat.value = updatedChat
        
        // Emit chat update event in a separate tick
        Promise.resolve().then(() => {
          emit('chatUpdated', updatedChat)
        })
      })
    }
  }

  const handleRoomEvent = (data: unknown) => {
    console.log('Room event received:', data)
    // You can handle join/leave events here if needed
  }

  const setupSocketListeners = () => {

    socketService.on('chat_reply', handleChatReply)
    socketService.on('room_event', handleRoomEvent)
  }

  const cleanupSocketListeners = () => {

    socketService.off('chat_reply', handleChatReply)
    socketService.off('room_event', handleRoomEvent)
  }

  // Handle socket reconnection
  const handleSocketReconnect = () => {
    console.log('Socket reconnected, re-establishing listeners and room')
    cleanupSocketListeners()
    setupSocketListeners()
    
    // Rejoin room if necessary

    const userId = userService.getUserId()
    if (userId) {
      socketService.emit('join_room', { session_id: `user_${userId}` })
    }
  }

 

  const loadChatDetail = async (sessionId: string) => {
    try {
      // Only load full chat detail if it's a new chat or not loaded yet
      if (!selectedChat.value || selectedChat.value.session_id !== sessionId) {
        chatLoading.value = true
        selectedId.value = sessionId
        const detail = await chatService.getChatDetail(sessionId)
        
        // Debug: Log if messages have attachments
        if (detail && detail.messages) {
          detail.messages.forEach((msg, idx) => {
            if (msg.attachments && msg.attachments.length > 0) {
              console.log(`[API Response] Message ${idx} has ${msg.attachments.length} attachments`)
            }
          })
        }
        
        selectedChat.value = detail
        
        // Clear unread messages for this chat
        if (unreadMessages[sessionId]) {
          delete unreadMessages[sessionId]
          emit('clearUnread', sessionId)
        }
      }
    } catch (err) {
      console.error('Failed to load chat:', err)
    } finally {
      chatLoading.value = false
    }
  }

  // Watch for conversations changes and load first conversation
  watch(() => props.conversations, (newConversations) => {
    if (newConversations.length > 0 && !selectedId.value) {
      // Use Promise.resolve().then() to break the reactive chain
      // This prevents the recursive update error
      Promise.resolve().then(() => {
        if (!selectedId.value) {
         // loadChatDetail(newConversations[0].session_id)
        }
      })
    }
  }, { immediate: true })

  const formattedConversations = computed(() => {
    // Ensure conversations is an array before mapping
    if (!Array.isArray(props.conversations)) {
      return []
    }
    
    return props.conversations.map(conv => ({
      ...conv,
      timeAgo: formatDistanceToNow(new Date(conv.updated_at), { addSuffix: true }),
      message_type: conv.attributes?.message_type || 'text',
      shopify_output: conv.attributes?.shopify_output
    }))
  })

  // Connect to socket and setup listeners on mount
  onMounted(() => {
    console.log('Connecting to socket')
    socketService.connect()
    setupSocketListeners()
    socketService.onReconnect(handleSocketReconnect)
    
    // Join user-specific room
    const userId = userService.getUserId()
    if (userId) {
      socketService.emit('join_room', { session_id: `user_${userId}` })
    }
  })

  // Cleanup on unmount
  onBeforeUnmount(() => {
    console.log('Disconnecting from socket')
    const userId = userService.getUserId()
    if (userId) {
      socketService.emit('leave_room', { session_id: `user_${userId}` })
    }
    cleanupSocketListeners()
    socketService.offReconnect(handleSocketReconnect)
  })

  // Add method to clear unreads
  const clearUnread = (sessionId: string) => {
    delete unreadMessages[sessionId]
  }

  return {
    selectedChat,
    selectedId,
    chatLoading,
    formattedConversations,
    loadChatDetail,
    unreadMessages,
    clearUnread
  }
} 