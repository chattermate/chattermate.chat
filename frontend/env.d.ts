/// <reference types="vite/client" />

// Global type declarations
declare global {
  interface Window {
    APP_CONFIG?: {
      API_URL?: string
      WS_URL?: string
      WIDGET_URL?: string
      FIREBASE_API_KEY?: string
      FIREBASE_AUTH_DOMAIN?: string
      FIREBASE_PROJECT_ID?: string
      FIREBASE_MESSAGING_SENDER_ID?: string
      FIREBASE_APP_ID?: string
      FIREBASE_STORAGE_BUCKET?: string
      FIREBASE_MEASUREMENT_ID?: string
      FIREBASE_VAPID_KEY?: string
      GOOGLE_FONTS_API_KEY?: string
      NODE_ENV?: string
      HOST?: string
      DEMO_WIDGET_ID?: string
      VITE_SHOPIFY_API_KEY?: string
      GTM_ID?: string
    }
  }
}
export {}

