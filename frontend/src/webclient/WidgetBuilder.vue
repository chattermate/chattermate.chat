<!--
ChatterMate - Widget Builder
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
// @ts-nocheck
import { ref, onMounted, computed, onUnmounted, watch, nextTick } from 'vue'
import {
    isValidEmail} from '../types/widget'
import { marked } from 'marked'
import { widgetEnv } from './widget-env'
import { useWidgetStyles } from '../composables/useWidgetStyles'
import { useWidgetFiles } from '../composables/useWidgetFiles'
import { useWidgetSocket } from '../composables/useWidgetSocket'
import { useWidgetCustomization } from '../composables/useWidgetCustomization'
import { formatDistanceToNow } from 'date-fns'
// Add marked configuration before the props definition
marked.setOptions({
    renderer: new marked.Renderer(),
    gfm: true,
    breaks: true
})

// Configure marked renderer to add target="_blank" to links
const renderer = new marked.Renderer();
const linkRenderer = renderer.link;
// @ts-ignore
renderer.link = (href, title, text) => {
    // @ts-ignore
    const html = linkRenderer.call(renderer, href, title, text);
    return html.replace(/^<a /, '<a target="_blank" rel="nofollow" ');
};

marked.use({ renderer })

const props = defineProps<{
    widgetId?: string | null
}>()

// Get widget ID from props or initial data
const widgetId = computed(() => props.widgetId || window.__INITIAL_DATA__?.widgetId)

const {
    customization,
    agentName,
    applyCustomization,
    initializeFromData
} = useWidgetCustomization()

const {
    messages,
    loading,
    errorMessage,
    showError,
    loadingHistory,
    hasStartedChat,
    connectionStatus,
    sendMessage: socketSendMessage,
    sendFileAttachments,
    loadChatHistory,
    connect,
    reconnect,
    cleanup,
    humanAgent,
    onTakeover,
    submitRating: socketSubmitRating,
    submitForm,
    currentForm,
    getWorkflowState,
    proceedWorkflow,
    onWorkflowState,
    onWorkflowProceeded,
    currentSessionId
} = useWidgetSocket()

const newMessage = ref('')
const isExpanded = ref(true)
const emailInput = ref('')
const hasConversationToken = ref(false)

// Handle input synchronization
const handleInputSync = (event: Event) => {
    const target = event.target as HTMLInputElement
    newMessage.value = target.value
}



// MutationObserver to detect DOM changes and re-setup listeners
let domObserver: MutationObserver | null = null

const setupDOMObserver = () => {
    if (domObserver) {
        domObserver.disconnect()
    }

    domObserver = new MutationObserver((mutations) => {
        let shouldResetup = false
        let hasNewInputFields = false

        mutations.forEach((mutation) => {
            // Check if input fields were added/removed
            if (mutation.type === 'childList') {
                const addedInputs = Array.from(mutation.addedNodes).some(node =>
                    node.nodeType === Node.ELEMENT_NODE &&
                    ((node as Element).matches('input, textarea') ||
                    (node as Element).querySelector?.('input, textarea'))
                )

                const removedInputs = Array.from(mutation.removedNodes).some(node =>
                    node.nodeType === Node.ELEMENT_NODE &&
                    ((node as Element).matches('input, textarea') ||
                    (node as Element).querySelector?.('input, textarea'))
                )

                if (addedInputs) {
                    hasNewInputFields = true
                    shouldResetup = true
                }

                if (removedInputs) {
                    shouldResetup = true
                }
            }
        })

        if (shouldResetup) {
            // Debounce to avoid excessive calls
            clearTimeout(setupDOMObserver.timeoutId)
            setupDOMObserver.timeoutId = setTimeout(() => {
                setupNativeEventListeners()
            }, hasNewInputFields ? 50 : 100) // Faster setup for new inputs
        }
    })

    // Observe the widget container for changes
    const widgetContainer = document.querySelector('.widget-container') || document.body
    domObserver.observe(widgetContainer, {
        childList: true,
        subtree: true
    })
}

// Add timeout ID property to the function for debouncing
setupDOMObserver.timeoutId = null

// Keep track of current input fields for cleanup
let currentInputFields: HTMLElement[] = []

// Setup native DOM event listeners as fallback
const setupNativeEventListeners = () => {
    // Clean up existing listeners first
    cleanupNativeEventListeners()

    // Try multiple selectors to find input fields
    const selectors = [
        '.widget-container input[type="text"]',
        '.chat-container input[type="text"]',
        '.message-input input',
        '.welcome-message-field',
        '.ask-anything-field',
        'input[placeholder*="message"]',
        'input[placeholder*="Type"]',
        'input[placeholder*="Ask"]',
        'input.message-input',
        'textarea',
        // More specific selectors for the widget context
        '.widget-container input',
        '.chat-input input',
        'input'
    ]

    let inputFields = []
    for (const selector of selectors) {
        const fields = document.querySelectorAll(selector)
        if (fields.length > 0) {
            inputFields = Array.from(fields)
            break
        }
    }

    if (inputFields.length === 0) {
        return
    }

    // Store reference for cleanup
    currentInputFields = inputFields

    inputFields.forEach((input) => {
        // Add native event listeners
        input.addEventListener('input', handleNativeInput, true)
        input.addEventListener('keyup', handleNativeInput, true)
        input.addEventListener('change', handleNativeInput, true)
        input.addEventListener('keypress', handleNativeKeyPress, true)
        input.addEventListener('keydown', handleNativeKeyDown, true)
    })
}

// Clean up native event listeners
const cleanupNativeEventListeners = () => {
    currentInputFields.forEach((input) => {
        input.removeEventListener('input', handleNativeInput)
        input.removeEventListener('keyup', handleNativeInput)
        input.removeEventListener('change', handleNativeInput)
        input.removeEventListener('keypress', handleNativeKeyPress)
        input.removeEventListener('keydown', handleNativeKeyDown)
    })
    currentInputFields = []
}

// Native input handler that bypasses Vue
const handleNativeInput = (event: Event) => {
    const target = event.target as HTMLInputElement
    newMessage.value = target.value
}

// Native keyboard event handlers
const handleNativeKeyPress = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault()
        event.stopPropagation()
        sendMessage()
    }
}

const handleNativeKeyDown = (event: KeyboardEvent) => {
    // Also handle keydown as a fallback for some browsers/contexts
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault()
        event.stopPropagation()
        sendMessage()
    }
}



// Add loading state
const isInitializing = ref(true)

// Add these to the script setup section after the imports
const TOKEN_KEY = 'ctid'
// @ts-ignore
const token = ref(window.__INITIAL_DATA__?.initialToken || localStorage.getItem(TOKEN_KEY))
const hasToken = computed(() => !!token.value)

// Initialize from initial data
initializeFromData()
const initialData = window.__INITIAL_DATA__

if (initialData?.initialToken) {
    token.value = initialData.initialToken
    // Notify parent window to store token
    window.parent.postMessage({
        type: 'TOKEN_UPDATE',
        token: initialData.initialToken
    }, '*')
    hasConversationToken.value = true
}

// Initialize allowAttachments from __INITIAL_DATA__
const allowAttachments = ref(false)
if (initialData?.allowAttachments !== undefined) {
    allowAttachments.value = initialData.allowAttachments
}

// Add after socket initialization
const messagesContainer = ref<HTMLElement | null>(null)

// Computed styles
const {
    chatStyles,
    chatIconStyles,
    agentBubbleStyles,
    userBubbleStyles,
    messageNameStyles,
    headerBorderStyles,
    photoUrl,
    shadowStyle
} = useWidgetStyles(customization)

// File input ref - must be defined before useWidgetFiles
const fileInputRef = ref<HTMLInputElement | null>(null)

// File handling functionality
const {
    uploadedAttachments,
    previewModal,
    previewFile,
    formatFileSize,
    isImageAttachment,
    getDownloadUrl,
    getPreviewUrl,
    handleFileSelect,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    handlePaste,
    uploadFiles,
    removeAttachment,
    openPreview,
    closePreview,
    openFilePicker,
    isImage
} = useWidgetFiles(token, fileInputRef)

// Check if there's an active form being displayed
const hasActiveForm = computed(() => {
    return messages.value.some(message =>
        message.message_type === 'form' &&
        (!message.isSubmitted || message.isSubmitted === false)
    )
})

// Update the computed property for message input enabled state
const isMessageInputEnabled = computed(() => {
    // If we already have a conversation started, allow input
    if (hasStartedChat.value && hasConversationToken.value) {

        return connectionStatus.value === 'connected' && !loading.value
    }

    // For ASK_ANYTHING style, don't require email
    if (isAskAnythingStyle.value) {

        return connectionStatus.value === 'connected' && !loading.value
    }



    return (isValidEmail(emailInput.value.trim()) &&
           connectionStatus.value === 'connected' && !loading.value)  || window.__INITIAL_DATA__?.workflow
})

const placeholderText = computed(() => {
    return connectionStatus.value === 'connected' ? (isAskAnythingStyle.value ? 'Ask me anything...' : 'Type a message...') : 'Connecting...'
})

// Update the sendMessage function
const sendMessage = async () => {
    if (!newMessage.value.trim() && uploadedAttachments.value.length === 0) return

    // If first message, fetch customization with email first
    if (!hasStartedChat.value && emailInput.value) {
        await checkAuthorization()
    }

    // Prepare files for upload (convert to format expected by backend)
    const files = uploadedAttachments.value.map(file => ({
        content: file.content,  // base64 content
        filename: file.filename,
        content_type: file.type,
        size: file.size
    }))

    // Send message with files in a single emit
    await socketSendMessage(newMessage.value, emailInput.value, files)

    // Clean up temporary object URLs
    uploadedAttachments.value.forEach(file => {
        if (file.url && file.url.startsWith('blob:')) {
            URL.revokeObjectURL(file.url)
        }
        if (file.file_url && file.file_url.startsWith('blob:')) {
            URL.revokeObjectURL(file.file_url)
        }
    })

    newMessage.value = ''
    uploadedAttachments.value = []

    // Also clear the actual DOM input field to ensure it's visually cleared
    const inputField = document.querySelector('input[placeholder*="Type a message"]') as HTMLInputElement
    if (inputField) {
        inputField.value = ''
    }

    // Re-setup native event listeners after message is sent
    // The DOM might have changed, so we need to reattach listeners
    setTimeout(() => {
        setupNativeEventListeners()
    }, 500)
}

// Handle enter key
const handleKeyPress = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault()
        event.stopPropagation()
        sendMessage()
    }
}

// Update the checkAuthorization function
const checkAuthorization = async () => {
    try {
        if (!widgetId.value) {
            console.error('Widget ID is not available')
            return false
        }

        const url = new URL(`${widgetEnv.API_URL}/widgets/${widgetId.value}`)
        if (emailInput.value.trim() && isValidEmail(emailInput.value.trim())) {
            url.searchParams.append('email', emailInput.value.trim())
        }

        const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }

        if (token.value) {
            headers['Authorization'] = `Bearer ${token.value}`
        }

        const response = await fetch(url, {
            headers
        })

        if (response.status === 401) {
            hasConversationToken.value = false
            return false
        }

        const data = await response.json()

        // Update token if new one is provided
        if (data.token) {
            token.value = data.token
            localStorage.setItem(TOKEN_KEY, data.token)
            // Notify parent window of token update
            window.parent.postMessage({ type: 'TOKEN_UPDATE', token: data.token }, '*')
        }

        hasConversationToken.value = true

        // Connect socket and verify connection success
        const connected = await connect()
        if (!connected) {
            console.error('Failed to connect to chat service')
            return false
        }

        await fetchChatHistory()

        if (data.agent?.customization) {
            applyCustomization(data.agent.customization)
        }
        if(data.agent && !data?.human_agent) {
            agentName.value = data.agent.name
        }
        if (data?.human_agent) {
            humanAgent.value = data.human_agent
        }

        // Set allow_attachments flag from agent data
        if (data.agent?.allow_attachments !== undefined) {
            allowAttachments.value = data.agent.allow_attachments
        }

        // Update workflow status in initial data if received from backend
        if (data.agent?.workflow !== undefined) {
            window.__INITIAL_DATA__ = window.__INITIAL_DATA__ || {}
            window.__INITIAL_DATA__.workflow = data.agent.workflow
        }

        // Get workflow state after successful connection
        if (data.agent?.workflow) {
            await getWorkflowState()
        }

        return true
    } catch (error) {
        console.error('Error checking authorization:', error)
        hasConversationToken.value = false
        return false
    } finally {
        isInitializing.value = false
    }
}

// Load history when chat starts
const fetchChatHistory = async () => {
    if (!hasStartedChat.value && hasConversationToken.value) {
        hasStartedChat.value = true
        await loadChatHistory()
    }
}

// Add this after messagesContainer ref definition
const scrollToBottom = () => {
    if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
}

// Add watch effect for messages
watch(() => messages.value, (newMessages) => {
    // Scroll to bottom when new messages arrive
    nextTick(() => {
        scrollToBottom()
    })
}, { deep: true })

// Watch for connection status changes to set up event listeners when needed
watch(connectionStatus, (newStatus, oldStatus) => {
    if (newStatus === 'connected' && oldStatus !== 'connected') {
        setTimeout(setupNativeEventListeners, 100)
    }
})

// Watch for messages to set up event listeners when chat becomes active
watch(() => messages.value.length, (newLength, oldLength) => {
    if (newLength > 0 && oldLength === 0) {
        setTimeout(setupNativeEventListeners, 100)
    }
})

// Check for end chat in the last message - existing functionality
watch(() => messages.value, (newMessages) => {
    if (newMessages.length > 0) {

        const lastMessage = newMessages[newMessages.length - 1]

        handleEndChat(lastMessage)
    }
}, { deep: true })

// Add reconnect handler
const handleReconnect = async () => {
    const connected = await reconnect()
    if (connected) {
        await checkAuthorization()
    }
}

// Add these refs after other refs
const showRatingDialog = ref(false)
const currentRating = ref(0)
const ratingFeedback = ref('')

// Add these refs for star rating
const hoverRating = ref(0)
const isSubmittingRating = ref(false)

// Form handling refs
const formData = ref<Record<string, any>>({})
const isSubmittingForm = ref(false)
const formErrors = ref<Record<string, string>>({})

// Landing page handling refs
const showLandingPage = ref(false)
const landingPageData = ref<any>(null)
const workflowButtonText = ref('Start Chat')

// Form full screen handling refs
const showFullScreenForm = ref(false)
const fullScreenFormData = ref<any>(null)



// Add this after other computed properties
const ratingEnabled = computed(() => {
    const lastMessage = messages.value[messages.value.length - 1]
    return lastMessage?.attributes?.request_rating || false
})

// Check if we should show "start new conversation" instead of chat input
const shouldShowNewConversationOption = computed(() => {
    // Only in workflow mode
    if (!window.__INITIAL_DATA__?.workflow) {
        return false
    }

    // Check if there's a submitted rating message
    const ratingMessage = messages.value.find(msg => msg.message_type === 'rating')
    return ratingMessage?.isSubmitted === true
})

