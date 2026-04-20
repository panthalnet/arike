import { NextRequest, NextResponse } from 'next/server'
import {
  setActiveWallpaper,
  deactivateAllWallpapers,
  deleteWallpaper,
  getAllWallpapers,
} from '@/services/wallpaper_service'

interface RouteParams {
  params: Promise<{ id: string }>
}

// POST /api/wallpapers/[id]/activate — Not used here; see sub-route
// PATCH /api/wallpapers/[id] — activate this wallpaper
export async function PATCH(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  try {
    await setActiveWallpaper(id)
    const wallpapers = await getAllWallpapers()
    const active = wallpapers.find(w => w.id === id)
    return NextResponse.json({ success: true, wallpaper: active })
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }
    console.error('Failed to activate wallpaper:', error)
    return NextResponse.json({ error: 'Failed to activate wallpaper' }, { status: 500 })
  }
}

// POST /api/wallpapers/[id] with body { action: 'activate' | 'deactivate' }
// or just POST for activation (matched by route.ts in sub-route)
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params

  try {
    let body: { action?: string } = {}
    try {
      body = await request.json()
    } catch {
      // No body; default action = activate
    }

    const action = body.action ?? 'activate'

    if (action === 'activate') {
      await setActiveWallpaper(id)
      const wallpapers = await getAllWallpapers()
      const active = wallpapers.find(w => w.id === id)
      return NextResponse.json({ success: true, wallpaper: active })
    }

    if (action === 'deactivate') {
      await deactivateAllWallpapers()
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }
    console.error('Wallpaper action failed:', error)
    return NextResponse.json({ error: 'Operation failed' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  try {
    await deleteWallpaper(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('built-in')) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
      if (error.message.includes('not found')) {
        return NextResponse.json({ error: error.message }, { status: 404 })
      }
    }
    console.error('Failed to delete wallpaper:', error)
    return NextResponse.json({ error: 'Failed to delete wallpaper' }, { status: 500 })
  }
}
