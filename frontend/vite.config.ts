import { fileURLToPath, URL } from 'node:url'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  // When mode is 'prod' or 'dev', load .env.prod or .env.dev respectively
  let envDir = process.cwd()
  let envFile = '.env'
  
  if (mode === 'prod' || mode === 'production') {
    // Manually load .env.prod for production builds. Plain `vite build`
    // (mode 'production', used by Dockerfile.frontend.prod) must see the
    // VITE_FIREBASE_* values too: src/sw.ts inlines them at build time, and
    // without them the service worker ships with push silently disabled.
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

  if (command === 'build' && !(process.env.VITE_FIREBASE_API_KEY || env.VITE_FIREBASE_API_KEY)) {
    console.warn(
      '\n[pwa] VITE_FIREBASE_API_KEY is not set for this build — the service worker ' +
      'will ship WITHOUT background push support (foreground notifications still work ' +
      'via runtime config.js). Provide .env/.env.prod with VITE_FIREBASE_* to enable it.\n'
    )
  }

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
    },
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      // Registration is manual (src/pwa/register.ts) so the Shopify App Bridge
      // script stays the first script tag and embedded contexts never register.
      injectRegister: false,
      manifest: {
        name: 'ChatterMate',
        short_name: 'ChatterMate',
        description: 'Agent console for ChatterMate — handle customer chats anywhere.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#0B0C10',
        theme_color: '#0B0C10',
        icons: [
          { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: '/pwa-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      injectManifest: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        // config.js is runtime-substituted per environment (docker-entrypoint)
        // and must never be precached; webclient/avatars aren't the agent app.
        globIgnores: ['config.js', 'config.dev.js', 'webclient/**', 'avatars/**'],
      },
      devOptions: {
        enabled: false,
      },
    })
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
