import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import os from 'os'
import path from 'path'
import fs from 'fs'

const TEST_BM_ID = 'integration-tile-bm-1'
let tmpDb: string
let sqlite: Database.Database

vi.mock('@/lib/db', () => ({
  get db() { return drizzle(sqlite) },
  get sqlite() { return sqlite },
}))

beforeEach(() => {
  tmpDb = path.join(os.tmpdir(), `arike-test-tile-int-${Date.now()}.db`)
  sqlite = new Database(tmpDb)
  sqlite.pragma('foreign_keys = ON')
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS bookmarks (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      url TEXT NOT NULL,
      icon TEXT NOT NULL,
      tile_size TEXT NOT NULL DEFAULT 'medium',
      created_at INTEGER DEFAULT (unixepoch()),
      updated_at INTEGER DEFAULT (unixepoch())
    )
  `)
  sqlite.prepare(
    `INSERT OR REPLACE INTO bookmarks (id, name, url, icon, tile_size)
     VALUES (?, 'Integration Test Bookmark', 'https://example.com', 'builtin:material:bookmark', 'medium')`
  ).run(TEST_BM_ID)
})

afterEach(() => {
  sqlite.close()
  fs.unlinkSync(tmpDb)
  vi.resetModules()
})

describe('tile size settings integration', () => {
  it('PATCH /api/bookmarks/[id] sets tile size to large', async () => {
    const { PATCH } = await import('@/app/api/bookmarks/[id]/route')
    const req = new Request(`http://localhost/api/bookmarks/${TEST_BM_ID}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tileSize: 'large' }),
    })
    const res = await PATCH(req as Parameters<typeof PATCH>[0], { params: Promise.resolve({ id: TEST_BM_ID }) })
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.tileSize).toBe('large')
  })

  it('PATCH /api/bookmarks/[id] rejects invalid tile size', async () => {
    const { PATCH } = await import('@/app/api/bookmarks/[id]/route')
    const req = new Request(`http://localhost/api/bookmarks/${TEST_BM_ID}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tileSize: 'gigantic' }),
    })
    const res = await PATCH(req as Parameters<typeof PATCH>[0], { params: Promise.resolve({ id: TEST_BM_ID }) })
    expect(res.status).toBe(400)
  })
})

