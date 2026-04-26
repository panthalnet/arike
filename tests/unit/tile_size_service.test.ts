import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import os from 'os'
import path from 'path'
import fs from 'fs'

const TEST_BM_ID = 'test-tile-bm-1'
let tmpDb: string
let sqlite: Database.Database

vi.mock('@/lib/db', () => ({
  get db() { return drizzle(sqlite) },
  get sqlite() { return sqlite },
}))

beforeEach(() => {
  tmpDb = path.join(os.tmpdir(), `arike-test-tile-${Date.now()}.db`)
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
     VALUES (?, 'Test Bookmark', 'https://example.com', 'builtin:material:bookmark', 'medium')`
  ).run(TEST_BM_ID)
})

afterEach(() => {
  sqlite.close()
  fs.unlinkSync(tmpDb)
  vi.resetModules()
})

describe('tile_size_service', () => {
  describe('getTileSize', () => {
    it('returns medium by default', async () => {
      const { getTileSize } = await import('@/services/tile_size_service')
      const size = await getTileSize(TEST_BM_ID)
      expect(size).toBe('medium')
    })

    it('returns small after setting it', async () => {
      const { getTileSize, setTileSize } = await import('@/services/tile_size_service')
      await setTileSize(TEST_BM_ID, 'small')
      const size = await getTileSize(TEST_BM_ID)
      expect(size).toBe('small')
    })
  })

  describe('setTileSize', () => {
    it('sets tile size to large', async () => {
      const { getTileSize, setTileSize } = await import('@/services/tile_size_service')
      await setTileSize(TEST_BM_ID, 'large')
      expect(await getTileSize(TEST_BM_ID)).toBe('large')
    })

    it('sets tile size to small', async () => {
      const { getTileSize, setTileSize } = await import('@/services/tile_size_service')
      await setTileSize(TEST_BM_ID, 'small')
      expect(await getTileSize(TEST_BM_ID)).toBe('small')
    })

    it('throws on invalid tile size', async () => {
      const { setTileSize } = await import('@/services/tile_size_service')
      await expect(setTileSize(TEST_BM_ID, 'huge' as 'small')).rejects.toThrow()
    })

    it('throws on unknown bookmark id', async () => {
      const { setTileSize } = await import('@/services/tile_size_service')
      await expect(setTileSize('nonexistent', 'large')).rejects.toThrow()
    })
  })

  describe('VALID_TILE_SIZES', () => {
    it('contains small, medium, large', async () => {
      const { VALID_TILE_SIZES } = await import('@/services/tile_size_service')
      expect(VALID_TILE_SIZES).toContain('small')
      expect(VALID_TILE_SIZES).toContain('medium')
      expect(VALID_TILE_SIZES).toContain('large')
    })
  })
})

