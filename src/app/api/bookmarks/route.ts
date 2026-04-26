import { NextRequest, NextResponse } from 'next/server'
import {
  getAllBookmarks,
  createBookmark,
  getBookmarksByCollection,
  searchBookmarks,
} from '@/services/bookmark_service'
import { addBookmarkToCollection } from '@/services/collection_service'

/**
 * GET /api/bookmarks
 * Get all bookmarks or search/filter
 * 
 * Query params:
 * - collection: Filter by collection ID
 * - search: Search query for name/URL
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const collectionId = searchParams.get('collection')
    const searchQuery = searchParams.get('search')

    let bookmarks

    if (searchQuery) {
      // Search bookmarks
      bookmarks = await searchBookmarks(searchQuery)
    } else if (collectionId) {
      // Get bookmarks by collection
      bookmarks = await getBookmarksByCollection(collectionId)
    } else {
      // Get all bookmarks
      bookmarks = await getAllBookmarks()
    }

    return NextResponse.json(bookmarks)
  } catch (error) {
    console.error('Failed to get bookmarks:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve bookmarks' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/bookmarks
 * Create a new bookmark
 * 
 * Body: { name: string, url: string, icon: string, collections?: string[] }
 */
export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json()

    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const payload = body as Record<string, unknown>

    // Validate required fields
    if (!payload.name || !payload.url || !payload.icon ||
        typeof payload.name !== 'string' || typeof payload.url !== 'string' || typeof payload.icon !== 'string') {
      return NextResponse.json(
        { error: 'Missing required fields: name, url, icon' },
        { status: 400 }
      )
    }

    // Create bookmark
    const bookmark = await createBookmark({
      name: payload.name,
      url: payload.url,
      icon: payload.icon,
    })

    // Add to collections if specified
    if (Array.isArray(payload.collections)) {
      for (const collectionId of payload.collections) {
        if (typeof collectionId === 'string') {
          await addBookmarkToCollection(bookmark.id, collectionId)
        }
      }
    }

    return NextResponse.json(bookmark, { status: 201 })
  } catch (error) {
    console.error('Failed to create bookmark:', error)

    // Check if it's a validation error
    if (error instanceof Error && error.message.includes('Invalid')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create bookmark' },
      { status: 500 }
    )
  }
}
