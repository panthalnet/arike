'use client'

import { useState, useEffect } from 'react'
import { Icon } from '@iconify/react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type BookmarkFormProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  bookmark?: {
    id: string
    name: string
    url: string
    icon: string
  }
  onSave: (data: { name: string; url: string; icon: string }) => Promise<void>
}

// Common Material Icons for quick selection
const QUICK_ICONS = [
  'home', 'star', 'bookmark', 'favorite', 'work', 'school', 'shopping-cart',
  'settings', 'dashboard', 'calendar-today', 'mail', 'account-circle',
  'code', 'terminal', 'data-object', 'developer-board',
]

/**
 * Bookmark Form Dialog
 * For adding/editing bookmarks with URL validation and icon selection
 * Simplified version - full icon picker to be implemented in polish phase
 */
export function BookmarkForm({ open, onOpenChange, bookmark, onSave }: BookmarkFormProps) {
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [selectedIcon, setSelectedIcon] = useState('home')
  const [urlError, setUrlError] = useState('')
  const [saving, setSaving] = useState(false)

  // Reset form when dialog opens/closes or bookmark changes
  useEffect(() => {
    if (open && bookmark) {
      // Edit mode
      setName(bookmark.name)
      setUrl(bookmark.url)
      // Parse icon if it's a material icon
      if (bookmark.icon.startsWith('builtin:material:')) {
        setSelectedIcon(bookmark.icon.replace('builtin:material:', ''))
      } else {
        setSelectedIcon('home')
      }
    } else if (open) {
      // Add mode
      setName('')
      setUrl('')
      setSelectedIcon('home')
    }
    setUrlError('')
  }, [open, bookmark])

  const validateUrl = (value: string): boolean => {
    const urlRegex = /^https?:\/\/.+/
    return urlRegex.test(value)
  }

  const handleUrlChange = (value: string) => {
    setUrl(value)
    if (value && !validateUrl(value)) {
      setUrlError('Invalid URL. Must start with http:// or https://')
    } else {
      setUrlError('')
    }
  }

  const handleSave = async () => {
    // Validate
    if (!name.trim()) {
      return
    }
    if (!validateUrl(url)) {
      setUrlError('Invalid URL. Must start with http:// or https://')
      return
    }

    setSaving(true)
    try {
      await onSave({
        name: name.trim(),
        url: url.trim(),
        icon: `builtin:material:${selectedIcon}`,
      })
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to save bookmark:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        data-testid="bookmark-form-dialog"
        className="sm:max-w-[500px]"
      >
        <DialogHeader>
          <DialogTitle>
            {bookmark ? 'Edit Bookmark' : 'Add Bookmark'}
          </DialogTitle>
          <DialogDescription>
            {bookmark 
              ? 'Update your bookmark details'
              : 'Add a new bookmark to your collection'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="bookmark-name">Name</Label>
            <Input
              id="bookmark-name"
              data-testid="bookmark-name-input"
              placeholder="GitHub"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          {/* URL */}
          <div className="space-y-2">
            <Label htmlFor="bookmark-url">URL</Label>
            <Input
              id="bookmark-url"
              data-testid="bookmark-url-input"
              type="url"
              placeholder="https://github.com"
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
            />
            {urlError && (
              <p 
                data-testid="url-error"
                className="text-sm text-destructive"
              >
                {urlError}
              </p>
            )}
          </div>

          {/* Icon Selection */}
          <div className="space-y-2">
            <Label>Icon</Label>
            <div 
              data-testid="icon-picker-button"
              className="border rounded-lg p-4"
            >
              <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-muted">
                  <Icon 
                    icon={`material-symbols:${selectedIcon}`}
                    width={48}
                    height={48}
                    className="text-accent"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {selectedIcon.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Material Icon
                  </p>
                </div>
              </div>

              {/* Quick icon grid */}
              <div 
                data-testid="icon-tab-material"
                className="grid grid-cols-8 gap-2"
              >
                {QUICK_ICONS.map((iconName) => (
                  <button
                    key={iconName}
                    data-testid={`icon-option-${iconName}`}
                    type="button"
                    onClick={() => setSelectedIcon(iconName)}
                    className={`
                      flex items-center justify-center w-10 h-10 rounded 
                      border-2 transition-colors
                      ${selectedIcon === iconName 
                        ? 'border-accent bg-accent/10' 
                        : 'border-border hover:border-accent/50 hover:bg-muted'
                      }
                    `}
                    title={iconName.replace(/-/g, ' ')}
                  >
                    <Icon 
                      icon={`material-symbols:${iconName}`}
                      width={24}
                      height={24}
                      className={selectedIcon === iconName ? 'text-accent' : 'text-foreground'}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            data-testid="bookmark-save-button"
            onClick={handleSave}
            disabled={saving || !name.trim() || !url.trim() || !!urlError}
          >
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
