import { NextRequest, NextResponse } from 'next/server'
import { getWallpaperById } from '@/services/wallpaper_service'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/wallpapers/file/[id] — serve uploaded wallpaper image from disk
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params

  try {
    const wallpaper = await getWallpaperById(id)

    if (!wallpaper || wallpaper.sourceType !== 'upload' || !wallpaper.filePath) {
      return NextResponse.json({ error: 'Wallpaper not found' }, { status: 404 })
    }

    const fs = await import('fs/promises')
    const fileBuffer = await fs.readFile(wallpaper.filePath)

    const ext = wallpaper.filePath.substring(wallpaper.filePath.lastIndexOf('.')).toLowerCase()
    // SVG is explicitly excluded — serving SVGs can allow XSS via embedded scripts
    if (ext === '.svg') {
      return NextResponse.json({ error: 'Wallpaper not found' }, { status: 404 })
    }

    const contentTypeMap: Record<string, string> = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.webp': 'image/webp',
    }
    const contentType = contentTypeMap[ext] ?? 'image/jpeg'

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('Failed to serve wallpaper file:', error)
    return NextResponse.json({ error: 'Wallpaper not found' }, { status: 404 })
  }
}
