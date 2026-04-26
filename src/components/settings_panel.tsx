'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Settings } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { BLUR_MIN, BLUR_MAX } from '@/lib/theme-constants'
import { useTheme } from '@/components/theme-provider'
import { WallpaperUploader } from '@/components/wallpaper_uploader'

type ThemeSetting = {
  selectedTheme: string
  customPrimary: string | null
  customBackground: string | null
  customText: string | null
  customBorder: string | null
  searchProvider: string
  blurIntensity?: number
}

type Wallpaper = {
  id: string
  displayName: string
  sourceType: 'builtin' | 'upload'
  isActive: boolean
}

type SettingsPanelProps = {
  initialSettings?: ThemeSetting
  initialLayoutMode?: 'uniform-grid' | 'bento-grid'
  onSettingsChange?: (settings: Partial<ThemeSetting>) => void
}

const AVAILABLE_THEMES = ['gruvbox', 'catppuccin', 'everforest', 'modern'] as const
const AVAILABLE_PROVIDERS = ['duckduckgo', 'google', 'bing', 'brave'] as const

const THEME_LABELS: Record<string, string> = {
  gruvbox: 'Gruvbox Dark',
  catppuccin: 'Catppuccin Mocha',
  everforest: 'Everforest Dark',
  modern: 'Modern (Glass)',
}

/**
 * Settings Panel component for theme and search provider configuration
 * Mobile-first design with full-screen overlay on mobile
 * Meets FR-007 requirements: theme customization with color pickers
 */
