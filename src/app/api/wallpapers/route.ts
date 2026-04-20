import { NextResponse } from 'next/server'
import { getAllWallpapers, uploadWallpaper } from '@/services/wallpaper_service'

export async function GET() {
  try {
    const wallpapers = await getAllWallpapers()
    return NextResponse.json(wallpapers)
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

    if (!result.success) {
      return NextResponse.json(
        { error: result.validationError ?? result.error ?? 'Upload failed' },
        { status: 400 }
      )
    }

    return NextResponse.json(result.wallpaper, { status: 201 })
  } catch (error) {
    console.error('Wallpaper upload failed:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
