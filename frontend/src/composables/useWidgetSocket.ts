import { ref } from 'vue'
import { io, Socket } from 'socket.io-client'
import type { HumanAgent, SocketError } from '../types/widget'
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
    const humanAgent = ref<HumanAgent>({})
    const currentForm = ref<any>(null)
    const currentSessionId = ref<string>('')

    let socket: Socket | null = null
    let onTakeoverCallback: ((data: { session_id: string, user_name: string }) => void) | null = null
    let onWorkflowStateCallback: ((data: any) => void) | null = null
    let onWorkflowProceededCallback: ((data: any) => void) | null = null

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
                console.log('Socket disconnected, setting connection status to connecting')
                connectionStatus.value = 'connecting'
            }
        })

        socket.on('connect_error', () => {
            retryCount.value++
            console.error('Socket connection failed, attempt:', retryCount.value, 'connection status:', connectionStatus.value)
            if (retryCount.value >= MAX_RETRIES) {
               
                connectionStatus.value = 'failed'
            }
        })

        socket.on('chat_response', (data) => {
            loading.value = false // Stop loading indicator first
            
            // Capture session_id from response for file attachments
            if (data.session_id) {
                console.log('Captured session_id from chat_response:', data.session_id)
                currentSessionId.value = data.session_id
            } else {
                console.warn('No session_id in chat_response data:', data)
            }

            if (data.type === 'agent_message') {
                // Handle human agent messages
                const agentMessage: any = {
                    message: data.message,
                    message_type: 'agent',
                    created_at: new Date().toISOString(),
                    session_id: '',
                    agent_name: data.agent_name,
                    attributes: {
                        end_chat: data.end_chat,
                        end_chat_reason: data.end_chat_reason,
                        end_chat_description: data.end_chat_description,
                        request_rating: data.request_rating
                    }
                }
                
                // Add attachments if present
                if (data.attachments && Array.isArray(data.attachments)) {
                    agentMessage.id = data.message_id
                    agentMessage.attachments = data.attachments.map((att: any, idx: number) => ({
                        id: data.message_id * 1000 + idx,
                        filename: att.filename,
                        file_url: att.file_url,
                        content_type: att.content_type,
                        file_size: att.file_size
                    }))
                }
                
                messages.value.push(agentMessage)
            // UPDATED CHECK: Look for the shopify_output object and products array
            } else if (data.shopify_output && typeof data.shopify_output === 'object' && data.shopify_output.products) {
                // Handle structured Shopify product data
                messages.value.push({
                    message: data.message, // Keep the accompanying text message
                    message_type: 'product', // Use 'product' type for rendering
                    created_at: new Date().toISOString(),
                    session_id: '', 
                    agent_name: data.agent_name,
                    // Assign the whole structured object
                    shopify_output: data.shopify_output, 
                    // Remove the old flattened fields (product_id, product_title, etc.)
                    attributes: { // Keep other attributes if needed
                         end_chat: data.end_chat,
                         request_rating: data.request_rating
                    }
                })
            } else {
                // Handle regular bot messages (without Shopify data)
                messages.value.push({
                    message: data.message,
                    message_type: 'bot',
                    created_at: new Date().toISOString(),
                    session_id: '',
                    agent_name: data.agent_name,
                    attributes: {
                        end_chat: data.end_chat,
                        end_chat_reason: data.end_chat_reason,
                        end_chat_description: data.end_chat_description,
                        request_rating: data.request_rating
                    }
                })
            }
            // loading.value = false // Moved to the top
        })

        socket.on('handle_taken_over', (data: { session_id: string, user_name: string, profile_picture?: string }) => {
            // Add system message for takeover
            messages.value.push({
                message: `${data.user_name} joined the conversation`,
                message_type: 'system',
                created_at: new Date().toISOString(),
                session_id: data.session_id
            })

            
            humanAgent.value = {
                ...humanAgent.value,
                human_agent_name: data.user_name,
                human_agent_profile_pic: data.profile_picture
            }

            // Call the callback if registered
            if (onTakeoverCallback) {
                onTakeoverCallback(data)
            }
        })

        socket.on('error', handleError)
        socket.on('chat_history', handleChatHistory)
        socket.on('rating_submitted', handleRatingSubmitted)
        socket.on('display_form', handleDisplayForm)
        socket.on('form_submitted', handleFormSubmitted)
        socket.on('workflow_state', handleWorkflowState)
        socket.on('workflow_proceeded', handleWorkflowProceeded)

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

    // Register workflow state callback
    const onWorkflowState = (callback: (data: any) => void) => {
        onWorkflowStateCallback = callback
    }

    // Register workflow proceeded callback
    const onWorkflowProceeded = (callback: (data: any) => void) => {
        onWorkflowProceededCallback = callback
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
            const historyMessages = data.messages.map((msg: Message) => {
                // Base message structure
                const messageObj = {
                    message: msg.message,
                    message_type: msg.message_type as "assistant" | "user" | "error" | "bot" | "agent" | "system" | "product",
                    created_at: msg.created_at,
                    session_id: '',
                    agent_name: msg.agent_name || '',
                    user_name: msg.user_name || '',
                    attributes: msg.attributes || {},
                    attachments: msg.attachments || [] // Include attachments
                }

                // Check if message has Shopify data in attributes
                if (msg.attributes?.shopify_output && typeof msg.attributes.shopify_output === 'object') {
                    return {
                        ...messageObj,
                        message_type: 'product',
                        shopify_output: msg.attributes.shopify_output
                    }
                }

                return messageObj
            })

            messages.value = [
                ...historyMessages.filter(newMsg => 
                    !messages.value.some(existingMsg => 
                        existingMsg.message === newMsg.message && 
                        existingMsg.created_at === newMsg.created_at
                    )
                ),
                ...messages.value
            ]
        }
    }

    // Add rating submission handler
    const handleRatingSubmitted = (data: { success: boolean, message: string }) => {
        if (data.success) {
            messages.value.push({
                message: 'Thank you for your feedback!',
                message_type: 'system',
                created_at: new Date().toISOString(),
                session_id: ''
            })
        }
    }


    // Form display handler
    const handleDisplayForm = (data: { form_data: any, session_id: string }) => {
        console.log('Form display handler in composable:', data)
        loading.value = false
        currentForm.value = data.form_data
        console.log('Set currentForm in handleDisplayForm:', currentForm.value)
        
        // Check if this is a full screen form
        if (data.form_data?.form_full_screen === true) {
            console.log('Full screen form detected, triggering workflow state callback')
            // Trigger workflow state callback for full screen forms
            if (onWorkflowStateCallback) {
                onWorkflowStateCallback({
                    type: 'form',
                    form_data: data.form_data,
                    session_id: data.session_id
                })
            }
        } else {
            // Add form message to chat for regular forms
            messages.value.push({
                message: '',
                message_type: 'form',
                created_at: new Date().toISOString(),
                session_id: data.session_id,
                attributes: {
                    form_data: data.form_data
                }
            })
        }
    }

    // Form submission confirmation handler
    const handleFormSubmitted = (data: { success: boolean, message: string }) => {
        console.log('Form submitted confirmation received, clearing currentForm')
        currentForm.value = null
        if (data.success) {
            // Success message will come through regular chat_response
            console.log('Form submitted successfully')
        }
    }

    // Workflow state handler
    const handleWorkflowState = (data: any) => {
        console.log('Workflow state received in composable:', data)
        
        // Set currentForm for form states to ensure submission works
        if (data.type === 'form' || data.type === 'display_form') {
            console.log('Setting currentForm from workflow state:', data.form_data)
            currentForm.value = data.form_data
        }
        
        if (onWorkflowStateCallback) {
            onWorkflowStateCallback(data)
        }
    }

    // Workflow proceeded handler
    const handleWorkflowProceeded = (data: { success: boolean }) => {
        console.log('Workflow proceeded in composable:', data)
        if (onWorkflowProceededCallback) {
            onWorkflowProceededCallback(data)
        }
    }

    // Add rating submission function
    const submitRating = async (rating: number, feedback?: string) => {
        if (!socket || !rating) return
        
        socket.emit('submit_rating', {
            rating,
            feedback
        })
    }

    // Form submission function
    const submitForm = async (formData: Record<string, any>) => {
        console.log('Submitting form in socket:', formData)
        console.log('Current form in socket:', currentForm.value)
        console.log('Socket in socket:', socket)
        
        if (!socket) {
            console.error('No socket available for form submission')
            return
        }
        
        // Allow submission even if currentForm.value is null, as long as we have form data
        if (!formData || Object.keys(formData).length === 0) {
            console.error('No form data to submit')
            return
        }
        
        console.log('Emitting submit_form event with data:', formData)
        socket.emit('submit_form', {
            form_data: formData
        })
        
        // Clear current form after submission
        currentForm.value = null
    }

    // Get workflow state function
    const getWorkflowState = async () => {
        if (!socket) return
        console.log('Getting workflow state 12')
        socket.emit('get_workflow_state')
    }

    // Proceed workflow function
    const proceedWorkflow = async () => {
        if (!socket) return
        
        socket.emit('proceed_workflow', {})
    }

    // Send message function
    const sendMessage = async (newMessage: string, email: string, files: Array<{content: string, filename: string, content_type: string, size: number}> = []) => {
        if (!socket || (!newMessage.trim() && files.length === 0)) return
        
        if(!humanAgent.value.human_agent_name) 
           loading.value = true
        
        // Add user message to display with temporary blob URLs for images
        const userMessage: any = {
            message: newMessage,
            message_type: 'user',
            created_at: new Date().toISOString(),
            session_id: ''
        }
        
        // Add temporary attachments for immediate display (will be replaced with real URLs from backend)
        if (files.length > 0) {
            userMessage.attachments = files.map((file, idx) => {
                // Create temporary blob URL for images
                let tempUrl = ''
                if (file.content_type.startsWith('image/')) {
                    // Convert base64 to blob URL for immediate display
                    const byteCharacters = atob(file.content)
                    const byteNumbers = new Array(byteCharacters.length)
                    for (let i = 0; i < byteCharacters.length; i++) {
                        byteNumbers[i] = byteCharacters.charCodeAt(i)
                    }
                    const byteArray = new Uint8Array(byteNumbers)
                    const blob = new Blob([byteArray], { type: file.content_type })
                    tempUrl = URL.createObjectURL(blob)
                }
                
                return {
                    id: Date.now() * 1000 + idx, // Temporary ID
                    filename: file.filename,
                    file_url: tempUrl, // Temporary blob URL, will be replaced
                    content_type: file.content_type,
                    file_size: file.size,
                    _isTemporary: true // Flag to identify temporary attachments
                }
            })
        }
        
        messages.value.push(userMessage)

        // Emit to socket WITH files (files will be uploaded on backend)
        socket.emit('chat', {
            message: newMessage,
            email: email,
            files: files  // Send files with base64 content
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
        onWorkflowStateCallback = null
        onWorkflowProceededCallback = null
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
        humanAgent,
        onTakeover,
        submitRating,
        currentForm,
        submitForm,
        getWorkflowState,
        proceedWorkflow,
        onWorkflowState,
        onWorkflowProceeded,
        currentSessionId
    }
} 