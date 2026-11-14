import { fileURLToPath } from 'node:url'
import { defineConfig, configDefaults } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { widgetExtensionPlugin } from './scripts/widget-ext'

export default defineConfig({
  plugins: [widgetExtensionPlugin(), vue(), vueJsx()],
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
    // Playwright specs (the enterprise suite lives under its module), not vitest.
    exclude: [...configDefaults.exclude, 'e2e/**', 'src/modules/enterprise/e2e/**'],
    root: fileURLToPath(new URL('./', import.meta.url)),
  },
})
