import { NextResponse } from 'next/server'
import { getAllWallpapers, uploadWallpaper } from '@/services/wallpaper_service'

export async function GET() {
  try {
    const wallpapers = await getAllWallpapers()
    // Strip server-side filePath — clients use /api/wallpapers/file/[id] instead
    const safeWallpapers = wallpapers.map(({ filePath: _fp, ...rest }) => rest)
    return NextResponse.json(safeWallpapers)
  } catch (error) {
    console.error('Failed to fetch wallpapers:', error)
    return NextResponse.json({ error: 'Failed to fetch wallpapers' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const result = await uploadWallpaper(file)

    if (!result.success || !result.wallpaper) {
      return NextResponse.json(
        { error: result.validationError ?? result.error ?? 'Upload failed' },
        { status: 400 }
      )
    }

    const { filePath: _fp, ...safeWallpaper } = result.wallpaper
    return NextResponse.json(safeWallpaper, { status: 201 })
  } catch (error) {
    console.error('Wallpaper upload failed:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
