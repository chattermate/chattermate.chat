/**
 * API Configuration - Uses runtime config from window.APP_CONFIG
 * Functions are used instead of constants to ensure runtime config is read at call time
 */

// API URLs - Dynamic functions..
export function getApiUrl(): string {
  return (
    window.APP_CONFIG?.API_URL || import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'
  )
}

export function getWsUrl(): string {
  return window.APP_CONFIG?.WS_URL || import.meta.env.VITE_WS_URL || 'ws://localhost:8000'
}

export function getWidgetUrl(): string {
  return window.APP_CONFIG?.WIDGET_URL || import.meta.env.VITE_WIDGET_URL || 'http://localhost:8000'
}

// Firebase Configuration - Dynamic functions
export function getFirebaseApiKey(): string {
  return window.APP_CONFIG?.FIREBASE_API_KEY || import.meta.env.VITE_FIREBASE_API_KEY || ''
}

export function getFirebaseAuthDomain(): string {
  return window.APP_CONFIG?.FIREBASE_AUTH_DOMAIN || import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || ''
}

export function getFirebaseProjectId(): string {
  return window.APP_CONFIG?.FIREBASE_PROJECT_ID || import.meta.env.VITE_FIREBASE_PROJECT_ID || ''
}

export function getFirebaseMessagingSenderId(): string {
  return (
    window.APP_CONFIG?.FIREBASE_MESSAGING_SENDER_ID ||
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ||
    ''
  )
}

export function getFirebaseAppId(): string {
  return window.APP_CONFIG?.FIREBASE_APP_ID || import.meta.env.VITE_FIREBASE_APP_ID || ''
}

export function getFirebaseStorageBucket(): string {
  return (
    window.APP_CONFIG?.FIREBASE_STORAGE_BUCKET || import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || ''
  )
}

export function getFirebaseMeasurementId(): string {
  return (
    window.APP_CONFIG?.FIREBASE_MEASUREMENT_ID || import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || ''
  )
}

export function getFirebaseVapidKey(): string {
  return window.APP_CONFIG?.FIREBASE_VAPID_KEY || import.meta.env.VITE_FIREBASE_VAPID_KEY || ''
}

// Google Fonts API - Dynamic function
export function getGoogleFontsApiKey(): string {
  return window.APP_CONFIG?.GOOGLE_FONTS_API_KEY || import.meta.env.VITE_GOOGLE_FONTS_API_KEY || ''
}

// Node Environment - Dynamic functions
export function getNodeEnv(): string {
  return window.APP_CONFIG?.NODE_ENV || import.meta.env.NODE_ENV || 'development'
}

export function getHost(): string {
  return window.APP_CONFIG?.HOST || import.meta.env.HOST || '0.0.0.0'
}

// Explore Configuration - Dynamic function
export function getDemoWidgetId(): string {
  return (
    (window.APP_CONFIG as any)?.DEMO_WIDGET_ID ||
    import.meta.env.VITE_DEMO_WIDGET_ID ||
    '397046dc-0093-4499-ab45-a0afe3c3ee14'
  )
}

// Explore Configuration - Dynamic function
export function getSHOPIFY_API_KEY(): string {
  return (
    (window.APP_CONFIG as any)?.VITE_SHOPIFY_API_KEY ||
    import.meta.env.VITE_SHOPIFY_API_KEY ||
    '397046dc-0093-4499-ab45-a0afe3c3ee14'
  )
}

// Legacy exports for backward compatibility - using getters to ensure dynamic evaluation
export const config = {
  get API_URL() {
    return getApiUrl()
  },
  get WS_URL() {
    return getWsUrl()
  },
  get WIDGET_URL() {
    return getWidgetUrl()
  },
}

// Direct exports that work dynamically
export { getApiUrl as API_URL }
export { getWsUrl as WS_URL }
export { getWidgetUrl as WIDGET_URL }
