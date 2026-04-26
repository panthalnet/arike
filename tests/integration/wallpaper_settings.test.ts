import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import os from 'os'
import path from 'path'
import fs from 'fs'
import { NextRequest } from 'next/server'

let tmpDb: string
let sqlite: Database.Database

vi.mock('@/lib/db', () => ({
  get db() { return drizzle(sqlite) },
  get sqlite() { return sqlite },
}))

beforeEach(() => {
  tmpDb = path.join(os.tmpdir(), `arike-test-wallpaper-int-${Date.now()}.db`)
  sqlite = new Database(tmpDb)
  sqlite.pragma('foreign_keys = ON')
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS wallpaper_assets (
      id TEXT PRIMARY KEY,
      source_type TEXT NOT NULL DEFAULT 'builtin',
      source_reference TEXT NOT NULL DEFAULT '',
      file_path TEXT,
      display_name TEXT NOT NULL DEFAULT '',
      is_active INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER DEFAULT (unixepoch()),
      updated_at INTEGER DEFAULT (unixepoch())
    )
  `)
  const insert = sqlite.prepare(
    `INSERT OR IGNORE INTO wallpaper_assets (id, source_type, source_reference, display_name)
     VALUES (?, 'builtin', ?, ?)`
  )
  insert.run('builtin-1', 'gradient-ocean', 'Ocean Gradient')
  insert.run('builtin-2', 'gradient-forest', 'Forest Gradient')
  insert.run('builtin-3', 'gradient-sunset', 'Sunset Gradient')
})

afterEach(() => {
  sqlite.close()
  fs.unlinkSync(tmpDb)
  vi.resetModules()
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

  it('POST /api/wallpapers/[id] with action=activate activates a built-in wallpaper', async () => {
    const { POST } = await import('@/app/api/wallpapers/[id]/route')
    const req = new NextRequest(`http://localhost/api/wallpapers/builtin-2`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'activate' }),
    })
    const res = await POST(req, { params: Promise.resolve({ id: 'builtin-2' }) })
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
  })

  it('POST /api/wallpapers/[id] rejects unknown id', async () => {
    const { POST } = await import('@/app/api/wallpapers/[id]/route')
    const req = new NextRequest(`http://localhost/api/wallpapers/unknown-id`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'activate' }),
    })
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

