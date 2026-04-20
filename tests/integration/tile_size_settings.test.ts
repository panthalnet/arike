import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import Database from 'better-sqlite3'
import path from 'path'

const TEST_BM_ID = 'integration-tile-bm-1'
let sqlite: InstanceType<typeof Database>

beforeAll(() => {
  const DB_PATH = path.join(process.cwd(), 'data', 'arike.db')
  sqlite = new Database(DB_PATH)
  sqlite.prepare(
    `INSERT OR REPLACE INTO bookmarks (id, name, url, icon, tile_size)
     VALUES (?, 'Integration Test Bookmark', 'https://example.com', 'builtin:material:bookmark', 'medium')`
  ).run(TEST_BM_ID)
})

afterAll(() => {
  sqlite.prepare('DELETE FROM bookmarks WHERE id = ?').run(TEST_BM_ID)
  sqlite.close()
})

describe('tile size settings integration', () => {
  it('PATCH /api/bookmarks/[id] sets tile size to large', async () => {
    const { PATCH } = await import('@/app/api/bookmarks/[id]/route')
    const req = new Request('http://localhost/api/bookmarks/bm-1', {
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
    const req = new Request('http://localhost/api/bookmarks/bm-1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tileSize: 'gigantic' }),
    })
    const res = await PATCH(req as Parameters<typeof PATCH>[0], { params: Promise.resolve({ id: TEST_BM_ID }) })
    expect(res.status).toBe(400)
  })
})
