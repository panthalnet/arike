import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import os from 'os'
import path from 'path'
import fs from 'fs'

let tmpDb: string
let sqlite: Database.Database

vi.mock('@/lib/db', () => ({
  get db() { return drizzle(sqlite) },
  get sqlite() { return sqlite },
}))

beforeEach(() => {
  tmpDb = path.join(os.tmpdir(), `arike-test-layout-${Date.now()}.db`)
  sqlite = new Database(tmpDb)
  sqlite.pragma('foreign_keys = ON')
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS layout_preferences (
      id INTEGER PRIMARY KEY,
      layout_mode TEXT NOT NULL DEFAULT 'uniform-grid',
      updated_at INTEGER DEFAULT (unixepoch())
    )
  `)
  // Seed the singleton row
  sqlite.prepare(`INSERT OR IGNORE INTO layout_preferences (id, layout_mode) VALUES (1, 'uniform-grid')`).run()
})

afterEach(() => {
  sqlite.close()
  fs.unlinkSync(tmpDb)
  vi.resetModules()
})

describe('layout_service', () => {
  describe('getLayoutMode', () => {
    it('returns uniform-grid by default', async () => {
      const { getLayoutMode } = await import('@/services/layout_service')
      expect(await getLayoutMode()).toBe('uniform-grid')
    })

    it('returns bento-grid after setting it', async () => {
      const { getLayoutMode, setLayoutMode } = await import('@/services/layout_service')
      await setLayoutMode('bento-grid')
      expect(await getLayoutMode()).toBe('bento-grid')
    })
  })

  describe('setLayoutMode', () => {
    it('sets layout mode to bento-grid', async () => {
      const { getLayoutMode, setLayoutMode } = await import('@/services/layout_service')
      await setLayoutMode('bento-grid')
      expect(await getLayoutMode()).toBe('bento-grid')
    })

    it('sets layout mode back to uniform-grid', async () => {
      const { getLayoutMode, setLayoutMode } = await import('@/services/layout_service')
      await setLayoutMode('bento-grid')
      await setLayoutMode('uniform-grid')
      expect(await getLayoutMode()).toBe('uniform-grid')
    })

    it('throws on invalid layout mode', async () => {
      const { setLayoutMode } = await import('@/services/layout_service')
      await expect(setLayoutMode('invalid-mode' as 'uniform-grid')).rejects.toThrow()
    })
  })

  describe('VALID_LAYOUT_MODES', () => {
    it('contains uniform-grid and bento-grid', async () => {
      const { VALID_LAYOUT_MODES } = await import('@/services/layout_service')
      expect(VALID_LAYOUT_MODES).toContain('uniform-grid')
      expect(VALID_LAYOUT_MODES).toContain('bento-grid')
    })
  })
})

