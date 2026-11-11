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
import type { Message, ShopifyProductImage } from './chat'

/** A product card in a widget message, as the shop tools send it. */
export interface WidgetProduct {
  id: string
  title: string
  price: string
  image?: ShopifyProductImage
  handle?: string
  variant_title?: string
  currency?: string
  price_formatted?: string
  cart_variant_id?: string | null
  price_max?: string | null
  total_inventory?: number | null
  /** Published to the Online Store: only then can the storefront's cart take it. */
  published?: boolean | null
  tracks_inventory?: boolean | null
  /** It has variants to choose between (Size, Colour): the product sheet reads them when opened. */
  has_choices?: boolean | null
}

/** A product's options and variants, read by the product sheet (product_options). */
export interface WidgetProductChoices {
  options: WidgetProductOption[]
  variants: WidgetProductVariant[]
  /** False when the sheet can't offer them whole: the product's own page can. */
  complete: boolean
}

export interface WidgetProductOption {
  name: string
  values: string[]
}

export interface WidgetProductVariant {
  id: string
  title?: string | null
  available: boolean
  price?: string | null
  /** Option name → value, e.g. { Size: 'M' }. */
  options: Record<string, string>
}

/** A chat message plus the state the widget keeps on it (forms, ratings, questions). */
export interface WidgetMessage extends Message {
  shopify_output?: { products: WidgetProduct[]; shop_domain?: string }
  isSubmitted?: boolean
  selectedRating?: number
  finalRating?: number
  showFeedback?: boolean
  feedback?: string
  finalFeedback?: string | null
  userInputValue?: string
  submittedValue?: string | null
}

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
    chat_background_color?: string;
    chat_bubble_color?: string;
    chat_text_color?: string;
    icon_url?: string;
    icon_color?: string;
    accent_color?: string;
    font_family?: string;
    custom_css?: string;
    customization_metadata?: Record<string, any>;
    launcher_logo_url?: string | null;
    chat_style?: ChatStyle;
    widget_position?: WidgetPosition;
    welcome_title?: string;
    welcome_subtitle?: string;
    welcome_message?: string;
    chat_initiation_messages?: string[];
    quick_actions?: string[];
}



export interface SocketError {
    type: 'connection_error' | 'auth_error' | 'chat_error' | 'ai_config_missing' | 'customer_required' | 'token_invalid' | 'conversation_gone';
    error?: string;
}

// Refusals the widget clears by authorizing again: GET /widgets/{id} binds an
// unbound token to a customer, and swaps an expired or revoked one for a live one.
export const REAUTHORIZING_REFUSALS: ReadonlySet<SocketError['type']> = new Set<SocketError['type']>(['customer_required', 'token_invalid'])

export const isReauthorizingRefusal = (reason: SocketError['type'] | null | undefined): boolean =>
    !!reason && REAUTHORIZING_REFUSALS.has(reason)

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
