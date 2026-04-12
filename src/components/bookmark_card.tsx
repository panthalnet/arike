'use client'

import { Icon } from '@iconify/react'
import { Edit, Trash2 } from 'lucide-react'
import { parseIconReference } from '@/lib/icon-utils'
import { Button } from '@/components/ui/button'

type BookmarkCardProps = {
  id: string
  name: string
  url: string
  icon: string
  onEdit?: () => void
  onDelete?: () => void
}

/**
 * Bookmark Card Component
 * Displays individual bookmark with icon, name, and action buttons
 * Meets FR-002 requirements: 64x64px icon, 44x44px touch target, clickable
 */
export function BookmarkCard({
  id,
  name,
  url,
  icon,
  onEdit,
  onDelete,
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
          className="text-accent"
        />
      )
    } else if (type === 'simple') {
      // Simple Icons from Iconify
      iconElement = (
        <Icon 
          icon={`simple-icons:${identifier}`}
          width={64}
          height={64}
          className="text-accent"
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
  } catch (error) {
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

  return (
    <div
      data-testid={`bookmark-card-${name}`}
      role="button"
      tabIndex={0}
      aria-label={`Open ${name}`}
      className="group relative flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-border bg-card hover:bg-accent/10 hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors duration-200 cursor-pointer"
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

      {/* Action buttons (shown on hover) */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
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
    </div>
  )
}
