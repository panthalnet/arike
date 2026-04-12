import { NextRequest, NextResponse } from 'next/server'
import { reorderCollections } from '@/services/collection_service'

/**
 * POST /api/collections/reorder
 * Reorder collections by the provided ordered list of IDs.
 *
 * Body: { orderedIds: string[] }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!Array.isArray(body.orderedIds) || body.orderedIds.some((id) => typeof id !== 'string')) {
      return NextResponse.json({ error: 'orderedIds must be an array of strings' }, { status: 400 })
    }

    await reorderCollections(body.orderedIds)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Failed to reorder collections:', error)
    return NextResponse.json({ error: 'Failed to reorder collections' }, { status: 500 })
  }
}
