import { fileURLToPath, URL } from 'node:url'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  // When mode is 'prod' or 'dev', load .env.prod or .env.dev respectively
  let envDir = process.cwd()
  let envFile = '.env'
  
  if (mode === 'prod') {
    // Manually load .env.prod for production builds
    const envPath = path.resolve(envDir, '.env.prod')
    if (fs.existsSync(envPath)) {
      const envConfig = dotenv.parse(fs.readFileSync(envPath))
      // Merge with process.env
      for (const key in envConfig) {
        if (!process.env[key]) {
          process.env[key] = envConfig[key]
        }
      }
    }
  } else if (mode === 'dev') {
    // Manually load .env.dev for development builds
    const envPath = path.resolve(envDir, '.env.dev')
    if (fs.existsSync(envPath)) {
      const envConfig = dotenv.parse(fs.readFileSync(envPath))
      // Merge with process.env
      for (const key in envConfig) {
        if (!process.env[key]) {
          process.env[key] = envConfig[key]
        }
      }
    }
  }
  
  // Also load standard Vite env files
  const env = loadEnv(mode, process.cwd(), '')

  return {
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // Treat all tags starting with 's-' as custom elements (Polaris web components)
          isCustomElement: (tag) => tag.startsWith('s-')
        }
      }
    }),
    vueJsx(),
    vueDevTools(),
    // Plugin to inject environment variables into HTML
    {
      name: 'html-transform',
      transformIndexHtml(html) {
        return html.replace(
          /<%= VITE_SHOPIFY_API_KEY %>/g,
          process.env.VITE_SHOPIFY_API_KEY || env.VITE_SHOPIFY_API_KEY || ''
        )
      }
    }
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    headers: {
      'Service-Worker-Allowed': '/',
    },
    // Allow ngrok and other tunnel services for Shopify embedded app development
    allowedHosts: [
      'localhost',
      '.ngrok.app',
      '.ngrok.io',
      'frontendchat.ngrok.app',
      '.chattermate.chat',
    ],
  },
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      input: {
        main: './index.html',
        'firebase-messaging-sw': './public/firebase-messaging-sw.js',
      },
      output: {
        manualChunks: {
          'vendor-vue': ['vue', 'vue-router', 'pinia'],
          'vendor-ui': ['vue3-apexcharts'],
          'vendor-utils': ['axios', 'marked'],
          'vendor-firebase': ['firebase/app', 'firebase/messaging', 'firebase/auth'],
        },
      },
    },
  },
  }
})
