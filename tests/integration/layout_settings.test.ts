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
  tmpDb = path.join(os.tmpdir(), `arike-test-layout-int-${Date.now()}.db`)
  sqlite = new Database(tmpDb)
  sqlite.pragma('foreign_keys = ON')
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS layout_preferences (
      id INTEGER PRIMARY KEY,
      layout_mode TEXT NOT NULL DEFAULT 'uniform-grid',
      created_at INTEGER DEFAULT (unixepoch()),
      updated_at INTEGER DEFAULT (unixepoch())
    )
  `)
  sqlite.prepare(`INSERT OR IGNORE INTO layout_preferences (id, layout_mode) VALUES (1, 'uniform-grid')`).run()
})

afterEach(() => {
  sqlite.close()
  fs.unlinkSync(tmpDb)
  vi.resetModules()
})

describe('layout settings integration', () => {
  it('GET /api/layout returns current layout mode', async () => {
    const { GET } = await import('@/app/api/layout/route')
    const res = await GET()
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json).toHaveProperty('layoutMode')
    expect(['uniform-grid', 'bento-grid']).toContain(json.layoutMode)
  })

  it('PUT /api/layout sets bento-grid mode', async () => {
    const { PUT } = await import('@/app/api/layout/route')
    const req = new NextRequest('http://localhost/api/layout', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ layoutMode: 'bento-grid' }),
    })
    const res = await PUT(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.layoutMode).toBe('bento-grid')
  })

  it('PUT /api/layout rejects invalid mode', async () => {
    const { PUT } = await import('@/app/api/layout/route')
    const req = new NextRequest('http://localhost/api/layout', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ layoutMode: 'invalid' }),
    })
    const res = await PUT(req)
    expect(res.status).toBe(400)
  })

  it('PUT /api/layout rejects missing layoutMode field', async () => {
    const { PUT } = await import('@/app/api/layout/route')
    const req = new NextRequest('http://localhost/api/layout', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    const res = await PUT(req)
    expect(res.status).toBe(400)
  })
})

