import { computed } from 'vue'
import type { AgentCustomization } from '../types/widget'
import { isColorDark, adjustColorBrightness } from '../types/widget'
import { widgetEnv } from '../webclient/widget-env'

export function useWidgetStyles(customization: { value: AgentCustomization }) {
    const chatStyles = computed(() => ({
        backgroundColor: customization.value.chat_background_color || '#ffffff',
        color: isColorDark(customization.value.chat_background_color || '#ffffff') ? '#ffffff' : '#000000'
    }))

    const chatIconStyles = computed(() => ({
        backgroundColor: customization.value.chat_bubble_color || '#f34611',
        color: isColorDark(customization.value.chat_bubble_color || '#f34611') ? '#FFFFFF' : '#000000'
    }))

    const agentBubbleStyles = computed(() => {
        const backgroundColor = customization.value.chat_background_color || '#F8F9FA'
        const adjustedBackground = adjustColorBrightness(backgroundColor, 20)
        return {
            backgroundColor: adjustedBackground,
            color: isColorDark(adjustedBackground) ? '#FFFFFF' : '#000000'
        }
    })

    const userBubbleStyles = computed(() => ({
        backgroundColor: customization.value.accent_color || '#f34611',
        color: isColorDark(customization.value.accent_color || '#f34611') ? '#FFFFFF' : '#000000'
    }))

    const messageNameStyles = computed(() => ({
        color: isColorDark(customization.value.chat_background_color || '#F8F9FA') ? '#FFFFFF' : '#000000'
    }))

    const headerBorderStyles = computed(() => ({
        borderBottom: `1px solid ${isColorDark(customization.value.chat_background_color || '#F8F9FA') ?
            'rgba(255, 255, 255, 0.1)' :
            'rgba(0, 0, 0, 0.1)'}`
    }))

    const photoUrl = computed(() => {

        if (!customization.value.photo_url) {
            return ''
        }
        // Use signed URL if available
        if (customization.value.photo_url_signed) {
            return customization.value.photo_url_signed
        }
        
        // For local storage, prepend the API URL
        return `${widgetEnv.API_URL}${customization.value.photo_url}`
    })

    const shadowStyle = computed(() => {
        const bgColor = customization.value.chat_background_color || '#ffffff'
        return {
            boxShadow: `0 8px 5px ${isColorDark(bgColor) ? 'rgba(0, 0, 0, 0.24)' : 'rgba(0, 0, 0, 0.12)'}`
        }
    })

    return {
        chatStyles,
        chatIconStyles,
        agentBubbleStyles,
        userBubbleStyles,
        messageNameStyles,
        headerBorderStyles,
        photoUrl,
        shadowStyle
    }
} 