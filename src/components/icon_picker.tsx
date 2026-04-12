'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Icon } from '@iconify/react'
import { Search, Upload, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

const ICONS_PER_PAGE = 40

// Material Symbols icons (subset for quick access + searchable)
const MATERIAL_ICONS: string[] = [
  'home', 'star', 'bookmark', 'favorite', 'work', 'school',
  'shopping-cart', 'settings', 'dashboard', 'calendar-today',
  'mail', 'account-circle', 'code', 'terminal', 'data-object',
  'developer-board', 'cloud', 'folder', 'link', 'launch',
  'search', 'person', 'group', 'notifications', 'lock',
  'security', 'payment', 'credit-card', 'shopping-bag', 'store',
  'restaurant', 'local-cafe', 'directions-car', 'flight', 'hotel',
  'music-note', 'movie', 'photo-camera', 'videocam', 'headphones',
  'sports-soccer', 'fitness-center', 'spa', 'book', 'article',
  'language', 'public', 'map', 'place', 'navigation',
  'chat', 'forum', 'email', 'phone', 'contacts',
  'build', 'science', 'biotech', 'psychology', 'architecture',
  'palette', 'brush', 'format-paint', 'design-services', 'draw',
  'videogame-asset', 'casino', 'toys', 'child-care', 'pets',
  'eco', 'park', 'energy-savings-leaf', 'water-drop', 'sunny',
  'cloud-download', 'cloud-upload', 'sync', 'backup', 'restore',
  'analytics', 'bar-chart', 'pie-chart', 'trending-up', 'insights',
  'key', 'vpn-key', 'fingerprint', 'face', 'badge',
  'heart-broken', 'thumb-up', 'thumb-down', 'mood', 'sentiment-satisfied',
]

// Simple Icons (brand icons)
const SIMPLE_ICONS: string[] = [
  'github', 'gitlab', 'bitbucket', 'npm', 'yarn',
  'react', 'vuedotjs', 'angular', 'svelte', 'nextdotjs',
  'typescript', 'javascript', 'python', 'rust', 'go',
  'docker', 'kubernetes', 'terraform', 'ansible', 'jenkins',
  'google', 'youtube', 'reddit', 'twitter', 'linkedin',
  'facebook', 'instagram', 'tiktok', 'discord', 'slack',
  'notion', 'figma', 'sketch', 'adobexd', 'invision',
  'jira', 'confluence', 'trello', 'asana', 'monday',
  'gmail', 'googlecalendar', 'googledrive', 'googlemeet', 'googlesheets',
  'amazon', 'amazonaws', 'netlify', 'vercel', 'heroku',
  'digitalocean', 'cloudflare', 'fastly', 'grafana', 'datadog',
  'stripe', 'paypal', 'shopify', 'woocommerce', 'magento',
  'spotify', 'applemusic', 'soundcloud', 'bandcamp', 'tidal',
  'netflix', 'disneyplus', 'primevideo', 'hulu', 'twitch',
  'linux', 'ubuntu', 'debian', 'archlinux', 'fedora',
  'macos', 'windows', 'android', 'ios', 'raspberrypi',
]

type Tab = 'material' | 'simple' | 'upload'

type IconPickerProps = {
  value: string // Current icon reference (builtin:material:name | builtin:simple:name | upload:uuid.ext)
  onChange: (value: string) => void
}

/**
 * Full Icon Picker Component
 * Supports Material Icons, Simple Icons, and custom uploads
 * Per spec §FR-003: dual-pack, searchable grid, 40 icons/page, hover tooltips, theme color
 */
export function IconPicker({ value, onChange }: IconPickerProps) {
  const [tab, setTab] = useState<Tab>('material')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Parse current value
  const isMaterial = value.startsWith('builtin:material:')
  const isSimple = value.startsWith('builtin:simple:')
  const isUpload = value.startsWith('upload:')
  const currentIconName = isMaterial
    ? value.replace('builtin:material:', '')
    : isSimple
    ? value.replace('builtin:simple:', '')
    : ''

  // Reset page on tab or search change
  useEffect(() => {
    setPage(0)
  }, [tab, searchQuery])

  const getFilteredIcons = useCallback(() => {
    const source = tab === 'material' ? MATERIAL_ICONS : SIMPLE_ICONS
    if (!searchQuery.trim()) return source
    const q = searchQuery.toLowerCase()
    return source.filter((name) => name.includes(q))
  }, [tab, searchQuery])

  const filteredIcons = getFilteredIcons()
  const totalPages = Math.ceil(filteredIcons.length / ICONS_PER_PAGE)
  const pageIcons = filteredIcons.slice(page * ICONS_PER_PAGE, (page + 1) * ICONS_PER_PAGE)

  const handleIconSelect = (iconName: string) => {
    if (tab === 'material') {
      onChange(`builtin:material:${iconName}`)
    } else {
      onChange(`builtin:simple:${iconName}`)
    }
  }

  const getIconifyId = (iconName: string): string => {
    if (tab === 'material') return `material-symbols:${iconName}`
    return `simple-icons:${iconName}`
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadError('')
    setUploading(true)

    try {
      // Validate file type
      const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
      if (!allowedTypes.includes(file.type)) {
        setUploadError('Only PNG, JPEG, WebP, and SVG files are allowed')
        return
      }

      // Validate file size (2MB)
      if (file.size > 2 * 1024 * 1024) {
        setUploadError('File size must be under 2MB')
        return
      }

      const formData = new FormData()
      formData.append('icon', file)

      const res = await fetch('/api/icons', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json()
        setUploadError(data.error ?? 'Upload failed')
        return
      }

      const data = await res.json()
      // iconReference is returned as "upload:uuid.ext" from the API
      onChange(data.iconReference ?? `upload:${data.filename}`)
    } catch {
      setUploadError('Upload failed. Please try again.')
    } finally {
      setUploading(false)
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // Rendered current icon preview
  const renderCurrentIcon = () => {
    if (isMaterial) {
      return (
        <Icon
          icon={`material-symbols:${currentIconName}`}
          width={48}
          height={48}
          className="text-accent"
          aria-hidden="true"
        />
      )
    }
    if (isSimple) {
      return (
        <Icon
          icon={`simple-icons:${currentIconName}`}
          width={48}
          height={48}
          className="text-accent"
          aria-hidden="true"
        />
      )
    }
    if (isUpload) {
      const filename = value.replace('upload:', '')
      return (
        <img
          src={`/api/icons/${filename}`}
          alt="Custom icon"
          width={48}
          height={48}
          className="object-contain"
          style={{ width: 48, height: 48 }}
        />
      )
    }
    return (
      <Icon
        icon="material-symbols:image"
        width={48}
        height={48}
        className="text-muted-foreground"
        aria-hidden="true"
      />
    )
  }

  return (
    <div className="space-y-3" data-testid="icon-picker">
      {/* Current selection preview */}
      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
        <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-background border">
          {renderCurrentIcon()}
        </div>
        <div>
          <p className="text-sm font-medium">
            {isMaterial && currentIconName.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
            {isSimple && currentIconName.charAt(0).toUpperCase() + currentIconName.slice(1)}
            {isUpload && 'Custom icon'}
            {!value && 'No icon selected'}
          </p>
          <p className="text-xs text-muted-foreground capitalize">
            {isMaterial && 'Material Symbol'}
            {isSimple && 'Simple Icon'}
            {isUpload && 'Uploaded'}
          </p>
        </div>
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="ml-auto h-8 w-8"
            onClick={() => onChange('')}
            aria-label="Clear icon selection"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 border-b border-border pb-1">
        <button
          type="button"
          data-testid="icon-tab-material"
          onClick={() => setTab('material')}
          className={`px-3 py-1.5 text-sm rounded-t font-medium transition-colors ${
            tab === 'material'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Material
        </button>
        <button
          type="button"
          data-testid="icon-tab-simple"
          onClick={() => setTab('simple')}
          className={`px-3 py-1.5 text-sm rounded-t font-medium transition-colors ${
            tab === 'simple'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Brands
        </button>
        <button
          type="button"
          data-testid="icon-tab-upload"
          onClick={() => setTab('upload')}
          className={`px-3 py-1.5 text-sm rounded-t font-medium transition-colors ${
            tab === 'upload'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Upload
        </button>
      </div>

      {/* Upload tab */}
      {tab === 'upload' && (
        <div className="space-y-3">
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" aria-hidden="true" />
            <p className="text-sm text-muted-foreground mb-3">
              PNG, JPEG, WebP, or SVG — max 2MB, 1024×1024px
            </p>
            <Button
              type="button"
              variant="outline"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploading ? 'Uploading...' : 'Choose file'}
            </Button>
            <input
              ref={fileInputRef}
              data-testid="icon-upload-input"
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              className="sr-only"
              aria-label="Upload icon file"
              onChange={handleFileUpload}
            />
          </div>
          {uploadError && (
            <p className="text-sm text-destructive" role="alert">
              {uploadError}
            </p>
          )}
        </div>
      )}

      {/* Icon grid (material or simple tabs) */}
      {tab !== 'upload' && (
        <>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <Input
              data-testid="icon-search-input"
              type="search"
              placeholder={`Search ${tab === 'material' ? 'Material' : 'brand'} icons…`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              aria-label="Search icons"
            />
          </div>

          {/* Grid */}
          <div
            data-testid={`icon-grid-${tab}`}
            className="grid grid-cols-8 gap-1.5"
            role="listbox"
            aria-label={`${tab === 'material' ? 'Material' : 'Brand'} icons`}
          >
            {pageIcons.map((iconName) => {
              const isSelected =
                (tab === 'material' && value === `builtin:material:${iconName}`) ||
                (tab === 'simple' && value === `builtin:simple:${iconName}`)
              return (
                <button
                  key={iconName}
                  type="button"
                  role="option"
                  data-testid={`icon-option-${iconName}`}
                  aria-selected={isSelected}
                  title={iconName.replace(/-/g, ' ')}
                  onClick={() => handleIconSelect(iconName)}
                  className={`
                    flex items-center justify-center w-10 h-10 rounded border-2 transition-colors
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                    ${isSelected
                      ? 'border-accent bg-accent/10'
                      : 'border-border hover:border-accent/50 hover:bg-muted'
                    }
                  `}
                  style={{ minWidth: '40px', minHeight: '40px' }}
                >
                  <Icon
                    icon={getIconifyId(iconName)}
                    width={24}
                    height={24}
                    className={isSelected ? 'text-accent' : 'text-foreground'}
                    aria-hidden="true"
                  />
                </button>
              )
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Page {page + 1} of {totalPages} ({filteredIcons.length} icons)
              </span>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                  aria-label="Previous page"
                >
                  ←
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                  aria-label="Next page"
                >
                  →
                </Button>
              </div>
            </div>
          )}

          {filteredIcons.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-4">
              No icons found for &quot;{searchQuery}&quot;
            </p>
          )}
        </>
      )}
    </div>
  )
}
