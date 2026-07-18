import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

// Load development environment variables
dotenv.config({ path: '.env.dev' })

// (swenv.js is gone — the app service worker src/sw.ts inlines its Firebase
// config at build time via import.meta.env)

// Create config.js content for development using environment variables
const configContent = `// Runtime configuration - this file gets replaced at container startup
window.APP_CONFIG = {
  // API URLs
  API_URL: "${process.env.VITE_API_URL || 'http://localhost:8000/api/v1'}",
  WS_URL: "${process.env.VITE_WS_URL || 'ws://localhost:8000'}",
  WIDGET_URL: "${process.env.VITE_WIDGET_URL || 'http://localhost:8000'}",
  
  // Firebase Configuration
  FIREBASE_API_KEY: "${process.env.VITE_FIREBASE_API_KEY || 'your_firebase_api_key_here'}",
  FIREBASE_AUTH_DOMAIN: "${process.env.VITE_FIREBASE_AUTH_DOMAIN || 'your_firebase_auth_domain_here'}",
  FIREBASE_PROJECT_ID: "${process.env.VITE_FIREBASE_PROJECT_ID || 'your_firebase_project_id_here'}",
  FIREBASE_MESSAGING_SENDER_ID: "${process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '680125690355'}",
  FIREBASE_APP_ID: "${process.env.VITE_FIREBASE_APP_ID || 'your_firebase_app_id_here'}",
  FIREBASE_STORAGE_BUCKET: "${process.env.VITE_FIREBASE_STORAGE_BUCKET || 'your_firebase_storage_bucket_here'}",
  FIREBASE_MEASUREMENT_ID: "${process.env.VITE_FIREBASE_MEASUREMENT_ID || 'your_firebase_measurement_id_here'}",
  FIREBASE_VAPID_KEY: "${process.env.VITE_FIREBASE_VAPID_KEY || 'your_firebase_vapid_key_here'}",
  
  // Google Fonts API
  GOOGLE_FONTS_API_KEY: "${process.env.VITE_GOOGLE_FONTS_API_KEY || 'your_google_fonts_api_key_here'}",
  
  // Demo Widget ID
  DEMO_WIDGET_ID: "${process.env.VITE_DEMO_WIDGET_ID || 'your_demo_widget_id_here'}",
  
  // Node Environment
  NODE_ENV: "development",
  HOST: "${process.env.VITE_HOST || '0.0.0.0'}"
};
`

// Write config to both public and dist directories
const publicConfigPath = './public/config.js'
const distConfigPath = './dist/config.js'

// Write to public directory
fs.writeFileSync(publicConfigPath, configContent)
console.log('Development config file generated to public/config.js')

// Ensure dist directory exists and write to dist directory
if (!fs.existsSync('./dist')) {
  fs.mkdirSync('./dist', { recursive: true })
}
fs.writeFileSync(distConfigPath, configContent)
console.log('Development config file generated to dist/config.js')
