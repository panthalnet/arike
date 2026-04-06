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
    primary: '#89b4fa',  // Blue - better contrast than Mauve
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

    const hexToHSL = (hex: string): string => {
      // Remove # if present
      hex = hex.replace('#', '')
      
      // Convert hex to RGB
      const r = parseInt(hex.substring(0, 2), 16) / 255
      const g = parseInt(hex.substring(2, 4), 16) / 255
      const b = parseInt(hex.substring(4, 6), 16) / 255
      
      const max = Math.max(r, g, b)
      const min = Math.min(r, g, b)
      let h = 0, s = 0, l = (max + min) / 2
      
      if (max !== min) {
        const d = max - min
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
        
        switch (max) {
          case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
          case g: h = ((b - r) / d + 2) / 6; break
          case b: h = ((r - g) / d + 4) / 6; break
        }
      }
      
      h = Math.round(h * 360)
      s = Math.round(s * 100)
      l = Math.round(l * 100)
      
      return `${h} ${s}% ${l}%`
    }

    // Set theme data attribute (CSS handles the colors via globals.css)
    document.documentElement.setAttribute('data-theme', theme)
    
    // Apply custom color overrides if set (convert hex to HSL)
    if (customColors.primary) {
      document.documentElement.style.setProperty('--primary', hexToHSL(customColors.primary))
    } else {
      document.documentElement.style.removeProperty('--primary')
    }
    
    if (customColors.background) {
      document.documentElement.style.setProperty('--background', hexToHSL(customColors.background))
    } else {
      document.documentElement.style.removeProperty('--background')
    }
    
    if (customColors.text) {
      document.documentElement.style.setProperty('--foreground', hexToHSL(customColors.text))
    } else {
      document.documentElement.style.removeProperty('--foreground')
    }
    
    if (customColors.border) {
      document.documentElement.style.setProperty('--border', hexToHSL(customColors.border))
    } else {
      document.documentElement.style.removeProperty('--border')
    }
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
