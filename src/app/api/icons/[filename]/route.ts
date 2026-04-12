import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { getIconPath } from '@/lib/storage'

type Params = { params: Promise<{ filename: string }> }

const CONTENT_TYPES: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  svg: 'image/svg+xml',
}

/**
 * GET /api/icons/:filename
 * Serve an uploaded icon file from local storage.
 * Validates filename format to prevent path traversal.
 */
export async function GET(_req: NextRequest, { params }: Params) {
  const { filename } = await params

  // Validate filename format: uuid.ext only, no path traversal
  const filenameRegex = /^[a-f0-9-]{36}\.(png|jpg|jpeg|webp|svg)$/i
  if (!filenameRegex.test(filename)) {
    return NextResponse.json({ error: 'Invalid filename' }, { status: 400 })
  }

  const ext = filename.split('.').pop()?.toLowerCase() ?? ''
  const contentType = CONTENT_TYPES[ext] ?? 'application/octet-stream'

  try {
    const filePath = getIconPath(filename)
    const buffer = await readFile(filePath)

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch {
    return NextResponse.json({ error: 'Icon not found' }, { status: 404 })
  }
}
