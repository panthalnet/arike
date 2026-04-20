import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import Database from 'better-sqlite3'
import path from 'path'
import { NextRequest } from 'next/server'

let sqlite: InstanceType<typeof Database>

beforeAll(() => {
  const DB_PATH = path.join(process.cwd(), 'data', 'arike.db')
  sqlite = new Database(DB_PATH)
  sqlite.prepare('UPDATE wallpaper_assets SET is_active = 0').run()
})

afterAll(() => {
  sqlite.prepare('UPDATE wallpaper_assets SET is_active = 0').run()
  sqlite.close()
})

describe('wallpaper settings integration', () => {
  it('GET /api/wallpapers returns built-in wallpapers', async () => {
    const { GET } = await import('@/app/api/wallpapers/route')
    const res = await GET()
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(Array.isArray(json)).toBe(true)
    expect(json.length).toBeGreaterThanOrEqual(3)
  })

  it('POST /api/wallpapers/[id]/activate activates a built-in wallpaper', async () => {
    const { POST } = await import('@/app/api/wallpapers/[id]/route')
    const req = new NextRequest('http://localhost/api/wallpapers/builtin-2/activate', { method: 'POST' })
    const res = await POST(req, { params: Promise.resolve({ id: 'builtin-2' }) })
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
  })

  it('POST /api/wallpapers/[id]/activate rejects unknown id', async () => {
    const { POST } = await import('@/app/api/wallpapers/[id]/route')
    const req = new NextRequest('http://localhost/api/wallpapers/unknown-id/activate', { method: 'POST' })
    const res = await POST(req, { params: Promise.resolve({ id: 'unknown-id' }) })
    expect(res.status).toBe(404)
  })

  it('DELETE /api/wallpapers/[id] rejects built-in wallpaper deletion', async () => {
    const { DELETE } = await import('@/app/api/wallpapers/[id]/route')
    const req = new NextRequest('http://localhost/api/wallpapers/builtin-1', { method: 'DELETE' })
    const res = await DELETE(req, { params: Promise.resolve({ id: 'builtin-1' }) })
    expect(res.status).toBe(400)
  })
})
