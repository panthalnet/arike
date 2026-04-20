import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import { getWallpaperById } from '@/services/wallpaper_service'
import { WALLPAPERS_DIR } from '@/lib/storage'

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

    // Path traversal guard: ensure the file is inside the wallpapers directory
    const resolvedPath = path.resolve(wallpaper.filePath)
    const resolvedDir = path.resolve(WALLPAPERS_DIR)
    if (!resolvedPath.startsWith(resolvedDir + path.sep) && resolvedPath !== resolvedDir) {
      return NextResponse.json({ error: 'Wallpaper not found' }, { status: 404 })
    }

    const fileBuffer = await fs.readFile(resolvedPath)

    const ext = resolvedPath.substring(resolvedPath.lastIndexOf('.')).toLowerCase()
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
