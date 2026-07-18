import { fileURLToPath } from 'node:url'
import { defineConfig, configDefaults } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

export default defineConfig({
  plugins: [vue(), vueJsx()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      // vite-plugin-pwa virtual module doesn't exist under vitest
      'virtual:pwa-register': fileURLToPath(
        new URL('./src/__tests__/stubs/pwa-register.ts', import.meta.url)
      ),
    },
  },
  test: {
    environment: 'jsdom',
    exclude: [...configDefaults.exclude, 'e2e/**'],
    root: fileURLToPath(new URL('./', import.meta.url)),
  },
})
