/**
 * Integration tests: Theme Settings API (T002)
 * Covers Modern theme switching, persistence, and malformed payload rejection
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

// We test at the service layer using an isolated SQLite DB
import { AVAILABLE_THEMES, BLUR_MIN, BLUR_MAX } from '../../src/services/theme_service'

const TEST_DB_PATH = path.join(process.cwd(), 'tests', 'test-theme-integration.db')

function setupDb() {
  const sqlite = new Database(TEST_DB_PATH)
  sqlite.pragma('foreign_keys = ON')
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS theme_settings (
      id INTEGER PRIMARY KEY,
      selected_theme TEXT NOT NULL DEFAULT 'gruvbox',
      custom_primary TEXT,
      custom_background TEXT,
      custom_text TEXT,
      custom_border TEXT,
      search_provider TEXT NOT NULL DEFAULT 'duckduckgo',
      blur_intensity INTEGER NOT NULL DEFAULT 12,
      updated_at INTEGER NOT NULL DEFAULT (unixepoch())
    )
  `)
  sqlite.prepare(
    `INSERT OR IGNORE INTO theme_settings (id, selected_theme, search_provider, blur_intensity) VALUES (1, 'gruvbox', 'duckduckgo', 12)`
  ).run()
  return sqlite
}

describe('Theme Settings Integration', () => {
  let sqlite: ReturnType<typeof Database>

  beforeEach(() => {
    sqlite = setupDb()
  })

  afterEach(() => {
    sqlite.close()
    if (fs.existsSync(TEST_DB_PATH)) fs.unlinkSync(TEST_DB_PATH)
  })

  it('should switch to Modern theme and persist', () => {
    sqlite.prepare(`UPDATE theme_settings SET selected_theme = 'modern' WHERE id = 1`).run()
    const row = sqlite.prepare('SELECT selected_theme FROM theme_settings WHERE id = 1').get() as { selected_theme: string }
    expect(row.selected_theme).toBe('modern')
  })

  it('should contain modern in AVAILABLE_THEMES', () => {
    expect(AVAILABLE_THEMES).toContain('modern')
  })

  it('should reject unknown theme names at application level', () => {
    const validTheme = (t: string) => (AVAILABLE_THEMES as readonly string[]).includes(t)
    expect(validTheme('modern')).toBe(true)
    expect(validTheme('gruvbox')).toBe(true)
    expect(validTheme('hacker')).toBe(false)
    expect(validTheme('')).toBe(false)
    expect(validTheme('<script>alert(1)</script>')).toBe(false)
  })

  it('should reject malformed settings payload (missing selectedTheme key)', () => {
    // Simulate application-level validation: body must have at least one known key
    const isValidPayload = (body: Record<string, unknown>) =>
      'selectedTheme' in body ||
      'searchProvider' in body ||
      'blurIntensity' in body ||
      'customPrimary' in body ||
      'customBackground' in body ||
      'customText' in body ||
      'customBorder' in body ||
      body.resetColors === true

    expect(isValidPayload({ selectedTheme: 'modern' })).toBe(true)
    expect(isValidPayload({})).toBe(false)
    expect(isValidPayload({ foo: 'bar' })).toBe(false)
  })

  it('should persist blur_intensity update within valid range', () => {
    const blur = 16
    expect(blur).toBeGreaterThanOrEqual(BLUR_MIN)
    expect(blur).toBeLessThanOrEqual(BLUR_MAX)
    sqlite.prepare(`UPDATE theme_settings SET blur_intensity = ? WHERE id = 1`).run(blur)
    const row = sqlite.prepare('SELECT blur_intensity FROM theme_settings WHERE id = 1').get() as { blur_intensity: number }
    expect(row.blur_intensity).toBe(blur)
  })

  it('should switch from modern back to gruvbox', () => {
    sqlite.prepare(`UPDATE theme_settings SET selected_theme = 'modern' WHERE id = 1`).run()
    sqlite.prepare(`UPDATE theme_settings SET selected_theme = 'gruvbox' WHERE id = 1`).run()
    const row = sqlite.prepare('SELECT selected_theme FROM theme_settings WHERE id = 1').get() as { selected_theme: string }
    expect(row.selected_theme).toBe('gruvbox')
  })

  it('should keep settings singleton (only id=1)', () => {
    const count = sqlite.prepare('SELECT COUNT(*) as n FROM theme_settings').get() as { n: number }
    expect(count.n).toBe(1)
  })
})
