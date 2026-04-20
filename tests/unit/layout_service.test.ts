import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import Database from 'better-sqlite3'
import path from 'path'
import {
  getLayoutMode,
  setLayoutMode,
  VALID_LAYOUT_MODES,
} from '@/services/layout_service'

// Use the real DB but reset state before/after each test
let sqlite: Database.Database

beforeEach(() => {
  const DB_PATH = path.join(process.cwd(), 'data', 'arike.db')
  sqlite = new Database(DB_PATH)
  sqlite.prepare("UPDATE layout_preferences SET layout_mode = 'uniform-grid' WHERE id = 1").run()
})

afterEach(() => {
  sqlite.prepare("UPDATE layout_preferences SET layout_mode = 'uniform-grid' WHERE id = 1").run()
  sqlite.close()
})

describe('layout_service', () => {
  describe('getLayoutMode', () => {
    it('returns uniform-grid by default', async () => {
      const mode = await getLayoutMode()
      expect(mode).toBe('uniform-grid')
    })

    it('returns bento-grid after setting it', async () => {
      await setLayoutMode('bento-grid')
      const mode = await getLayoutMode()
      expect(mode).toBe('bento-grid')
    })
  })

  describe('setLayoutMode', () => {
    it('sets layout mode to bento-grid', async () => {
      await setLayoutMode('bento-grid')
      const mode = await getLayoutMode()
      expect(mode).toBe('bento-grid')
    })

    it('sets layout mode back to uniform-grid', async () => {
      await setLayoutMode('bento-grid')
      await setLayoutMode('uniform-grid')
      const mode = await getLayoutMode()
      expect(mode).toBe('uniform-grid')
    })

    it('throws on invalid layout mode', async () => {
      await expect(setLayoutMode('invalid-mode' as 'uniform-grid')).rejects.toThrow()
    })
  })

  describe('VALID_LAYOUT_MODES', () => {
    it('contains uniform-grid and bento-grid', () => {
      expect(VALID_LAYOUT_MODES).toContain('uniform-grid')
      expect(VALID_LAYOUT_MODES).toContain('bento-grid')
    })
  })
})
