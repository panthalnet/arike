import { NextRequest, NextResponse } from 'next/server'
import {
  getCollectionById,
  renameCollection,
  deleteCollection,
} from '@/services/collection_service'

type Params = { params: Promise<{ id: string }> }

/**
 * GET /api/collections/:id
 * Returns a single collection.
 */
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params
  try {
    const collection = await getCollectionById(id)
    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 })
    }
    return NextResponse.json(collection)
  } catch (error) {
    console.error('Failed to get collection:', error)
    return NextResponse.json({ error: 'Failed to retrieve collection' }, { status: 500 })
  }
}

/**
 * PATCH /api/collections/:id
 * Rename a collection.
 *
 * Body: { name: string }
 */
export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params
  try {
    const body = await request.json()

    if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
      return NextResponse.json({ error: 'Collection name is required' }, { status: 400 })
    }

    const collection = await renameCollection(id, body.name)
    return NextResponse.json(collection)
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Collection not found') {
        return NextResponse.json({ error: error.message }, { status: 404 })
      }
      if (error.message.includes('UNIQUE constraint')) {
        return NextResponse.json({ error: 'A collection with that name already exists' }, { status: 409 })
      }
    }
    console.error('Failed to rename collection:', error)
    return NextResponse.json({ error: 'Failed to rename collection' }, { status: 500 })
  }
}

/**
 * DELETE /api/collections/:id
 * Delete a collection. Bookmarks are NOT deleted; only the collection and its mappings are removed.
 * Returns 422 if attempting to delete the last collection.
 */
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params
  try {
    await deleteCollection(id)
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Collection not found') {
        return NextResponse.json({ error: error.message }, { status: 404 })
      }
      if (error.message === 'Cannot delete the last collection') {
        return NextResponse.json({ error: error.message }, { status: 422 })
      }
    }
    console.error('Failed to delete collection:', error)
    return NextResponse.json({ error: 'Failed to delete collection' }, { status: 500 })
  }
}
