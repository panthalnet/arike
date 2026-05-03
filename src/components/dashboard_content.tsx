'use client'

import { useState, useCallback, useEffect } from 'react'
import { GripVertical, Settings2 } from 'lucide-react'
import { BookmarksGrid } from '@/components/bookmarks_grid'
import { CollectionManager } from '@/components/collection_manager'
import { Button } from '@/components/ui/button'

type Bookmark = {
  id: string
  name: string
  url: string
  icon: string
}

type Collection = {
  id: string
  name: string
  order: number
  bookmarkCount: number
}

type DashboardContentProps = {
  initialCollections?: Collection[]
  initialBookmarks?: Bookmark[]
  initialLayoutMode?: 'uniform-grid' | 'bento-grid'
}

/**
 * DashboardContent (Client Component)
 * Manages collection tabs state, active collection, and coordinates
 * between the CollectionManager and BookmarksGrid.
 *
 * Meets FR-004:
 * - Horizontal tab navigation (desktop), scrollable tabs (mobile)
 * - Active collection highlighted with badge counts
 * - "Manage" button to open CollectionManager
 */
export function DashboardContent({
  initialCollections = [],
  initialBookmarks = [],
  initialLayoutMode = 'uniform-grid',
}: DashboardContentProps) {
  const [collections, setCollections] = useState<Collection[]>(initialCollections)
  const [activeCollectionId, setActiveCollectionId] = useState<string>(
    initialCollections[0]?.id ?? ''
  )
  const [collectionManagerOpen, setCollectionManagerOpen] = useState(false)
  const [layoutMode, setLayoutMode] = useState<'uniform-grid' | 'bento-grid'>(initialLayoutMode)

  // Listen for layout changes dispatched by SettingsPanel
  useEffect(() => {
    const handler = (e: Event) => {
      const mode = (e as CustomEvent<{ mode: 'uniform-grid' | 'bento-grid' }>).detail.mode
      setLayoutMode(mode)
    }
    window.addEventListener('arike:layout-change', handler)
    return () => window.removeEventListener('arike:layout-change', handler)
  }, [])

  const fetchCollections = useCallback(async () => {
    try {
      const res = await fetch('/api/collections')
      if (res.ok) {
        const data: Collection[] = await res.json()
        setCollections(data)
        // If active collection was deleted, switch to first
        setActiveCollectionId((prev) => {
          const still = data.find((c) => c.id === prev)
          return still ? prev : (data[0]?.id ?? '')
        })
      }
    } catch (err) {
      console.error('Failed to refresh collections:', err)
    }
  }, [])

  // Set initial active collection
  useEffect(() => {
    if (!activeCollectionId && initialCollections.length > 0) {
      setActiveCollectionId(initialCollections[0].id)
    }
  }, [initialCollections, activeCollectionId])

  const handleCollectionsChange = useCallback(() => {
    fetchCollections()
  }, [fetchCollections])

  const handleBookmarkSaved = useCallback(() => {
    fetchCollections() // Refresh badge counts
  }, [fetchCollections])

  const handleMoveCollection = useCallback(async (id: string, direction: 'left' | 'right') => {
    const index = collections.findIndex((collection) => collection.id === id)
    if (index < 0) return

    const targetIndex = direction === 'left' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= collections.length) return

    const next = [...collections]
    const [moved] = next.splice(index, 1)
    next.splice(targetIndex, 0, moved)
    setCollections(next)

    try {
      await fetch('/api/collections/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds: next.map((collection) => collection.id) }),
      })
    } catch (error) {
      console.error('Failed to reorder collections:', error)
      await fetchCollections()
    }
  }, [collections, fetchCollections])

  return (
    <div className="w-full">
      {/* Collection Tabs + Manage button */}
      <div className="glass-surface flex items-center gap-2 mb-6 p-2 rounded-xl bg-card border border-border">
        {/* Scrollable tab strip */}
        <div
          data-testid="collection-tabs"
          role="tablist"
          aria-label="Bookmark collections"
          className="flex-1 flex items-center gap-1 overflow-x-auto pb-1 scrollbar-thin"
          style={{ scrollbarWidth: 'thin' }}
        >
          {collections.map((col, index) => {
            const isActive = col.id === activeCollectionId
            return (
              <div key={col.id} className="inline-flex items-stretch shrink-0">
                <button
                  role="tab"
                  data-testid={`collection-tab-${col.name}`}
                  aria-selected={isActive}
                  aria-controls={`tabpanel-${col.id}`}
                  onClick={() => setActiveCollectionId(col.id)}
                  className={`
                    inline-flex items-center gap-1.5 shrink-0 rounded-l-lg px-3 py-2 text-sm font-medium
                    transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                    ${isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                    }
                  `}
                  style={{ minHeight: '44px' }}
                >
                  <span>{col.name}</span>
                  <span
                    data-testid="tab-badge"
                    aria-label={`${col.bookmarkCount} bookmarks`}
                    className={`
                      text-xs rounded-full px-1.5 py-0.5 min-w-[1.25rem] text-center
                      ${isActive
                        ? 'bg-primary-foreground/20 text-primary-foreground'
                        : 'bg-background text-muted-foreground'
                      }
                    `}
                  >
                    {col.bookmarkCount}
                  </span>
                </button>
                <div className="flex items-stretch overflow-hidden rounded-r-lg border border-l-0 border-border">
                  <button
                    type="button"
                    data-testid={`move-collection-left-${col.name}`}
                    aria-label={`Move collection ${col.name} left`}
                    disabled={index === 0}
                    onClick={() => void handleMoveCollection(col.id, 'left')}
                    className="inline-flex items-center justify-center px-2 text-muted-foreground hover:text-foreground disabled:opacity-40"
                    style={{ minHeight: '44px' }}
                  >
                    <GripVertical className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    data-testid={`move-collection-right-${col.name}`}
                    aria-label={`Move collection ${col.name} right`}
                    disabled={index === collections.length - 1}
                    onClick={() => void handleMoveCollection(col.id, 'right')}
                    className="inline-flex items-center justify-center px-2 text-muted-foreground hover:text-foreground disabled:opacity-40"
                    style={{ minHeight: '44px' }}
                  >
                    <GripVertical className="h-4 w-4 rotate-90" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Manage collections button */}
        <Button
          data-testid="manage-collections-button"
          variant="outline"
          size="default"
          onClick={() => setCollectionManagerOpen(true)}
          className="shrink-0 gap-1.5"
          aria-label="Manage collections"
          style={{ minHeight: '44px' }}
        >
          <Settings2 className="h-4 w-4" />
          <span className="hidden sm:inline">Manage</span>
        </Button>
      </div>

      {/* Tab panels */}
      {collections.map((col) => (
        <div
          key={col.id}
          id={`tabpanel-${col.id}`}
          role="tabpanel"
          aria-labelledby={`collection-tab-${col.name}`}
          hidden={col.id !== activeCollectionId}
        >
          {col.id === activeCollectionId && (
            <BookmarksGrid
              initialBookmarks={initialBookmarks.filter(() => false)} // always fetch fresh
              collectionId={col.id}
              collections={collections}
              onBookmarkSaved={handleBookmarkSaved}
              layoutMode={layoutMode}
            />
          )}
        </div>
      ))}

      {/* Collection Manager Dialog */}
      <CollectionManager
        open={collectionManagerOpen}
        onOpenChange={setCollectionManagerOpen}
        onCollectionsChange={handleCollectionsChange}
      />
    </div>
  )
}
