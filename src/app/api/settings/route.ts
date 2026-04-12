import { NextRequest, NextResponse } from 'next/server'
import {
  getThemeSettings,
  updateTheme,
  updateCustomColors,
  updateSearchProvider,
  resetCustomColors,
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
    const body = await request.json()

    // Handle theme change
    if (body.selectedTheme) {
      const updated = await updateTheme(body.selectedTheme)
      return NextResponse.json(updated)
    }

    // Handle search provider change
    if (body.searchProvider) {
      const updated = await updateSearchProvider(body.searchProvider)
      return NextResponse.json(updated)
    }

    // Handle reset colors
    if (body.resetColors === true) {
      const updated = await resetCustomColors()
      return NextResponse.json(updated)
    }

    // Handle custom color updates
    const colorUpdates: CustomColors = {}
    let hasColorUpdates = false

    if ('customPrimary' in body) {
      colorUpdates.customPrimary = body.customPrimary
      hasColorUpdates = true
    }
    if ('customBackground' in body) {
      colorUpdates.customBackground = body.customBackground
      hasColorUpdates = true
    }
    if ('customText' in body) {
      colorUpdates.customText = body.customText
      hasColorUpdates = true
    }
    if ('customBorder' in body) {
      colorUpdates.customBorder = body.customBorder
      hasColorUpdates = true
    }

    if (hasColorUpdates) {
      const updated = await updateCustomColors(colorUpdates)
      return NextResponse.json(updated)
    }

    // No valid updates provided
    return NextResponse.json(
      { error: 'No valid settings provided for update' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Failed to update theme settings:', error)
    
    // Check if it's a validation error
    if (error instanceof Error && error.message.includes('Invalid')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}
