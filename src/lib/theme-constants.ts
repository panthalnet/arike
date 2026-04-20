/**
 * Pure theme constants — safe to import in Client Components.
 * No database or Node.js-only dependencies.
 */

export const AVAILABLE_THEMES = ['gruvbox', 'catppuccin', 'everforest', 'modern'] as const
export type ThemeName = typeof AVAILABLE_THEMES[number]

export const AVAILABLE_SEARCH_PROVIDERS = ['duckduckgo', 'google', 'bing', 'brave'] as const
export type SearchProvider = typeof AVAILABLE_SEARCH_PROVIDERS[number]

export const BLUR_MIN = 8
export const BLUR_MAX = 20
export const BLUR_DEFAULT = 12

export const THEME_COLORS: Record<ThemeName, {
  primary: string
  background: string
  text: string
  border: string
  accent: string
  muted: string
}> = {
  gruvbox: {
    primary: '#d79921',
    background: '#282828',
    text: '#ebdbb2',
    border: '#504945',
    accent: '#b8bb26',
    muted: '#928374',
  },
  catppuccin: {
    primary: '#cba6f7',
    background: '#1e1e2e',
    text: '#cdd6f4',
    border: '#313244',
    accent: '#89b4fa',
    muted: '#6c7086',
  },
  everforest: {
    primary: '#a7c080',
    background: '#2d353b',
    text: '#d3c6aa',
    border: '#475258',
    accent: '#83c092',
    muted: '#859289',
  },
  modern: {
    primary: '#6366f1',
    background: '#0f0f1a',
    text: '#e2e8f0',
    border: 'rgba(255,255,255,0.12)',
    accent: '#8b5cf6',
    muted: '#94a3b8',
  },
}
