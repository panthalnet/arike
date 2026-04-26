'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { getCachedWallpaper, setCachedWallpaper } from '@/lib/wallpaper_cache'

type Theme = 'gruvbox' | 'catppuccin' | 'everforest' | 'modern'

interface ThemeColors {
  primary: string
  background: string
  text: string
  border: string
}

interface ThemeContextType {
  theme: Theme
  customColors: Partial<ThemeColors>
  blurIntensity: number
  activeWallpaper: string | null
  setTheme: (theme: Theme) => void
  setCustomColors: (colors: Partial<ThemeColors>) => void
  setBlurIntensity: (px: number) => void
  setActiveWallpaper: (url: string | null) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('gruvbox')
  const [customColors, setCustomColors] = useState<Partial<ThemeColors>>({})
  const [blurIntensity, setBlurIntensity] = useState<number>(12)
  const [activeWallpaper, setActiveWallpaper] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  // Load theme settings on mount
  useEffect(() => {
    setMounted(true)
    
    const BUILTIN_GRADIENTS: Record<string, string> = {
      'builtin-1': 'linear-gradient(135deg, #0a3d62 0%, #1a5c7a 100%)',
      'builtin-2': 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)',
      'builtin-3': 'linear-gradient(135deg, #5d2c3e 0%, #8b4f9f 50%, #e8a555 100%)',
    }

    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        const loadedTheme = data.selectedTheme as Theme | undefined
        if (loadedTheme) {
          setTheme(loadedTheme)
        }
        
        if (typeof data.blurIntensity === 'number') {
          setBlurIntensity(data.blurIntensity)
        }

        const custom: Partial<ThemeColors> = {}
        if (data.customPrimary) custom.primary = data.customPrimary
        if (data.customBackground) custom.background = data.customBackground
        if (data.customText) custom.text = data.customText
        if (data.customBorder) custom.border = data.customBorder
        
        if (Object.keys(custom).length > 0) {
          setCustomColors(custom)
        }

        // Apply cached wallpaper only once we know the theme is Modern —
        // prevents a wallpaper flash when loading on a non-Modern theme.
        if (loadedTheme === 'modern') {
          const cached = getCachedWallpaper()
          if (cached) {
            document.documentElement.style.setProperty('--theme-background', cached)
            setActiveWallpaper(cached)
          }
          fetch('/api/wallpapers')
            .then(r => r.json())
            .then((wallpapers: Array<{ id: string; isActive: boolean; sourceType: string }>) => {
              const active = wallpapers.find(w => w.isActive)
              const cssValue = active
                ? (BUILTIN_GRADIENTS[active.id] ?? `url(/api/wallpapers/file/${active.id})`)
                : null
              // Only update DOM + cache if the value differs from what's already applied
              if (cssValue !== getCachedWallpaper()) {
                setActiveWallpaper(cssValue)
                setCachedWallpaper(cssValue)
              }
            })
            .catch(() => { /* wallpaper load failure is non-fatal */ })
        } else {
          // Non-modern theme: clear wallpaper cache and reset state so a
          // subsequent switch back to Modern re-fetches from the server.
          setCachedWallpaper(null)
          setActiveWallpaper(null)
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

    // Apply blur intensity for Modern theme
    if (theme === 'modern') {
      document.documentElement.style.setProperty('--glass-blur', `${blurIntensity}px`)
      
      // Apply active wallpaper or default gradient
      if (activeWallpaper) {
        document.documentElement.style.setProperty('--theme-background', activeWallpaper)
      } else {
        document.documentElement.style.removeProperty('--theme-background')
      }
    } else {
      document.documentElement.style.removeProperty('--glass-blur')
      document.documentElement.style.removeProperty('--theme-background')
    }
    
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
  }, [theme, customColors, blurIntensity, activeWallpaper, mounted])

  return (
    <ThemeContext.Provider value={{ theme, customColors, blurIntensity, activeWallpaper, setTheme, setCustomColors, setBlurIntensity, setActiveWallpaper }}>
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