// Handle human agent profile picture URL
const humanAgentPhotoUrl = computed(() => {
    if (!humanAgent.value.human_agent_profile_pic) {
        return ''
    }

    // Use signed URL if available (AWS S3)
    if (humanAgent.value.human_agent_profile_pic.includes('amazonaws.com')) {
        return humanAgent.value.human_agent_profile_pic
    }

    // For local storage, prepend the API URL
    return `${widgetEnv.API_URL}${humanAgent.value.human_agent_profile_pic}`
})

// Add this after other methods
const handleEndChat = (message) => {

    if (message.attributes?.end_chat && message.attributes?.request_rating) {
        // Determine the agent name with proper fallbacks
        const displayAgentName = message.agent_name || humanAgent.value?.human_agent_name || agentName.value || 'our agent'

        messages.value.push({
            message: `Rate the chat session that you had with ${displayAgentName}`,
            message_type: 'rating',
            created_at: new Date().toISOString(),
            session_id: message.session_id,
            agent_name: displayAgentName,
            showFeedback: false
        })
        currentSessionId.value = message.session_id
    }
}

const handleStarHover = (rating: number) => {
    if (!isSubmittingRating.value) {
        hoverRating.value = rating
    }
}

const handleStarLeave = () => {
    if (!isSubmittingRating.value) {
        const lastMessage = messages.value[messages.value.length - 1]
        hoverRating.value = lastMessage?.selectedRating || 0
    }
}

const handleStarClick = async (rating: number) => {
    if (!isSubmittingRating.value) {
        hoverRating.value = rating
        // Show feedback input after rating selection
        const lastMessage = messages.value[messages.value.length - 1]
        if (lastMessage && lastMessage.message_type === 'rating') {
            lastMessage.showFeedback = true
            lastMessage.selectedRating = rating
        }
    }
}

const handleSubmitRating = async (sessionId: string, rating: number, feedback: string | null = null) => {
    try {
        isSubmittingRating.value = true
        await socketSubmitRating(rating, feedback)

        // Instead of removing the rating message, mark it as submitted
        const lastMessage = messages.value.find(msg => msg.message_type === 'rating')
        if (lastMessage) {
            lastMessage.isSubmitted = true
            lastMessage.finalRating = rating
            lastMessage.finalFeedback = feedback
        }
    } catch (error) {
        console.error('Failed to submit rating:', error)
    } finally {
        isSubmittingRating.value = false
    }
}

const handleAddToCart = (message) => {
    const productData = message.shopify_output || {
        id: message.product_id,
        title: message.product_title,
        price: message.product_price,
        image: message.product_image,
        vendor: message.product_vendor
    };

    if (productData) {
        // Send a message to the parent window (the main shop)
        window.parent.postMessage({
            type: 'ADD_TO_CART',
            product: productData
        }, '*');
    }
};

const handleAddToCartFromCarousel = (product) => {
    if (product) {
        window.parent.postMessage({
            type: 'ADD_TO_CART',
            product: product
        }, '*');
    }
};

// Form validation function
const validateForm = (formConfig: any): boolean => {
    const errors: Record<string, string> = {}

    for (const field of formConfig.fields) {
        const value = formData.value[field.name]
        const error = validateFormField(field, value)

        if (error) {
            errors[field.name] = error
        }
    }

    formErrors.value = errors
    return Object.keys(errors).length === 0
}

// Handle form submission
const handleFormSubmit = async (formConfig: any) => {


    if (isSubmittingForm.value) {
        return
    }


    const isValid = validateForm(formConfig)


    if (!isValid) {

        return
    }

    try {

        isSubmittingForm.value = true
        await submitForm(formData.value)


        // Remove the form message from messages array
        const formIndex = messages.value.findIndex(msg =>
            msg.message_type === 'form' &&
            (!msg.isSubmitted || msg.isSubmitted === false)
        )
        if (formIndex !== -1) {
            messages.value.splice(formIndex, 1)

        }

        // Clear form data after successful submission
        formData.value = {}
        formErrors.value = {}

    } catch (error) {
        console.error('Failed to submit form:', error)
    } finally {
        isSubmittingForm.value = false

    }
}

// Handle form field change
const handleFieldChange = (fieldName: string, value: any) => {

    formData.value[fieldName] = value


    // Real-time validation: validate the current field if it has a value
    if (value && value.toString().trim() !== '') {
        // Find the field configuration for real-time validation
        let fieldConfig = null

        // Check full screen form first
        if (fullScreenFormData.value?.fields) {
            fieldConfig = fullScreenFormData.value.fields.find(f => f.name === fieldName)
        }

        // If not found and there's a current form, check regular form
        if (!fieldConfig && currentForm.value?.fields) {
            fieldConfig = currentForm.value.fields.find(f => f.name === fieldName)
        }

        if (fieldConfig) {
            const error = validateFormField(fieldConfig, value)
            if (error) {
                formErrors.value[fieldName] = error
                console.log(`Validation error for ${fieldName}:`, error)
            } else {
                delete formErrors.value[fieldName]

            }
        }
    } else {
        // Clear error when field is cleared
        delete formErrors.value[fieldName]
        console.log(`Cleared error for ${fieldName}`)
    }
}

// Phone number validation function
const isValidPhoneNumber = (phone: string): boolean => {
    // Remove all non-digit characters
    const cleanPhone = phone.replace(/\D/g, '')
    // Check if it's between 7 and 15 digits (international standard)
    return cleanPhone.length >= 7 && cleanPhone.length <= 15
}

// Enhanced form validation function
const validateFormField = (field: any, value: any): string | null => {
    // Required field validation
    if (field.required && (!value || value.toString().trim() === '')) {
        return `${field.label} is required`
    }

    // Skip further validation if field is empty and not required
    if (!value || value.toString().trim() === '') {
        return null
    }

    // Email validation
    if (field.type === 'email' && !isValidEmail(value)) {
        return `Please enter a valid email address`
    }

    // Phone number validation
    if (field.type === 'tel' && !isValidPhoneNumber(value)) {
        return `Please enter a valid phone number`
    }

    // Length validation for text fields
    if ((field.type === 'text' || field.type === 'textarea') && field.minLength && value.length < field.minLength) {
        return `${field.label} must be at least ${field.minLength} characters`
    }

    if ((field.type === 'text' || field.type === 'textarea') && field.maxLength && value.length > field.maxLength) {
        return `${field.label} must not exceed ${field.maxLength} characters`
    }

    // Number validation
    if (field.type === 'number') {
        const numValue = parseFloat(value)
        if (isNaN(numValue)) {
            return `${field.label} must be a valid number`
        }
        if (field.minLength && numValue < field.minLength) {
            return `${field.label} must be at least ${field.minLength}`
        }
        if (field.maxLength && numValue > field.maxLength) {
            return `${field.label} must not exceed ${field.maxLength}`
        }
    }

    return null
}

// Handle full screen form submission
const submitFullScreenForm = async () => {


    if (isSubmittingForm.value || !fullScreenFormData.value) {
        return
    }

    try {
        isSubmittingForm.value = true
        formErrors.value = {}

        // Enhanced validation with field-specific rules
        let hasErrors = false
        for (const field of fullScreenFormData.value.fields || []) {
            const value = formData.value[field.name]
            const error = validateFormField(field, value)

            if (error) {
                formErrors.value[field.name] = error
                hasErrors = true
                console.log(`Validation error for field ${field.name}:`, error)
            }
        }


        if (hasErrors) {
            isSubmittingForm.value = false
            console.log('Validation failed, not submitting')
            return
        }

        // Submit form data through the workflow
        await submitForm(formData.value)

        // Hide full screen form after successful submission
        showFullScreenForm.value = false
        fullScreenFormData.value = null
        formData.value = {}

    } catch (error) {
        console.error('Failed to submit full screen form:', error)
    } finally {
        isSubmittingForm.value = false
        console.log('Full screen form submission completed')
    }
}

const handleViewDetails = (product, shopDomain) => {
    console.log('handleViewDetails called with:', { product, shopDomain });

    if (!product) {
        console.error('No product provided to handleViewDetails');
        return;
    }

    // Try to construct the product URL
    let productUrl = null;

    // If product has a handle, construct the URL
    if (product.handle && shopDomain) {
        productUrl = `https://${shopDomain}/products/${product.handle}`;
    } else if (product.id && shopDomain) {
        // Fallback: use product ID
        productUrl = `https://${shopDomain}/products/${product.id}`;
    } else if (!shopDomain) {
        console.error('Shop domain is missing! Product:', product);
        alert('Unable to open product: Shop domain not available. Please contact support.');
        return;
    } else if (!product.handle && !product.id) {
        console.error('Product handle and ID are both missing! Product:', product);
        alert('Unable to open product: Product information incomplete.');
        return;
    }

    // Open the product URL in new tab
    if (productUrl) {
        console.log('Opening product URL:', productUrl);
        window.open(productUrl, '_blank');
    }
};

// Add this function in the script section after the other helper functions
const removeUrls = (text) => {
    if (!text) return '';

    console.log('removeUrls - Input text:', text);

    // First, remove markdown images: ![alt text](url)
    let processedText = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '');

    // Then, temporarily replace regular markdown links with placeholders to preserve them
    const markdownLinks = [];
    processedText = processedText.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, linkText, url) => {
        const placeholder = `__MARKDOWN_LINK_${markdownLinks.length}__`;
        console.log('Found markdown link:', match, '-> placeholder:', placeholder);
        markdownLinks.push(match);
        return placeholder;
    });

    console.log('After replacing markdown links with placeholders:', processedText);
    console.log('Markdown links array:', markdownLinks);

    // Now remove standalone URLs (not part of markdown links)
    processedText = processedText.replace(/https?:\/\/[^\s\)]+/g, '[link removed]');

    console.log('After removing standalone URLs:', processedText);

    // Restore markdown links
    markdownLinks.forEach((link, index) => {
        processedText = processedText.replace(`__MARKDOWN_LINK_${index}__`, link);
        console.log(`Restored markdown link ${index}:`, link);
    });

    // Clean up extra whitespace and newlines left after removing images
    processedText = processedText.replace(/\n\s*\n\s*\n/g, '\n\n').trim();

    console.log('removeUrls - Final output:', processedText);

    return processedText;
}


// File upload functionality (remaining local state)
const isUploading = ref(false)
const dragOver = ref(false)

const maxFiles = 3
const acceptTypes = 'image/*,.pdf,.doc,.docx,.txt,.csv,.xlsx,.xls'

const canUploadMore = computed(() => {
  // Attachments only allowed when:
  // 1. allow_attachments setting is enabled
  // 2. Chat has been handed over to a human agent
  // 3. Human agent has sent at least one message
  const isHandedOverToHuman = !!humanAgent.value?.human_agent_name
  const hasAgentMessage = messages.value.some(msg => msg.message_type === 'agent')
  return allowAttachments.value && isHandedOverToHuman && hasAgentMessage && uploadedAttachments.value.length < maxFiles
})

// Watch for changes to allowAttachments
watch(allowAttachments, (newVal) => {
  console.log('🔍 allowAttachments changed to:', newVal)
  console.log('   isHandedOverToHuman:', !!humanAgent.value?.human_agent_name)
  console.log('   canUploadMore:', canUploadMore.value)
})





// Handle landing page proceed action
const handleLandingPageProceed = async () => {
    try {
        showLandingPage.value = false
        landingPageData.value = null
        await proceedWorkflow()
    } catch (error) {
        console.error('Failed to proceed workflow:', error)
    }
}

// Handle user input submission
const handleUserInputSubmit = async (message: any) => {
    try {
        if (!message.userInputValue || !message.userInputValue.trim()) {
            return
        }

        const userInput = message.userInputValue.trim()

        // Mark message as submitted
        message.isSubmitted = true
        message.submittedValue = userInput

        // Send the user input as a regular message to continue the workflow
        await socketSendMessage(userInput, emailInput.value)

    } catch (error) {
        console.error('Failed to submit user input:', error)
        // Reset submission state on error
        message.isSubmitted = false
        message.submittedValue = null
    }
}

// Initialize widget - main initialization logic
const initializeWidget = async () => {
    try {
        // Wait for window.__INITIAL_DATA__ to be available
        let attempts = 0
        const maxAttempts = 50 // 5 seconds max wait
        while (!window.__INITIAL_DATA__?.widgetId && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100))
            attempts++
        }

        if (!window.__INITIAL_DATA__?.widgetId) {
            console.error('Widget data not available after waiting')
            return false
        }

        const isAuthorized = await checkAuthorization()

        if (!isAuthorized) {
            connectionStatus.value = 'connected'
            return false
        }

        // For refresh cases, also check if we need to get workflow state
        if (window.__INITIAL_DATA__?.workflow && hasConversationToken.value) {
            await getWorkflowState()
        }

        return true
    } catch (error) {
        console.error('Failed to initialize widget:', error)
        return false
    }
}

// Setup event listeners and callbacks
const setupEventListeners = () => {
    // Register takeover callback
    onTakeover(async () => {
        await checkAuthorization()
    })

    // Listen for scroll message from parent
    window.addEventListener('message', (event) => {
        if (event.data.type === 'SCROLL_TO_BOTTOM') {
            scrollToBottom()
        }
        if (event.data.type === 'TOKEN_RECEIVED') {
            // Parent confirmed token storage
            localStorage.setItem(TOKEN_KEY, event.data.token)
        }
    })

    // Register workflow state callback
    onWorkflowState((data) => {

        workflowButtonText.value = data.button_text || 'Start Chat'

        if (data.type === 'landing_page') {
            landingPageData.value = data.landing_page_data
            showLandingPage.value = true
            showFullScreenForm.value = false
        } else if (data.type === 'form' || data.type === 'display_form') {
            // Check if form should be displayed in full screen mode

            if (data.form_data?.form_full_screen === true) {

                fullScreenFormData.value = data.form_data
                showFullScreenForm.value = true
                showLandingPage.value = false

            } else {

                // For non-fullscreen forms, add a form message to the chat
                const formMessage = {
                    message: '',
                    message_type: 'form',
                    attributes: {
                        form_data: data.form_data
                    },
                    created_at: new Date().toISOString(),
                    isSubmitted: false
                }

                // Check if form message already exists to avoid duplicates
                const existingFormIndex = messages.value.findIndex(msg =>
                    msg.message_type === 'form' && !msg.isSubmitted
                )

                if (existingFormIndex === -1) {
                    messages.value.push(formMessage)
                }

                showLandingPage.value = false
                showFullScreenForm.value = false
            }
        } else {

            showLandingPage.value = false
            showFullScreenForm.value = false
        }
    })

    onWorkflowProceeded((data) => {
        console.log('Workflow proceeded:', data)
    })
}

// Start new conversation workflow
const startNewConversationWorkflow = async () => {
    try {

        await initializeWidget()
        await getWorkflowState()
    } catch (error) {
        console.error('Failed to start new conversation:', error)
        throw error
    }
}

