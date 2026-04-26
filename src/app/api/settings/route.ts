import { NextRequest, NextResponse } from 'next/server'
import {
  getThemeSettings,
  updateTheme,
  updateCustomColors,
  updateSearchProvider,
  resetCustomColors,
  updateBlurIntensity,
  AVAILABLE_THEMES,
  AVAILABLE_SEARCH_PROVIDERS,
  BLUR_MIN,
  BLUR_MAX,
  type CustomColors,
} from '@/services/theme_service'

/**
 * GET /api/settings
 * Retrieve current theme settings
 */
export async function GET() {
  try {
    const settings = await getThemeSettings()
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Failed to get theme settings:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve settings' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/settings
 * Update theme settings
 * 
 * Accepts partial updates:
 * - { selectedTheme: string }
 * - { customPrimary: string | null, customBackground: string | null, ... }
 * - { searchProvider: string }
 * - { resetColors: true }
 */
export async function PUT(request: NextRequest) {
  try {
    const body: unknown = await request.json()

    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const payload = body as Record<string, unknown>

    // Runtime schema validation: at least one known key required
    const knownKeys = ['selectedTheme', 'searchProvider', 'blurIntensity', 'customPrimary',
      'customBackground', 'customText', 'customBorder', 'resetColors']
    const hasKnown = knownKeys.some(k => k in payload)
    if (!hasKnown) {
      return NextResponse.json({ error: 'No valid settings fields provided' }, { status: 400 })
    }

    // Handle theme change
    if (payload.selectedTheme !== undefined) {
      if (typeof payload.selectedTheme !== 'string' || !(AVAILABLE_THEMES as readonly string[]).includes(payload.selectedTheme)) {
        return NextResponse.json({ error: `Invalid theme: ${payload.selectedTheme}` }, { status: 400 })
      }
      const updated = await updateTheme(payload.selectedTheme)
      return NextResponse.json(updated)
    }

    // Handle blur intensity change
    if (payload.blurIntensity !== undefined) {
      const px = Number(payload.blurIntensity)
      if (!Number.isInteger(px) || px < BLUR_MIN || px > BLUR_MAX) {
        return NextResponse.json(
          { error: `blurIntensity must be an integer between ${BLUR_MIN} and ${BLUR_MAX}` },
          { status: 400 }
        )
      }
      const updated = await updateBlurIntensity(px)
      return NextResponse.json(updated)
    }

    // Handle search provider change
    if (payload.searchProvider !== undefined) {
      if (typeof payload.searchProvider !== 'string' || !(AVAILABLE_SEARCH_PROVIDERS as readonly string[]).includes(payload.searchProvider)) {
        return NextResponse.json({ error: `Invalid search provider: ${payload.searchProvider}` }, { status: 400 })
      }
      const updated = await updateSearchProvider(payload.searchProvider)
      return NextResponse.json(updated)
    }

    // Handle reset colors
    if (payload.resetColors === true) {
      const updated = await resetCustomColors()
      return NextResponse.json(updated)
    }

    // Handle custom color updates
    const colorUpdates: CustomColors = {}
    let hasColorUpdates = false

    if ('customPrimary' in payload) {
      colorUpdates.customPrimary = payload.customPrimary as string | null
      hasColorUpdates = true
    }
    if ('customBackground' in payload) {
      colorUpdates.customBackground = payload.customBackground as string | null
      hasColorUpdates = true
    }
    if ('customText' in payload) {
      colorUpdates.customText = payload.customText as string | null
      hasColorUpdates = true
    }
    if ('customBorder' in payload) {
      colorUpdates.customBorder = payload.customBorder as string | null
      hasColorUpdates = true
    }

    if (hasColorUpdates) {
      const updated = await updateCustomColors(colorUpdates)
      return NextResponse.json(updated)
    }

    return NextResponse.json({ error: 'No valid settings provided for update' }, { status: 400 })
  } catch (error) {
    console.error('Failed to update theme settings:', error)
    
    if (error instanceof Error && error.message.includes('Invalid')) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
