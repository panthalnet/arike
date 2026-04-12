import { NextRequest, NextResponse } from 'next/server'
import { getCollectionsForBookmark } from '@/services/bookmark_service'

type Params = { params: Promise<{ id: string }> }

/**
 * GET /api/bookmarks/:id/collections
 * Returns array of collection IDs that this bookmark belongs to.
 */
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params
  try {
    const collectionIds = await getCollectionsForBookmark(id)
    return NextResponse.json(collectionIds)
  } catch (error) {
    console.error('Failed to get bookmark collections:', error)
    return NextResponse.json({ error: 'Failed to retrieve bookmark collections' }, { status: 500 })
  }
}
