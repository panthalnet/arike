import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import Database from 'better-sqlite3'
import path from 'path'
import { NextRequest } from 'next/server'

let sqlite: InstanceType<typeof Database>

beforeAll(() => {
  const DB_PATH = path.join(process.cwd(), 'data', 'arike.db')
  sqlite = new Database(DB_PATH)
  sqlite.prepare("UPDATE layout_preferences SET layout_mode = 'uniform-grid' WHERE id = 1").run()
})

afterAll(() => {
  sqlite.prepare("UPDATE layout_preferences SET layout_mode = 'uniform-grid' WHERE id = 1").run()
  sqlite.close()
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