// Handle starting a new conversation
const handleStartNewConversation = async () => {
    shouldShowNewConversationOption.value = false
    messages.value = [] // Clear messages
    await startNewConversationWorkflow()
}

onMounted(async () => {
    await initializeWidget()
    setupEventListeners()

    // Setup DOM observer to detect changes
    setupDOMObserver()

    // Only set up native event listeners if we're in a state where input is expected
    // This avoids unnecessary overhead during workflow navigation
    const shouldSetupListeners = () => {
        // Check if we're in a state where chat input is expected
        const hasMessages = messages.value.length > 0
        const isConnected = connectionStatus.value === 'connected'
        const hasInputFields = document.querySelector('input[type="text"], textarea') !== null

        return hasMessages || isConnected || hasInputFields
    }

    // Initial setup with intelligent timing
    if (shouldSetupListeners()) {
        setTimeout(setupNativeEventListeners, 100)
    } else {
        // If no immediate need, wait for DOM changes to trigger setup
        // Event listeners will be set up when connection is established or messages arrive
    }
})

onUnmounted(() => {
    window.removeEventListener('message', (event) => {
        if (event.data.type === 'SCROLL_TO_BOTTOM') {
            scrollToBottom()
        }
    })

    // Clean up DOM observer
    if (domObserver) {
        domObserver.disconnect()
        domObserver = null
    }

    // Clear any pending timeouts
    if (setupDOMObserver.timeoutId) {
        clearTimeout(setupDOMObserver.timeoutId)
        setupDOMObserver.timeoutId = null
    }

    // Clean up native event listeners
    cleanupNativeEventListeners()

    cleanup()
})

// Add after the existing computed properties, around line 120
const isAskAnythingStyle = computed(() => {
    return customization.value.chat_style === 'ASK_ANYTHING'
})

const containerStyles = computed(() => {
    const baseStyles = {
        width: '100%',
        height: '580px',
        borderRadius: 'var(--radius-lg)'
    }

    // Override for mobile devices
    if (window.innerWidth <= 768) {
        baseStyles.width = '100vw'
        baseStyles.height = '100vh'
        baseStyles.borderRadius = '0'
        baseStyles.position = 'fixed'
        baseStyles.top = '0'
        baseStyles.left = '0'
        baseStyles.bottom = '0'
        baseStyles.right = '0'
        baseStyles.maxWidth = '100vw'
        baseStyles.maxHeight = '100vh'
    }

    if (isAskAnythingStyle.value) {
        // Mobile responsive adjustments for ASK_ANYTHING style
        if (window.innerWidth <= 768) {
            return {
                ...baseStyles,
                width: '100vw',
                height: '100vh',
                maxWidth: '100vw',
                maxHeight: '100vh',
                minWidth: 'unset',
                borderRadius: '0'
            }
        } else if (window.innerWidth <= 1024) {
            // Tablet adjustments
            return {
                ...baseStyles,
                width: '95%',
                maxWidth: '700px',
                minWidth: '500px',
                height: '650px'
            }
        } else {
            // Desktop - same width as other chat styles
            return {
                ...baseStyles,
                width: '100%',
                maxWidth: '400px',
                minWidth: '400px',
                height: '580px'
            }
        }
    }

    return baseStyles
})

const shouldShowWelcomeMessage = computed(() => {
    return isAskAnythingStyle.value && messages.value.length === 0
})
</script>

