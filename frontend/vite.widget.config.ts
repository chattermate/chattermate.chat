import { defineConfig, transformWithEsbuild, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// Vite never strips whitespace from an ES library build (it would drop the
// /*#__PURE__*/ hints a consumer's bundler tree-shakes with). widget.js is loaded
// as-is by the widget page, never re-bundled, so minify it fully once it is built.
const minifyWidgetBundle = (): Plugin => ({
  name: 'minify-widget-bundle',
  apply: 'build',
  enforce: 'post',
  // After every renderChunk: Vite's own esbuild pass would re-print the whitespace.
  async generateBundle(_options, bundle) {
    for (const file of Object.values(bundle)) {
      if (file.type !== 'chunk') continue
      const result = await transformWithEsbuild(file.code, file.fileName, { minify: true, format: 'esm' })
      file.code = result.code
    }
  },
})

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // Treat all tags starting with 's-' as custom elements (Polaris web components)
          isCustomElement: (tag) => tag.startsWith('s-')
        }
      }
    }),
    minifyWidgetBundle(),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/webclient/widget.ts'),
      name: 'ChatterMateWidget',
      fileName: 'widget',
      formats: ['es'],
    },
    outDir: '../backend/assets',
    emptyOutDir: false,
    rollupOptions: {
      output: {
        format: 'es',
        entryFileNames: 'widget.js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') {
            return 'widget.css'
          }
          // Place other assets in a subdirectory that we can ignore or clean up later
          return 'unused/[name]-[hash][extname]'
        },
        chunkFileNames: 'unused/[name]-[hash].js',
        manualChunks: undefined, // Disable code splitting
      },
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
  },
})
