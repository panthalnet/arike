import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import os from 'os'
import path from 'path'
import fs from 'fs'

// ── Temp DB setup ────────────────────────────────────────────────────────────
let tmpDb: string
let sqlite: Database.Database

vi.mock('@/lib/db', () => {
  // Resolved lazily so sqlite is initialised before the mock is consumed
  return {
    get db() { return drizzle(sqlite) },
    get sqlite() { return sqlite },
  }
})

beforeEach(() => {
  tmpDb = path.join(os.tmpdir(), `arike-test-wallpaper-${Date.now()}.db`)
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
  // Seed built-in wallpapers
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

// ── Tests ────────────────────────────────────────────────────────────────────

describe('wallpaper_service', () => {
  describe('getAllWallpapers', () => {
    it('returns all 3 built-in wallpapers', async () => {
      const { getAllWallpapers } = await import('@/services/wallpaper_service')
      const wallpapers = await getAllWallpapers()
      expect(wallpapers).toHaveLength(3)
      expect(wallpapers.map(w => w.id)).toContain('builtin-1')
      expect(wallpapers.map(w => w.id)).toContain('builtin-2')
      expect(wallpapers.map(w => w.id)).toContain('builtin-3')
    })

    it('returns wallpapers with required fields', async () => {
      const { getAllWallpapers } = await import('@/services/wallpaper_service')
      const wallpapers = await getAllWallpapers()
      for (const w of wallpapers) {
        expect(w).toHaveProperty('id')
        expect(w).toHaveProperty('sourceType')
        expect(w).toHaveProperty('displayName')
        expect(w).toHaveProperty('isActive')
      }
    })
  })

  describe('getActiveWallpaper', () => {
    it('returns null when no wallpaper is active', async () => {
      const { getActiveWallpaper } = await import('@/services/wallpaper_service')
      const active = await getActiveWallpaper()
      expect(active).toBeNull()
    })

    it('returns the active wallpaper after activating one', async () => {
      const { setActiveWallpaper, getActiveWallpaper } = await import('@/services/wallpaper_service')
      await setActiveWallpaper('builtin-1')
      const active = await getActiveWallpaper()
      expect(active?.id).toBe('builtin-1')
    })
  })

  describe('setActiveWallpaper', () => {
    it('sets a wallpaper as active', async () => {
      const { setActiveWallpaper, getActiveWallpaper } = await import('@/services/wallpaper_service')
      await setActiveWallpaper('builtin-2')
      const active = await getActiveWallpaper()
      expect(active?.id).toBe('builtin-2')
    })

    it('deactivates previously active wallpaper', async () => {
      const { setActiveWallpaper, getActiveWallpaper, getAllWallpapers } = await import('@/services/wallpaper_service')
      await setActiveWallpaper('builtin-1')
      await setActiveWallpaper('builtin-3')
      const active = await getActiveWallpaper()
      expect(active?.id).toBe('builtin-3')
      const all = await getAllWallpapers()
      expect(all.filter(w => w.isActive)).toHaveLength(1)
    })

    it('throws on unknown wallpaper id', async () => {
      const { setActiveWallpaper } = await import('@/services/wallpaper_service')
      await expect(setActiveWallpaper('nonexistent-id')).rejects.toThrow()
    })
  })

  describe('deleteWallpaper', () => {
    it('cannot delete a built-in wallpaper', async () => {
      const { deleteWallpaper } = await import('@/services/wallpaper_service')
      await expect(deleteWallpaper('builtin-1')).rejects.toThrow()
    })
  })

  describe('BUILTIN_WALLPAPER_IDS', () => {
    it('exports the 3 builtin ids', async () => {
      const { BUILTIN_WALLPAPER_IDS } = await import('@/services/wallpaper_service')
      expect(BUILTIN_WALLPAPER_IDS).toHaveLength(3)
      expect(BUILTIN_WALLPAPER_IDS).toContain('builtin-1')
    })
  })
})