<template>
    <div v-if="widgetId" class="chat-container" :class="{ collapsed: !isExpanded, 'ask-anything-style': isAskAnythingStyle }" :style="{ ...shadowStyle, ...containerStyles }">
        <!-- Loading State -->
        <div v-if="isInitializing" class="initializing-overlay">
            <div class="loading-spinner">
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
            </div>
            <div class="loading-text">Initializing chat...</div>
        </div>

        <!-- Connection Status -->
        <div v-if="!isInitializing && connectionStatus !== 'connected'" class="connection-status" :class="connectionStatus">
            <div v-if="connectionStatus === 'connecting'" class="connecting-message">
                Connecting to chat service...
                <div class="loading-dots">
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                </div>
            </div>
            <div v-else-if="connectionStatus === 'failed'" class="failed-message">
                Connection failed.
                <button @click="handleReconnect" class="reconnect-button">
                    Click here to reconnect
                </button>
            </div>
        </div>

        <!-- Error Alert -->
        <div v-if="showError" class="error-alert" :style="chatIconStyles">
            {{ errorMessage }}
        </div>

        <!-- Welcome Message for ASK_ANYTHING Style -->
        <div v-if="shouldShowWelcomeMessage" class="welcome-message-section" :style="chatStyles">
            <div class="welcome-content">
                <div class="welcome-header">
                    <img
                        v-if="photoUrl"
                        :src="photoUrl"
                        :alt="agentName"
                        class="welcome-avatar"
                    >
                    <h1 class="welcome-title">{{ customization.welcome_title || `Welcome to ${agentName}` }}</h1>
                    <p class="welcome-subtitle">{{ customization.welcome_subtitle || "I'm here to help you with anything you need. What can I assist you with today?" }}</p>
                </div>
            </div>

            <!-- Welcome Input Container -->
            <div class="welcome-input-container">
                <div class="email-input" v-if="!hasStartedChat && !hasConversationToken && !isAskAnythingStyle">
                    <input
                        v-model="emailInput"
                        type="email"
                        placeholder="Enter your email address"
                        :disabled="loading || connectionStatus !== 'connected'"
                        :class="{
                            'invalid': emailInput.trim() && !isValidEmail(emailInput.trim()),
                            'disabled': connectionStatus !== 'connected'
                        }"
                        class="welcome-email-input"
                    >
                </div>
                <div class="welcome-message-input">
                    <input
                        v-model="newMessage"
                        type="text"
                        :placeholder=placeholderText
                        @keypress="handleKeyPress"
                        @input="handleInputSync"
                        @change="handleInputSync"
                        :disabled="!isMessageInputEnabled"
                        :class="{ 'disabled': !isMessageInputEnabled }"
                        class="welcome-message-field"
                    >
                    <button
                        class="welcome-send-button"
                        :style="userBubbleStyles"
                        @click="sendMessage"
                        :disabled="!newMessage.trim() || !isMessageInputEnabled"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 12L3 21L21 12L3 3L5 12ZM5 12L13 12" stroke="currentColor" stroke-width="2"
                                stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </button>
                </div>
            </div>

            <!-- Powered by footer for welcome message -->
            <div class="powered-by-welcome" :style="messageNameStyles">
                <svg class="chattermate-logo" width="16" height="16" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M45 15H15C13.3431 15 12 16.3431 12 18V42C12 43.6569 13.3431 45 15 45H25L30 52L35 45H45C46.6569 45 48 43.6569 48 42V18C48 16.3431 46.6569 15 45 15Z" fill="currentColor" opacity="0.8"/>
                    <path d="M36 27C36 27 32.5 26 30 26C27.5 26 24 27 24 31C24 35 27.5 36 30 36C32.5 36 36 35 36 35V33C36 33 33 34 31.5 34C30 34 27 33 27 31C27 29 30 28 31.5 28C33 28 36 29 36 29V27Z" fill="currentColor"/>
                </svg>
                Powered by ChatterMate
            </div>
        </div>

        <!-- Landing Page Display (Full Screen) -->
        <div v-if="showLandingPage && landingPageData" class="landing-page-fullscreen" :style="chatStyles">
            <div class="landing-page-content">
                <div class="landing-page-header">
                    <h2 class="landing-page-heading">
                        {{ landingPageData.heading }}
                    </h2>
                    <div class="landing-page-text">
                        {{ landingPageData.content }}
                    </div>
                </div>
                <div class="landing-page-actions">
                    <button
                        class="landing-page-button"
                        @click="handleLandingPageProceed"
                    >
                        {{ workflowButtonText }}
                    </button>
                </div>
            </div>
            <!-- Powered by footer for landing page -->
            <div class="powered-by-landing" :style="messageNameStyles">
                <svg class="chattermate-logo" width="16" height="16" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M45 15H15C13.3431 15 12 16.3431 12 18V42C12 43.6569 13.3431 45 15 45H25L30 52L35 45H45C46.6569 45 48 43.6569 48 42V18C48 16.3431 46.6569 15 45 15Z" fill="currentColor" opacity="0.8"/>
                    <path d="M36 27C36 27 32.5 26 30 26C27.5 26 24 27 24 31C24 35 27.5 36 30 36C32.5 36 36 35 36 35V33C36 33 33 34 31.5 34C30 34 27 33 27 31C27 29 30 28 31.5 28C33 28 36 29 36 29V27Z" fill="currentColor"/>
                </svg>
                Powered by ChatterMate
            </div>
        </div>

        <!-- Full Screen Form Display -->
        <div v-else-if="showFullScreenForm && fullScreenFormData" class="form-fullscreen" :style="chatStyles">
            <div class="form-fullscreen-content">
                <div v-if="fullScreenFormData.title || fullScreenFormData.description" class="form-header">
                    <h2 v-if="fullScreenFormData.title" class="form-title">{{ fullScreenFormData.title }}</h2>
                    <p v-if="fullScreenFormData.description" class="form-description">
                        {{ fullScreenFormData.description }}
                    </p>
                </div>

                <div class="form-fields">
                    <div
                        v-for="field in fullScreenFormData.fields"
                        :key="field.name"
                        class="form-field"
                    >
                        <label :for="`fullscreen-form-${field.name}`" class="field-label">
                            {{ field.label }}
                            <span v-if="field.required" class="required-indicator">*</span>
                        </label>

                        <!-- Text Input -->
                        <input
                            v-if="field.type === 'text' || field.type === 'email' || field.type === 'tel'"
                            :id="`fullscreen-form-${field.name}`"
                            :type="field.type"
                            :placeholder="field.placeholder || ''"
                            :required="field.required"
                            :minlength="field.minLength"
                            :maxlength="field.maxLength"
                            :value="formData[field.name] || ''"
                            @input="handleFieldChange(field.name, ($event.target as HTMLInputElement).value)"
                            @blur="handleFieldChange(field.name, ($event.target as HTMLInputElement).value)"
                            class="form-input"
                            :class="{ 'error': formErrors[field.name] }"
                            :autocomplete="field.type === 'email' ? 'email' : field.type === 'tel' ? 'tel' : 'off'"
                            :inputmode="field.type === 'tel' ? 'tel' : field.type === 'email' ? 'email' : 'text'"
                        />

                        <!-- Number Input -->
                        <input
                            v-else-if="field.type === 'number'"
                            :id="`fullscreen-form-${field.name}`"
                            type="number"
                            :placeholder="field.placeholder || ''"
                            :required="field.required"
                            :min="field.minLength"
                            :max="field.maxLength"
                            :value="formData[field.name] || ''"
                            @input="handleFieldChange(field.name, ($event.target as HTMLInputElement).value)"
                            class="form-input"
                            :class="{ 'error': formErrors[field.name] }"
                        />

                        <!-- Textarea -->
                        <textarea
                            v-else-if="field.type === 'textarea'"
                            :id="`fullscreen-form-${field.name}`"
                            :placeholder="field.placeholder || ''"
                            :required="field.required"
                            :minlength="field.minLength"
                            :maxlength="field.maxLength"
                            :value="formData[field.name] || ''"
                            @input="handleFieldChange(field.name, ($event.target as HTMLTextAreaElement).value)"
                            class="form-textarea"
                            :class="{ 'error': formErrors[field.name] }"
                            rows="4"
                        ></textarea>

                        <!-- Select -->
                        <select
                            v-else-if="field.type === 'select'"
                            :id="`fullscreen-form-${field.name}`"
                            :required="field.required"
                            :value="formData[field.name] || ''"
                            @change="handleFieldChange(field.name, ($event.target as HTMLSelectElement).value)"
                            class="form-select"
                            :class="{ 'error': formErrors[field.name] }"
                        >
                            <option value="">{{ field.placeholder || 'Please select...' }}</option>
                            <option
                                v-for="option in (Array.isArray(field.options) ? field.options : field.options?.split('\n') || []).filter(o => o.trim())"
                                :key="option"
                                :value="option.trim()"
                            >
                                {{ option.trim() }}
                            </option>
                        </select>

                        <!-- Checkbox -->
                        <label
                            v-else-if="field.type === 'checkbox'"
                            class="checkbox-field"
                        >
                            <input
                                :id="`fullscreen-form-${field.name}`"
                                type="checkbox"
                                :required="field.required"
                                :checked="formData[field.name] || false"
                                @change="handleFieldChange(field.name, ($event.target as HTMLInputElement).checked)"
                                class="form-checkbox"
                            />
                            <span class="checkbox-label">{{ field.label }}</span>
                        </label>

                        <!-- Radio -->
                        <div
                            v-else-if="field.type === 'radio'"
                            class="radio-group"
                        >
                            <label
                                v-for="option in (Array.isArray(field.options) ? field.options : field.options?.split('\n') || []).filter(o => o.trim())"
                                :key="option"
                                class="radio-field"
                            >
                                <input
                                    type="radio"
                                    :name="`fullscreen-form-${field.name}`"
                                    :value="option.trim()"
                                    :required="field.required"
                                    :checked="formData[field.name] === option.trim()"
                                    @change="handleFieldChange(field.name, option.trim())"
                                    class="form-radio"
                                />
                                <span class="radio-label">{{ option.trim() }}</span>
                            </label>
                        </div>

                        <!-- Field error -->
                        <div v-if="formErrors[field.name]" class="field-error">
                            {{ formErrors[field.name] }}
                        </div>
                    </div>
                </div>

                <div class="form-actions">
                    <button
                        @click="() => { console.log('Submit button clicked!'); submitFullScreenForm(); }"
                        :disabled="isSubmittingForm"
                        class="submit-form-button"
                        :style="userBubbleStyles"
                    >
                        <span v-if="isSubmittingForm" class="loading-spinner-inline">
                            <div class="dot"></div>
                            <div class="dot"></div>
                            <div class="dot"></div>
                        </span>
                        <span v-else>{{ fullScreenFormData.submit_button_text || 'Submit' }}</span>
                    </button>
                </div>
            </div>
            <!-- Powered by footer for form -->
            <div class="powered-by-landing" :style="messageNameStyles">
                <svg class="chattermate-logo" width="16" height="16" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M45 15H15C13.3431 15 12 16.3431 12 18V42C12 43.6569 13.3431 45 15 45H25L30 52L35 45H45C46.6569 45 48 43.6569 48 42V18C48 16.3431 46.6569 15 45 15Z" fill="currentColor" opacity="0.8"/>
                    <path d="M36 27C36 27 32.5 26 30 26C27.5 26 24 27 24 31C24 35 27.5 36 30 36C32.5 36 36 35 36 35V33C36 33 33 34 31.5 34C30 34 27 33 27 31C27 29 30 28 31.5 28C33 28 36 29 36 29V27Z" fill="currentColor"/>
                </svg>
                Powered by ChatterMate
            </div>
        </div>

        <!-- Chat Panel (Only show when landing page, full screen form, and welcome message are not active) -->
        <div v-else-if="!shouldShowWelcomeMessage" class="chat-panel" :class="{ 'ask-anything-chat': isAskAnythingStyle }" :style="chatStyles" v-if="isExpanded">
            <div v-if="!isAskAnythingStyle" class="chat-header" :style="headerBorderStyles">
                <div class="header-content">
                    <img
                        v-if="humanAgentPhotoUrl || photoUrl"
                        :src="humanAgentPhotoUrl || photoUrl"
                        :alt="humanAgent.human_agent_name || agentName"
                        class="header-avatar"
                    >
                    <div class="header-info">
                        <h3 :style="messageNameStyles">{{ humanAgent.human_agent_name || agentName }}</h3>
                        <div class="status">
                            <span class="status-indicator online"></span>
                            <span class="status-text" :style="messageNameStyles">Online</span>
                        </div>
                    </div>
                </div>
            </div>
            <div v-else class="ask-anything-top" :style="headerBorderStyles">
                <div class="ask-anything-header">
                    <img
                        v-if="humanAgentPhotoUrl || photoUrl"
                        :src="humanAgentPhotoUrl || photoUrl"
                        :alt="humanAgent.human_agent_name || agentName"
                        class="header-avatar"
                    >
                    <div class="header-info">
                        <h3 :style="messageNameStyles">{{ agentName }}</h3>
                        <p class="ask-anything-subtitle" :style="messageNameStyles">{{ customization.welcome_subtitle || 'Ask me anything. I\'m here to help.' }}</p>
                    </div>
                </div>
            </div>

            <!-- Loading indicator for history -->
            <div v-if="loadingHistory" class="loading-history">
                <div class="loading-spinner">
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                </div>
            </div>

            <div class="chat-messages" ref="messagesContainer">
                <template v-for="(message, index) in messages" :key="index">
                    <div
                        :class="[
                            'message',
                            message.message_type === 'bot' ? 'agent-message' :
                            message.message_type === 'agent' ? 'agent-message' :
                            message.message_type === 'system' ? 'system-message' :
                            message.message_type === 'rating' ? 'rating-message' :
                            message.message_type === 'form' ? 'form-message' :
                            message.message_type === 'product' || message.shopify_output ? 'product-message' :
                            'user-message'
                        ]"
                    >
                        <div class="message-bubble"
                            :style="message.message_type === 'system' || message.message_type === 'rating' || message.message_type === 'product' || message.shopify_output ? {} :
                                   message.message_type === 'user' ? userBubbleStyles :
                                   agentBubbleStyles"
                        >
                            <template v-if="message.message_type === 'rating'">
                                <div class="rating-content">
                                    <p class="rating-prompt">Rate the chat session that you had with {{ message.agent_name || humanAgent.human_agent_name || agentName || 'our agent' }}</p>

                                    <!-- Rating stars -->
                                    <div class="star-rating" :class="{ 'submitted': isSubmittingRating || message.isSubmitted }">
                                        <button
                                            v-for="star in 5"
                                            :key="star"
                                            class="star-button"
                                            :class="{
                                                'warning': star <= (message.isSubmitted ? message.finalRating : (hoverRating || message.selectedRating)) && (message.isSubmitted ? message.finalRating : (hoverRating || message.selectedRating)) <= 3,
                                                'success': star <= (message.isSubmitted ? message.finalRating : (hoverRating || message.selectedRating)) && (message.isSubmitted ? message.finalRating : (hoverRating || message.selectedRating)) > 3,
                                                'selected': star <= (message.isSubmitted ? message.finalRating : (hoverRating || message.selectedRating))
                                            }"
                                            @mouseover="!message.isSubmitted && handleStarHover(star)"
                                            @mouseleave="!message.isSubmitted && handleStarLeave"
                                            @click="!message.isSubmitted && handleStarClick(star)"
                                            :disabled="isSubmittingRating || message.isSubmitted"
                                        >
                                            ★
                                        </button>
                                    </div>

                                    <!-- Feedback input before submission -->
                                    <div v-if="message.showFeedback && !message.isSubmitted" class="feedback-wrapper">
                                        <div class="feedback-section">
                                            <input
                                                v-model="message.feedback"
                                                placeholder="Please share your feedback (optional)"
                                                :disabled="isSubmittingRating"
                                                maxlength="500"
                                                class="feedback-input"
                                            />
                                            <div class="feedback-counter">{{ message.feedback?.length || 0 }}/500</div>
                                        </div>
                                        <button
                                            @click="handleSubmitRating(message.session_id, hoverRating, message.feedback)"
                                            :disabled="isSubmittingRating || !hoverRating"
                                            class="submit-rating-button"
                                            :style="{ backgroundColor: customization.accent_color || 'var(--primary-color)' }"
                                        >
                                            {{ isSubmittingRating ? 'Submitting...' : 'Submit Rating' }}
                                        </button>
                                    </div>

                                    <!-- Submitted feedback display -->
                                    <div v-if="message.isSubmitted && message.finalFeedback" class="submitted-feedback-wrapper">
                                        <div class="submitted-feedback">
                                            <p class="submitted-feedback-text">{{ message.finalFeedback }}</p>
                                        </div>

                                    </div>

                                    <!-- Thank you message if no feedback was provided -->
                                    <div v-else-if="message.isSubmitted" class="submitted-message">
                                        Thank you for your rating!
                                    </div>
                                </div>
                            </template>
                            <template v-else-if="message.message_type === 'form'">
                                <div class="form-content">
                                                                    <div v-if="message.attributes?.form_data?.title || message.attributes?.form_data?.description" class="form-header">
                                    <h3 v-if="message.attributes?.form_data?.title" class="form-title">{{ message.attributes.form_data.title }}</h3>
                                    <p v-if="message.attributes?.form_data?.description" class="form-description">
                                        {{ message.attributes.form_data.description }}
                                    </p>
                                </div>
                                    <div class="form-fields">
                                        <div
                                            v-for="field in message.attributes?.form_data?.fields"
                                            :key="field.name"
                                            class="form-field"
                                        >
                                            <label :for="`form-${field.name}`" class="field-label">
                                                {{ field.label }}
                                                <span v-if="field.required" class="required-indicator">*</span>
                                            </label>

                                            <!-- Text Input -->
                                            <input
                                                v-if="field.type === 'text' || field.type === 'email' || field.type === 'tel'"
                                                :id="`form-${field.name}`"
                                                :type="field.type"
                                                :placeholder="field.placeholder || ''"
                                                :required="field.required"
                                                :minlength="field.minLength"
                                                :maxlength="field.maxLength"
                                                :value="formData[field.name] || ''"
                                                @input="handleFieldChange(field.name, ($event.target as HTMLInputElement).value)"
                                                @blur="handleFieldChange(field.name, ($event.target as HTMLInputElement).value)"
                                                class="form-input"
                                                :class="{ 'error': formErrors[field.name] }"
                                                :disabled="isSubmittingForm"
                                                :autocomplete="field.type === 'email' ? 'email' : field.type === 'tel' ? 'tel' : 'off'"
                                                :inputmode="field.type === 'tel' ? 'tel' : field.type === 'email' ? 'email' : 'text'"
                                            />

                                            <!-- Number Input -->
                                            <input
                                                v-else-if="field.type === 'number'"
                                                :id="`form-${field.name}`"
                                                type="number"
                                                :placeholder="field.placeholder || ''"
                                                :required="field.required"
                                                :min="field.min"
                                                :max="field.max"
                                                :value="formData[field.name] || ''"
                                                @input="handleFieldChange(field.name, ($event.target as HTMLInputElement).value)"
                                                class="form-input"
                                                :class="{ 'error': formErrors[field.name] }"
                                                :disabled="isSubmittingForm"
                                            />

                                            <!-- Textarea -->
                                            <textarea
                                                v-else-if="field.type === 'textarea'"
                                                :id="`form-${field.name}`"
                                                :placeholder="field.placeholder || ''"
                                                :required="field.required"
                                                :minlength="field.minLength"
                                                :maxlength="field.maxLength"
                                                :value="formData[field.name] || ''"
                                                @input="handleFieldChange(field.name, ($event.target as HTMLTextAreaElement).value)"
                                                class="form-textarea"
                                                :class="{ 'error': formErrors[field.name] }"
                                                :disabled="isSubmittingForm"
                                                rows="3"
                                            ></textarea>

                                            <!-- Select -->
                                            <select
                                                v-else-if="field.type === 'select'"
                                                :id="`form-${field.name}`"
                                                :required="field.required"
                                                :value="formData[field.name] || ''"
                                                @change="handleFieldChange(field.name, ($event.target as HTMLSelectElement).value)"
                                                class="form-select"
                                                :class="{ 'error': formErrors[field.name] }"
                                                :disabled="isSubmittingForm"
                                            >
                                                <option value="">{{ field.placeholder || 'Select an option' }}</option>
                                                <option
                                                    v-for="option in (Array.isArray(field.options) ? field.options : field.options?.split('\n') || []).filter(o => o.trim())"
                                                    :key="option.trim()"
                                                    :value="option.trim()"
                                                >
                                                    {{ option.trim() }}
                                                </option>
                                            </select>

                                            <!-- Checkbox -->
                                            <div v-else-if="field.type === 'checkbox'" class="checkbox-field">
                                                <input
                                                    :id="`form-${field.name}`"
                                                    type="checkbox"
                                                    :checked="formData[field.name] || false"
                                                    @change="handleFieldChange(field.name, ($event.target as HTMLInputElement).checked)"
                                                    class="form-checkbox"
                                                    :disabled="isSubmittingForm"
                                                />
                                                <label :for="`form-${field.name}`" class="checkbox-label">
                                                    {{ field.placeholder || field.label }}
                                                </label>
                                            </div>

                                            <!-- Radio buttons -->
                                            <div v-else-if="field.type === 'radio'" class="radio-field">
                                                <div
                                                    v-for="option in (Array.isArray(field.options) ? field.options : field.options?.split('\n') || []).filter(o => o.trim())"
                                                    :key="option.trim()"
                                                    class="radio-option"
                                                >
                                                    <input
                                                        :id="`form-${field.name}-${option.trim()}`"
                                                        :name="`form-${field.name}`"
                                                        type="radio"
                                                        :value="option.trim()"
                                                        :checked="formData[field.name] === option.trim()"
                                                        @change="handleFieldChange(field.name, option.trim())"
                                                        class="form-radio"
                                                        :disabled="isSubmittingForm"
                                                    />
                                                    <label :for="`form-${field.name}-${option.trim()}`" class="radio-label">
                                                        {{ option.trim() }}
                                                    </label>
                                                </div>
                                            </div>

                                            <!-- Error message -->
                                            <div v-if="formErrors[field.name]" class="field-error">
                                                {{ formErrors[field.name] }}
                                            </div>
                                        </div>
                                    </div>

                                    <div class="form-actions">
                                        <button
                                            @click="() => { console.log('Regular form submit button clicked!'); handleFormSubmit(message.attributes?.form_data); }"
                                            :disabled="isSubmittingForm"
                                            class="form-submit-button"
                                            :style="userBubbleStyles"
                                        >
                                            {{ isSubmittingForm ? 'Submitting...' : (message.attributes?.form_data?.submit_button_text || 'Submit') }}
                                        </button>
                                    </div>
                                </div>
                            </template>
                            <template v-else-if="message.message_type === 'user_input'">
                                <div class="user-input-content">
                                    <!-- Only show prompt if message exists and is not empty -->
                                    <div
                                        v-if="message.attributes?.prompt_message && message.attributes.prompt_message.trim()"
                                        class="user-input-prompt"
                                    >
                                        {{ message.attributes.prompt_message }}
                                    </div>

                                    <!-- Show input form if not submitted -->
                                    <div v-if="!message.isSubmitted" class="user-input-form">
                                        <textarea
                                            v-model="message.userInputValue"
                                            class="user-input-textarea"
                                            placeholder="Type your message here..."
                                            rows="3"
                                            @keydown.enter.ctrl="handleUserInputSubmit(message)"
                                            @keydown.enter.meta="handleUserInputSubmit(message)"
                                        ></textarea>
                                        <button
                                            class="user-input-submit-button"
                                            @click="handleUserInputSubmit(message)"
                                            :disabled="!message.userInputValue || !message.userInputValue.trim()"
                                        >
                                            Submit
                                        </button>
                                    </div>

                                    <!-- Show submitted value -->
                                    <div v-else class="user-input-submitted">
                                        <strong>Your input:</strong> {{ message.submittedValue }}
                                        <div
                                            v-if="message.attributes?.confirmation_message && message.attributes.confirmation_message.trim()"
                                            class="user-input-confirmation"
                                        >
                                            {{ message.attributes.confirmation_message }}
                                        </div>
                                    </div>
                                </div>
                            </template>
                            <template v-else-if="message.shopify_output || message.message_type === 'product'">
                                <div class="product-message-container">
                                    <!-- Display the message text, removing images if products are present -->
                                    <div v-if="message.message" v-html="marked(message.shopify_output?.products?.length > 0 ? removeUrls(message.message) : message.message, { renderer })" class="product-message-text"></div>

                                    <!-- Always use carousel/list display -->
                                    <div v-if="message.shopify_output?.products && message.shopify_output.products.length > 0" class="products-carousel">
                                        <h3 class="carousel-title">Products</h3>
                                        <div class="carousel-items">
                                            <div v-for="product in message.shopify_output.products" :key="product.id" class="product-card-compact carousel-item">
                                                <div class="product-image-compact" v-if="product.image?.src">
                                                    <img :src="product.image.src" :alt="product.title" class="product-thumbnail">
                                                </div>
                                                <div class="product-info-compact">
                                                    <div class="product-text-area">
                                                        <div class="product-title-compact">{{ product.title }}</div>
                                                        <div class="product-variant-compact" v-if="product.variant_title && product.variant_title !== 'Default Title'">{{ product.variant_title }}</div>
                                                        <div class="product-price-compact">{{ product.price_formatted || `₹${product.price}` }}</div>
                                                    </div>
                                                    <div class="product-actions-compact">
                                                        <button
                                                            class="view-details-button-compact"
                                                            @click="handleViewDetails(product, message.shopify_output?.shop_domain)"
                                                        >
                                                            View product <span class="external-link-icon">↗</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- No products found message - only show if there's no message text -->
                                    <div v-else-if="!message.message && message.shopify_output?.products && message.shopify_output.products.length === 0" class="no-products-message">
                                        <p>No products found.</p>
                                    </div>
                                    <!-- Add a message if shopify_output exists but has no products array (edge case) -->
                                     <div v-else-if="!message.message && message.shopify_output && !message.shopify_output.products" class="no-products-message">
                                        <p>No products to display.</p>
                                     </div>
                                </div>
                            </template>
                            <template v-else>
                                <div v-html="marked(message.message, { renderer })"></div>

                                <!-- Display attachments if present -->
                                <div v-if="message.attachments && message.attachments.length > 0" class="message-attachments">
                                  <div
                                    v-for="attachment in message.attachments"
                                    :key="attachment.id"
                                    class="attachment-item"
                                  >
                                    <!-- Image attachment - render as image -->
                                    <template v-if="isImageAttachment(attachment.content_type)">
                                      <div class="attachment-image-container">
                                        <img
                                          :src="getDownloadUrl(attachment.file_url)"
                                          :alt="attachment.filename"
                                          class="attachment-image"
                                          @click.stop="openPreview({url: attachment.file_url, filename: attachment.filename, type: attachment.content_type, file_url: getDownloadUrl(attachment.file_url), size: undefined})"
                                          style="cursor: pointer;"
                                        />
                                        <div class="attachment-image-info">
                                          <a
                                            :href="getDownloadUrl(attachment.file_url)"
                                            target="_blank"
                                            class="attachment-link"
                                          >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                              <polyline points="7 10 12 15 17 10"></polyline>
                                              <line x1="12" y1="15" x2="12" y2="3"></line>
                                            </svg>
                                            {{ attachment.filename }}
                                            <span class="attachment-size">({{ formatFileSize(attachment.file_size) }})</span>
                                          </a>
                                        </div>
                                      </div>
                                    </template>
                                    <!-- Other file types - render as download link -->
                                    <template v-else>
                                      <a
                                        :href="getDownloadUrl(attachment.file_url)"
                                        target="_blank"
                                        class="attachment-link"
                                      >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                          <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                                        </svg>
                                        {{ attachment.filename }}
                                        <span class="attachment-size">({{ formatFileSize(attachment.file_size) }})</span>
                                      </a>
                                    </template>
                                  </div>
                                </div>
                            </template>
                        </div>
                        <div class="message-info">
                            <span v-if="message.message_type === 'user'" class="agent-name">
                                You
                            </span>
                        </div>
                    </div>
                </template>

                <!-- Typing indicator -->
                <div v-if="loading" class="typing-indicator">
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                </div>
            </div>

            <!-- Chat Input Section (Hidden when conversation is ended in workflow) -->
            <div v-if="!shouldShowNewConversationOption" class="chat-input" :class="{ 'ask-anything-input': isAskAnythingStyle }" :style="agentBubbleStyles">
                <div class="email-input" v-if="!hasStartedChat && !hasConversationToken && !isAskAnythingStyle">
                    <input
                        v-model="emailInput"
                        type="email"
                        placeholder="Enter your email address to begin"
                        :disabled="loading || connectionStatus !== 'connected'"
                        :class="{
                            'invalid': emailInput.trim() && !isValidEmail(emailInput.trim()),
                            'disabled': connectionStatus !== 'connected'
                        }"
                    >
                </div>

                <!-- File upload input (hidden) -->
                <input
                    ref="fileInputRef"
                    type="file"
                    :accept="acceptTypes"
                    multiple
                    style="display: none"
                    @change="handleFileSelect"
                />

                <!-- File previews -->
                <div v-if="uploadedAttachments.length > 0" class="file-previews-widget">
                    <div
                        v-for="(file, index) in uploadedAttachments"
                        :key="index"
                        class="file-preview-widget"
                    >
                        <div class="file-preview-content-widget" style="cursor: pointer;">
                            <img
                                v-if="isImage(file.type)"
                                :src="getPreviewUrl(file)"
                                :alt="file.filename"
                                class="file-preview-image-widget"
                                @click.stop="openPreview(file)"
                                style="cursor: pointer;"
                            />
                            <div v-else class="file-preview-icon-widget" @click.stop="openPreview(file)" style="cursor: pointer;">
                                <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2"
                                >
                                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                                    <polyline points="13 2 13 9 20 9"></polyline>
                                </svg>
                            </div>
                        </div>
                        <div class="file-preview-info-widget">
                            <div class="file-preview-name-widget">{{ file.filename }}</div>
                            <div class="file-preview-size-widget">{{ formatFileSize(file.size) }}</div>
                        </div>
                        <button
                            type="button"
                            class="file-preview-remove-widget"
                            @click="removeAttachment(index)"
                            :title="'Remove file'"
                        >
                            ×
                        </button>
                    </div>
                </div>

                <!-- Upload progress indicator -->
                <div v-if="isUploading" class="upload-progress-widget">
                    <div class="upload-spinner-widget"></div>
                    <span class="upload-text-widget">Uploading files...</span>
                </div>

                <div class="message-input">
                    <input
                        v-model="newMessage"
                        type="text"
                        :placeholder="placeholderText"
                        @keypress="handleKeyPress"
                        @input="handleInputSync"
                        @change="handleInputSync"
                        @paste="handlePaste"
                        @drop="handleDrop"
                        @dragover="handleDragOver"
                        @dragleave="handleDragLeave"
                        :disabled="!isMessageInputEnabled"
                        :class="{ 'disabled': !isMessageInputEnabled, 'ask-anything-field': isAskAnythingStyle }"
                    >
                    <button
                        v-if="canUploadMore"
                        type="button"
                        class="attach-button"
                        :disabled="isUploading"
                        @click="openFilePicker"
                        :title="`Attach files (${uploadedAttachments.length}/${maxFiles} used) or paste screenshots`"
                    >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"
                                stroke="currentColor"
                                stroke-width="2.2"
                                stroke-linecap="round"
                                stroke-linejoin="round"/>
                        </svg>
                        <span class="attach-button-glow"></span>
                    </button>
                    <button
                        class="send-button"
                        :class="{ 'ask-anything-send': isAskAnythingStyle }"
                        :style="userBubbleStyles"
                        @click="sendMessage"
                        :disabled="(!newMessage.trim() && uploadedAttachments.length === 0) || !isMessageInputEnabled"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 12L3 21L21 12L3 3L5 12ZM5 12L13 12" stroke="currentColor" stroke-width="2"
                                stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </button>
                </div>
            </div>

            <!-- New Conversation Section (Shown when conversation is ended in workflow) -->
            <div v-else class="new-conversation-section" :style="agentBubbleStyles">
                <div class="conversation-ended-message">
                    <p class="ended-text">This chat has ended.</p>
                    <button
                        class="start-new-conversation-button"
                        :style="userBubbleStyles"
                        @click="handleStartNewConversation"
                    >
                        Click here to start a new conversation
                    </button>
                </div>
            </div>

            <!-- Powered by footer -->
            <div class="powered-by" :style="messageNameStyles">
                <svg class="chattermate-logo" width="16" height="16" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M45 15H15C13.3431 15 12 16.3431 12 18V42C12 43.6569 13.3431 45 15 45H25L30 52L35 45H45C46.6569 45 48 43.6569 48 42V18C48 16.3431 46.6569 15 45 15Z" fill="currentColor" opacity="0.8"/>
                    <path d="M36 27C36 27 32.5 26 30 26C27.5 26 24 27 24 31C24 35 27.5 36 30 36C32.5 36 36 35 36 35V33C36 33 33 34 31.5 34C30 34 27 33 27 31C27 29 30 28 31.5 28C33 28 36 29 36 29V27Z" fill="currentColor"/>
                </svg>
                Powered by ChatterMate
            </div>
        </div>



        <!-- Rating Dialog -->
        <div v-if="showRatingDialog" class="rating-dialog">
            <div class="rating-content">
                <h3>Rate your conversation</h3>
                <div class="star-rating">
                    <button
                        v-for="star in 5"
                        :key="star"
                        @click="currentRating = star"
                        :class="{ active: star <= currentRating }"
                        class="star-button"
                    >
                        ★
                    </button>
                </div>
                <textarea
                    v-model="ratingFeedback"
                    placeholder="Additional feedback (optional)"
                    class="rating-feedback"
                ></textarea>
                <div class="rating-actions">
                    <button
                        @click="submitRating(currentRating, ratingFeedback)"
                        :disabled="!currentRating"
                        class="submit-button"
                        :style="userBubbleStyles"
                    >
                        Submit
                    </button>
                    <button
                        @click="showRatingDialog = false"
                        class="skip-rating"
                    >
                        Skip
                    </button>
                </div>
            </div>
        </div>

        <!-- Image Preview Modal -->
        <div v-if="previewModal" class="preview-modal-overlay" @click="closePreview">
            <div class="preview-modal-content" @click.stop>
                <button class="preview-modal-close" @click="closePreview">×</button>
                <div v-if="previewFile && isImage(previewFile.type)" class="preview-modal-image-container">
                    <img :src="getPreviewUrl(previewFile)" :alt="previewFile.filename" class="preview-modal-image" />
                    <div class="preview-modal-filename">{{ previewFile.filename }}</div>
                </div>
            </div>
        </div>
    </div>
    <div v-else class="widget-loading">
        <!-- Widget is initializing, waiting for widgetId -->
    </div>
