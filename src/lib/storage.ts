import fs from 'fs/promises'
import path from 'path'
import { createWriteStream } from 'fs'
import { pipeline } from 'stream/promises'

const ICONS_DIR = process.env.DATA_DIR 
  ? path.join(process.env.DATA_DIR, 'icons')
  : path.join(process.cwd(), 'data', 'icons')

// Ensure icons directory exists
export async function ensureIconsDirectory() {
  try {
    await fs.access(ICONS_DIR)
  } catch {
    await fs.mkdir(ICONS_DIR, { recursive: true })
    console.log(`Created icons directory: ${ICONS_DIR}`)
  }
}

// Save uploaded icon file (from File object)
export async function saveIcon(file: File): Promise<string> {
  await ensureIconsDirectory()

  // Generate unique filename
  const ext = file.name.split('.').pop() || 'png'
  const filename = `${crypto.randomUUID()}.${ext}`
  const filepath = path.join(ICONS_DIR, filename)

  // Save file
  const buffer = Buffer.from(await file.arrayBuffer())
  await fs.writeFile(filepath, buffer)

  return `upload:${filename}`
}

// Save icon from buffer (for API routes)
export async function saveIconBuffer(buffer: Buffer, extension: string): Promise<string> {
  await ensureIconsDirectory()

  // Generate unique filename
  const ext = extension.replace('.', '')
  const filename = `${crypto.randomUUID()}.${ext}`
  const filepath = path.join(ICONS_DIR, filename)

  // Save file
  await fs.writeFile(filepath, buffer)

  return `upload:${filename}`
}

// Delete icon file
export async function deleteIcon(filename: string): Promise<void> {
  const filepath = path.join(ICONS_DIR, filename)
  try {
    await fs.unlink(filepath)
  } catch (error) {
    console.warn(`Failed to delete icon ${filename}:`, error)
  }
}

// Check if icon file exists
export async function iconExists(filename: string): Promise<boolean> {
  const filepath = path.join(ICONS_DIR, filename)
  try {
    await fs.access(filepath)
    return true
  } catch {
    return false
  }
}

// Get icon file path
export function getIconPath(filename: string): string {
  return path.join(ICONS_DIR, filename)
}
