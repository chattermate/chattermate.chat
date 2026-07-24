import { build } from 'esbuild'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'

// Load development environment variables
dotenv.config({ path: '.env.dev' })

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function buildWebClientDev() {
  try {
    console.log('Building webclient with development configuration...')
    
    // For development, we use the existing config.js which is already set for development
    // No need to copy files like in production build
    console.log('Using existing config.js for development build')

    // Set NODE_ENV to development for the build
    process.env.NODE_ENV = 'development'
    
    // Baked DEFAULT base URL only; getBaseUrl() still resolves
    // window.chattermateBaseUrl / window.APP_CONFIG at runtime, so no rebuild is
    // needed when a deployment's env changes.
    const apiUrl = process.env.VITE_API_URL || 'http://localhost:8000/api/v1'
    console.log('Using API URL:', apiUrl)

    const sourceFile = resolve(dirname(__dirname), 'src/webclient/chattermate.js')

    await build({
      entryPoints: [sourceFile],
      bundle: true,
      minify: false, // Don't minify for development
      outfile: resolve(dirname(__dirname), 'public/webclient/chattermate.min.js'),
      format: 'iife',
      target: ['es2015'],
      loader: {
        '.svg': 'text',
      },
      define: {
        'process.env.NODE_ENV': '"development"',
        '__CHATTERMATE_API_URL__': JSON.stringify(apiUrl),
      },
      sourcemap: true, // Add sourcemap for development
    })

    // Copy output to dist/webclient directory
    const publicWebclientPath = resolve(dirname(__dirname), 'public/webclient/chattermate.min.js')
    const publicSourcemapPath = resolve(dirname(__dirname), 'public/webclient/chattermate.min.js.map')
    const distWebclientDir = resolve(dirname(__dirname), 'dist/webclient')
    const distWebclientPath = resolve(distWebclientDir, 'chattermate.min.js')
    const distSourcemapPath = resolve(distWebclientDir, 'chattermate.min.js.map')
    
    // Ensure dist/webclient directory exists
    if (!fs.existsSync(distWebclientDir)) {
      fs.mkdirSync(distWebclientDir, { recursive: true })
    }
    
    // Copy the built file and sourcemap to dist/webclient
    fs.copyFileSync(publicWebclientPath, distWebclientPath)
    if (fs.existsSync(publicSourcemapPath)) {
      fs.copyFileSync(publicSourcemapPath, distSourcemapPath)
    }
    console.log('Development web client copied to dist/webclient/')

    console.log('Development web client built successfully!')
  } catch (error) {
    console.error('Development build failed:', error)
    process.exit(1)
  }
}

buildWebClientDev()