</template>

<style scoped>
.chat-container {
    width: 100%;
    height: 580px;
    display: flex;
    flex-direction: column;
    background: transparent;
    overflow: hidden;
    position: relative;
    border-radius: var(--radius-lg);
    /* Subtle solid border around chat window */
    border: none;
    box-shadow: none;
    /* Open/close transition used when container toggles in embed */
    transition: opacity 220ms ease, transform 220ms ease;
}

.chat-container::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    border-radius: var(--radius-lg);
    border: 1px solid #e5e7eb;
}

.chat-container.collapsed {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.chat-panel {
    background: var(--background-base);
    display: flex;
    flex-direction: column;
    height: 100%;
    transition: all 0.3s ease;
    border-radius: 0;
}

.chat-header {
    padding: var(--space-md);
    display: flex;
    justify-content: flex-start;
    align-items: center;
}

.header-content {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
}

.header-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: cover;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border: 2px solid white;
}

.header-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.header-info h3 {
    margin: 0;
    font-size: var(--text-md);
    font-weight: 600;
    line-height: 1.2;
}

.status {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    font-size: var(--text-sm);
}

.status-indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--error-color);
    box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
    animation: pulse-offline 2s ease-in-out infinite;
}

@keyframes pulse-offline {
    0%, 100% {
        opacity: 1;
    }
    50% {
        opacity: 0.5;
    }
}

.status-indicator.online {
    background: var(--success-color);
    box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
    animation: pulse-online 2s ease-in-out infinite;
}

@keyframes pulse-online {
    0%, 100% {
        box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
    }
    50% {
        box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.3);
    }
}

.chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: var(--space-md);
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    -webkit-overflow-scrolling: touch;
    scroll-behavior: smooth;
    margin-top: var(--space-sm);
}

.message {
    display: flex;
    gap: var(--space-sm);
    max-width: 85%;
    align-items: flex-start;
    margin-bottom: var(--space-md);
    animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.message-avatar {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    object-fit: cover;
    margin-top: 4px;
}

.message-bubble {
    padding: 10px 14px;
    border-radius: 18px;
    line-height: 1.4;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    max-width: 85%;
    transition: all 0.2s ease;
    position: relative;
}

.message-bubble:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.user-message {
    align-self: flex-end;
    flex-direction: row-reverse;
}

.user-message .message-bubble {
    border-bottom-right-radius: 6px;
    background: linear-gradient(135deg, var(--primary-color) 0%, color-mix(in srgb, var(--primary-color) 90%, black) 100%);
}

.assistant-message .message-bubble,
.agent-message .message-bubble {
    border-bottom-left-radius: 6px;
    background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%);
    border: 1px solid rgba(0, 0, 0, 0.06);
}

.chat-input {
    padding: var(--space-md);
    border-top: 1px solid var(--border-color);
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
}

.email-input {
    width: 85%;
}

.email-input input {
    width: 100%;
    padding: var(--space-sm) var(--space-md);
    border: 2px solid var(--border-color);
    border-radius: var(--radius-lg);
}

.email-input input.invalid {
    border-color: var(--error-color);
}

.email-input input.invalid:focus {
    outline-color: var(--error-color);
}

.message-input {
    display: flex;
    gap: var(--space-sm);
}

.message-input input {
    flex: 1;
    padding: var(--space-sm) var(--space-md);
    border: 2px solid var(--border-color);
    border-radius: var(--radius-lg);
}

.message-input input:disabled {
    background-color: rgba(0, 0, 0, 0.05);
    cursor: not-allowed;
}

.send-button {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-sm);
    min-width: 40px;
    height: 40px;
    border: none;
    border-radius: var(--radius-lg);
    cursor: pointer;
    color: white;
}

.send-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.loading {
    display: flex;
    gap: 4px;
    padding: 12px 16px;
}

.dot {
    width: 8px;
    height: 8px;
    background: currentColor;
    border-radius: 50%;
    opacity: 0.6;
    animation: bounce 1.4s infinite ease-in-out;
}

.dot:nth-child(1) {
    animation-delay: -0.32s;
}

.dot:nth-child(2) {
    animation-delay: -0.16s;
}

@keyframes bounce {

    0%,
    80%,
    100% {
        transform: scale(0);
    }

    40% {
        transform: scale(1);
    }
}

.powered-by {
    text-align: center;
    padding: var(--space-xs);
    font-size: 0.75rem;
    opacity: 0.7;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
    margin-top: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
}

/* New conversation section styles */
.new-conversation-section {
    padding: var(--space-md);
    border-top: 1px solid var(--border-color);
    display: flex;
    justify-content: center;
    align-items: center;
}

.conversation-ended-message {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-md);
    text-align: center;
    width: 100%;
}

.ended-text {
    margin: 0;
    font-size: var(--text-sm);
    color: var(--text-muted);
    font-weight: 500;
}

