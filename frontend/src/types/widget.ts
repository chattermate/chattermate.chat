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

import type { ChatStyle, WidgetPosition } from './agent'

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

export interface HumanAgent {
    human_agent_name?: string
    human_agent_profile_pic?: string
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
    chat_style?: ChatStyle;
    widget_position?: WidgetPosition;
    welcome_title?: string;
    welcome_subtitle?: string;
    welcome_message?: string;
    chat_initiation_messages?: string[];
    quick_actions?: string[];
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
