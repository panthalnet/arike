'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, X } from 'lucide-react'
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

export type Collection = {
  id: string
  name: string
  order: number
  bookmarkCount: number
}

type CollectionManagerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCollectionsChange: () => void
}

/**
 * Collection Manager Dialog
 * Allows creating, renaming (future), and deleting collections.
 * Per spec §FR-004: horizontal tab navigation, badge counts, at least 1 collection must remain.
 */
export function CollectionManager({ open, onOpenChange, onCollectionsChange }: CollectionManagerProps) {
  const [collections, setCollections] = useState<Collection[]>([])
  const [newName, setNewName] = useState('')
  const [nameError, setNameError] = useState('')
  const [creating, setCreating] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [announcement, setAnnouncement] = useState('')

  const fetchCollections = useCallback(async () => {
    try {
      const res = await fetch('/api/collections')
      if (res.ok) {
        const data = await res.json()
        setCollections(data)
      }
    } catch (err) {
      console.error('Failed to fetch collections:', err)
    }
  }, [])

  useEffect(() => {
    if (open) {
      fetchCollections()
    }
  }, [open, fetchCollections])

  const handleCreate = async () => {
    const trimmed = newName.trim()
    if (!trimmed) {
      setNameError('Collection name is required')
      return
    }
    setCreating(true)
    setNameError('')
    try {
      const res = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed }),
      })

      if (res.ok) {
        setNewName('')
        await fetchCollections()
        onCollectionsChange()
        setAnnouncement(`Collection "${trimmed}" created`)
      } else if (res.status === 409) {
        setNameError('A collection with that name already exists')
      } else if (res.status === 422) {
        const data = await res.json()
        setNameError(data.error)
      } else {
        setNameError('Failed to create collection')
      }
    } catch {
      setNameError('Failed to create collection')
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteRequest = (id: string) => {
    setDeleteConfirmId(id)
  }

  const handleDeleteCancel = () => {
    setDeleteConfirmId(null)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmId) return
    const col = collections.find((c) => c.id === deleteConfirmId)
    setDeletingId(deleteConfirmId)
    setDeleteConfirmId(null)

    try {
      const res = await fetch(`/api/collections/${deleteConfirmId}`, {
        method: 'DELETE',
      })

      if (res.ok || res.status === 204) {
        await fetchCollections()
        onCollectionsChange()
        setAnnouncement(`Collection "${col?.name}" deleted`)
      } else if (res.status === 422) {
        setAnnouncement('Cannot delete the last collection')
      }
    } catch {
      setAnnouncement('Failed to delete collection')
    } finally {
      setDeletingId(null)
    }
  }

  const collectionToDelete = collections.find((c) => c.id === deleteConfirmId)
  const isLastCollection = collections.length <= 1

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-testid="collection-manager-dialog"
        className="sm:max-w-[480px]"
      >
        <DialogHeader>
          <DialogTitle>Manage Collections</DialogTitle>
          <DialogDescription>
            Create and delete bookmark collections. At least one collection must remain.
          </DialogDescription>
        </DialogHeader>

        {/* Create new collection */}
        <div className="space-y-3 py-2">
          <Label htmlFor="new-collection-name">New Collection</Label>
          <div className="flex gap-2">
            <Input
              id="new-collection-name"
              data-testid="new-collection-name-input"
              placeholder="Collection name"
              value={newName}
              onChange={(e) => {
                setNewName(e.target.value)
                setNameError('')
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              disabled={creating}
            />
            <Button
              data-testid="add-collection-button"
              onClick={handleCreate}
              disabled={creating || !newName.trim()}
              size="default"
              className="shrink-0 gap-1"
            >
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>
          {nameError && (
            <p className="text-sm text-destructive" role="alert">
              {nameError}
            </p>
          )}
        </div>

        {/* Collection list */}
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {collections.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No collections yet.</p>
          ) : (
            collections.map((col) => (
              <div
                key={col.id}
                data-testid={`collection-list-item-${col.name}`}
                className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="truncate font-medium text-sm">{col.name}</span>
                  <span
                    data-testid={`collection-badge-${col.name}`}
                    className="shrink-0 text-xs bg-muted text-muted-foreground rounded-full px-2 py-0.5"
                    aria-label={`${col.bookmarkCount} bookmarks`}
                  >
                    {col.bookmarkCount}
                  </span>
                </div>
                <Button
                  data-testid={`delete-collection-button-${col.name}`}
                  variant="ghost"
                  size="icon"
                  disabled={isLastCollection || deletingId === col.id}
                  onClick={() => handleDeleteRequest(col.id)}
                  aria-label={`Delete collection ${col.name}`}
                  title={isLastCollection ? 'Cannot delete the last collection' : `Delete "${col.name}"`}
                  className="shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>

        {/* Close button */}
        <div className="flex justify-end pt-2">
          <Button
            data-testid="close-collection-manager"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4 mr-1" />
            Close
          </Button>
        </div>

        {/* Delete confirmation (inline) */}
        {deleteConfirmId && collectionToDelete && (
          <div
            data-testid="delete-collection-confirm"
            role="alertdialog"
            aria-modal="true"
            className="absolute inset-0 bg-background/95 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center gap-4 p-6 z-10"
          >
            <div className="text-center space-y-2">
              <h3 className="font-semibold text-lg">Delete Collection?</h3>
              <p className="text-sm text-muted-foreground">
                Delete &quot;{collectionToDelete.name}&quot;? The{' '}
                {collectionToDelete.bookmarkCount} bookmark
                {collectionToDelete.bookmarkCount !== 1 ? 's' : ''} in this collection will
                not be deleted — they will still appear in other collections they belong to.
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                data-testid="cancel-delete-collection-button"
                variant="outline"
                onClick={handleDeleteCancel}
              >
                Cancel
              </Button>
              <Button
                data-testid="confirm-delete-collection-button"
                variant="destructive"
                onClick={handleDeleteConfirm}
              >
                Delete Collection
              </Button>
            </div>
          </div>
        )}

        {/* Screen reader announcements */}
        <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
          {announcement}
        </div>
      </DialogContent>
    </Dialog>
  )
}