.start-new-conversation-button {
    padding: var(--space-sm) var(--space-lg);
    border: none;
    border-radius: var(--radius-lg);
    font-size: var(--text-sm);
    font-weight: 600;
    color: white;
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.start-new-conversation-button:hover {
    opacity: 0.9;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.start-new-conversation-button:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.error-alert {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    padding: 12px;
    text-align: center;
    color: white;
    z-index: 100;
    animation: slideDown 0.3s ease-out;
    border-radius: 24px 24px 0 0;
}

@keyframes slideDown {
    from {
        transform: translateY(-100%);
    }
    to {
        transform: translateY(0);
    }
}

.chat-container.collapsed .error-alert {
    display: none;
}

@media (max-width: 768px) {

    .chat-container,
    .chat-container.collapsed {
        width: 100vw !important;
        height: 100vh !important;
        height: 100dvh !important;
        border-radius: 0 !important;
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        bottom: 0 !important;
        right: 0 !important;
        max-width: 100vw !important;
        max-height: 100vh !important;
        max-height: 100dvh !important;
    }

    .chat-panel {
        height: 100%;
        border-radius: 0;
    }

    .chat-messages {
        padding: var(--space-sm);
    }

    .chat-toggle {
        width: 48px;
        height: 48px;
        font-size: 14px;
    }

    /* Mobile styles for new conversation section */
    .new-conversation-section {
        padding: var(--space-sm);
    }

    .conversation-ended-message {
        gap: var(--space-sm);
    }

    .ended-text {
        font-size: var(--text-xs);
    }

    .start-new-conversation-button {
        padding: var(--space-xs) var(--space-md);
        font-size: var(--text-xs);
        min-width: 160px;
        border-radius: var(--radius-md);
    }
}

.loading-history {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: var(--space-sm);
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    background: rgba(255, 255, 255, 0.9);
    z-index: 10;
}

.loading-spinner {
    display: flex;
    gap: 4px;
}

.message-info {
    font-size: 0.75rem;
    margin-top: 4px;
    display: flex;
    align-items: center;
    gap: 4px;
}

.agent-name {
    color: var(--text-muted);
    font-size: 0.75rem;
    font-weight: 500;
    opacity: 0.8;
}

.message-time {
    font-size: 0.75rem;
    opacity: 0.7;
    margin-top: 4px;
    text-align: right;
}

.typing-indicator {
    display: flex;
    gap: 4px;
    padding: 12px 16px;
    margin-top: var(--space-md);
}

.connection-status {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    padding: 12px;
    text-align: center;
    z-index: 100;
    background: rgba(255, 255, 255, 0.95);
    border-bottom: 1px solid var(--border-color);
}

.connecting-message {
    color: var(--text-color);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
}

.failed-message {
    color: var(--error-color);
}

.reconnect-button {
    background: none;
    border: none;
    color: var(--primary-color);
    text-decoration: underline;
    cursor: pointer;
    padding: 4px 8px;
    margin-left: 8px;
}

.reconnect-button:hover {
    color: var(--primary-dark);
}

.loading-dots {
    display: flex;
    gap: 4px;
    margin-left: 4px;
}

.loading-dots .dot {
    width: 6px;
    height: 6px;
    background: currentColor;
    border-radius: 50%;
    animation: bounce 1.4s infinite ease-in-out;
}

.loading-dots .dot:nth-child(1) { animation-delay: -0.32s; }
.loading-dots .dot:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
    0%, 80%, 100% { transform: scale(0); }
    40% { transform: scale(1); }
}

.message-input input.disabled,
.email-input input.disabled {
    background-color: rgba(0, 0, 0, 0.05) !important;
    cursor: not-allowed;
    color: var(--text-muted);
}

.message-input input.disabled::placeholder,
.email-input input.disabled::placeholder {
    color: var(--text-muted);
}

/* Add styles for agent messages */
.message.agent-message {
    margin-right: auto;
    justify-content: flex-start;
}

.agent-name {
    font-size: 12px;
    color: #9ca3af;
    margin-top: 4px;
    margin-left: 8px;
}

.message-info {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
    margin-top: 4px;
}

/* Add system message styles */
.message.system-message {
    align-self: center;
    max-width: 100%;
    margin: var(--space-sm) 0;
}

.system-message .message-bubble {
    background: rgba(0, 0, 0, 0.05);
    color: var(--text-muted);
    font-size: 0.85em;
    padding: var(--space-xs) var(--space-md);
    border-radius: var(--radius-lg);
    text-align: center;
}

.initializing-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.95);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    border-radius: var(--radius-lg);
}

.loading-text {
    margin-top: var(--space-md);
    color: var(--text-color);
    font-size: var(--text-md);
}

.loading-spinner {
    display: flex;
    gap: 6px;
}

.loading-spinner .dot {
    width: 10px;
    height: 10px;
    background: var(--primary-color);
    border-radius: 50%;
    animation: bounce 1.4s infinite ease-in-out;
}

.loading-spinner .dot:nth-child(1) { animation-delay: -0.32s; }
.loading-spinner .dot:nth-child(2) { animation-delay: -0.16s; }

.rating-dialog {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.rating-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 0.5rem;
    width: 100%;
}

.star-rating {
    display: flex;
    gap: 0.75rem;
    justify-content: center;
    margin: 0 0 24px;
}

.star-button {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 28px;
    color: #d1d5db;
    transition: all var(--transition-fast);
    padding: 0 4px;
    transform-origin: center;
    line-height: 1;
}

.star-button:hover {
    transform: scale(1.1);
}

.star-button.selected {
    transform: scale(1.05);
}

.star-button.warning {
    color: var(--error-color);
    text-shadow: 0 0 5px rgba(239, 68, 68, 0.3);
}

.star-button.success {
    color: var(--success-color);
    text-shadow: 0 0 5px rgba(16, 185, 129, 0.3);
}

.star-button:disabled {
    cursor: not-allowed;
    opacity: 0.7;
}

.submit-button {
    padding: 12px 20px;
    border: none;
    border-radius: var(--radius-md);
    background-color: var(--primary-color);
    color: white;
    cursor: pointer;
    font-size: var(--text-base);
    font-weight: 600;
    transition: all var(--transition-fast);
    width: 100%;
    text-align: center;
    display: block;
    margin-top: 16px;
}

.submit-button:hover:not(:disabled) {
    opacity: 0.9;
}

.submit-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.rating-prompt {
    font-size: var(--text-sm);
    color: var(--text-primary);
    margin-bottom: 24px;
    text-align: center;
    font-weight: 500;
}

.rating-message {
    align-self: center;
    width: 100%;
    max-width: 500px;
    margin: var(--space-sm) 0;
}

.rating-message .message-bubble {
    background-color: white;
    padding: var(--space-md) var(--space-md);
    border-radius: 12px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
    border: 1px solid var(--border-color);
    transition: all var(--transition-normal);
}

.rating-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    padding: 0;
}

.rating-prompt {
    font-size: var(--text-sm);
    color: var(--text-primary);
    margin-bottom: 20px;
    text-align: center;
    font-weight: 500;
}

.star-rating {
    display: flex;
    gap: 0.75rem;
    justify-content: center;
    margin: 0 0 20px;
}

.feedback-wrapper {
    width: 100%;
}

.feedback-section {
    display: flex;
    flex-direction: column;
    gap: 2px;
    width: 100%;
    padding: 0;
    margin-bottom: 4px;
}

.feedback-input {
    padding: 10px 14px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    font-size: var(--text-sm);
    transition: border-color var(--transition-fast);
    background-color: white;
    box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
}

.feedback-input:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(243, 70, 17, 0.1);
}

.feedback-counter {
    font-size: var(--text-xs);
    color: var(--text-muted);
    text-align: right;
    margin-right: 4px;
    padding: 0 4px;
}

.submit-rating-button {
    padding: 10px 20px;
    border: none;
    border-radius: 8px;
    background-color: var(--primary-color);
    color: white;
    cursor: pointer;
    font-size: var(--text-base);
    font-weight: 600;
    transition: all var(--transition-fast);
    width: 100%;
    text-align: center;
    display: block;
    margin: 12px 0 0;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.submit-rating-button:hover:not(:disabled) {
    opacity: 0.95;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
}

.submit-rating-button:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.submit-rating-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.submitted .star-button {
    pointer-events: none;
    opacity: 0.7;
}

.submitted-feedback-wrapper {
    width: 100%;
    margin-top: 16px;
}

.submitted-feedback {
    padding: 12px 16px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background-color: #f9f9f9;
    margin-bottom: 8px;
}

.submitted-feedback-text {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    margin: 0;
    line-height: 1.5;
    word-break: break-word;
}

.submitted-message {
    font-size: var(--text-sm);
    color: var(--success-color);
    text-align: center;
    font-weight: 500;
    margin-top: 8px;
}

/* Compact Product Card Styles - UPDATED */
.message.product-message .message-bubble {
    padding: 0;
    background: none;
    border: none;
    box-shadow: none;
    width: 100%;
    max-width: none;
}

.product-card-compact {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    border: 1px solid var(--border-color); /* Keep border, ensure it uses token */
    border-radius: var(--radius-lg); /* Slightly larger radius for modern feel */
    overflow: hidden;
    background-color: var(--background-base);
    box-shadow: var(--shadow-sm); /* Use softer shadow */
    padding: var(--space-md); /* Increased padding */
    gap: var(--space-md); /* Increased gap */
    width: 100%;
    transition: box-shadow var(--transition-fast); /* Add transition */
}

.product-card-compact:hover {
    box-shadow: var(--shadow-md); /* Slightly elevate on hover */
}

.product-card-compact.carousel-item {
    flex-direction: column;
    align-items: stretch;
    width: 160px;
    flex-shrink: 0;
    padding: 0;
    gap: 0;
    height: auto;
    border-radius: var(--radius-md); /* Keep standard radius for carousel */
    box-shadow: var(--shadow-sm);
}

.product-card-compact.carousel-item:hover {
     box-shadow: var(--shadow-md);
}

.product-card-compact.single-product {
    max-width: 280px; /* Reduced max width */
    align-self: flex-start;
    padding: var(--space-sm); /* Reduced padding */
    gap: var(--space-sm); /* Reduced gap */
    display: flex;
    flex-direction: row;
    align-items: flex-start; /* Align items at the start */
}

.product-card-compact.single-product .product-image-compact {
    width: 50px; /* Smaller image */
    height: 50px;
    border-radius: var(--radius-xs); /* Smaller radius */
    flex-shrink: 0;
}

.product-card-compact.single-product .product-info-compact {
    display: flex;
    flex-direction: column;
    justify-content: space-between; /* Space out text and button */
    flex: 1; /* Take remaining space */
    min-height: 50px; /* Match image height */
    gap: var(--space-xxs); /* Reduced gap */
}

.product-card-compact.single-product .product-text-info {
    display: flex;
    flex-direction: column;
    gap: 1px; /* Very small gap between text lines */
}

.product-card-compact.single-product .product-title-compact {
    font-size: var(--text-xs); /* Smaller font */
    font-weight: 500;
    line-height: 1.3;
    white-space: normal; /* Allow wrapping */
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    margin: 0;
}

.product-card-compact.single-product .product-variant-compact {
    font-size: 10px; /* Even smaller variant text */
    color: var(--text-muted);
    line-height: 1.2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.product-card-compact.single-product .product-price-compact {
    font-size: var(--text-xs); /* Smaller font */
    font-weight: 600;
    margin-top: 2px;
}

.product-card-compact.single-product .product-actions-compact {
    margin-top: auto; /* Push button to bottom */
    width: 100%; /* Make container full width */
}

.product-card-compact.single-product .view-details-button-compact {
    width: 100%; /* Make button full width */
    padding: 5px 8px; /* Smaller padding */
    font-size: 11px; /* Smaller font */
    justify-content: center; /* Center text/icon */
}

.product-image-compact {
    position: relative;
    width: 60px; /* Fixed width for thumbnail */
    height: 60px; /* Fixed height for thumbnail */
    aspect-ratio: 1 / 1;
    background-color: var(--background-soft);
    overflow: hidden;
    border: none; /* Remove border */
    border-radius: var(--radius-sm); /* Rounded corners */
    flex-shrink: 0; /* Prevent image from shrinking */
}

.product-card-compact.carousel-item .product-image-compact {
    width: 100%;
    height: auto;
    aspect-ratio: 1 / 1;
    border-radius: 0;
    border-bottom: 1px solid var(--border-color);
}

.product-thumbnail {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform var(--transition-fast);
}

.product-thumbnail:hover {
    transform: scale(1.05);
}

.product-info-compact {
    display: flex;
    flex-direction: column;
    gap: 2px; /* Reduced gap */
    flex: 1; /* Allow info to take remaining space */
    justify-content: center; /* Center content vertically */
    min-width: 0; /* Prevent flex item overflow */
}

.product-card-compact.carousel-item .product-info-compact {
    padding: var(--space-sm);
    gap: var(--space-xs);
    justify-content: flex-start; /* Align items to start for carousel */
}

.product-title-compact {
    margin: 0;
    font-size: var(--text-sm);
    font-weight: 500;
    line-height: 1.4;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap; /* Single line */
}

.product-variant-compact {
    font-size: var(--text-xs);
    color: var(--text-muted);
    line-height: 1.3;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.product-price-compact {
    font-size: var(--text-sm); /* Adjusted size */
    font-weight: 600; /* Adjusted weight */
    color: var(--text-primary);
    white-space: nowrap;
    margin-top: 2px; /* Small top margin */
}

.product-actions-compact {
    display: flex;
    gap: var(--space-xs);
    margin-top: var(--space-sm); /* Add margin for single card */
}

.product-actions-compact.single {
     justify-content: flex-start; /* Align button left */
}

.product-card-compact.carousel-item .product-actions-compact {
    margin-top: auto; /* Push actions to bottom */
    padding-top: var(--space-xs);
}

.add-to-cart-button-compact,
.view-details-button-compact {
    flex: none; /* Don't grow */
    padding: 6px 10px; /* Adjusted padding */
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    font-weight: 500;
    font-size: var(--text-xs);
    cursor: pointer;
    transition: all var(--transition-fast);
    text-align: center;
    white-space: nowrap;
    background-color: var(--background-base);
    color: var(--text-secondary);
    line-height: 1;
}

.add-to-cart-button-compact {
    background-color: var(--primary-color);
    color: white;
    border-color: transparent;
    box-shadow: var(--shadow-xs);
    flex: 1; /* Allow add button to take space in carousel */
}

.view-details-button-compact {
     display: inline-flex; /* Align icon */
     align-items: center;
     gap: 4px;
}

.external-link-icon {
    font-size: 1em;
    line-height: 1;
    display: inline-block;
}

.add-to-cart-button-compact:hover:not(:disabled) {
    opacity: 0.9;
    box-shadow: var(--shadow-sm);
}

.add-to-cart-button-compact:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
    opacity: 0.7;
    box-shadow: none;
}

.view-details-button-compact:hover {
    background-color: var(--background-soft);
    border-color: var(--border-color-hover);
    color: var(--text-primary);
}

/* Remove old .product-card styles */
/* .product-card { ... } */
/* .product-image-container { ... } */
/* .product-image { ... } */
/* .product-badge { ... } */
/* .product-details { ... } */
/* .product-title { ... } */
/* .product-price { ... } */
/* .current-price { ... } */
/* .product-meta { ... } */
/* .product-vendor { ... } */
/* .label { ... } */
/* .product-type { ... } */
/* .product-description { ... } */
/* .product-actions { ... } */
/* .add-to-cart-button { ... } */
/* .view-details-button { ... } */

/* Ensure product message container uses full width */
.product-message-container {
    width: 100%;
    overflow: hidden; /* Hide scrollbar overflow from container */
}

.products-carousel {
    margin: var(--space-xs) 0;
    width: 100%;
    padding: var(--space-xs);
    background: rgba(0, 0, 0, 0.02);
    border-radius: 20px;
}

.carousel-title {
    font-size: var(--text-base);
    font-weight: 600;
    margin-bottom: var(--space-sm);
    color: var(--text-primary);
    padding: 0 var(--space-xs);
}

.carousel-items {
    display: flex;
    flex-direction: row;
    gap: var(--space-sm);
    margin-top: var(--space-xs);
    overflow-x: auto;
    padding: var(--space-xs);
    padding-bottom: var(--space-md);
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: thin;
    scrollbar-color: rgba(0, 0, 0, 0.3) rgba(0, 0, 0, 0.1);
}

/* Modern scrollbar styling */
.carousel-items::-webkit-scrollbar {
    display: block;
    height: 8px;
}

.carousel-items::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.05);
    border-radius: 4px;
}

