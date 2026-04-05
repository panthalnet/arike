'use client'

import { useState, useCallback, FormEvent, ChangeEvent } from 'react'
import { Search } from 'lucide-react'

type SearchBarProps = {
  searchProvider?: string
  onBookmarkSearch?: (query: string) => void
  bookmarks?: Array<{ id: string; name: string; url: string }>
}

/**
 * SearchBar component with web search and local bookmark filtering
 * Mobile-first design meeting FR-001 and FR-005 requirements
 * - Centered, 60% viewport width (320-800px), 48px height
 * - Web search opens in new tab
 * - Local bookmark search with live filtering
 */
export function SearchBar({ 
  searchProvider = 'duckduckgo',
  onBookmarkSearch,
  bookmarks = [],
}: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  // Search provider URL templates
  const searchProviderUrls: Record<string, string> = {
    duckduckgo: 'https://duckduckgo.com/?q=',
    google: 'https://www.google.com/search?q=',
    bing: 'https://www.bing.com/search?q=',
    brave: 'https://search.brave.com/search?q=',
  }

  const handleSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!query.trim()) return

    // Open web search in new tab
    const baseUrl = searchProviderUrls[searchProvider] || searchProviderUrls.duckduckgo
    const searchUrl = `${baseUrl}${encodeURIComponent(query.trim())}`
    window.open(searchUrl, '_blank', 'noopener,noreferrer')
    
    // Clear search after submission
    setQuery('')
  }, [query, searchProvider])

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value
    setQuery(newQuery)
    
    // Trigger local bookmark search if callback provided
    if (onBookmarkSearch) {
      onBookmarkSearch(newQuery)
    }
  }, [onBookmarkSearch])

  const handleFocus = useCallback(() => {
    setIsFocused(true)
  }, [])

  const handleBlur = useCallback(() => {
    setIsFocused(false)
  }, [])

  // Filter bookmarks for autocomplete suggestions (optional for v1)
  const filteredBookmarks = query.trim()
    ? bookmarks.filter(bookmark => 
        bookmark.name.toLowerCase().includes(query.toLowerCase()) ||
        bookmark.url.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5) // Show max 5 suggestions
    : []

  return (
    <div 
      data-testid="search-bar"
      className="w-full mx-auto"
      style={{
        maxWidth: '800px',
        width: '100%',
      }}
    >
      <form 
        onSubmit={handleSubmit}
        className="relative"
        role="search"
      >
        <div className="relative">
          <Search 
            className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none"
            aria-hidden="true"
          />
          <input
            data-testid="search-input"
            type="search"
            value={query}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder="Search the web or bookmarks..."
            autoComplete="off"
            spellCheck={false}
            className="w-full h-12 pl-12 pr-4 rounded-lg border-2 border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
            style={{
              minWidth: '320px',
              minHeight: '48px', // WCAG AA touch target
              fontSize: 'max(16px, 1rem)', // Prevent zoom on mobile iOS
            }}
            aria-label="Search the web or filter bookmarks"
            aria-describedby={isFocused && filteredBookmarks.length > 0 ? "search-suggestions" : undefined}
            // Mobile keyboard type
            inputMode="search"
          />
        </div>

        {/* Bookmark suggestions (optional feature for v1) */}
        {isFocused && filteredBookmarks.length > 0 && (
          <div
            id="search-suggestions"
            className="absolute z-10 w-full mt-2 bg-background border-2 border-border rounded-lg shadow-lg overflow-hidden"
            role="listbox"
            aria-label="Bookmark suggestions"
          >
            {filteredBookmarks.map((bookmark) => (
              <a
                key={bookmark.id}
                href={bookmark.url}
                className="block px-4 py-3 hover:bg-muted transition-colors duration-150 border-b border-border last:border-b-0"
                role="option"
                tabIndex={0}
              >
                <div className="font-medium text-foreground">{bookmark.name}</div>
                <div className="text-sm text-muted-foreground truncate">{bookmark.url}</div>
              </a>
            ))}
          </div>
        )}
      </form>

      {/* Screen reader announcement for bookmark filtering */}
      {query.trim() && onBookmarkSearch && (
        <div 
          role="status" 
          aria-live="polite" 
          aria-atomic="true"
          className="sr-only"
        >
          {filteredBookmarks.length > 0 
            ? `${filteredBookmarks.length} bookmark${filteredBookmarks.length === 1 ? '' : 's'} found`
            : 'No bookmarks found'
          }
        </div>
      )}
    </div>
  )
}
