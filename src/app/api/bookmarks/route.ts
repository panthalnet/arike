import { NextRequest, NextResponse } from 'next/server'
import {
  getAllBookmarks,
  createBookmark,
  getBookmarksByCollection,
  searchBookmarks,
} from '@/services/bookmark_service'

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
    const body = await request.json()

    // Validate required fields
    if (!body.name || !body.url || !body.icon) {
      return NextResponse.json(
        { error: 'Missing required fields: name, url, icon' },
        { status: 400 }
      )
    }

    // Create bookmark
    const bookmark = await createBookmark({
      name: body.name,
      url: body.url,
      icon: body.icon,
    })

    // Add to collections if specified
    if (body.collections && Array.isArray(body.collections)) {
      const { addBookmarkToCollection } = await import('@/services/bookmark_service')
      
      for (const collectionId of body.collections) {
        await addBookmarkToCollection(bookmark.id, collectionId)
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