.carousel-items::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 4px;
    transition: background-color 0.2s;
}

.carousel-items::-webkit-scrollbar-thumb:hover {
    background-color: rgba(0, 0, 0, 0.3);
}

/* Enhanced product card styling */
.product-card-compact {
    background-color: white;
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06),
                0 1px 2px rgba(0, 0, 0, 0.04);
    overflow: hidden;
    width: 180px; /* Slightly reduced width */
    flex-shrink: 0;
    transition: all 0.2s ease;
}

.product-card-compact:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08),
                0 2px 4px rgba(0, 0, 0, 0.06);
}

.product-card-compact .product-info-compact {
    display: flex;
    flex-direction: column;
    padding: var(--space-sm) var(--space-sm);
    gap: var(--space-xs);
    background-color: white;
}

.product-card-compact .product-title-compact {
    font-size: var(--text-sm);
    font-weight: 500;
    line-height: 1.4;
    color: var(--text-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    margin: 0;
    min-height: 2.8em;
}

.product-card-compact .product-price-compact {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--text-primary);
    margin-top: 2px;
}

.product-card-compact .view-details-button-compact {
    width: 100%;
    padding: 8px 12px;
    background-color: white;
    color: var(--text-primary);
    border: 1px solid var(--border-color);
    border-radius: 16px;
    font-size: var(--text-xs);
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
    margin-top: var(--space-xs);
}

.product-card-compact .view-details-button-compact:hover {
    background-color: var(--background-soft);
    border-color: var(--border-color-hover);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}

.product-message-container {
    width: 100%;
    margin: var(--space-sm) 0;
    padding: 0 var(--space-xs);
}

/* Adjust carousel title spacing */
.carousel-title {
    font-size: var(--text-base);
    font-weight: 600;
    margin-bottom: var(--space-sm);
    color: var(--text-primary);
    padding: 0 var(--space-xs);
}

.no-products-message {
    padding: var(--space-md);
    color: var(--text-muted);
    text-align: center;
    font-style: italic;
    font-size: var(--text-sm);
}

/* Modern Form Styles */
.message.form-message {
    align-self: center;
    width: 100%;
    max-width: 520px;
    margin: var(--space-md) 0;
}

.form-message .message-bubble {
    background: linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%);
    padding: var(--space-xl);
    border-radius: 24px;
    box-shadow:
        0 20px 25px -5px rgba(0, 0, 0, 0.1),
        0 10px 10px -5px rgba(0, 0, 0, 0.04),
        0 0 0 1px rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(0, 0, 0, 0.06);
    width: 100%;
    max-width: none;
    backdrop-filter: blur(10px);
    position: relative;
    overflow: hidden;
}

.form-message .message-bubble::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--primary-color), #ff6b6b, #4ecdc4, var(--primary-color));
    background-size: 200% 100%;
    animation: gradientShift 3s ease infinite;
}

@keyframes gradientShift {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
}

.form-content {
    width: 100%;
    position: relative;
}

.form-header {
    margin-bottom: var(--space-xl);
    text-align: center;
    position: relative;
}

.form-title {
    font-size: 28px;
    font-weight: 700;
    background: black;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0 0 var(--space-sm) 0;
    letter-spacing: -0.02em;
}

.form-description {
    font-size: var(--text-base);
    color: var(--text-secondary);
    margin: 0;
    line-height: 1.6;
    opacity: 0.8;
}











/* Responsive form styles */
@media (max-width: 768px) {
    .message.form-message {
        max-width: 100%;
        margin: var(--space-sm) 0;
    }

    .form-message .message-bubble {
        padding: var(--space-lg);
        border-radius: 20px;
        margin: 0 var(--space-xs);
    }

    .form-title {
        font-size: 24px;
        letter-spacing: -0.01em;
    }

    .form-description {
        font-size: var(--text-sm);
    }






}

/* User Input Message Styles */
.user-input-content {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
}

.user-input-prompt {
    font-size: var(--text-base);
    color: var(--text-primary);
    line-height: 1.5;
}

.user-input-form {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
    padding: var(--space-md);
    background: var(--background-soft);
    border-radius: var(--radius-md);
    border: 1px solid var(--border-color);
}

.user-input-textarea {
    width: 100%;
    padding: var(--space-sm) var(--space-md);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    background: var(--background-base);
    color: var(--text-primary);
    font-size: var(--text-base);
    font-family: inherit;
    resize: vertical;
    min-height: 80px;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.user-input-textarea:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(243, 70, 17, 0.1);
}

.user-input-textarea::placeholder {
    color: var(--text-muted);
}

.user-input-actions {
    display: flex;
    justify-content: flex-end;
}

.user-input-submit-button {
    padding: var(--space-sm) var(--space-lg);
    background: var(--primary-color);
    color: white;
    border: none;
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 100px;
}

.user-input-submit-button:hover:not(:disabled) {
    background: var(--primary-dark);
    transform: translateY(-1px);
}

.user-input-submit-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
}

.user-input-submitted {
    padding: var(--space-md);
    background: var(--background-soft);
    border-radius: var(--radius-md);
    border: 1px solid var(--border-color);
}

.submitted-input {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    line-height: 1.4;
}

.submitted-input strong {
    color: var(--text-primary);
    font-weight: 600;
}

/* Responsive styles for user input */
@media (max-width: 768px) {
    .user-input-form {
        padding: var(--space-sm);
        gap: var(--space-xs);
    }

    .user-input-textarea {
        min-height: 60px;
        padding: var(--space-xs) var(--space-sm);
    }

    .user-input-submit-button {
        padding: var(--space-xs) var(--space-md);
        font-size: var(--text-xs);
        min-width: 80px;
    }

    .user-input-submitted {
        padding: var(--space-sm);
    }
}

/* ========== ASK_ANYTHING CHAT STYLE - COMPLETE OVERRIDE ========== */

.chat-container.ask-anything-style {
    max-width: 400px;
    min-width: 400px;
    width: 400px;
    margin: 0 auto;
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
    border-radius: 24px;
    background: white;
}

/* Tablet responsive for ASK_ANYTHING */
@media (max-width: 1024px) and (min-width: 769px) {
    .chat-container.ask-anything-style {
        max-width: 700px;
        min-width: 500px;
        margin: 10px auto;
        height: 650px;
    }
}

/* ASK_ANYTHING: Complete chat messages container override */
.chat-container.ask-anything-style .chat-messages {
    flex: 1 !important;
    overflow-y: auto !important;
    padding: var(--space-xl) !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: flex-start !important;
    justify-content: flex-start !important;
    gap: var(--space-md) !important;
    -webkit-overflow-scrolling: touch !important;
    scroll-behavior: smooth !important;
    margin-top: 0 !important;
    max-width: 600px !important;
    margin-left: auto !important;
    margin-right: auto !important;
    width: 100% !important;
    box-sizing: border-box !important;
}

/* ASK_ANYTHING: Reset all message base styles */
.chat-container.ask-anything-style .chat-messages .message {
    display: flex !important;
    gap: var(--space-sm) !important;
    max-width: 85% !important;
    align-items: flex-start !important;
    margin-bottom: var(--space-md) !important;
    margin-left: 0 !important;
    margin-right: 0 !important;
    width: auto !important;
    align-self: unset !important;
    justify-content: unset !important;
    text-align: unset !important;
}

/* ASK_ANYTHING: User messages - force right alignment */
.chat-container.ask-anything-style .chat-messages .message.user-message,
.chat-container.ask-anything-style .message.user-message,
.chat-container.ask-anything-style div.message.user-message {
    align-self: flex-end !important;
    margin-left: auto !important;
    margin-right: 0 !important;
    flex-direction: row-reverse !important;
    text-align: right !important;
    justify-content: flex-start !important;
    width: auto !important;
    max-width: 85% !important;
}

/* ASK_ANYTHING: Agent/Bot messages - force left alignment */
.chat-container.ask-anything-style .chat-messages .message.agent-message,
.chat-container.ask-anything-style .chat-messages .message.bot,
.chat-container.ask-anything-style .chat-messages .message.agent,
.chat-container.ask-anything-style .message.agent-message,
.chat-container.ask-anything-style .message.bot,
.chat-container.ask-anything-style .message.agent,
.chat-container.ask-anything-style div.message.agent-message,
.chat-container.ask-anything-style div.message.bot,
.chat-container.ask-anything-style div.message.agent {
    align-self: flex-start !important;
    margin-left: 0 !important;
    margin-right: auto !important;
    flex-direction: row !important;
    text-align: left !important;
    justify-content: flex-start !important;
    width: auto !important;
    max-width: 85% !important;
}

/* ASK_ANYTHING: Typing indicator - force left alignment */
.chat-container.ask-anything-style .typing-indicator {
    display: flex !important;
    gap: 4px !important;
    padding: 12px 16px !important;
    margin-top: var(--space-md) !important;
    align-self: flex-start !important;
    margin-left: 0 !important;
    margin-right: auto !important;
    width: auto !important;
    max-width: 85% !important;
    justify-content: flex-start !important;
}

/* ASK_ANYTHING: System messages - center them */
.chat-container.ask-anything-style .chat-messages .message.system-message,
.chat-container.ask-anything-style .message.system-message {
    align-self: center !important;
    margin: var(--space-sm) auto !important;
    text-align: center !important;
    max-width: 100% !important;
    justify-content: center !important;
}

/* ASK_ANYTHING: Message bubbles */
.chat-container.ask-anything-style .message-bubble {
    padding: var(--space-md) var(--space-lg) !important;
    border-radius: 20px !important;
    line-height: 1.4 !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08) !important;
    max-width: 100% !important;
    width: auto !important;
    display: inline-block !important;
}

.chat-container.ask-anything-style .user-message .message-bubble {
    border-bottom-right-radius: 6px !important;
}

.chat-container.ask-anything-style .agent-message .message-bubble,
.chat-container.ask-anything-style .bot .message-bubble,
.chat-container.ask-anything-style .agent .message-bubble {
    border-bottom-left-radius: 6px !important;
}

/* ASK_ANYTHING: Chat Panel Layout */
.chat-panel.ask-anything-chat {
    max-width: 700px;
    margin: 0 auto;
    background: var(--background-base);
    border-radius: var(--radius-lg);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}

/* ASK_ANYTHING Input Styling */
.chat-input.ask-anything-input {
    padding: var(--space-xl) !important;
    background: var(--background-base) !important;
    border-top: 1px solid var(--border-color) !important;
    border-radius: 0 0 var(--radius-lg) var(--radius-lg) !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
}

.chat-input.ask-anything-input .message-input {
    max-width: 600px !important;
    margin: 0 auto !important;
    gap: var(--space-md) !important;
    display: flex !important;
    align-items: center !important;
    width: 100% !important;
}

.chat-input.ask-anything-input .email-input {
    max-width: 600px !important;
    margin: 0 auto var(--space-md) auto !important;
    width: 100% !important;
}

.chat-input.ask-anything-input .email-input input {
    padding: 18px 24px;
    border: 2px solid var(--border-color);
    border-radius: 16px;
    font-size: 1rem;
    font-weight: 500;
    background: var(--background-base);
    color: var(--text-primary);
    transition: all 0.3s ease;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.chat-input.ask-anything-input .email-input input:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 4px rgba(243, 70, 17, 0.1), 0 8px 16px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
}

.ask-anything-field {
    padding: 18px 24px !important;
    border: 2px solid var(--border-color) !important;
    border-radius: 16px !important;
    font-size: 1rem !important;
    font-weight: 500 !important;
    background: var(--background-base) !important;
    color: var(--text-primary) !important;
    transition: all 0.3s ease !important;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05) !important;
}

.ask-anything-field:focus {
    outline: none !important;
    border-color: var(--primary-color) !important;
    box-shadow: 0 0 0 4px rgba(243, 70, 17, 0.1), 0 8px 16px rgba(0, 0, 0, 0.1) !important;
    transform: translateY(-1px) !important;
}

.ask-anything-field::placeholder {
    color: var(--text-muted) !important;
    font-weight: 400 !important;
}

.send-button.ask-anything-send {
    padding: 18px !important;
    min-width: 56px !important;
    height: 56px !important;
    border-radius: 16px !important;
    transition: all 0.3s ease !important;
    box-shadow: 0 4px 14px rgba(243, 70, 17, 0.3) !important;
}

.send-button.ask-anything-send:hover:not(:disabled) {
    transform: translateY(-2px) !important;
    box-shadow: 0 8px 25px rgba(243, 70, 17, 0.4) !important;
}

.send-button.ask-anything-send:active:not(:disabled) {
    transform: translateY(0) !important;
    box-shadow: 0 4px 14px rgba(243, 70, 17, 0.3) !important;
}

/* Welcome Message Section for ASK_ANYTHING Style */
.welcome-message-section {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    background: var(--background-base);
    border-radius: var(--radius-lg);
    position: relative;
    overflow: hidden;
    padding: var(--space-xl);
    box-sizing: border-box;
}

.welcome-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    max-width: 600px;
    text-align: center;
    flex: 1;
}

.welcome-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-lg);
}

.welcome-avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    object-fit: cover;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
    border: 4px solid white;
}

.welcome-title {
    font-size: 2.5rem;
    font-weight: 700;
    color: #1f2937;
    margin: 0;
    line-height: 1.2;
    letter-spacing: -0.02em;
}

.welcome-subtitle {
    font-size: 1.125rem;
    color: var(--text-secondary);
    margin: 0;
    line-height: 1.6;
    max-width: 500px;
    font-weight: 400;
}

/* Welcome Input Section */
.welcome-input-section {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    background: var(--background-base);
    border-radius: var(--radius-lg);
    position: relative;
}

.welcome-input-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-lg);
    max-width: 600px;
    margin: 0 auto;
    width: 100%;
    padding: 0;
}

.welcome-input-container .email-input {
    width: 100%;
    margin-bottom: var(--space-md);
}

.welcome-email-input {
    width: 100%;
    padding: 18px 24px;
    border: 2px solid var(--border-color);
    border-radius: 16px;
    font-size: 1rem;
    font-weight: 500;
    background: var(--background-base);
    color: var(--text-primary);
    transition: all 0.3s ease;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.welcome-email-input:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 4px rgba(243, 70, 17, 0.1), 0 8px 16px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
}

.welcome-email-input.invalid {
    border-color: var(--error-color);
    box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1);
}

.welcome-email-input.disabled {
    background-color: rgba(0, 0, 0, 0.05);
    cursor: not-allowed;
    opacity: 0.7;
}

.welcome-message-input {
    display: flex;
    gap: var(--space-md);
    width: 100%;
    align-items: center;
}

