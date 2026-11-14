import { fileURLToPath } from 'node:url'
import { defineConfig, configDefaults } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { widgetExtensionPlugin } from './scripts/widget-ext'

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
    // Playwright specs (the enterprise suite lives under its module), not vitest.
    exclude: [...configDefaults.exclude, 'e2e/**', 'src/modules/enterprise/e2e/**'],
    root: fileURLToPath(new URL('./', import.meta.url)),
    // The open-source suite runs the widget as self-hosters build it, with no chat UI
    // layer; the enterprise suite with the layer its module supplies (scripts/widget-ext.ts).
    projects: [
      {
        extends: true,
        plugins: [widgetExtensionPlugin({ layer: false })],
        test: { name: 'oss', exclude: [...configDefaults.exclude, 'e2e/**', 'src/modules/enterprise/**'] },
      },
      {
        extends: true,
        plugins: [widgetExtensionPlugin()],
        test: { name: 'enterprise', include: ['src/modules/enterprise/**/*.{test,spec}.?(c|m)[jt]s?(x)'] },
      },
    ],
  },
})
