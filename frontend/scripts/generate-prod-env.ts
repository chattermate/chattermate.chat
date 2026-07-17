import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

// Load production environment variables
dotenv.config({ path: '.env.prod' })

// (swenv.js is gone — the app service worker src/sw.ts inlines its Firebase
// config at build time via import.meta.env)

// Create config.js content for production using environment variables
const configContent = `// Runtime configuration - this file gets replaced at container startup
window.APP_CONFIG = {
  // API URLs
  API_URL: "${process.env.VITE_API_URL || 'https://api.chattermate.chat/api/v1'}",
  WS_URL: "${process.env.VITE_WS_URL || 'wss://api.chattermate.chat'}",
  WIDGET_URL: "${process.env.VITE_WIDGET_URL || 'https://app.chattermate.chat'}",
  
  // Firebase Configuration
  FIREBASE_API_KEY: "${process.env.VITE_FIREBASE_API_KEY || ''}",
  FIREBASE_AUTH_DOMAIN: "${process.env.VITE_FIREBASE_AUTH_DOMAIN || ''}",
  FIREBASE_PROJECT_ID: "${process.env.VITE_FIREBASE_PROJECT_ID || ''}",
  FIREBASE_MESSAGING_SENDER_ID: "${process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || ''}",
  FIREBASE_APP_ID: "${process.env.VITE_FIREBASE_APP_ID || ''}",
  FIREBASE_STORAGE_BUCKET: "${process.env.VITE_FIREBASE_STORAGE_BUCKET || ''}",
  FIREBASE_MEASUREMENT_ID: "${process.env.VITE_FIREBASE_MEASUREMENT_ID || ''}",
  FIREBASE_VAPID_KEY: "${process.env.VITE_FIREBASE_VAPID_KEY || ''}",
  
  // Google Fonts API
  GOOGLE_FONTS_API_KEY: "${process.env.VITE_GOOGLE_FONTS_API_KEY || ''}",
  
  // Demo Widget ID
  DEMO_WIDGET_ID: "${process.env.VITE_DEMO_WIDGET_ID || ''}",
  
  // Node Environment
  NODE_ENV: "production",
  HOST: "${process.env.VITE_HOST || '0.0.0.0'}",
  VITE_SHOPIFY_API_KEY: "${process.env.VITE_SHOPIFY_API_KEY || ''}",
};
`

// Write config to both public and dist directories
const publicConfigPath = './public/config.js'
const distConfigPath = './dist/config.js'

// Write to public directory
fs.writeFileSync(publicConfigPath, configContent)
console.log('Production config file generated to public/config.js')

// Ensure dist directory exists and write to dist directory
if (!fs.existsSync('./dist')) {
  fs.mkdirSync('./dist', { recursive: true })
}
fs.writeFileSync(distConfigPath, configContent)
console.log('Production config file generated to dist/config.js')
