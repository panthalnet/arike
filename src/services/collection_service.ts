import { db } from '@/lib/db'
import {
  collections,
  collectionBookmarks,
  bookmarks,
  type Collection,
  type NewCollection,
} from '@/lib/schema'
import { eq, sql, and } from 'drizzle-orm'

/** Maximum number of collections allowed (warn at 40) */
export const MAX_COLLECTIONS = 50
export const WARN_COLLECTIONS_AT = 40

export type CollectionInput = {
  name: string
}

export type CollectionWithCount = Collection & {
  bookmarkCount: number
}

/**
 * Seed default "Bookmarks" collection if no collections exist.
 * Called on app startup via instrumentation.ts / db initialization.
 */
export async function seedDefaultCollection(): Promise<void> {
  const existing = await db.select().from(collections).limit(1)
  if (existing.length === 0) {
    await db.insert(collections).values({
      id: 'default-collection',
      name: 'Bookmarks',
      order: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  }
}

/**
 * Get all collections ordered by their sort order, with bookmark counts.
 */
export async function getAllCollections(): Promise<CollectionWithCount[]> {
  const rows = await db
    .select({
      id: collections.id,
      name: collections.name,
      order: collections.order,
      createdAt: collections.createdAt,
      updatedAt: collections.updatedAt,
      bookmarkCount: sql<number>`count(${collectionBookmarks.bookmarkId})`,
    })
    .from(collections)
    .leftJoin(collectionBookmarks, eq(collections.id, collectionBookmarks.collectionId))
    .groupBy(
      collections.id,
      collections.name,
      collections.order,
      collections.createdAt,
      collections.updatedAt,
    )
    .orderBy(collections.order)

  return rows.map((row) => ({ ...row, bookmarkCount: Number(row.bookmarkCount ?? 0) }))
}

/**
 * Get a single collection by ID.
 */
export async function getCollectionById(id: string): Promise<Collection | null> {
  const result = await db.select().from(collections).where(eq(collections.id, id)).limit(1)
  return result.length > 0 ? result[0] : null
}

/**
 * Create a new collection.
 * Throws if the 50-collection limit would be exceeded.
 */
export async function createCollection(data: CollectionInput): Promise<Collection> {
  if (!data.name || !data.name.trim()) {
    throw new Error('Collection name is required')
  }

  // Check limit
  const countResult = await db.select({ count: sql<number>`count(*)` }).from(collections)
  const current = Number(countResult[0]?.count ?? 0)

  if (current >= MAX_COLLECTIONS) {
    throw new Error(`Cannot create more than ${MAX_COLLECTIONS} collections`)
  }

  // Determine max order
  const existing = await db.select({ order: collections.order }).from(collections).orderBy(collections.order)
  const maxOrder = existing.length > 0 ? existing[existing.length - 1].order : -1

  const id = crypto.randomUUID()
  const now = new Date()
  const collection: NewCollection = {
    id,
    name: data.name.trim(),
    order: maxOrder + 1,
    createdAt: now,
    updatedAt: now,
  }

  await db.insert(collections).values(collection)
  return collection as Collection
}

/**
 * Rename a collection.
 */
export async function renameCollection(id: string, name: string): Promise<Collection> {
  if (!name || !name.trim()) {
    throw new Error('Collection name is required')
  }

  const result = await db
    .update(collections)
    .set({ name: name.trim(), updatedAt: new Date() })
    .where(eq(collections.id, id))
    .returning()

  if (result.length === 0) {
    throw new Error('Collection not found')
  }

  return result[0]
}

/**
 * Delete a collection.
 * The collection_bookmarks entries are cascade-deleted automatically.
 * Bookmarks themselves are NOT deleted.
 * Throws if this is the last collection (must always have at least 1).
 */
export async function deleteCollection(id: string): Promise<void> {
  const countResult = await db.select({ count: sql<number>`count(*)` }).from(collections)
  const current = Number(countResult[0]?.count ?? 0)

  if (current <= 1) {
    throw new Error('Cannot delete the last collection')
  }

  const result = await db.delete(collections).where(eq(collections.id, id)).returning()

  if (result.length === 0) {
    throw new Error('Collection not found')
  }
}

/**
 * Reorder collections given an ordered list of IDs.
 * Each ID is assigned its position index as the new order.
 * Wrapped in a transaction to prevent partial updates.
 */
export function reorderCollections(orderedIds: string[]): void {
  db.transaction((tx) => {
    for (const [index, id] of orderedIds.entries()) {
      tx.update(collections)
        .set({ order: index, updatedAt: new Date() })
        .where(eq(collections.id, id))
        .run()
    }
  })
}

/**
 * Add a bookmark to a collection.
 * Idempotent: does nothing if the bookmark is already in the collection.
 */
export async function addBookmarkToCollection(
  bookmarkId: string,
  collectionId: string
): Promise<void> {
  // Check if already present
  const existing = await db
    .select()
    .from(collectionBookmarks)
    .where(
      and(
        eq(collectionBookmarks.bookmarkId, bookmarkId),
        eq(collectionBookmarks.collectionId, collectionId)
      )
    )
    .limit(1)

  if (existing.length > 0) {
    return // Already assigned
  }

  // Get max order in collection
  const currentMappings = await db
    .select({ order: collectionBookmarks.order })
    .from(collectionBookmarks)
    .where(eq(collectionBookmarks.collectionId, collectionId))

  const maxOrder = currentMappings.reduce((max, m) => Math.max(max, m.order), -1)

  await db.insert(collectionBookmarks).values({
    bookmarkId,
    collectionId,
    order: maxOrder + 1,
  })
}

/**
 * Remove a bookmark from a collection.
 * The bookmark itself is not deleted.
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
 * Set a bookmark's collection memberships to exactly the given list of collection IDs.
 * Adds to new collections, removes from collections not in the list.
 */
export async function setBookmarkCollections(
  bookmarkId: string,
  collectionIds: string[]
): Promise<void> {
  // Get current memberships
  const current = await db
    .select({ collectionId: collectionBookmarks.collectionId })
    .from(collectionBookmarks)
    .where(eq(collectionBookmarks.bookmarkId, bookmarkId))

  const currentIds = new Set(current.map((r) => r.collectionId))
  const desiredIds = new Set(collectionIds)

  // Remove collections no longer desired
  for (const id of currentIds) {
    if (!desiredIds.has(id)) {
      await removeBookmarkFromCollection(bookmarkId, id)
    }
  }

  // Add new collections
  for (const id of desiredIds) {
    if (!currentIds.has(id)) {
      await addBookmarkToCollection(bookmarkId, id)
    }
  }
}

/**
 * Get the collection IDs a bookmark belongs to.
 */
export async function getCollectionsForBookmark(bookmarkId: string): Promise<string[]> {
  const result = await db
    .select({ collectionId: collectionBookmarks.collectionId })
    .from(collectionBookmarks)
    .where(eq(collectionBookmarks.bookmarkId, bookmarkId))
  return result.map((r) => r.collectionId)
}

/**
 * Check whether the collection count is near the warning threshold.
 */
export async function isNearCollectionLimit(): Promise<boolean> {
  const countResult = await db.select({ count: sql<number>`count(*)` }).from(collections)
  return Number(countResult[0]?.count ?? 0) >= WARN_COLLECTIONS_AT
}
