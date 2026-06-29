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
    // Get API URL from environment or default to development
    const apiUrl = process.env.VITE_API_URL || 'http://localhost:8000/api/v1'
    console.log('Using API URL:', apiUrl)
    
    // Read the source file and replace the placeholder
    const sourceFile = resolve(dirname(__dirname), 'src/webclient/chattermate.js')
    const tempFile = resolve(dirname(__dirname), 'src/webclient/chattermate.temp.js')
    
    let sourceContent = fs.readFileSync(sourceFile, 'utf8')
    
    // Replace the getBaseUrl function with a direct return of the API URL
    sourceContent = sourceContent.replace(
      /\/\/ Get base URL - injected at build time or fallback to config[\s\S]*?function getBaseUrl\(\) \{[\s\S]*?\n  \}/,
      `// Get base URL - injected at build time
  function getBaseUrl() {
    return "${apiUrl}";
  }`
    )
    
    // Write temporary file
    fs.writeFileSync(tempFile, sourceContent)
    
    await build({
      entryPoints: [tempFile],
      bundle: true,
      minify: true,
      outfile: resolve(dirname(__dirname), 'public/webclient/chattermate.min.js'),
      format: 'iife',
      target: ['es2015'],
      loader: {
        '.svg': 'text',
      },
    })
    
    // Clean up temporary file
    fs.unlinkSync(tempFile)

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
