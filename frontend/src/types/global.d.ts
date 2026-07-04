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

      // Razorpay Checkout

      // Google Fonts API
      GOOGLE_FONTS_API_KEY?: string

      // Node Environment
      NODE_ENV?: string
      HOST?: string

      // Explore Configuration
      DEMO_WIDGET_ID?: string
      VITE_SHOPIFY_API_KEY?: string
      GTM_ID?: string
    }
  }
}

export {}
