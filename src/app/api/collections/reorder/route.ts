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
    const body: unknown = await request.json()

    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const payload = body as Record<string, unknown>

    if (!Array.isArray(payload.orderedIds) || payload.orderedIds.some((id) => typeof id !== 'string')) {
      return NextResponse.json({ error: 'orderedIds must be an array of strings' }, { status: 400 })
    }

    reorderCollections(payload.orderedIds)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Failed to reorder collections:', error)
    return NextResponse.json({ error: 'Failed to reorder collections' }, { status: 500 })
  }
}
