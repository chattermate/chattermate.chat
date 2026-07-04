#!/bin/sh

# Generate config.js with runtime environment variables
cat <<EOF > /usr/share/nginx/html/config.js
// Runtime configuration generated at container startup
window.APP_CONFIG = {
  // API URLs
  API_URL: "${VITE_API_URL:-http://localhost:8000/api/v1}",
  WS_URL: "${VITE_WS_URL:-ws://localhost:8000}",
  WIDGET_URL: "${VITE_WIDGET_URL:-http://localhost:8000}",
  
  // Firebase Configuration
  FIREBASE_API_KEY: "${VITE_FIREBASE_API_KEY:-}",
  FIREBASE_AUTH_DOMAIN: "${VITE_FIREBASE_AUTH_DOMAIN:-}",
  FIREBASE_PROJECT_ID: "${VITE_FIREBASE_PROJECT_ID:-}",
  FIREBASE_MESSAGING_SENDER_ID: "${VITE_FIREBASE_MESSAGING_SENDER_ID:-}",
  FIREBASE_APP_ID: "${VITE_FIREBASE_APP_ID:-}",
  FIREBASE_STORAGE_BUCKET: "${VITE_FIREBASE_STORAGE_BUCKET:-}",
  FIREBASE_MEASUREMENT_ID: "${VITE_FIREBASE_MEASUREMENT_ID:-}",
  FIREBASE_VAPID_KEY: "${VITE_FIREBASE_VAPID_KEY:-}",
  
  // Razorpay Checkout
  RAZORPAY_KEY_ID: "${VITE_RAZORPAY_KEY_ID:-}",
  // Google Tag Manager container (enables purchase/checkout analytics)
  GTM_ID: "${VITE_GTM_ID:-}",

  // Google Fonts API
  GOOGLE_FONTS_API_KEY: "${VITE_GOOGLE_FONTS_API_KEY:-}",
  
  // Node Environment
  NODE_ENV: "${NODE_ENV:-development}",
  HOST: "${HOST:-0.0.0.0}"
};
EOF

# Start nginx
exec "$@" 