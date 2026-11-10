import { defineConfig, transformWithEsbuild, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// Vite leaves an ES library build unminified in whitespace and comments, so a
// bundler consuming it can still tree-shake. widget.js is never consumed: it is
// loaded as is into every chat, so minify the finished file (about 15% less to
// download, gzipped).
const minifyFinishedBundle = (): Plugin => ({
  name: 'chattermate-minify-widget',
  apply: 'build',
  enforce: 'post',
  async renderChunk(code, chunk) {
    const result = await transformWithEsbuild(code, chunk.fileName, {
      minify: true,
      format: 'esm',
      legalComments: 'none',
    })
    return { code: result.code, map: null }
  },
})

export default defineConfig({
  plugins: [
    minifyFinishedBundle(),
    vue({
      template: {
        compilerOptions: {
          // Treat all tags starting with 's-' as custom elements (Polaris web components)
          isCustomElement: (tag) => tag.startsWith('s-')
        }
      }
    })
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
