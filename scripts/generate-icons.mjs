#!/usr/bin/env node
/**
 * scripts/generate-icons.mjs
 * Generates all required app icon assets from the master SVG source files.
 *
 * Source: docs/brand/arike-icon-dark.svg
 * Outputs:
 *   src/app/favicon.ico        (16×16 + 32×32 multi-size ICO)
 *   src/app/icon.svg           (copy of dark SVG)
 *   src/app/icon.png           (512×512 PNG)
 *   src/app/apple-icon.png     (180×180 PNG)
 *   src/app/opengraph-image.png (1200×630 PNG — icon centered on dark bg)
 *   public/icon-192.png        (192×192 PNG)
 *   public/icon-512.png        (512×512 PNG)
 *
 * Requires: sharp (transitive Next.js dependency)
 * Run: npm run generate-icons
 */

import sharp from 'sharp'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

const DARK_SVG = path.join(ROOT, 'docs/brand/arike-icon-dark.svg')
const SRC_APP = path.join(ROOT, 'src/app')
const PUBLIC = path.join(ROOT, 'public')

// Ensure output directories exist
fs.mkdirSync(SRC_APP, { recursive: true })
fs.mkdirSync(PUBLIC, { recursive: true })

console.log('Generating Arike icon assets from', DARK_SVG)

// Helper: resize dark SVG to PNG at given size
async function svgToPng(size, outputPath) {
  await sharp(DARK_SVG)
    .resize(size, size)
    .png()
    .toFile(outputPath)
  console.log(`  ✓ ${path.relative(ROOT, outputPath)} (${size}×${size})`)
}

/**
 * Build a minimal ICO file from one or more PNG buffers.
 * ICO format reference: https://en.wikipedia.org/wiki/ICO_(file_format)
 * @param {Buffer[]} pngBuffers - array of raw PNG data (each must be square)
 * @param {number[]} sizes     - pixel dimensions corresponding to each buffer
 */
function buildIco(pngBuffers, sizes) {
  const count = pngBuffers.length
  // ICO header: 6 bytes
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0)     // Reserved (0)
  header.writeUInt16LE(1, 2)     // Type: 1 = ICO
  header.writeUInt16LE(count, 4) // Number of images

  // Directory entries: 16 bytes each
  const dirEntrySize = 16
  const dirSize = count * dirEntrySize
  const imageDataOffset = 6 + dirSize

  const dirEntries = []
  let currentOffset = imageDataOffset

  for (let i = 0; i < count; i++) {
    const entry = Buffer.alloc(dirEntrySize)
    const sz = sizes[i]
    // Width and height are stored as 0 for 256×256, otherwise the actual value
    entry.writeUInt8(sz >= 256 ? 0 : sz, 0)  // Width
    entry.writeUInt8(sz >= 256 ? 0 : sz, 1)  // Height
    entry.writeUInt8(0, 2)                    // Color count (0 = no palette)
    entry.writeUInt8(0, 3)                    // Reserved
    entry.writeUInt16LE(1, 4)                 // Color planes
    entry.writeUInt16LE(32, 6)                // Bits per pixel
    entry.writeUInt32LE(pngBuffers[i].length, 8)  // Size of image data
    entry.writeUInt32LE(currentOffset, 12)        // Offset of image data
    dirEntries.push(entry)
    currentOffset += pngBuffers[i].length
  }

  return Buffer.concat([header, ...dirEntries, ...pngBuffers])
}

async function main() {
  // 1. icon.svg — copy dark SVG directly
  fs.copyFileSync(DARK_SVG, path.join(SRC_APP, 'icon.svg'))
  console.log('  ✓ src/app/icon.svg (copy)')

  // 2. icon.png — 512×512
  await svgToPng(512, path.join(SRC_APP, 'icon.png'))

  // 3. apple-icon.png — 180×180
  await svgToPng(180, path.join(SRC_APP, 'apple-icon.png'))

  // 4. public/icon-192.png — 192×192
  await svgToPng(192, path.join(PUBLIC, 'icon-192.png'))

  // 5. public/icon-512.png — 512×512
  await svgToPng(512, path.join(PUBLIC, 'icon-512.png'))

  // 6. opengraph-image.png — 1200×630, icon centered on dark navy background
  {
    const iconSize = 400
    const bgW = 1200
    const bgH = 630
    const iconBuf = await sharp(DARK_SVG).resize(iconSize, iconSize).png().toBuffer()
    await sharp({
      create: {
        width: bgW,
        height: bgH,
        channels: 4,
        background: { r: 26, g: 32, b: 53, alpha: 1 }, // #1a2035
      },
    })
      .composite([{
        input: iconBuf,
        left: Math.round((bgW - iconSize) / 2),
        top: Math.round((bgH - iconSize) / 2),
      }])
      .png()
      .toFile(path.join(SRC_APP, 'opengraph-image.png'))
    console.log('  ✓ src/app/opengraph-image.png (1200×630)')
  }

  // 7. favicon.ico — multi-size ICO (16×16 + 32×32)
  {
    const png16 = await sharp(DARK_SVG).resize(16, 16).png().toBuffer()
    const png32 = await sharp(DARK_SVG).resize(32, 32).png().toBuffer()
    const icoData = buildIco([png16, png32], [16, 32])
    fs.writeFileSync(path.join(SRC_APP, 'favicon.ico'), icoData)
    console.log('  ✓ src/app/favicon.ico (16×16 + 32×32)')
  }

  console.log('\nAll icon assets generated successfully.')
}

main().catch((err) => {
  console.error('Icon generation failed:', err)
  process.exit(1)
})
