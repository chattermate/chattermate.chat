import { ref } from 'vue'
import type { AgentCustomization } from '../types/widget'
import WebFont from 'webfontloader'

export function useWidgetCustomization() {
    const customization = ref<AgentCustomization>({})
    const agentName = ref('')

    const applyCustomization = (newCustomization: AgentCustomization) => {
        customization.value = newCustomization
 
        
        if (newCustomization.photo_url) {
            customization.value.photo_url = newCustomization.photo_url
        }

        // Load font if specified
        if (newCustomization.font_family) {
            WebFont.load({
                google: {
                    families: [newCustomization.font_family]
                },
                active: () => {
                    const chatContainer = document.querySelector('.chat-container') as HTMLElement
                    if (chatContainer) {
                        chatContainer.style.fontFamily = `"${newCustomization.font_family}", system-ui, sans-serif`
                    }
                }
            })
        }

        // Send customization update to parent
        window.parent.postMessage({
            type: 'CUSTOMIZATION_UPDATE',
            data: {
                chat_bubble_color: newCustomization.chat_bubble_color || '#f34611'
            }
        }, '*')
    }

    // Initialize from window.__INITIAL_DATA__
    const initializeFromData = () => {
        const initialData = window.__INITIAL_DATA__
        if (initialData) {
            applyCustomization(initialData.customization || {})
            agentName.value = initialData.agentName || ''
        }
    }

    return {
        customization,
        agentName,
        applyCustomization,
        initializeFromData
    }
} 