/**
 * Regenerate the raster favicon set (PNG + ICO) from the new lime 3-dot SVG mark.
 * Run with: npx tsx scripts/gen-favicons.ts  (from the frontend/ directory)
 *
 * Requires devDeps: sharp, png-to-ico
 */
import sharp from 'sharp'
import pngToIco from 'png-to-ico'
import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const here = dirname(fileURLToPath(import.meta.url))
const frontend = resolve(here, '..')
const repoRoot = resolve(frontend, '..')
const backendFavicon = resolve(repoRoot, 'backend/static/images/favicon')

const svg = readFileSync(resolve(frontend, 'public/favicon.svg'))

async function toPng(size: number): Promise<Buffer> {
  // high density so the vector rasterizes crisply, then resize to target
  return sharp(svg, { density: 512 }).resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer()
}

async function writePng(size: number, ...paths: string[]) {
  const buf = await toPng(size)
  for (const p of paths) writeFileSync(p, buf)
  console.log('wrote', size + 'px ->', paths.map(p => p.replace(repoRoot + '/', '')).join(', '))
}

async function main() {
  // Backend static favicon set
  await writePng(16, resolve(backendFavicon, 'favicon-16x16.png'))
  await writePng(32, resolve(backendFavicon, 'favicon-32x32.png'))
  await writePng(180, resolve(backendFavicon, 'apple-touch-icon.png'))
  await writePng(192, resolve(backendFavicon, 'android-chrome-192x192.png'))
  await writePng(512, resolve(backendFavicon, 'android-chrome-512x512.png'))

  // ICO (16/32/48) used in several places
  const icoBuffers = await Promise.all([16, 32, 48].map(toPng))
  const ico = await pngToIco(icoBuffers)
  for (const p of [
    resolve(backendFavicon, 'favicon.ico'),
    resolve(frontend, 'public/favicon.ico'),
    resolve(frontend, 'public/assets/favicon.ico'),
  ]) {
    writeFileSync(p, ico)
    console.log('wrote ico ->', p.replace(repoRoot + '/', ''))
  }
}

main().catch((e) => { console.error(e); process.exit(1) })
