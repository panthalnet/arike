'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus } from 'lucide-react'
import { BookmarkCard } from '@/components/bookmark_card'
import { BookmarkForm } from '@/components/bookmark_form'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

type Bookmark = {
  id: string
  name: string
  url: string
  icon: string
  tileSize?: 'small' | 'medium' | 'large'
}

type Collection = {
  id: string
  name: string
  order: number
  bookmarkCount: number
}

type BookmarksGridProps = {
  initialBookmarks?: Bookmark[]
  collectionId?: string
  collections?: Collection[]
  onBookmarkSaved?: () => void
  layoutMode?: 'uniform-grid' | 'bento-grid'
}

/**
 * Bookmarks Grid Component
 * Displays bookmarks in a responsive grid with CRUD operations
 * Meets FR-002: 4-column grid (desktop), 2-column (tablet), 1-column (mobile)
 */
export function BookmarksGrid({ initialBookmarks = [], collectionId, collections = [], onBookmarkSaved, layoutMode = 'uniform-grid' }: BookmarksGridProps) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks)
  const [formOpen, setFormOpen] = useState(false)
  const [editingBookmark, setEditingBookmark] = useState<(Bookmark & { collectionIds?: string[] }) | undefined>()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [bookmarkToDelete, setBookmarkToDelete] = useState<Bookmark | null>(null)
  const [announcement, setAnnouncement] = useState('')

  const fetchBookmarks = async () => {
    try {
      const params = new URLSearchParams()
      if (collectionId) {
        params.set('collection', collectionId)
      }

      const response = await fetch(`/api/bookmarks?${params}`)
      if (response.ok) {
        const data = await response.json()
        setBookmarks(data)
      }
    } catch (error) {
      console.error('Failed to fetch bookmarks:', error)
    }
  }

  // Fetch bookmarks
  useEffect(() => {
    fetchBookmarks()
  }, [collectionId])

  const handleAddBookmark = () => {
    setEditingBookmark(undefined)
    setFormOpen(true)
  }

  const handleEditBookmark = async (bookmark: Bookmark) => {
    // Fetch current collection memberships for this bookmark
    try {
      const res = await fetch(`/api/bookmarks/${bookmark.id}/collections`)
      const collectionIds: string[] = res.ok ? await res.json() : []
      setEditingBookmark({ ...bookmark, collectionIds })
    } catch {
      setEditingBookmark({ ...bookmark, collectionIds: collectionId ? [collectionId] : [] })
    }
    setFormOpen(true)
  }

  const handleSaveBookmark = async (data: { name: string; url: string; icon: string; collectionIds: string[] }) => {
    try {
      if (editingBookmark) {
        // Update existing bookmark
        const response = await fetch(`/api/bookmarks/${editingBookmark.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: data.name,
            url: data.url,
            icon: data.icon,
            collections: data.collectionIds,
          }),
        })

        if (response.ok) {
          await fetchBookmarks()
          onBookmarkSaved?.()
          setAnnouncement(`${data.name} updated`)
        }
      } else {
        // Create new bookmark
        const response = await fetch('/api/bookmarks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: data.name,
            url: data.url,
            icon: data.icon,
            collections: data.collectionIds.length > 0 ? data.collectionIds : (collectionId ? [collectionId] : []),
          }),
        })

        if (response.ok) {
          await fetchBookmarks()
          onBookmarkSaved?.()
          setAnnouncement(`${data.name} added`)
        }
      }
    } catch (error) {
      console.error('Failed to save bookmark:', error)
      setAnnouncement('Failed to save bookmark')
    }
  }

  const handleDeleteClick = (bookmark: Bookmark) => {
    setBookmarkToDelete(bookmark)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!bookmarkToDelete) return

    try {
      const response = await fetch(`/api/bookmarks/${bookmarkToDelete.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchBookmarks()
        setAnnouncement(`${bookmarkToDelete.name} deleted`)
        setDeleteDialogOpen(false)
        setBookmarkToDelete(null)
      }
    } catch (error) {
      console.error('Failed to delete bookmark:', error)
      setAnnouncement('Failed to delete bookmark')
    }
  }

  return (
    <div className="w-full">
      {/* Add Bookmark Button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Bookmarks</h2>
        <Button
          data-testid="add-bookmark-button"
          onClick={handleAddBookmark}
          size="default"
          className="gap-2"
          style={{ minHeight: '44px' }}
        >
          <Plus className="h-5 w-5" />
          Add Bookmark
        </Button>
      </div>

      {/* Bookmarks Grid or Empty State */}
      {bookmarks.length > 0 ? (
        <div 
          data-testid="bookmarks-grid"
          data-layout={layoutMode}
          className={layoutMode === 'bento-grid'
            ? 'bento-grid'
            : 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'
          }
        >
          {bookmarks.map((bookmark) => (
            <BookmarkCard
              key={bookmark.id}
              {...bookmark}
              layoutMode={layoutMode}
              onEdit={() => handleEditBookmark(bookmark)}
              onDelete={() => handleDeleteClick(bookmark)}
              onTileSizeChange={async (size) => {
                const res = await fetch(`/api/bookmarks/${bookmark.id}`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ tileSize: size }),
                })
                if (res.ok) {
                  setBookmarks(prev =>
                    prev.map(b => b.id === bookmark.id ? { ...b, tileSize: size } : b)
                  )
                }
              }}
            />
          ))}
        </div>
      ) : (
        <div 
          data-testid="bookmarks-empty-state"
          className="text-center py-16"
        >
          <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-muted mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            No bookmarks yet
          </h3>
          <p className="text-muted-foreground mb-4">
            Add your first bookmark to get started
          </p>
          <Button
            onClick={handleAddBookmark}
            size="lg"
            className="gap-2"
          >
            <Plus className="h-5 w-5" />
            Add Bookmark
          </Button>
        </div>
      )}

      {/* Bookmark Form Dialog */}
      <BookmarkForm
        open={formOpen}
        onOpenChange={setFormOpen}
        bookmark={editingBookmark}
        collections={collections}
        activeCollectionId={collectionId}
        onSave={handleSaveBookmark}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent data-testid="delete-confirmation-dialog">
          <DialogHeader>
            <DialogTitle>Delete Bookmark</DialogTitle>
            <DialogDescription>
              Delete &apos;{bookmarkToDelete?.name}&apos;? This cannot be undone.
              {collectionId && ' This will remove it from all collections.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              data-testid="delete-cancel-button"
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              data-testid="delete-confirm-button"
              variant="destructive"
              onClick={handleDeleteConfirm}
            >
              Delete
            </Button>
          </DialogFooter>
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
    </div>
  )
}
