import { db } from '@/lib/db'
import { themeSettings, type ThemeSetting } from '@/lib/schema'
import { eq } from 'drizzle-orm'

// Available themes (built-in)
export const AVAILABLE_THEMES = ['gruvbox', 'catppuccin', 'everforest'] as const
export type ThemeName = typeof AVAILABLE_THEMES[number]

// Available search providers
export const AVAILABLE_SEARCH_PROVIDERS = ['duckduckgo', 'google', 'bing', 'brave'] as const
export type SearchProvider = typeof AVAILABLE_SEARCH_PROVIDERS[number]

// Custom color configuration
export type CustomColors = {
  customPrimary?: string | null
  customBackground?: string | null
  customText?: string | null
  customBorder?: string | null
}

// Theme definitions with CSS custom properties
export const THEME_COLORS = {
  gruvbox: {
    primary: '#d65d0e',
    background: '#282828',
    text: '#ebdbb2',
    border: '#504945',
    accent: '#d79921',
    muted: '#3c3836',
  },
  catppuccin: {
    primary: '#f5c2e7',
    background: '#1e1e2e',
    text: '#cdd6f4',
    border: '#45475a',
    accent: '#94e2d5',
    muted: '#313244',
  },
  everforest: {
    primary: '#a7c080',
    background: '#2d353b',
    text: '#d3c6aa',
    border: '#475258',
    accent: '#dbbc7f',
    muted: '#343f44',
  },
} as const

// Search provider URL templates
export const SEARCH_PROVIDER_URLS = {
  duckduckgo: 'https://duckduckgo.com/?q=',
  google: 'https://www.google.com/search?q=',
  bing: 'https://www.bing.com/search?q=',
  brave: 'https://search.brave.com/search?q=',
} as const

/**
 * Get current theme settings
 * Returns the single settings record (id = 1)
 * Returns default settings if database not initialized (e.g., during build)
 */
export async function getThemeSettings(): Promise<ThemeSetting> {
  try {
    const settings = await db.select().from(themeSettings).where(eq(themeSettings.id, 1)).limit(1)
    
    if (settings.length === 0) {
      // Return default settings if no record exists
      return {
        id: 1,
        selectedTheme: 'gruvbox',
        customPrimary: null,
        customBackground: null,
        customText: null,
        customBorder: null,
        searchProvider: 'duckduckgo',
        updatedAt: new Date(),
      }
    }
    
    return settings[0]
  } catch (error) {
    // Handle case where table doesn't exist (e.g., during build)
    console.warn('Failed to fetch theme settings, using defaults:', error)
    return {
      id: 1,
      selectedTheme: 'gruvbox',
      customPrimary: null,
      customBackground: null,
      customText: null,
      customBorder: null,
      searchProvider: 'duckduckgo',
      updatedAt: new Date(),
    }
  }
}

/**
 * Update selected theme
 */
export async function updateTheme(theme: string): Promise<ThemeSetting> {
  // Validate theme name
  if (!AVAILABLE_THEMES.includes(theme as ThemeName)) {
    throw new Error(`Invalid theme: ${theme}. Must be one of: ${AVAILABLE_THEMES.join(', ')}`)
  }

  const updated = await db
    .update(themeSettings)
    .set({ 
      selectedTheme: theme,
      updatedAt: new Date(),
    })
    .where(eq(themeSettings.id, 1))
    .returning()

  return updated[0]
}

/**
 * Update custom colors
 */
export async function updateCustomColors(colors: CustomColors): Promise<ThemeSetting> {
  // Validate hex color format
  const hexColorRegex = /^#[0-9A-Fa-f]{3,6}$/
  
  const validatedColors: CustomColors = {}
  
  if (colors.customPrimary !== undefined) {
    if (colors.customPrimary !== null && !hexColorRegex.test(colors.customPrimary)) {
      throw new Error(`Invalid hex color for customPrimary: ${colors.customPrimary}`)
    }
    validatedColors.customPrimary = colors.customPrimary
  }
  
  if (colors.customBackground !== undefined) {
    if (colors.customBackground !== null && !hexColorRegex.test(colors.customBackground)) {
      throw new Error(`Invalid hex color for customBackground: ${colors.customBackground}`)
    }
    validatedColors.customBackground = colors.customBackground
  }
  
  if (colors.customText !== undefined) {
    if (colors.customText !== null && !hexColorRegex.test(colors.customText)) {
      throw new Error(`Invalid hex color for customText: ${colors.customText}`)
    }
    validatedColors.customText = colors.customText
  }
  
  if (colors.customBorder !== undefined) {
    if (colors.customBorder !== null && !hexColorRegex.test(colors.customBorder)) {
      throw new Error(`Invalid hex color for customBorder: ${colors.customBorder}`)
    }
    validatedColors.customBorder = colors.customBorder
  }

  const updated = await db
    .update(themeSettings)
    .set({ 
      ...validatedColors,
      updatedAt: new Date(),
    })
    .where(eq(themeSettings.id, 1))
    .returning()

  return updated[0]
}

/**
 * Update search provider
 */
export async function updateSearchProvider(provider: string): Promise<ThemeSetting> {
  // Validate provider name
  if (!AVAILABLE_SEARCH_PROVIDERS.includes(provider as SearchProvider)) {
    throw new Error(`Invalid search provider: ${provider}. Must be one of: ${AVAILABLE_SEARCH_PROVIDERS.join(', ')}`)
  }

  const updated = await db
    .update(themeSettings)
    .set({ 
      searchProvider: provider,
      updatedAt: new Date(),
    })
    .where(eq(themeSettings.id, 1))
    .returning()

  return updated[0]
}

/**
 * Reset custom colors to null (use theme defaults)
 */
export async function resetCustomColors(): Promise<ThemeSetting> {
  const updated = await db
    .update(themeSettings)
    .set({ 
      customPrimary: null,
      customBackground: null,
      customText: null,
      customBorder: null,
      updatedAt: new Date(),
    })
    .where(eq(themeSettings.id, 1))
    .returning()

  return updated[0]
}

/**
 * Get complete theme configuration including custom overrides
 */
export async function getActiveThemeColors(): Promise<Record<string, string>> {
  const settings = await getThemeSettings()
  const baseColors = THEME_COLORS[settings.selectedTheme as ThemeName]
  
  return {
    primary: settings.customPrimary ?? baseColors.primary,
    background: settings.customBackground ?? baseColors.background,
    text: settings.customText ?? baseColors.text,
    border: settings.customBorder ?? baseColors.border,
    accent: baseColors.accent, // Accent not customizable in v1
    muted: baseColors.muted,   // Muted not customizable in v1
  }
}

/**
 * Get search URL for current provider
 */
export async function getSearchUrl(query: string): Promise<string> {
  const settings = await getThemeSettings()
  const baseUrl = SEARCH_PROVIDER_URLS[settings.searchProvider as SearchProvider]
  return `${baseUrl}${encodeURIComponent(query)}`
}

/**
 * Get list of available themes
 */
export function getAvailableThemes(): readonly ThemeName[] {
  return AVAILABLE_THEMES
}

/**
 * Get list of available search providers
 */
export function getAvailableSearchProviders(): readonly SearchProvider[] {
  return AVAILABLE_SEARCH_PROVIDERS
}
