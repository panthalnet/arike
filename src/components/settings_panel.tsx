'use client'

import { useState, useEffect, useCallback } from 'react'
import { Settings, X } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type ThemeSetting = {
  selectedTheme: string
  customPrimary: string | null
  customBackground: string | null
  customText: string | null
  customBorder: string | null
  searchProvider: string
}

type SettingsPanelProps = {
  initialSettings?: ThemeSetting
  onSettingsChange?: (settings: Partial<ThemeSetting>) => void
}

const AVAILABLE_THEMES = ['gruvbox', 'catppuccin', 'everforest'] as const
const AVAILABLE_PROVIDERS = ['duckduckgo', 'google', 'bing', 'brave'] as const

/**
 * Settings Panel component for theme and search provider configuration
 * Mobile-first design with full-screen overlay on mobile
 * Meets FR-007 requirements: theme customization with color pickers
 */
export function SettingsPanel({ 
  initialSettings,
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
  })
  const [announcement, setAnnouncement] = useState('')

  // Load initial settings
  useEffect(() => {
    if (initialSettings) {
      setSettings(initialSettings)
    } else {
      // Fetch from API
      fetchSettings()
    }
  }, [initialSettings])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings')
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    }
  }

  const updateSetting = useCallback(async (updates: Partial<ThemeSetting>) => {
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        const updated = await response.json()
        setSettings(updated)
        
        // Notify parent component
        if (onSettingsChange) {
          onSettingsChange(updates)
        }

        // Apply theme immediately (no page reload)
        applyTheme(updated)

        // Screen reader announcement
        if (updates.selectedTheme) {
          setAnnouncement(`Theme updated to ${updates.selectedTheme}`)
        } else if (updates.searchProvider) {
          setAnnouncement(`Search provider changed to ${updates.searchProvider}`)
        }
      }
    } catch (error) {
      console.error('Failed to update settings:', error)
      setAnnouncement('Failed to update settings')
    }
  }, [onSettingsChange])

  const applyTheme = (themeSettings: ThemeSetting) => {
    const html = document.documentElement
    
    // Set theme data attribute
    html.setAttribute('data-theme', themeSettings.selectedTheme)
    
    // Apply custom colors if set
    if (themeSettings.customPrimary) {
      html.style.setProperty('--primary', themeSettings.customPrimary)
    }
    if (themeSettings.customBackground) {
      html.style.setProperty('--background', themeSettings.customBackground)
    }
    if (themeSettings.customText) {
      html.style.setProperty('--foreground', themeSettings.customText)
    }
    if (themeSettings.customBorder) {
      html.style.setProperty('--border', themeSettings.customBorder)
    }
  }

  const handleThemeChange = (theme: string) => {
    updateSetting({ selectedTheme: theme })
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
                onValueChange={handleThemeChange}
              >
                <SelectTrigger 
                  id="theme-select"
                  data-testid="theme-select"
                  style={{ minHeight: '44px' }}
                >
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_THEMES.map((theme) => (
                    <SelectItem key={theme} value={theme}>
                      {theme.charAt(0).toUpperCase() + theme.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
