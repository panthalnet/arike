'use client'

import { useState, useEffect } from 'react'
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
import { IconPicker } from '@/components/icon_picker'

type Collection = {
  id: string
  name: string
  order: number
  bookmarkCount: number
}

type BookmarkFormProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  bookmark?: {
    id: string
    name: string
    url: string
    icon: string
    collectionIds?: string[]
  }
  collections?: Collection[]
  activeCollectionId?: string
  onSave: (data: { name: string; url: string; icon: string; collectionIds: string[] }) => Promise<void>
}

/**
 * Bookmark Form Dialog
 * For adding/editing bookmarks with URL validation and full icon picker
 * Supports Material Icons, Simple Icons (brand), and custom uploads
 */
export function BookmarkForm({ open, onOpenChange, bookmark, collections = [], activeCollectionId, onSave }: BookmarkFormProps) {
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [selectedIcon, setSelectedIcon] = useState('builtin:material:home')
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<string[]>([])
  const [urlError, setUrlError] = useState('')
  const [saving, setSaving] = useState(false)

  // Reset form when dialog opens/closes or bookmark changes
  useEffect(() => {
    if (open && bookmark) {
      // Edit mode
      setName(bookmark.name)
      setUrl(bookmark.url)
      setSelectedIcon(bookmark.icon || 'builtin:material:home')
      // Restore collection membership
      setSelectedCollectionIds(bookmark.collectionIds ?? (activeCollectionId ? [activeCollectionId] : []))
    } else if (open) {
      // Add mode - default to active collection
      setName('')
      setUrl('')
      setSelectedIcon('builtin:material:home')
      setSelectedCollectionIds(activeCollectionId ? [activeCollectionId] : [])
    }
    setUrlError('')
  }, [open, bookmark, activeCollectionId])

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

  const toggleCollection = (id: string) => {
    setSelectedCollectionIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    )
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
        icon: selectedIcon || 'builtin:material:home',
        collectionIds: selectedCollectionIds,
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
        className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto"
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

          {/* Icon Selection - full picker */}
          <div className="space-y-2" data-testid="icon-picker-section">
            <Label>Icon</Label>
            <IconPicker
              value={selectedIcon}
              onChange={setSelectedIcon}
            />
          </div>

          {/* Collections */}
          {collections.length > 0 && (
            <div className="space-y-2">
              <Label>Collections</Label>
              <div className="border rounded-lg p-3 space-y-2 max-h-40 overflow-y-auto">
                {collections.map((col) => (
                  <label
                    key={col.id}
                    className="flex items-center gap-2 cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      data-testid={`collection-checkbox-${col.name}`}
                      checked={selectedCollectionIds.includes(col.id)}
                      onChange={() => toggleCollection(col.id)}
                      className="h-4 w-4 rounded border-border accent-primary"
                    />
                    <span className="text-sm">{col.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
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
