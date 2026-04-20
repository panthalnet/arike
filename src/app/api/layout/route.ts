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
    const body = await request.json()

    if (!('layoutMode' in body)) {
      return NextResponse.json({ error: 'layoutMode field is required' }, { status: 400 })
    }

    if (!(VALID_LAYOUT_MODES as readonly string[]).includes(body.layoutMode)) {
      return NextResponse.json(
        { error: `Invalid layoutMode: "${body.layoutMode}". Must be one of: ${VALID_LAYOUT_MODES.join(', ')}` },
        { status: 400 }
      )
    }

    const updated = await setLayoutMode(body.layoutMode as LayoutMode)
    return NextResponse.json(updated)
  } catch (error) {
    console.error('Failed to update layout mode:', error)
    return NextResponse.json({ error: 'Failed to update layout mode' }, { status: 500 })
  }
}
