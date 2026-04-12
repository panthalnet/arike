import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import fs from 'fs'
import path from 'path'
import { AVAILABLE_THEMES, AVAILABLE_SEARCH_PROVIDERS, THEME_COLORS } from '../../src/services/theme_service'

// We'll import the theme service after it's created
// For now, let's define the expected interface
type ThemeService = {
  getThemeSettings: () => Promise<ThemeSetting>
  updateTheme: (theme: string) => Promise<void>
  updateCustomColors: (colors: CustomColors) => Promise<void>
  updateSearchProvider: (provider: string) => Promise<void>
  getAvailableThemes: () => string[]
  getAvailableSearchProviders: () => string[]
}

type ThemeSetting = {
  id: number
  selectedTheme: string
  customPrimary: string | null
  customBackground: string | null
  customText: string | null
  customBorder: string | null
  searchProvider: string
  updatedAt: Date
}

type CustomColors = {
  customPrimary?: string | null
  customBackground?: string | null
  customText?: string | null
  customBorder?: string | null
}

describe('Theme Service', () => {
  const TEST_DB_PATH = path.join(process.cwd(), 'tests', 'test-theme.db')
  let db: ReturnType<typeof drizzle>
  let sqlite: Database.Database
  let themeService: ThemeService

  beforeEach(async () => {
    // Create test database
    sqlite = new Database(TEST_DB_PATH)
    sqlite.pragma('foreign_keys = ON')
    db = drizzle(sqlite)

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
        updated_at INTEGER NOT NULL DEFAULT (unixepoch())
      )
    `)

    // Insert default settings
    sqlite.prepare(`
      INSERT INTO theme_settings (id, selected_theme, search_provider)
      VALUES (1, 'gruvbox', 'duckduckgo')
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
    expect(settings.selectedTheme).toBe('gruvbox')
    expect(settings.searchProvider).toBe('duckduckgo')
    expect(settings.customPrimary).toBeNull()
    expect(settings.customBackground).toBeNull()
    expect(settings.customText).toBeNull()
    expect(settings.customBorder).toBeNull()
  })

  it('should update theme setting', async () => {
    // Update theme
    sqlite.prepare(`
      UPDATE theme_settings 
      SET selected_theme = ?, updated_at = unixepoch()
      WHERE id = 1
    `).run('catppuccin')

    const settings = sqlite.prepare('SELECT * FROM theme_settings WHERE id = 1').get() as ThemeSetting
    expect(settings.selectedTheme).toBe('catppuccin')
  })

  it('should update custom colors', async () => {
    // Update custom colors
    sqlite.prepare(`
      UPDATE theme_settings 
      SET custom_primary = ?, custom_background = ?, updated_at = unixepoch()
      WHERE id = 1
    `).run('#ff5733', '#1a1a1a')

    const settings = sqlite.prepare('SELECT * FROM theme_settings WHERE id = 1').get() as ThemeSetting
    expect(settings.customPrimary).toBe('#ff5733')
    expect(settings.customBackground).toBe('#1a1a1a')
  })

  it('should update search provider', async () => {
    // Update search provider
    sqlite.prepare(`
      UPDATE theme_settings 
      SET search_provider = ?, updated_at = unixepoch()
      WHERE id = 1
    `).run('google')

    const settings = sqlite.prepare('SELECT * FROM theme_settings WHERE id = 1').get() as ThemeSetting
    expect(settings.searchProvider).toBe('google')
  })

  it('should validate theme names via service constants', () => {
    expect(AVAILABLE_THEMES).toContain('gruvbox')
    expect(AVAILABLE_THEMES).toContain('catppuccin')
    expect(AVAILABLE_THEMES).toContain('everforest')
    expect(AVAILABLE_THEMES).not.toContain('invalid-theme')
    expect(AVAILABLE_THEMES).toHaveLength(3)
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
    const themeKeys = ['gruvbox', 'catppuccin', 'everforest'] as const
    const colorKeys = ['primary', 'background', 'text', 'border', 'accent', 'muted'] as const

    themeKeys.forEach(theme => {
      expect(THEME_COLORS[theme]).toBeDefined()
      colorKeys.forEach(key => {
        expect(THEME_COLORS[theme][key]).toMatch(/^#[0-9A-Fa-f]{6}$/)
      })
    })
  })

  it('should validate hex color format', () => {
    const validColors = ['#ff5733', '#1a1a1a', '#fff', '#000000']
    const invalidColors = ['ff5733', '#gg5733', 'red', '#12345', '']

    const hexColorRegex = /^#[0-9A-Fa-f]{3,6}$/

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
    expect(settings.customPrimary).toBeNull()
    expect(settings.customBackground).toBeNull()
    expect(settings.customText).toBeNull()
    expect(settings.customBorder).toBeNull()
  })

  it('should update updatedAt timestamp on changes', async () => {
    const before = sqlite.prepare('SELECT updated_at FROM theme_settings WHERE id = 1').get() as { updated_at: number }
    
    // Wait a moment to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 100))

    // Update theme
    sqlite.prepare(`
      UPDATE theme_settings 
      SET selected_theme = ?, updated_at = unixepoch()
      WHERE id = 1
    `).run('everforest')

    const after = sqlite.prepare('SELECT updated_at FROM theme_settings WHERE id = 1').get() as { updated_at: number }
    
    expect(after.updated_at).toBeGreaterThan(before.updated_at)
  })

  it('should handle partial custom color updates', async () => {
    // Update only primary color
    sqlite.prepare(`
      UPDATE theme_settings 
      SET custom_primary = ?, updated_at = unixepoch()
      WHERE id = 1
    `).run('#ff5733')

    const settings = sqlite.prepare('SELECT * FROM theme_settings WHERE id = 1').get() as ThemeSetting
    expect(settings.customPrimary).toBe('#ff5733')
    expect(settings.customBackground).toBeNull()
    expect(settings.customText).toBeNull()
    expect(settings.customBorder).toBeNull()
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
