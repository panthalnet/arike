'use client'

import { Icon } from '@iconify/react'
import { Edit, Trash2 } from 'lucide-react'
import { parseIconReference } from '@/lib/icon-utils'
import { Button } from '@/components/ui/button'

type TileSize = 'small' | 'medium' | 'large'

type BookmarkCardProps = {
  id: string
  name: string
  url: string
  icon: string
  tileSize?: TileSize
  layoutMode?: 'uniform-grid' | 'bento-grid'
  onEdit?: () => void
  onDelete?: () => void
  onTileSizeChange?: (size: TileSize) => void
}

/**
 * Bookmark Card Component
 * Displays individual bookmark with icon, name, and action buttons
 * Meets FR-002 requirements: 64x64px icon, 44x44px touch target, clickable
 */
export function BookmarkCard({
  name,
  url,
  icon,
  tileSize = 'medium',
  layoutMode = 'uniform-grid',
  onEdit,
  onDelete,
  onTileSizeChange,
}: BookmarkCardProps) {
  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger if clicking action buttons
    if ((e.target as HTMLElement).closest('button')) {
      return
    }
    // Open bookmark in new tab
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  // Parse icon reference to determine rendering method
  let iconElement: React.ReactNode

  try {
    const { type, identifier } = parseIconReference(icon)

    if (type === 'material') {
      // Material Icons from Iconify
      iconElement = (
        <Icon 
          icon={`material-symbols:${identifier}`}
          width={64}
          height={64}
          className="text-primary"
        />
      )
    } else if (type === 'simple') {
      // Simple Icons from Iconify
      iconElement = (
        <Icon 
          icon={`simple-icons:${identifier}`}
          width={64}
          height={64}
          className="text-primary"
        />
      )
    } else if (type === 'upload') {
      // Uploaded custom icon
      iconElement = (
        <img
          src={`/api/icons/${identifier}`}
          alt={`${name} icon`}
          width={64}
          height={64}
          className="object-contain"
        />
      )
    }
  } catch {
    // Fallback icon if parsing fails
    iconElement = (
      <Icon 
        icon="material-symbols:bookmark"
        width={64}
        height={64}
        className="text-muted-foreground"
      />
    )
  }

  const tileSizeClass = layoutMode === 'bento-grid' ? `bento-tile-${tileSize}` : ''

  return (
    <div
      data-testid={`bookmark-card-${name}`}
      role="button"
      tabIndex={0}
      aria-label={`Open ${name}`}
      className={`group relative flex flex-col items-center gap-2 p-4 glass-surface hover:bg-accent/10 hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors duration-200 cursor-pointer ${tileSizeClass}`}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      style={{ minWidth: '120px', minHeight: '120px' }}
    >
      {/* Icon */}
      <div 
        data-testid="bookmark-icon"
        className="flex items-center justify-center"
        style={{ width: '64px', height: '64px' }}
      >
        {iconElement}
      </div>

      {/* Name */}
      <div 
        data-testid="bookmark-name"
        className="text-sm font-medium text-center text-foreground line-clamp-2 w-full px-1"
        title={name}
      >
        {name}
      </div>

      {/* Action buttons (shown on hover or keyboard focus within card) */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200">
        {onEdit && (
          <Button
            data-testid={`bookmark-edit-button-${name}`}
            variant="ghost"
            size="icon"
            className="h-8 w-8 bg-background/80 hover:bg-background"
            onClick={(e) => {
              e.stopPropagation()
              onEdit()
            }}
            aria-label={`Edit ${name}`}
          >
            <Edit className="h-4 w-4" />
          </Button>
        )}
        {onDelete && (
          <Button
            data-testid={`bookmark-delete-button-${name}`}
            variant="ghost"
            size="icon"
            className="h-8 w-8 bg-background/80 hover:bg-destructive hover:text-destructive-foreground"
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            aria-label={`Delete ${name}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Hidden link for SEO */}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      >
        {name} - {url}
      </a>

      {/* Tile size picker — bento grid mode only, shown on hover/focus */}
      {layoutMode === 'bento-grid' && onTileSizeChange && (
        <div
          className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity flex rounded-md overflow-hidden border border-border"
          role="group"
          aria-label={`Tile size for ${name}`}
          onClick={(e) => e.stopPropagation()}
        >
          {(['small', 'medium', 'large'] as TileSize[]).map((size, i) => (
            <button
              key={size}
              data-testid={i === 0 ? 'tile-size-select' : undefined}
              aria-label={`${size} tile`}
              aria-pressed={tileSize === size}
              onClick={(e) => {
                e.stopPropagation()
                onTileSizeChange(size)
              }}
              className={`text-xs px-1.5 py-0.5 cursor-pointer transition-colors ${
                tileSize === size
                  ? 'bg-primary text-primary-foreground font-semibold'
                  : 'bg-background/80 text-muted-foreground hover:bg-background hover:text-foreground'
              }`}
            >
              {size[0].toUpperCase()}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
