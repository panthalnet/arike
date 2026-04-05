'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'gruvbox' | 'catppuccin' | 'everforest'

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

const themePresets: Record<Theme, ThemeColors> = {
  gruvbox: {
    primary: '#d65d0e',
    background: '#fbf1c7',
    text: '#3c3836',
    border: '#d5c4a1',
  },
  catppuccin: {
    primary: '#b4befe',
    background: '#1e1e2e',
    text: '#cdd6f4',
    border: '#45475a',
  },
  everforest: {
    primary: '#a7c080',
    background: '#2d353b',
    text: '#d3c6aa',
    border: '#475258',
  },
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('gruvbox')
  const [customColors, setCustomColors] = useState<Partial<ThemeColors>>({})

  useEffect(() => {
    // Apply theme colors to CSS variables
    const colors = { ...themePresets[theme], ...customColors }
    
    Object.entries(colors).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--color-${key}`, value)
    })
  }, [theme, customColors])

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
