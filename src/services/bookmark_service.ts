import { db } from '@/lib/db'
import { bookmarks, collectionBookmarks, type Bookmark, type NewBookmark } from '@/lib/schema'
import { eq, and, inArray } from 'drizzle-orm'
import { validateUrl, validateIconReference, parseIconReference } from '@/lib/icon-utils'

/**
 * Icon format types
 * - builtin:material:[name] - Material Icons from Iconify
 * - builtin:simple:[name] - Simple Icons from Iconify
 * - upload:[uuid].[ext] - Uploaded custom icon
 */
export type IconReference = string

/**
 * Input data for creating a bookmark (without auto-generated fields)
 */
export type BookmarkInput = {
  name: string
  url: string
  icon: string
}

// Re-export utilities for convenience
export { validateUrl, validateIconReference, parseIconReference } from '@/lib/icon-utils'

/**
 * Create a new bookmark
 */
export async function createBookmark(data: BookmarkInput): Promise<Bookmark> {
  // Validate URL
  if (!validateUrl(data.url)) {
    throw new Error('Invalid URL format. Must start with http:// or https://')
  }

  // Validate icon reference
  if (!validateIconReference(data.icon)) {
    throw new Error('Invalid icon reference format')
  }

  // Generate UUID
  const id = crypto.randomUUID()

  const now = new Date()
  const bookmark = {
    id,
    name: data.name,
    url: data.url,
    icon: data.icon,
    tileSize: 'medium' as const,
    createdAt: now,
    updatedAt: now,
  }

  await db.insert(bookmarks).values(bookmark)

  return bookmark
}

/**
 * Get all bookmarks
 */
export async function getAllBookmarks(): Promise<Bookmark[]> {
  const result = await db.select().from(bookmarks).orderBy(bookmarks.createdAt)
  return result
}

/**
 * Get bookmark by ID
 */
export async function getBookmarkById(id: string): Promise<Bookmark | null> {
  const result = await db.select().from(bookmarks).where(eq(bookmarks.id, id)).limit(1)
  return result.length > 0 ? result[0] : null
}

/**
 * Get bookmarks by collection ID
 */
export async function getBookmarksByCollection(collectionId: string): Promise<Bookmark[]> {
  const result = await db
    .select({
      id: bookmarks.id,
      name: bookmarks.name,
      url: bookmarks.url,
      icon: bookmarks.icon,
      tileSize: bookmarks.tileSize,
      createdAt: bookmarks.createdAt,
      updatedAt: bookmarks.updatedAt,
      order: collectionBookmarks.order,
    })
    .from(bookmarks)
    .innerJoin(collectionBookmarks, eq(bookmarks.id, collectionBookmarks.bookmarkId))
    .where(eq(collectionBookmarks.collectionId, collectionId))
    .orderBy(collectionBookmarks.order)

  return result
}

/**
 * Update an existing bookmark
 */
export async function updateBookmark(id: string, data: Partial<BookmarkInput>): Promise<Bookmark> {
  // Validate URL if provided
  if (data.url && !validateUrl(data.url)) {
    throw new Error('Invalid URL format. Must start with http:// or https://')
  }

  // Validate icon reference if provided
  if (data.icon && !validateIconReference(data.icon)) {
    throw new Error('Invalid icon reference format')
  }

  const updateData: any = {
    ...data,
    updatedAt: new Date(),
  }

  const result = await db
    .update(bookmarks)
    .set(updateData)
    .where(eq(bookmarks.id, id))
    .returning()

  if (result.length === 0) {
    throw new Error('Bookmark not found')
  }

  return result[0]
}

/**
 * Delete a bookmark
 * Note: CASCADE delete will remove from collection_bookmarks automatically
 */
export async function deleteBookmark(id: string): Promise<void> {
  const result = await db.delete(bookmarks).where(eq(bookmarks.id, id)).returning()

  if (result.length === 0) {
    throw new Error('Bookmark not found')
  }
}

/**
 * Add bookmark to a collection
 */
export async function addBookmarkToCollection(
  bookmarkId: string,
  collectionId: string,
  order?: number
): Promise<void> {
  // Get current max order in collection
  const existingMappings = await db
    .select()
    .from(collectionBookmarks)
    .where(eq(collectionBookmarks.collectionId, collectionId))

  const maxOrder = existingMappings.reduce((max, m) => Math.max(max, m.order), -1)
  const newOrder = order ?? maxOrder + 1

  await db.insert(collectionBookmarks).values({
    bookmarkId,
    collectionId,
    order: newOrder,
  })
}

/**
 * Remove bookmark from a collection
 */
export async function removeBookmarkFromCollection(
  bookmarkId: string,
  collectionId: string
): Promise<void> {
  await db
    .delete(collectionBookmarks)
    .where(
      and(
        eq(collectionBookmarks.bookmarkId, bookmarkId),
        eq(collectionBookmarks.collectionId, collectionId)
      )
    )
}

/**
 * Get collections containing a bookmark
 */
export async function getCollectionsForBookmark(bookmarkId: string): Promise<string[]> {
  const result = await db
    .select({ collectionId: collectionBookmarks.collectionId })
    .from(collectionBookmarks)
    .where(eq(collectionBookmarks.bookmarkId, bookmarkId))

  return result.map((r) => r.collectionId)
}

/**
 * Search bookmarks by name or URL
 */
export async function searchBookmarks(query: string): Promise<Bookmark[]> {
  const allBookmarks = await getAllBookmarks()
  const lowerQuery = query.toLowerCase()

  return allBookmarks.filter(
    (bookmark) =>
      bookmark.name.toLowerCase().includes(lowerQuery) ||
      bookmark.url.toLowerCase().includes(lowerQuery)
  )
}


