'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, Check } from 'lucide-react'
import { setCachedWallpaper } from '@/lib/wallpaper_cache'

interface Wallpaper {
  id: string
  displayName: string
  sourceType: 'builtin' | 'upload'
  isActive: boolean
}

const BUILTIN_GRADIENTS: Record<string, string> = {
  'builtin-1': 'linear-gradient(135deg, #0a3d62 0%, #1a5c7a 100%)',
  'builtin-2': 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)',
  'builtin-3': 'linear-gradient(135deg, #5d2c3e 0%, #8b4f9f 50%, #e8a555 100%)',
}

interface WallpaperUploaderProps {
  wallpapers: Wallpaper[]
  onWallpaperActivated: (wallpaperId: string | null) => void
  onWallpaperUploaded: (wallpaper: Wallpaper) => void
}

export function WallpaperUploader({
  wallpapers,
  onWallpaperActivated,
  onWallpaperUploaded,
}: WallpaperUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [activating, setActivating] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const announceRef = useRef<HTMLDivElement>(null)

  const announce = (msg: string) => {
    if (announceRef.current) announceRef.current.textContent = msg
  }

  const applyWallpaperCss = (wallpaperId: string | null) => {
    let cssValue: string | null = null
    if (wallpaperId && BUILTIN_GRADIENTS[wallpaperId]) {
      cssValue = BUILTIN_GRADIENTS[wallpaperId]
    } else if (wallpaperId) {
      cssValue = `url(/api/wallpapers/file/${wallpaperId})`
    }

    if (cssValue) {
      document.documentElement.style.setProperty('--theme-background', cssValue)
    } else {
      document.documentElement.style.removeProperty('--theme-background')
    }
    setCachedWallpaper(cssValue)
  }

  const handleActivate = async (wallpaperId: string) => {
    setActivating(wallpaperId)
    try {
      const res = await fetch(`/api/wallpapers/${wallpaperId}`, { method: 'POST' })
      if (!res.ok) throw new Error('Failed to activate wallpaper')
      applyWallpaperCss(wallpaperId)
      onWallpaperActivated(wallpaperId)
      announce(`Wallpaper changed successfully`)
    } catch {
      announce('Failed to change wallpaper')
    } finally {
      setActivating(null)
    }
  }

  const handleDeactivate = async () => {
    try {
      await fetch(`/api/wallpapers/none`, {
        method: 'POST',
        body: JSON.stringify({ action: 'deactivate' }),
        headers: { 'Content-Type': 'application/json' },
      })
      applyWallpaperCss(null)
      onWallpaperActivated(null)
      announce('Wallpaper removed')
    } catch {
      announce('Failed to remove wallpaper')
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Client-side size check (2 MB)
    if (file.size > 2 * 1024 * 1024) {
      setUploadError('File size exceeds 2 MB limit')
      return
    }

    setUploadError(null)
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/wallpapers', { method: 'POST', body: formData })
      if (!res.ok) {
        const json = await res.json()
        setUploadError(json.error ?? 'Upload failed')
        return
      }
      const uploaded: Wallpaper = await res.json()
      onWallpaperUploaded(uploaded)
      // Auto-activate the just-uploaded wallpaper
      await handleActivate(uploaded.id)
      announce(`Wallpaper "${uploaded.displayName}" uploaded and activated`)
    } catch {
      setUploadError('Upload failed. Please try again.')
    } finally {
      setUploading(false)
      // Reset input so same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div data-testid="wallpaper-section" className="space-y-3">
      {/* Live region for accessibility announcements */}
      <div ref={announceRef} aria-live="polite" className="sr-only" />

      {/* Built-in + uploaded wallpaper swatches */}
      <div className="grid grid-cols-3 gap-2">
        {wallpapers.map((w) => {
          const gradient = BUILTIN_GRADIENTS[w.id]
          return (
            <button
              key={w.id}
              type="button"
              data-testid={`wallpaper-option-${w.id}`}
              aria-pressed={w.isActive}
              aria-label={`${w.displayName}${w.isActive ? ' (active)' : ''}`}
              disabled={activating !== null}
              onClick={() => void handleActivate(w.id)}
              className={`relative h-16 rounded-md border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                ${w.isActive ? 'border-primary ring-2 ring-primary/30' : 'border-border hover:border-accent'}`}
          style={
                gradient
                  ? { background: gradient }
                  : { backgroundImage: `url(/api/wallpapers/file/${w.id})`, backgroundSize: 'cover', backgroundPosition: 'center' }
              }
            >
              {w.isActive && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <Check className="h-5 w-5 text-white drop-shadow" aria-hidden="true" />
                </span>
              )}
              <span className="sr-only">{w.displayName}</span>
            </button>
          )
        })}
      </div>

      {/* None / no wallpaper option */}
      <button
        type="button"
        data-testid="wallpaper-option-none"
        onClick={() => void handleDeactivate()}
        className="text-xs text-muted-foreground hover:text-foreground underline"
      >
        Remove wallpaper
      </button>

      {/* Upload new wallpaper */}
      <div className="flex items-center gap-2 mt-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          data-testid="wallpaper-upload-button"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          className="gap-1.5"
        >
          <Upload className="h-4 w-4" aria-hidden="true" />
          {uploading ? 'Uploading...' : 'Upload image'}
        </Button>
        <input
          ref={fileInputRef}
          data-testid="wallpaper-upload-input"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="sr-only"
          aria-label="Upload wallpaper image"
          onChange={(e) => void handleFileChange(e)}
        />
      </div>

      {/* Upload error */}
      {uploadError && (
        <p
          data-testid="wallpaper-upload-error"
          role="alert"
          className="text-sm text-destructive"
        >
          {uploadError}
        </p>
      )}
    </div>
  )
}
