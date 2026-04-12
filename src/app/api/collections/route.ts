import { NextRequest, NextResponse } from 'next/server'
import {
  getAllCollections,
  createCollection,
  isNearCollectionLimit,
  MAX_COLLECTIONS,
} from '@/services/collection_service'

/**
 * GET /api/collections
 * Returns all collections ordered by sortOrder, including bookmark counts.
 */
export async function GET() {
  try {
    const result = await getAllCollections()
    return NextResponse.json(result)
  } catch (error) {
    console.error('Failed to get collections:', error)
    return NextResponse.json({ error: 'Failed to retrieve collections' }, { status: 500 })
  }
}

/**
 * POST /api/collections
 * Create a new collection.
 *
 * Body: { name: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
      return NextResponse.json({ error: 'Collection name is required' }, { status: 400 })
    }

    // Warn (but still allow) if near limit
    const nearLimit = await isNearCollectionLimit()

    const collection = await createCollection({ name: body.name })

    const response = NextResponse.json(collection, { status: 201 })
    if (nearLimit) {
      response.headers.set('X-Collection-Limit-Warning', `Approaching limit of ${MAX_COLLECTIONS} collections`)
    }
    return response
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Cannot create more than')) {
        return NextResponse.json({ error: error.message }, { status: 422 })
      }
      if (error.message.includes('UNIQUE constraint')) {
        return NextResponse.json({ error: 'A collection with that name already exists' }, { status: 409 })
      }
    }
    console.error('Failed to create collection:', error)
    return NextResponse.json({ error: 'Failed to create collection' }, { status: 500 })
  }
}
