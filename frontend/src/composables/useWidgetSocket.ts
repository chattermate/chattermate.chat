import { ref } from 'vue'
import { io, Socket } from 'socket.io-client'
import type { Customer, SocketError } from '../types/widget'
import { getErrorMessage } from '../types/widget'
import { widgetEnv } from '../webclient/widget-env'
import type { Message } from '@/types/chat'

type ConnectionStatus = 'connected' | 'connecting' | 'failed'

export function useWidgetSocket() {
    const messages = ref<Message[]>([])
    const loading = ref(false)
    const errorMessage = ref('')
    const showError = ref(false)
    const loadingHistory = ref(false)
    const hasStartedChat = ref(false)
    const connectionStatus = ref<ConnectionStatus>('connecting')
    const retryCount = ref(0)
    const MAX_RETRIES = 5
    const customer = ref<Customer>({})

    let socket: Socket | null = null
    let onTakeoverCallback: ((data: { session_id: string, user_name: string }) => void) | null = null

    const initializeSocket = (sessionId: string) => {
        const token = localStorage.getItem('ctid');
        
        socket = io(`${widgetEnv.WS_URL}/widget`, {
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: MAX_RETRIES,
            reconnectionDelay: 1000,
            auth: token ? {
                conversation_token: token
            } : undefined
        })

        // Set up event listeners
        socket.on('connect', () => {
            connectionStatus.value = 'connected'
            retryCount.value = 0
        })

        socket.on('disconnect', () => {
            if (connectionStatus.value === 'connected') {
                connectionStatus.value = 'connecting'
            }
        })

        socket.on('connect_error', () => {
            retryCount.value++
            console.error('Socket connection failed, attempt:', retryCount.value)
            if (retryCount.value >= MAX_RETRIES) {
                connectionStatus.value = 'failed'
            }
        })

        socket.on('chat_response', (data) => {
            if (data.type === 'agent_message') {
                messages.value.push({
                    message: data.message,
                    message_type: 'agent',
                    created_at: new Date().toISOString(),
                    session_id: '',
                    agent_name: data.agent_name
                })
            } else {
                messages.value.push({
                    message: data.message,
                    message_type: 'bot',
                    created_at: new Date().toISOString(),
                    session_id: '',
                    agent_name: data.agent_name
                })
            }
            loading.value = false
        })

        socket.on('handle_taken_over', (data: { session_id: string, user_name: string, profile_picture?: string }) => {
            // Add system message for takeover
            messages.value.push({
                message: `${data.user_name} joined the conversation`,
                message_type: 'system',
                created_at: new Date().toISOString(),
                session_id: data.session_id
            })

            // Update customer info with agent details
            customer.value = {
                ...customer.value,
                agent_name: data.user_name,
                agent_profile_pic: data.profile_picture
            }

            // Call the callback if registered
            if (onTakeoverCallback) {
                onTakeoverCallback(data)
            }
        })

        socket.on('error', handleError)
        socket.on('chat_history', handleChatHistory)

        return socket
    }

    const connect = async (): Promise<boolean> => {
        try {
            connectionStatus.value = 'connecting'
            retryCount.value = 0

            // Cleanup existing socket if any
            if (socket) {
                socket.removeAllListeners()
                socket.disconnect()
                socket = null
            }

            socket = initializeSocket('')

            return new Promise((resolve) => {
                socket?.on('connect', () => {
                    resolve(true)
                })

                socket?.on('connect_error', () => {
                    if (retryCount.value >= MAX_RETRIES) {
                        resolve(false)
                    }
                })
            })
        } catch (error) {
            console.error('Socket initialization failed:', error)
            connectionStatus.value = 'failed'
            return false
        }
    }

    // Manual reconnect function
    const reconnect = () => {
        if (socket) {
            socket.disconnect()
        }
        return connect()
    }

    // Register takeover callback
    const onTakeover = (callback: (data: { session_id: string, user_name: string }) => void) => {
        onTakeoverCallback = callback
    }

    // Socket event handlers
    const handleError = (error: any) => {
        loading.value = false
        errorMessage.value = getErrorMessage(error as SocketError)
        showError.value = true
        
        // Hide error after 5 seconds
        setTimeout(() => {
            showError.value = false
            errorMessage.value = ''
        }, 5000)
    }

    const handleChatHistory = (data: {
        type: string;
        messages: Message[];
    }) => {
        if (data.type === 'chat_history' && Array.isArray(data.messages)) {
            const historyMessages = data.messages.map((msg: Message) => ({
                message: msg.message,
                message_type: msg.message_type as "assistant" | "user" | "error" | "bot" | "agent" | "system",
                created_at: msg.created_at,
                attributes: msg.attributes || {},
                session_id: '',
                agent_name: msg.agent_name || '',
                user_name: msg.user_name || ''
            }))

            messages.value = [
                ...historyMessages.filter(newMsg => 
                    !messages.value.some(existingMsg => 
                        existingMsg.message === newMsg.message && 
                        existingMsg.message_type === newMsg.message_type
                    )
                ),
                ...messages.value
            ]
        }
    }

    // Send message function
    const sendMessage = async (newMessage: string, email: string) => {
        if (!socket || !newMessage.trim()) return
        if(!customer.value.full_name) 
           loading.value = true
        messages.value.push({
            message: newMessage,
            message_type: 'user',
            created_at: new Date().toISOString(),
            session_id: ''
        })

        socket.emit('chat', {
            message: newMessage,
            email: email
        })

        hasStartedChat.value = true
    }

    // Chat history functions
    const loadChatHistory = async () => {
        if (!socket) return

        try {
            loadingHistory.value = true
            socket.emit('get_chat_history')
        } catch (error) {
            console.error('Failed to load chat history:', error)
        } finally {
            loadingHistory.value = false
        }
    }

    const cleanup = () => {
        if (socket) {
            socket.removeAllListeners()
            socket.disconnect()
            socket = null
        }
        onTakeoverCallback = null
    }

    return {
        messages,
        loading,
        errorMessage,
        showError,
        loadingHistory,
        hasStartedChat,
        connectionStatus,
        sendMessage,
        loadChatHistory,
        connect,
        reconnect,
        cleanup,
        customer,
        onTakeover
    }
} 