import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import Database from 'better-sqlite3'
import path from 'path'
import {
  getTileSize,
  setTileSize,
  VALID_TILE_SIZES,
} from '@/services/tile_size_service'

const TEST_BM_ID = 'test-tile-bm-1'
let sqlite: Database.Database

beforeEach(() => {
  const DB_PATH = path.join(process.cwd(), 'data', 'arike.db')
  sqlite = new Database(DB_PATH)
  sqlite.prepare(
    `INSERT OR REPLACE INTO bookmarks (id, name, url, icon, tile_size)
     VALUES (?, 'Test Bookmark', 'https://example.com', 'builtin:material:bookmark', 'medium')`
  ).run(TEST_BM_ID)
})

afterEach(() => {
  sqlite.prepare('DELETE FROM bookmarks WHERE id = ?').run(TEST_BM_ID)
  sqlite.close()
})

describe('tile_size_service', () => {
  describe('getTileSize', () => {
    it('returns medium by default', async () => {
      const size = await getTileSize(TEST_BM_ID)
      expect(size).toBe('medium')
    })

    it('returns small after setting it', async () => {
      await setTileSize(TEST_BM_ID, 'small')
      const size = await getTileSize(TEST_BM_ID)
      expect(size).toBe('small')
    })
  })

  describe('setTileSize', () => {
    it('sets tile size to large', async () => {
      await setTileSize(TEST_BM_ID, 'large')
      const size = await getTileSize(TEST_BM_ID)
      expect(size).toBe('large')
    })

    it('sets tile size to small', async () => {
      await setTileSize(TEST_BM_ID, 'small')
      const size = await getTileSize(TEST_BM_ID)
      expect(size).toBe('small')
    })

    it('throws on invalid tile size', async () => {
      await expect(setTileSize(TEST_BM_ID, 'huge' as 'small')).rejects.toThrow()
    })

    it('throws on unknown bookmark id', async () => {
      await expect(setTileSize('nonexistent', 'large')).rejects.toThrow()
    })
  })

  describe('VALID_TILE_SIZES', () => {
    it('contains small, medium, large', () => {
      expect(VALID_TILE_SIZES).toContain('small')
      expect(VALID_TILE_SIZES).toContain('medium')
      expect(VALID_TILE_SIZES).toContain('large')
    })
  })
})
