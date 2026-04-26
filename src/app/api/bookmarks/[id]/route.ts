import { NextRequest, NextResponse } from 'next/server'
import {
  getBookmarkById,
  updateBookmark,
  deleteBookmark,
  type BookmarkInput,
} from '@/services/bookmark_service'
import {
  getCollectionsForBookmark,
  addBookmarkToCollection,
  removeBookmarkFromCollection,
} from '@/services/collection_service'
import { setTileSize, getTileSize, VALID_TILE_SIZES, type TileSize } from '@/services/tile_size_service'

type RouteContext = {
  params: Promise<{ id: string }>
}

/**
 * GET /api/bookmarks/[id]
 * Get a specific bookmark by ID
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const bookmark = await getBookmarkById(id)

    if (!bookmark) {
      return NextResponse.json(
        { error: 'Bookmark not found' },
        { status: 404 }
      )
    }

    // Also include collections this bookmark belongs to
    const collections = await getCollectionsForBookmark(id)

    return NextResponse.json({
      ...bookmark,
      collections,
    })
  } catch (error) {
    console.error('Failed to get bookmark:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve bookmark' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/bookmarks/[id]
 * Update a bookmark
 * 
 * Body: { name?: string, url?: string, icon?: string, collections?: string[] }
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const body: unknown = await request.json()

    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const payload = body as Record<string, unknown>

    // Update bookmark fields
    const updateData: Partial<BookmarkInput> = {}
    if (payload.name !== undefined) {
      if (typeof payload.name !== 'string' || payload.name.trim() === '') {
        return NextResponse.json({ error: 'name must be a non-empty string' }, { status: 400 })
      }
      updateData.name = payload.name
    }
    if (payload.url !== undefined) {
      if (typeof payload.url !== 'string') {
        return NextResponse.json({ error: 'url must be a string' }, { status: 400 })
      }
      updateData.url = payload.url
    }
    if (payload.icon !== undefined) {
      if (typeof payload.icon !== 'string') {
        return NextResponse.json({ error: 'icon must be a string' }, { status: 400 })
      }
      updateData.icon = payload.icon
    }

    let bookmark
    if (Object.keys(updateData).length > 0) {
      bookmark = await updateBookmark(id, updateData)
    } else {
      bookmark = await getBookmarkById(id)
    }

    // Update collections if specified
    if (payload.collections && Array.isArray(payload.collections)) {
      const desiredCollections = payload.collections as string[]
      // Get current collections
      const currentCollections = await getCollectionsForBookmark(id)

      // Find collections to add and remove
      const collectionsToAdd = desiredCollections.filter(
        (c: string) => !currentCollections.includes(c)
      )
      const collectionsToRemove = currentCollections.filter(
        (c) => !desiredCollections.includes(c)
      )

      // Add to new collections
      for (const collectionId of collectionsToAdd) {
        if (typeof collectionId === 'string') {
          await addBookmarkToCollection(id, collectionId)
        }
      }

      // Remove from old collections
      for (const collectionId of collectionsToRemove) {
        await removeBookmarkFromCollection(id, collectionId)
      }
    }

    // Return updated bookmark with collections
    const collections = await getCollectionsForBookmark(id)

    return NextResponse.json({
      ...bookmark,
      collections,
    })
  } catch (error) {
    console.error('Failed to update bookmark:', error)

    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return NextResponse.json(
          { error: 'Bookmark not found' },
          { status: 404 }
        )
      }
      if (error.message.includes('Invalid')) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to update bookmark' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/bookmarks/[id]
 * Delete a bookmark
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    await deleteBookmark(id)

    return NextResponse.json(
      { message: 'Bookmark deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Failed to delete bookmark:', error)

    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { error: 'Bookmark not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to delete bookmark' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/bookmarks/[id]
 * Partial update — currently supports: { tileSize: 'small' | 'medium' | 'large' }
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const params = await context.params
    const id = params.id
    const body: unknown = await request.json()

    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const payload = body as Record<string, unknown>

    if ('tileSize' in payload) {
      const tileSize = payload.tileSize
      if (typeof tileSize !== 'string' || !(VALID_TILE_SIZES as readonly string[]).includes(tileSize)) {
        return NextResponse.json(
          { error: `Invalid tileSize: "${tileSize}". Must be one of: ${VALID_TILE_SIZES.join(', ')}` },
          { status: 400 }
        )
      }
      await setTileSize(id, tileSize as TileSize)
      const updatedSize = await getTileSize(id)
      return NextResponse.json({ id, tileSize: updatedSize })
    }

    return NextResponse.json({ error: 'No patchable fields provided' }, { status: 400 })
  } catch (error) {
    console.error('Failed to patch bookmark:', error)
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json({ error: 'Bookmark not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to update bookmark' }, { status: 500 })
  }
}
