declare global {
  interface Window {
    APP_CONFIG?: {
      // API URLs
      API_URL?: string
      WS_URL?: string
      WIDGET_URL?: string

      // Firebase Configuration
      FIREBASE_API_KEY?: string
      FIREBASE_AUTH_DOMAIN?: string
      FIREBASE_PROJECT_ID?: string
      FIREBASE_MESSAGING_SENDER_ID?: string
      FIREBASE_APP_ID?: string
      FIREBASE_STORAGE_BUCKET?: string
      FIREBASE_MEASUREMENT_ID?: string
      FIREBASE_VAPID_KEY?: string

      // Google Fonts API
      GOOGLE_FONTS_API_KEY?: string

      // Node Environment
      NODE_ENV?: string
      HOST?: string

      // Explore Configuration
      DEMO_WIDGET_ID?: string
      VITE_SHOPIFY_API_KEY?: string
    }
  }
}

export {}