export function SettingsPanel({ 
  initialSettings,
  initialLayoutMode = 'uniform-grid',
  onSettingsChange,
}: SettingsPanelProps) {
  const [open, setOpen] = useState(false)
  const [settings, setSettings] = useState<ThemeSetting>({
    selectedTheme: 'gruvbox',
    customPrimary: null,
    customBackground: null,
    customText: null,
    customBorder: null,
    searchProvider: 'duckduckgo',
    blurIntensity: 12,
  })
  const [announcement, setAnnouncement] = useState('')
  const [themeChangePending, setThemeChangePending] = useState(false)
  const [themeChangeError, setThemeChangeError] = useState<string | null>(null)
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([])
  const [wallpapersLoaded, setWallpapersLoaded] = useState(false)
  const [layoutMode, setLayoutModeState] = useState<'uniform-grid' | 'bento-grid'>(initialLayoutMode)
  const blurDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { setTheme, setCustomColors, setBlurIntensity: setBlurContext, setActiveWallpaper } = useTheme()

  // Load initial settings
  useEffect(() => {
    if (initialSettings) {
      setSettings(initialSettings)
    } else {
      // Fetch from API
      fetchSettings()
    }
  }, [initialSettings])

  // Clear debounce timer on unmount to prevent state updates after unmount
  useEffect(() => {
    return () => {
      if (blurDebounceRef.current) clearTimeout(blurDebounceRef.current)
    }
  }, [])

  // Load wallpapers when Modern theme is selected
  useEffect(() => {
    if (settings.selectedTheme === 'modern' && !wallpapersLoaded) {
      fetch('/api/wallpapers')
        .then(res => res.json())
        .then((data: Wallpaper[]) => {
          setWallpapers(data)
          setWallpapersLoaded(true)
        })
        .catch(err => console.error('Failed to load wallpapers:', err))
    }
  }, [settings.selectedTheme, wallpapersLoaded])

  const fetchSettings = async () => {
    try {
      const [settingsRes, layoutRes] = await Promise.all([
        fetch('/api/settings'),
        fetch('/api/layout'),
      ])
      if (settingsRes.ok) {
        const data = await settingsRes.json()
        setSettings(data)
      }
      if (layoutRes.ok) {
        const data = await layoutRes.json()
        if (data.layoutMode) setLayoutModeState(data.layoutMode)
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    }
  }

  const updateSetting = useCallback(async (updates: Partial<ThemeSetting>): Promise<boolean> => {
    const isThemeChange = 'selectedTheme' in updates
    if (isThemeChange) {
      setThemeChangePending(true)
      setThemeChangeError(null)
    }
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        const updated = await response.json()
        setSettings(prev => ({ ...prev, ...updated }))
        
        // Notify parent component
        if (onSettingsChange) {
          onSettingsChange(updates)
        }

        // Sync ThemeProvider context (single source of truth for DOM mutations)
        setTheme(updated.selectedTheme as typeof AVAILABLE_THEMES[number])
        setCustomColors({
          ...(updated.customPrimary ? { primary: updated.customPrimary } : {}),
          ...(updated.customBackground ? { background: updated.customBackground } : {}),
          ...(updated.customText ? { text: updated.customText } : {}),
          ...(updated.customBorder ? { border: updated.customBorder } : {}),
        })
        if (typeof updated.blurIntensity === 'number') {
          setBlurContext(updated.blurIntensity)
        }

        // Screen reader announcement
        if (updates.selectedTheme) {
          const label = THEME_LABELS[updates.selectedTheme] ?? updates.selectedTheme
          setAnnouncement(`Theme updated to ${label}`)
        } else if (updates.searchProvider) {
          setAnnouncement(`Search provider changed to ${updates.searchProvider}`)
        } else if (updates.blurIntensity !== undefined) {
          setAnnouncement(`Blur intensity set to ${updates.blurIntensity}px`)
        }
        return true
      } else {
        const errText = await response.text()
        setThemeChangeError('Failed to save: ' + errText)
        setAnnouncement('Failed to update settings')
        return false
      }
    } catch (error) {
      console.error('Failed to update settings:', error)
      setThemeChangeError('Network error — settings not saved')
      setAnnouncement('Failed to update settings')
      return false
    } finally {
      if (isThemeChange) {
        setThemeChangePending(false)
      }
    }
  }, [onSettingsChange, setTheme, setCustomColors, setBlurContext])

  const handleThemeChange = async (theme: string) => {
    const succeeded = await updateSetting({ selectedTheme: theme })
    // Only switch to bento-grid default when the theme was actually persisted
    if (succeeded && theme === 'modern' && layoutMode === 'uniform-grid') {
      void handleLayoutModeChange('bento-grid')
    }
  }

  const handleLayoutModeChange = async (mode: 'uniform-grid' | 'bento-grid') => {
    try {
      const res = await fetch('/api/layout', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ layoutMode: mode }),
      })
      if (res.ok) {
        setLayoutModeState(mode)
        // Notify DashboardContent via custom event (cross-component, no prop drilling)
        window.dispatchEvent(new CustomEvent('arike:layout-change', { detail: { mode } }))
        setAnnouncement(`Layout changed to ${mode === 'bento-grid' ? 'Bento Grid' : 'Uniform Grid'}`)
      }
    } catch (error) {
      console.error('Failed to update layout mode:', error)
    }
  }

  const handleBlurChange = (values: number[]) => {
    const px = values[0]
    setSettings(prev => ({ ...prev, blurIntensity: px }))
    // Update ThemeProvider context for live preview (ThemeProvider owns the CSS var)
    setBlurContext(px)
    // Debounce the API write — slider fires on every pixel while dragging
    if (blurDebounceRef.current) clearTimeout(blurDebounceRef.current)
    blurDebounceRef.current = setTimeout(() => {
      updateSetting({ blurIntensity: px })
    }, 400)
  }

  const handleProviderChange = (provider: string) => {
    updateSetting({ searchProvider: provider })
  }

  const handleColorChange = (colorType: keyof ThemeSetting, value: string) => {
    updateSetting({ [colorType]: value || null })
  }

  const handleResetColors = () => {
    updateSetting({
      customPrimary: null,
      customBackground: null,
      customText: null,
      customBorder: null,
    })
    setAnnouncement('Custom colors reset to theme defaults')
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            data-testid="settings-button"
            variant="outline"
            size="icon"
            aria-label="Open settings"
            className="rounded-full"
            style={{ minWidth: '44px', minHeight: '44px' }} // WCAG AA touch target
          >
            <Settings className="h-5 w-5" aria-hidden="true" />
          </Button>
        </DialogTrigger>
        
        <DialogContent 
          data-testid="settings-panel"
          className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto"
        >
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription>
              Customize your Arike dashboard appearance and search preferences
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Theme Selection */}
            <div className="space-y-2">
              <Label htmlFor="theme-select">Theme</Label>
              <Select
                value={settings.selectedTheme}
                onValueChange={(v) => void handleThemeChange(v)}
                disabled={themeChangePending}
              >
                <SelectTrigger 
                  id="theme-select"
                  data-testid="theme-select"
                  style={{ minHeight: '44px' }}
                  aria-busy={themeChangePending}
                >
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_THEMES.map((theme) => (
                    <SelectItem key={theme} value={theme}>
                      {THEME_LABELS[theme] ?? theme}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {themeChangePending && (
                <p className="text-xs text-muted-foreground" aria-live="polite">Saving…</p>
              )}
              {themeChangeError && (
                <p className="text-xs text-destructive" role="alert">{themeChangeError}</p>
              )}

              {/* Blur intensity slider — Modern theme only */}
              {settings.selectedTheme === 'modern' && (
                <div className="space-y-2 mt-4" data-testid="blur-intensity-control">
                  <Label htmlFor="blur-slider">
                    Glass Blur Intensity: {settings.blurIntensity ?? 12}px
                  </Label>
                  <Slider
                    id="blur-slider"
                    data-testid="blur-slider"
                    min={BLUR_MIN}
                    max={BLUR_MAX}
                    step={1}
                    value={[settings.blurIntensity ?? 12]}
                    onValueChange={handleBlurChange}
                    aria-label="Glass blur intensity"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{BLUR_MIN}px (subtle)</span>
                    <span>{BLUR_MAX}px (heavy)</span>
                  </div>
                </div>
              )}

              {/* Wallpaper picker — Modern theme only */}
              {settings.selectedTheme === 'modern' && (
                <div className="mt-4 space-y-2">
                  <Label>Background Wallpaper</Label>
                  <WallpaperUploader
                    wallpapers={wallpapers}
                    onWallpaperActivated={(id) => {
                      setWallpapers(prev => prev.map(w => ({ ...w, isActive: w.id === id })))
                      // Keep ThemeProvider context in sync so --theme-background isn't overwritten
                      const builtinGradients: Record<string, string> = {
                        'builtin-1': 'linear-gradient(135deg, #0a3d62 0%, #1a5c7a 100%)',
                        'builtin-2': 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)',
                        'builtin-3': 'linear-gradient(135deg, #5d2c3e 0%, #8b4f9f 50%, #e8a555 100%)',
                      }
                      const cssValue = id
                        ? (builtinGradients[id] ?? `url(/api/wallpapers/file/${id})`)
                        : null
                      setActiveWallpaper(cssValue)
                    }}
                    onWallpaperUploaded={(w) => {
                      setWallpapers(prev => [...prev, w])
                    }}
                  />
                </div>
              )}
            </div>

            {/* Custom Colors */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Custom Colors</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetColors}
                  className="h-8 text-xs"
                >
                  Reset to defaults
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="custom-primary">Primary</Label>
                  <Input
                    id="custom-primary"
                    data-testid="custom-primary-color"
                    type="color"
                    value={settings.customPrimary || '#000000'}
                    onChange={(e) => handleColorChange('customPrimary', e.target.value)}
                    className="h-12 cursor-pointer"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="custom-background">Background</Label>
                  <Input
                    id="custom-background"
                    data-testid="custom-background-color"
                    type="color"
                    value={settings.customBackground || '#ffffff'}
                    onChange={(e) => handleColorChange('customBackground', e.target.value)}
                    className="h-12 cursor-pointer"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="custom-text">Text</Label>
                  <Input
                    id="custom-text"
                    data-testid="custom-text-color"
                    type="color"
                    value={settings.customText || '#000000'}
                    onChange={(e) => handleColorChange('customText', e.target.value)}
                    className="h-12 cursor-pointer"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="custom-border">Border</Label>
                  <Input
                    id="custom-border"
                    data-testid="custom-border-color"
                    type="color"
                    value={settings.customBorder || '#cccccc'}
                    onChange={(e) => handleColorChange('customBorder', e.target.value)}
                    className="h-12 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Layout Mode */}
            <div className="space-y-2">
              <Label htmlFor="layout-mode-select">Layout Mode</Label>
              <Select
                value={layoutMode}
                onValueChange={(value) => void handleLayoutModeChange(value as 'uniform-grid' | 'bento-grid')}
              >
                <SelectTrigger
                  id="layout-mode-select"
                  data-testid="layout-mode-select"
                  style={{ minHeight: '44px' }}
                >
                  <SelectValue placeholder="Select layout mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="uniform-grid">Uniform Grid</SelectItem>
                  <SelectItem value="bento-grid">Bento Grid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Search Provider */}
            <div className="space-y-2">
              <Label htmlFor="search-provider-select">Search Provider</Label>
              <Select
                value={settings.searchProvider}
                onValueChange={handleProviderChange}
              >
                <SelectTrigger 
                  id="search-provider-select"
                  data-testid="search-provider-select"
                  style={{ minHeight: '44px' }}
                >
                  <SelectValue placeholder="Select search provider" />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_PROVIDERS.map((provider) => (
                    <SelectItem key={provider} value={provider}>
                      {provider.charAt(0).toUpperCase() + provider.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end">
            <DialogClose asChild>
              <Button 
                data-testid="settings-close"
                variant="outline"
                style={{ minHeight: '44px' }}
              >
                Close
              </Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>

      {/* Screen reader announcements */}
      <div 
        role="status" 
        aria-live="polite" 
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>
    </>
  )
}
