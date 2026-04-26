import { NextRequest, NextResponse } from 'next/server'
import {
  getLayoutPreferences,
  setLayoutMode,
  VALID_LAYOUT_MODES,
  type LayoutMode,
} from '@/services/layout_service'

export async function GET() {
  try {
    const prefs = await getLayoutPreferences()
    return NextResponse.json(prefs)
  } catch (error) {
    console.error('Failed to fetch layout preferences:', error)
    return NextResponse.json({ error: 'Failed to fetch layout preferences' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body: unknown = await request.json()

    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const payload = body as Record<string, unknown>

    if (!('layoutMode' in payload)) {
      return NextResponse.json({ error: 'layoutMode field is required' }, { status: 400 })
    }

    const layoutMode = payload.layoutMode
    if (typeof layoutMode !== 'string') {
      return NextResponse.json({ error: 'layoutMode must be a string' }, { status: 400 })
    }

    if (!(VALID_LAYOUT_MODES as readonly string[]).includes(layoutMode)) {
      return NextResponse.json(
        { error: `Invalid layoutMode: "${layoutMode}". Must be one of: ${VALID_LAYOUT_MODES.join(', ')}` },
        { status: 400 }
      )
    }

    const updated = await setLayoutMode(layoutMode as LayoutMode)
    return NextResponse.json(updated)
  } catch (error) {
    console.error('Failed to update layout mode:', error)
    return NextResponse.json({ error: 'Failed to update layout mode' }, { status: 500 })
  }
}
