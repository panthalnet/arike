'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'gruvbox' | 'catppuccin' | 'everforest'

// Theme colors (duplicated from service to avoid server-side imports in client)
const THEME_COLORS = {
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

interface ThemeColors {
  primary: string
  background: string
  text: string
  border: string
}

interface ThemeContextType {
  theme: Theme
  customColors: Partial<ThemeColors>
  setTheme: (theme: Theme) => void
  setCustomColors: (colors: Partial<ThemeColors>) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('gruvbox')
  const [customColors, setCustomColors] = useState<Partial<ThemeColors>>({})
  const [mounted, setMounted] = useState(false)

  // Load theme settings on mount
  useEffect(() => {
    setMounted(true)
    
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.selectedTheme) {
          setTheme(data.selectedTheme as Theme)
        }
        
        const custom: Partial<ThemeColors> = {}
        if (data.customPrimary) custom.primary = data.customPrimary
        if (data.customBackground) custom.background = data.customBackground
        if (data.customText) custom.text = data.customText
        if (data.customBorder) custom.border = data.customBorder
        
        if (Object.keys(custom).length > 0) {
          setCustomColors(custom)
        }
      })
      .catch(err => {
        console.error('Failed to load theme settings:', err)
      })
  }, [])

  useEffect(() => {
    if (!mounted) return

    // Apply theme colors to CSS variables and data attribute
    const baseColors = THEME_COLORS[theme]
    const colors = { ...baseColors, ...customColors }
    
    document.documentElement.setAttribute('data-theme', theme)
    
    // Apply colors using CSS custom properties
    document.documentElement.style.setProperty('--primary', colors.primary)
    document.documentElement.style.setProperty('--background', colors.background)
    document.documentElement.style.setProperty('--foreground', colors.text)
    document.documentElement.style.setProperty('--border', colors.border)
    document.documentElement.style.setProperty('--accent', colors.accent)
    document.documentElement.style.setProperty('--muted', colors.muted)
  }, [theme, customColors, mounted])

  return (
    <ThemeContext.Provider value={{ theme, customColors, setTheme, setCustomColors }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
