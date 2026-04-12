import React from 'react'

// Loading state component
export function Loading({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] p-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4" />
      <p className="text-sm text-foreground/60">{message}</p>
    </div>
  )
}

// Error state component
export function ErrorState({ 
  message = 'Something went wrong',
  onRetry,
}: { 
  message?: string
  onRetry?: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] p-8">
      <div className="text-4xl mb-4">⚠️</div>
      <p className="text-sm text-foreground/80 mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity"
        >
          Retry
        </button>
      )}
    </div>
  )
}

// Empty state component
export function EmptyState({
  icon = '📦',
  title = 'No items yet',
  description,
  action,
}: {
  icon?: string
  title?: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] p-8 text-center">
      <div className="text-6xl mb-4 opacity-50">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-foreground/60 mb-4 max-w-md">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
