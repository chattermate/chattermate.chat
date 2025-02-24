export interface Widget {
  id: string
  name: string
  organization_id: string
  agent_id: string
}

export interface WidgetCreate {
  name: string
  agent_id: string
}

export interface Customer {
    full_name?: string
    profile_pic?: string
    agent_name?: string
    agent_profile_pic?: string
}

export interface AgentCustomization {
    id?: number;
    agent_id?: string;
    photo_url?: string;
    photo_url_signed?: string;
    chat_background_color?: string;
    chat_bubble_color?: string;
    chat_text_color?: string;
    icon_url?: string;
    icon_color?: string;
    accent_color?: string;
    font_family?: string;
    custom_css?: string;
    customization_metadata?: Record<string, any>;
}



export interface SocketError {
    type: 'connection_error' | 'auth_error' | 'chat_error' | 'ai_config_missing';
    error?: string;
}


// Helper functions
export const isColorDark = (color: string): boolean => {
    const hex = color.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000
    return brightness < 128
}

export const adjustColorBrightness = (color: string, amount: number): string => {
    const hex = color.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)

    const isBackgroundDark = isColorDark(color)
    const newR = isBackgroundDark ? Math.min(255, r + amount) : Math.max(0, r - amount)
    const newG = isBackgroundDark ? Math.min(255, g + amount) : Math.max(0, g - amount)
    const newB = isBackgroundDark ? Math.min(255, b + amount) : Math.max(0, b - amount)

    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`
}

export const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

export const getErrorMessage = (error: SocketError): string => {
    switch(error.type) {
        case 'connection_error':
            return 'Unable to connect. Please try again later.'
        case 'auth_error':
            return 'Authentication failed. Please refresh the page.'
        case 'chat_error':
            return 'Unable to send message. Please try again.'
        case 'ai_config_missing':
            return 'Chat service is currently unavailable.'
        default:
            return error.error || 'Something went wrong. Please try again.'
    }
}
