import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { bookmarks } from '@/lib/schema'

export type TileSize = 'small' | 'medium' | 'large'

export const VALID_TILE_SIZES: readonly TileSize[] = ['small', 'medium', 'large'] as const

export async function getTileSize(bookmarkId: string): Promise<TileSize> {
  const rows = await db
    .select({ tileSize: bookmarks.tileSize })
    .from(bookmarks)
    .where(eq(bookmarks.id, bookmarkId))
    .all()

  if (rows.length === 0) {
    throw new Error(`Bookmark not found: ${bookmarkId}`)
  }

  return (rows[0].tileSize as TileSize) ?? 'medium'
}

export async function setTileSize(bookmarkId: string, size: TileSize): Promise<void> {
  if (!(VALID_TILE_SIZES as readonly string[]).includes(size)) {
    throw new Error(`Invalid tile size: "${size}". Must be one of: ${VALID_TILE_SIZES.join(', ')}`)
  }

  const existing = await db
    .select({ id: bookmarks.id })
    .from(bookmarks)
    .where(eq(bookmarks.id, bookmarkId))
    .all()

  if (existing.length === 0) {
    throw new Error(`Bookmark not found: ${bookmarkId}`)
  }

  await db
    .update(bookmarks)
    .set({ tileSize: size, updatedAt: new Date() })
    .where(eq(bookmarks.id, bookmarkId))
    .run()
}
