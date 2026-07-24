import { build } from 'esbuild'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import * as fs from 'fs'
import * as path from 'path'
import dotenv from 'dotenv'

// Load the local .env so a plain `build:webclient` uses the local API URL.
dotenv.config({ path: '.env' })

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function buildWebClient() {
  try {
    // Baked DEFAULT base URL only; getBaseUrl() still resolves
    // window.chattermateBaseUrl / window.APP_CONFIG at runtime, so no rebuild is
    // needed when a deployment's env changes.
    const apiUrl = process.env.VITE_API_URL || 'http://localhost:8000/api/v1'
    console.log('Using API URL:', apiUrl)

    const sourceFile = resolve(dirname(__dirname), 'src/webclient/chattermate.js')

    await build({
      entryPoints: [sourceFile],
      bundle: true,
      minify: true,
      outfile: resolve(dirname(__dirname), 'public/webclient/chattermate.min.js'),
      format: 'iife',
      target: ['es2015'],
      loader: {
        '.svg': 'text',
      },
      define: {
        '__CHATTERMATE_API_URL__': JSON.stringify(apiUrl),
      },
    })

    // Copy output to dist/webclient directory
    const publicWebclientPath = resolve(dirname(__dirname), 'public/webclient/chattermate.min.js')
    const distWebclientDir = resolve(dirname(__dirname), 'dist/webclient')
    const distWebclientPath = resolve(distWebclientDir, 'chattermate.min.js')
    
    // Ensure dist/webclient directory exists
    if (!fs.existsSync(distWebclientDir)) {
      fs.mkdirSync(distWebclientDir, { recursive: true })
    }
    
    // Copy the built file to dist/webclient
    fs.copyFileSync(publicWebclientPath, distWebclientPath)
    console.log('Web client copied to dist/webclient/')

    console.log('Web client built successfully!')
  } catch (error) {
    console.error('Build failed:', error)
    process.exit(1)
  }
}

buildWebClient()
