import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { wallpaperAssets } from '@/lib/schema'
import { saveWallpaper, deleteWallpaperFile } from '@/lib/storage'

export const BUILTIN_WALLPAPER_IDS = ['builtin-1', 'builtin-2', 'builtin-3'] as const

export const BUILTIN_WALLPAPERS = [
  { id: 'builtin-1', name: 'gradient-ocean', label: 'Ocean Gradient', cssValue: 'linear-gradient(135deg, #0a3d62 0%, #1a5c7a 100%)' },
  { id: 'builtin-2', name: 'gradient-forest', label: 'Forest Gradient', cssValue: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)' },
  { id: 'builtin-3', name: 'gradient-sunset', label: 'Sunset Gradient', cssValue: 'linear-gradient(135deg, #5d2c3e 0%, #8b4f9f 50%, #e8a555 100%)' },
] as const

export type WallpaperSourceType = 'upload' | 'builtin'

export interface WallpaperAssetDTO {
  id: string
  sourceType: WallpaperSourceType
  sourceReference: string
  filePath: string | null
  displayName: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2 MB
// SVG is excluded: serving SVGs can allow XSS via embedded scripts
const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp']

function rowToDTO(row: typeof wallpaperAssets.$inferSelect): WallpaperAssetDTO {
  return {
    id: row.id,
    sourceType: row.sourceType as WallpaperSourceType,
    sourceReference: row.sourceReference,
    filePath: row.filePath ?? null,
    displayName: row.displayName,
    isActive: Boolean(row.isActive),
    createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: row.updatedAt ? new Date(row.updatedAt).toISOString() : new Date().toISOString(),
  }
}

export async function getAllWallpapers(): Promise<WallpaperAssetDTO[]> {
  const rows = await db.select().from(wallpaperAssets).all()
  return rows.map(rowToDTO)
}

export async function getWallpaperById(id: string): Promise<WallpaperAssetDTO | null> {
  const rows = await db
    .select()
    .from(wallpaperAssets)
    .where(eq(wallpaperAssets.id, id))
    .limit(1)
    .all()
  return rows.length > 0 ? rowToDTO(rows[0]) : null
}

export async function getActiveWallpaper(): Promise<WallpaperAssetDTO | null> {
  const rows = await db
    .select()
    .from(wallpaperAssets)
    .where(eq(wallpaperAssets.isActive, true))
    .limit(1)
    .all()
  return rows.length > 0 ? rowToDTO(rows[0]) : null
}

export async function setActiveWallpaper(wallpaperId: string): Promise<void> {
  // Verify the wallpaper exists
  const existing = await db
    .select()
    .from(wallpaperAssets)
    .where(eq(wallpaperAssets.id, wallpaperId))
    .limit(1)
    .all()

  if (existing.length === 0) {
    throw new Error(`Wallpaper not found: ${wallpaperId}`)
  }

  // Deactivate all then activate target — wrapped in a transaction for atomicity
  db.transaction((tx) => {
    tx.update(wallpaperAssets).set({ isActive: false, updatedAt: new Date() }).run()
    tx.update(wallpaperAssets).set({ isActive: true, updatedAt: new Date() }).where(eq(wallpaperAssets.id, wallpaperId)).run()
  })
}

export async function deactivateAllWallpapers(): Promise<void> {
  await db
    .update(wallpaperAssets)
    .set({ isActive: false, updatedAt: new Date() })
    .run()
}

export interface WallpaperUploadResult {
  success: boolean
  wallpaper?: WallpaperAssetDTO
  error?: string
  validationError?: string
}

export async function uploadWallpaper(file: File): Promise<WallpaperUploadResult> {
  // Validate MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return { success: false, validationError: `File type "${file.type}" is not allowed. Use PNG, JPEG, or WebP.` }
  }

  // Validate size
  if (file.size > MAX_FILE_SIZE) {
    return { success: false, validationError: `File size ${(file.size / 1024 / 1024).toFixed(1)} MB exceeds the 2 MB limit.` }
  }

  const MIME_TO_EXT: Record<string, string> = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' }
  const ext = MIME_TO_EXT[file.type] ?? 'png'
  const buffer = Buffer.from(await file.arrayBuffer())
  const filePath = await saveWallpaper(buffer, ext)

  const id = crypto.randomUUID()
  try {
    await db
      .insert(wallpaperAssets)
      .values({
        id,
        sourceType: 'upload',
        sourceReference: file.name,
        filePath,
        displayName: file.name.replace(/\.[^.]+$/, ''),
        isActive: false,
      })
      .run()

    const [row] = await db.select().from(wallpaperAssets).where(eq(wallpaperAssets.id, id)).all()
    return { success: true, wallpaper: rowToDTO(row) }
  } catch (err) {
    // DB insert failed — clean up the orphaned file so we don't leak disk space
    await deleteWallpaperFile(filePath)
    throw err
  }
}

export async function deleteWallpaper(wallpaperId: string): Promise<void> {
  if ((BUILTIN_WALLPAPER_IDS as readonly string[]).includes(wallpaperId)) {
    throw new Error('Cannot delete a built-in wallpaper')
  }

  const [row] = await db.select().from(wallpaperAssets).where(eq(wallpaperAssets.id, wallpaperId)).all()
  if (!row) {
    throw new Error(`Wallpaper not found: ${wallpaperId}`)
  }

  if (row.filePath) {
    await deleteWallpaperFile(row.filePath)
  }

  await db.delete(wallpaperAssets).where(eq(wallpaperAssets.id, wallpaperId)).run()
}
