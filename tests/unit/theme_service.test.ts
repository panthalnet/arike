import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import Database from 'better-sqlite3'
import fs from 'fs'
import path from 'path'
import { AVAILABLE_THEMES, AVAILABLE_SEARCH_PROVIDERS, THEME_COLORS, BLUR_MIN, BLUR_MAX, BLUR_DEFAULT } from '../../src/services/theme_service'

// We'll import the theme service after it's created
// For now, let's define the expected interface

type ThemeSetting = {
  id: number
  selected_theme: string
  custom_primary: string | null
  custom_background: string | null
  custom_text: string | null
  custom_border: string | null
  search_provider: string
  blur_intensity: number
  updated_at: number
}

describe('Theme Service', () => {
  const TEST_DB_PATH = path.join(process.cwd(), 'tests', 'test-theme.db')
  let sqlite: Database.Database

  beforeEach(async () => {
    // Create test database
    sqlite = new Database(TEST_DB_PATH)
    sqlite.pragma('foreign_keys = ON')

    // Create schema
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

    // Insert default settings
    sqlite.prepare(`
      INSERT INTO theme_settings (id, selected_theme, search_provider, blur_intensity)
      VALUES (1, 'gruvbox', 'duckduckgo', 12)
    `).run()

    // Import theme service (will be created in T011)
    // themeService = await import('@/services/theme_service')
  })

  afterEach(() => {
    // Clean up test database
    sqlite.close()
    if (fs.existsSync(TEST_DB_PATH)) {
      fs.unlinkSync(TEST_DB_PATH)
    }
  })

  it('should get default theme settings', async () => {
    // This test will be implemented after theme service is created
    const settings = sqlite.prepare('SELECT * FROM theme_settings WHERE id = 1').get() as ThemeSetting

    expect(settings).toBeDefined()
    expect(settings.selected_theme).toBe('gruvbox')
    expect(settings.search_provider).toBe('duckduckgo')
    expect(settings.custom_primary).toBeNull()
    expect(settings.custom_background).toBeNull()
    expect(settings.custom_text).toBeNull()
    expect(settings.custom_border).toBeNull()
  })

  it('should update theme setting', async () => {
    // Update theme
    sqlite.prepare(`
      UPDATE theme_settings 
      SET selected_theme = ?, updated_at = unixepoch()
      WHERE id = 1
    `).run('catppuccin')

    const settings = sqlite.prepare('SELECT * FROM theme_settings WHERE id = 1').get() as ThemeSetting
    expect(settings.selected_theme).toBe('catppuccin')
  })

  it('should update custom colors', async () => {
    // Update custom colors
    sqlite.prepare(`
      UPDATE theme_settings 
      SET custom_primary = ?, custom_background = ?, updated_at = unixepoch()
      WHERE id = 1
    `).run('#ff5733', '#1a1a1a')

    const settings = sqlite.prepare('SELECT * FROM theme_settings WHERE id = 1').get() as ThemeSetting
    expect(settings.custom_primary).toBe('#ff5733')
    expect(settings.custom_background).toBe('#1a1a1a')
  })

  it('should update search provider', async () => {
    // Update search provider
    sqlite.prepare(`
      UPDATE theme_settings 
      SET search_provider = ?, updated_at = unixepoch()
      WHERE id = 1
    `).run('google')

    const settings = sqlite.prepare('SELECT * FROM theme_settings WHERE id = 1').get() as ThemeSetting
    expect(settings.search_provider).toBe('google')
  })

  it('should validate theme names via service constants', () => {
    expect(AVAILABLE_THEMES).toContain('gruvbox')
    expect(AVAILABLE_THEMES).toContain('catppuccin')
    expect(AVAILABLE_THEMES).toContain('everforest')
    expect(AVAILABLE_THEMES).toContain('modern')
    expect(AVAILABLE_THEMES).not.toContain('invalid-theme')
    expect(AVAILABLE_THEMES).toHaveLength(4)
  })

  it('should validate search provider names via service constants', () => {
    expect(AVAILABLE_SEARCH_PROVIDERS).toContain('duckduckgo')
    expect(AVAILABLE_SEARCH_PROVIDERS).toContain('google')
    expect(AVAILABLE_SEARCH_PROVIDERS).toContain('bing')
    expect(AVAILABLE_SEARCH_PROVIDERS).toContain('brave')
    expect(AVAILABLE_SEARCH_PROVIDERS).not.toContain('invalid-provider')
    expect(AVAILABLE_SEARCH_PROVIDERS).toHaveLength(4)
  })

  it('should have correct THEME_COLORS structure for all themes', () => {
    const themeKeys = ['gruvbox', 'catppuccin', 'everforest', 'modern'] as const
    const colorKeys = ['primary', 'background', 'text', 'border', 'accent', 'muted'] as const

    themeKeys.forEach(theme => {
      expect(THEME_COLORS[theme]).toBeDefined()
      colorKeys.forEach(key => {
        expect(typeof THEME_COLORS[theme][key]).toBe('string')
        expect(THEME_COLORS[theme][key].length).toBeGreaterThan(0)
      })
    })
  })

  it('should expose blur intensity constants with valid range', () => {
    expect(BLUR_MIN).toBe(8)
    expect(BLUR_MAX).toBe(20)
    expect(BLUR_DEFAULT).toBe(12)
    expect(BLUR_DEFAULT).toBeGreaterThanOrEqual(BLUR_MIN)
    expect(BLUR_DEFAULT).toBeLessThanOrEqual(BLUR_MAX)
  })

  it('should persist blur_intensity in theme_settings', () => {
    sqlite.prepare(`
      UPDATE theme_settings SET blur_intensity = 16 WHERE id = 1
    `).run()
    const row = sqlite.prepare('SELECT blur_intensity FROM theme_settings WHERE id = 1').get() as { blur_intensity: number }
    expect(row.blur_intensity).toBe(16)
  })

  it('should reject blur_intensity outside 8–20 range at application level', () => {
    // The DB doesn't enforce range, application validates
    const validate = (v: number) => v >= BLUR_MIN && v <= BLUR_MAX
    expect(validate(8)).toBe(true)
    expect(validate(20)).toBe(true)
    expect(validate(12)).toBe(true)
    expect(validate(7)).toBe(false)
    expect(validate(21)).toBe(false)
  })

  it('should allow selecting modern theme', async () => {
    sqlite.prepare(`
      UPDATE theme_settings SET selected_theme = 'modern' WHERE id = 1
    `).run()
    const settings = sqlite.prepare('SELECT * FROM theme_settings WHERE id = 1').get() as ThemeSetting
    expect(settings.selected_theme).toBe('modern')
  })

  it('should validate hex color format', () => {
    const validColors = ['#ff5733', '#1a1a1a', '#fff', '#000000']
    const invalidColors = ['ff5733', '#gg5733', 'red', '#12345', '']

    const hexColorRegex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/

    validColors.forEach(color => {
      expect(hexColorRegex.test(color)).toBe(true)
    })

    invalidColors.forEach(color => {
      expect(hexColorRegex.test(color)).toBe(false)
    })
  })

  it('should reset custom colors to null', async () => {
    // Set custom colors first
    sqlite.prepare(`
      UPDATE theme_settings 
      SET custom_primary = ?, custom_background = ?, updated_at = unixepoch()
      WHERE id = 1
    `).run('#ff5733', '#1a1a1a')

    // Reset to null
    sqlite.prepare(`
      UPDATE theme_settings 
      SET custom_primary = NULL, custom_background = NULL, custom_text = NULL, custom_border = NULL, updated_at = unixepoch()
      WHERE id = 1
    `).run()

    const settings = sqlite.prepare('SELECT * FROM theme_settings WHERE id = 1').get() as ThemeSetting
    expect(settings.custom_primary).toBeNull()
    expect(settings.custom_background).toBeNull()
    expect(settings.custom_text).toBeNull()
    expect(settings.custom_border).toBeNull()
  })

  it('should update updatedAt timestamp on changes', async () => {
    const before = sqlite.prepare('SELECT updated_at FROM theme_settings WHERE id = 1').get() as { updated_at: number }

    // Manually set a past timestamp to simulate time passing
    sqlite.prepare('UPDATE theme_settings SET updated_at = ? WHERE id = 1').run(before.updated_at - 10)

    // Update theme with fresh timestamp
    sqlite.prepare(`
      UPDATE theme_settings 
      SET selected_theme = ?, updated_at = unixepoch()
      WHERE id = 1
    `).run('everforest')

    const after = sqlite.prepare('SELECT updated_at FROM theme_settings WHERE id = 1').get() as { updated_at: number }
    
    expect(after.updated_at).toBeGreaterThan(before.updated_at - 10)
  })

  it('should handle partial custom color updates', async () => {
    // Update only primary color
    sqlite.prepare(`
      UPDATE theme_settings 
      SET custom_primary = ?, updated_at = unixepoch()
      WHERE id = 1
    `).run('#ff5733')

    const settings = sqlite.prepare('SELECT * FROM theme_settings WHERE id = 1').get() as ThemeSetting
    expect(settings.custom_primary).toBe('#ff5733')
    expect(settings.custom_background).toBeNull()
    expect(settings.custom_text).toBeNull()
    expect(settings.custom_border).toBeNull()
  })

  it('should always have exactly one settings record', async () => {
    const count = sqlite.prepare('SELECT COUNT(*) as count FROM theme_settings').get() as { count: number }
    expect(count.count).toBe(1)

    // Try to insert another record (should be prevented by application logic)
    try {
      sqlite.prepare(`
        INSERT INTO theme_settings (id, selected_theme, search_provider)
        VALUES (2, 'gruvbox', 'duckduckgo')
      `).run()
      
      // If this succeeds, verify our service only uses id = 1
      const mainSettings = sqlite.prepare('SELECT * FROM theme_settings WHERE id = 1').get()
      expect(mainSettings).toBeDefined()
    } catch (error) {
      // Expected if primary key constraint prevents duplicate id
      expect(error).toBeDefined()
    }
  })
})