.welcome-message-field {
    flex: 1;
    padding: 18px 24px;
    border: 2px solid var(--border-color);
    border-radius: 16px;
    font-size: 1rem;
    font-weight: 500;
    background: var(--background-base);
    color: var(--text-primary);
    transition: all 0.3s ease;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.welcome-message-field:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 4px rgba(243, 70, 17, 0.1), 0 8px 16px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
}

.welcome-message-field.disabled {
    background-color: rgba(0, 0, 0, 0.05);
    cursor: not-allowed;
    opacity: 0.7;
}

.welcome-message-field::placeholder {
    color: var(--text-muted);
    font-weight: 400;
}

.welcome-send-button {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 18px;
    min-width: 56px;
    height: 56px;
    border: none;
    border-radius: 16px;
    cursor: pointer;
    color: white;
    transition: all 0.3s ease;
    box-shadow: 0 4px 14px rgba(243, 70, 17, 0.3);
}

.welcome-send-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(243, 70, 17, 0.4);
}

.welcome-send-button:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 0 4px 14px rgba(243, 70, 17, 0.3);
}

.welcome-send-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.powered-by-welcome {
    text-align: center;
    font-size: 0.75rem;
    opacity: 0.6;
    color: var(--text-muted);
    padding: var(--space-md);
    background: transparent;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    margin-top: auto;
}

/* Mobile responsive styles for ASK_ANYTHING */
@media (max-width: 768px) {
    .chat-container.ask-anything-style {
        min-width: 100vw !important;
        max-width: 100vw !important;
        width: 100vw !important;
        height: 100vh !important;
        height: 100dvh !important;
        margin: 0 !important;
        border-radius: 0 !important;
        box-shadow: none !important;
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
    }

    .chat-panel.ask-anything-chat {
        max-width: 100% !important;
        width: 100vw !important;
        height: 100vh !important;
        height: 100dvh !important;
        margin: 0 !important;
        border-radius: 0 !important;
    }

    .chat-container.ask-anything-style .chat-messages {
        padding: var(--space-lg) !important;
        max-width: 100% !important;
        /* Add space for mobile top bar when present */
        padding-top: calc(var(--space-lg) + 60px) !important;
        height: calc(100vh - 60px - 120px) !important; /* topbar + input */
        height: calc(100dvh - 60px - 120px) !important;
    }

    .chat-input.ask-anything-input {
        padding: var(--space-lg) !important;
        border-radius: 0 !important;
        /* position: fixed !important; */
        bottom: 0 !important;
        left: 0 !important;
        right: 0 !important;
        width: 100vw !important;
        box-sizing: border-box !important;
    }

    .chat-input.ask-anything-input .message-input,
    .chat-input.ask-anything-input .email-input {
        max-width: 100%;
    }

    .ask-anything-field {
        padding: 16px 20px !important;
        font-size: 0.9rem !important;
        border-radius: 12px !important;
    }

    .send-button.ask-anything-send {
        padding: 16px !important;
        min-width: 52px !important;
        height: 52px !important;
        border-radius: 12px !important;
    }

    .welcome-title {
        font-size: 2rem;
    }

    .welcome-subtitle {
        font-size: 1rem;
    }

    .welcome-input-container {
        padding: var(--space-lg);
        gap: var(--space-md);
    }

    .welcome-email-input,
    .welcome-message-field {
        padding: 16px 20px;
        font-size: 0.9rem;
        border-radius: 12px;
    }

    .welcome-send-button {
        padding: 16px;
        min-width: 52px;
        height: 52px;
        border-radius: 12px;
    }

    .welcome-avatar {
        width: 64px;
        height: 64px;
    }

    .welcome-message-input {
        gap: var(--space-sm);
    }
}

@media (max-width: 480px) {
    .welcome-title {
        font-size: 1.75rem;
    }

    .welcome-subtitle {
        font-size: 0.9rem;
    }

    .welcome-input-container {
        padding: var(--space-md);
    }

    .welcome-email-input,
    .welcome-message-field {
        padding: 14px 18px;
        font-size: 0.85rem;
    }

    .welcome-send-button {
        padding: 14px;
        min-width: 48px;
        height: 48px;
    }

    .chat-input.ask-anything-input {
        padding: var(--space-md);
    }

    .ask-anything-field {
        padding: 14px 18px !important;
        font-size: 0.85rem !important;
    }

    .send-button.ask-anything-send {
        padding: 14px !important;
        min-width: 48px !important;
        height: 48px !important;
    }
}

/* ASK ANYTHING header */
.ask-anything-top {
    padding: var(--space-md);
    display: flex;
    align-items: center;
    border-bottom: 1px solid var(--border-color);
}
.ask-anything-header {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
}
.ask-anything-subtitle {
    margin: 0;
    font-size: var(--text-sm);
    color: var(--text-secondary);
}

/* Attachment styles */
.message-attachments {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.attachment-item {
  display: flex;
  align-items: center;
}

.attachment-link {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  color: inherit;
  text-decoration: none;
  font-size: 13px;
  transition: all 0.2s;
  max-width: 100%;
  overflow: hidden;
}

.attachment-link:hover {
  background: rgba(0, 0, 0, 0.1);
  border-color: rgba(0, 0, 0, 0.2);
}

.attachment-link svg {
  flex-shrink: 0;
  opacity: 0.7;
}

.attachment-size {
  opacity: 0.7;
  font-size: 11px;
  margin-left: 4px;
}

.user-message .attachment-link {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
  color: inherit;
}

.user-message .attachment-link:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
}

/* Image attachment styles */
.attachment-image-container {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-width: 300px;
  margin-top: 8px;
}

.attachment-image {
  width: 100%;
  max-height: 300px;
  border-radius: 8px;
  object-fit: contain;
  border: 1px solid rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s;
  background: rgba(0, 0, 0, 0.02);
}

.attachment-image:hover {
  border-color: rgba(0, 0, 0, 0.2);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.user-message .attachment-image {
  border-color: rgba(255, 255, 255, 0.3);
}

.user-message .attachment-image:hover {
  border-color: rgba(255, 255, 255, 0.6);
  box-shadow: 0 2px 8px rgba(255, 255, 255, 0.2);
}

.attachment-image-info {
  display: flex;
  align-items: center;
  font-size: 12px;
}

.attachment-image-info .attachment-link {
  margin: 0;
  padding: 4px 8px;
  font-size: 12px;
}

/* File upload styles for widget */
.file-previews-widget {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 12px;
  background: linear-gradient(135deg, rgba(243, 70, 17, 0.03) 0%, rgba(243, 70, 17, 0.01) 100%);
  border-radius: 12px;
  margin-bottom: 10px;
  border: 1px dashed rgba(243, 70, 17, 0.2);
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Modern File Preview Cards */
.file-preview-widget {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
  border: 2px solid #e5e7eb;
  border-radius: 14px;
  font-size: 13px;
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.04),
    0 1px 2px rgba(0, 0, 0, 0.02);
  max-width: 100%;
  overflow: hidden;
}

.file-preview-widget::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(180deg,
    #818cf8 0%,
    #a78bfa 50%,
    #c084fc 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.file-preview-widget:hover {
  box-shadow:
    0 8px 16px rgba(124, 58, 237, 0.12),
    0 4px 8px rgba(124, 58, 237, 0.08);
  transform: translateY(-2px);
  border-color: #c4b5fd;
}

.file-preview-widget:hover::before {
  opacity: 1;
}

.file-preview-content-widget {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #f0f4ff 0%, #e9d5ff 100%);
  flex-shrink: 0;
  overflow: hidden;
  position: relative;
  box-shadow:
    0 2px 8px rgba(124, 58, 237, 0.1),
    inset 0 1px 2px rgba(255, 255, 255, 0.5);
}

.file-preview-content-widget::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg,
    rgba(255, 255, 255, 0.4) 0%,
    transparent 100%);
  pointer-events: none;
}

.file-preview-image-widget {
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: 10px;
  position: relative;
  z-index: 1;
  transition: transform 0.3s ease;
}

.file-preview-widget:hover .file-preview-image-widget {
  transform: scale(1.05);
}

.file-preview-icon-widget {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #7c3aed;
  position: relative;
  z-index: 1;
  transition: transform 0.3s ease;
}

.file-preview-widget:hover .file-preview-icon-widget {
  transform: scale(1.1) rotate(-5deg);
}

.file-preview-info-widget {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  flex: 1;
}

.file-preview-name-widget {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 600;
  color: #1f2937;
  font-size: 13px;
  line-height: 1.4;
  letter-spacing: -0.01em;
}

.file-preview-size-widget {
  font-size: 11px;
  color: #9ca3af;
  font-weight: 500;
  letter-spacing: 0.01em;
}

.file-preview-remove-widget {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  min-width: 28px;
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  border: 1.5px solid #fca5a5;
  border-radius: 8px;
  color: #dc2626;
  cursor: pointer;
  font-size: 20px;
  font-weight: bold;
  padding: 0;
  flex-shrink: 0;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  line-height: 1;
  box-shadow: 0 2px 4px rgba(220, 38, 38, 0.1);
}

.file-preview-remove-widget:hover {
  background: linear-gradient(135deg, #fca5a5 0%, #f87171 100%);
  border-color: #ef4444;
  color: white;
  transform: scale(1.1) rotate(90deg);
  box-shadow: 0 4px 8px rgba(220, 38, 38, 0.25);
}

.file-preview-remove-widget:active {
  transform: scale(1) rotate(90deg);
  box-shadow: 0 2px 4px rgba(220, 38, 38, 0.2);
}

/* Modern Attach Button Styling */
.attach-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  min-width: 44px;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border: 2px solid #e5e7eb;
  color: #6b7280;
  cursor: pointer;
  border-radius: 50%;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
  position: relative;
  overflow: visible;
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.06),
    0 1px 2px rgba(0, 0, 0, 0.04);
}

.attach-button::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(135deg,
    rgba(243, 70, 17, 0.4) 0%,
    rgba(217, 58, 12, 0.4) 50%,
    rgba(239, 68, 68, 0.4) 100%);
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: -1;
  filter: blur(8px);
}

.attach-button-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: radial-gradient(circle,
    rgba(243, 70, 17, 0.2) 0%,
    transparent 70%);
  opacity: 0;
  transition: all 0.4s ease;
  pointer-events: none;
  z-index: -1;
}

.attach-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
  border-color: var(--primary-color);
  color: var(--primary-color);
  transform: translateY(-3px) scale(1.05);
  box-shadow:
    0 8px 16px rgba(243, 70, 17, 0.15),
    0 4px 8px rgba(243, 70, 17, 0.1),
    0 0 0 4px rgba(243, 70, 17, 0.1);
}

.attach-button:hover:not(:disabled)::before {
  opacity: 1;
  animation: pulseGlow 2s ease-in-out infinite;
}

.attach-button:hover:not(:disabled) .attach-button-glow {
  opacity: 1;
  width: 150%;
  height: 150%;
}

.attach-button:active:not(:disabled) {
  transform: translateY(-1px) scale(1);
  box-shadow:
    0 4px 8px rgba(243, 70, 17, 0.2),
    0 0 0 3px rgba(243, 70, 17, 0.15);
  transition: all 0.1s ease;
}

.attach-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  background: #f3f4f6;
  transform: none;
  box-shadow: none;
}

.attach-button svg {
  position: relative;
  z-index: 2;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
}

.attach-button:hover:not(:disabled) svg {
  transform: rotate(-15deg) scale(1.1);
  filter: drop-shadow(0 2px 4px rgba(243, 70, 17, 0.3));
}

.attach-button:active:not(:disabled) svg {
  transform: rotate(-15deg) scale(1.05);
}

@keyframes pulseGlow {
  0%, 100% {
    opacity: 0.6;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
}

.message-input {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
}

.message-input input {
  flex: 1;
  padding: var(--space-sm) var(--space-md);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-lg);
  font-size: 14px;
  transition: all 0.2s ease;
}

.message-input input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(243, 70, 17, 0.1);
}

.message-input input:disabled {
  background-color: rgba(0, 0, 0, 0.05);
  cursor: not-allowed;
}

.send-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-sm);
  min-width: 40px;
  height: 40px;
  border: none;
  border-radius: var(--radius-lg);
  cursor: pointer;
  color: white;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.send-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, transparent 100%);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.send-button:hover:not(:disabled)::before {
  opacity: 1;
}

.send-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.send-button:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.send-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.send-button svg {
  position: relative;
  z-index: 1;
}

/* Modern Upload Progress Indicator */
.upload-progress-widget {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: linear-gradient(135deg,
    rgba(124, 58, 237, 0.08) 0%,
    rgba(168, 85, 247, 0.05) 100%);
  border-radius: 12px;
  margin-bottom: 10px;
  border: 2px solid rgba(124, 58, 237, 0.2);
  animation: uploadPulse 2s ease-in-out infinite;
  box-shadow: 0 2px 8px rgba(124, 58, 237, 0.1);
  position: relative;
  overflow: hidden;
}

.upload-progress-widget::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.3) 50%,
    transparent 100%);
  animation: shimmer 2s infinite;
}

@keyframes uploadPulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.85;
    transform: scale(0.995);
  }
}

@keyframes shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

.upload-spinner-widget {
  width: 20px;
  height: 20px;
  border: 2.5px solid rgba(124, 58, 237, 0.2);
  border-top: 2.5px solid #7c3aed;
  border-radius: 50%;
  animation: modernSpin 0.8s linear infinite;
  box-shadow: 0 0 8px rgba(124, 58, 237, 0.3);
}

@keyframes modernSpin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.upload-text-widget {
  font-size: 13px;
  color: #7c3aed;
  font-weight: 600;
  letter-spacing: 0.01em;
  text-shadow: 0 1px 2px rgba(124, 58, 237, 0.1);
}

/* Attachment restriction message */
.attachment-restriction-message {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 14px;
  background: linear-gradient(135deg,
    rgba(59, 130, 246, 0.08) 0%,
    rgba(96, 165, 250, 0.05) 100%);
  border-radius: 10px;
  margin-bottom: 10px;
  border: 1px solid rgba(59, 130, 246, 0.2);
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.08);
}

.restriction-text {
  font-size: 12px;
  color: #3b82f6;
  font-weight: 500;
  text-align: center;
  letter-spacing: 0.01em;
  line-height: 1.4;
}

/* Preview Modal Styles */
.preview-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.2s ease-in;
}

.preview-modal-content {
  position: relative;
  max-width: 90%;
  max-height: 90vh;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease-out;
}

.preview-modal-image-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 20px;
  max-width: 100%;
  max-height: 100%;
}

.preview-modal-image {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
  border-radius: 8px;
}

.preview-modal-filename {
  font-size: 14px;
  color: #666;
  text-align: center;
  max-width: 100%;
  word-break: break-word;
  padding: 0 12px;
}

.preview-modal-close {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(0, 0, 0, 0.6);
  border: none;
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  z-index: 10000;
}

.preview-modal-close:hover {
  background: rgba(0, 0, 0, 0.8);
  transform: scale(1.1);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
