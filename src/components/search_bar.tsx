'use client'

import { useState, useCallback, useRef, useEffect, FormEvent, KeyboardEvent } from 'react'
import { Search, ExternalLink } from 'lucide-react'
import { Icon } from '@iconify/react'

type BookmarkResult = {
  id: string
  name: string
  url: string
  icon: string
}

type SearchBarProps = {
  searchProvider?: string
}

const PROVIDER_URLS: Record<string, string> = {
  duckduckgo: 'https://duckduckgo.com/?q=',
  google: 'https://www.google.com/search?q=',
  bing: 'https://www.bing.com/search?q=',
  brave: 'https://search.brave.com/search?q=',
}

/**
 * SearchBar with live bookmark search dropdown
 * Per spec §FR-005:
 * - Web search opens in new tab
 * - Bookmark search: live filtering as user types, keyboard navigation,
 *   "No bookmarks found" empty state, highlight matched text
 * - 60% viewport width (320-800px), 48px height
 */
export function SearchBar({ searchProvider = 'duckduckgo' }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [bookmarkResults, setBookmarkResults] = useState<BookmarkResult[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Live bookmark search with debounce
  const searchBookmarks = useCallback(async (q: string) => {
    if (!q.trim()) {
      setBookmarkResults([])
      setShowDropdown(false)
      setHasSearched(false)
      return
    }

    setIsSearching(true)
    setHasSearched(false)

    try {
      const res = await fetch(`/api/bookmarks?search=${encodeURIComponent(q.trim())}`)
      if (res.ok) {
        const data: BookmarkResult[] = await res.json()
        setBookmarkResults(data.slice(0, 8)) // Max 8 suggestions
        setShowDropdown(true)
        setHasSearched(true)
        setActiveIndex(-1)
      }
    } catch {
      // Fail silently for search
    } finally {
      setIsSearching(false)
    }
  }, [])

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value
      setQuery(val)

      // Clear previous debounce
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)

      if (!val.trim()) {
        setBookmarkResults([])
        setShowDropdown(false)
        setHasSearched(false)
        return
      }

      // Show dropdown immediately with loading state
      setShowDropdown(true)
      searchTimeoutRef.current = setTimeout(() => {
        searchBookmarks(val)
      }, 150) // 150ms debounce for real-time feel
    },
    [searchBookmarks]
  )

  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault()

      // If a bookmark result is active, navigate to it
      if (activeIndex >= 0 && bookmarkResults[activeIndex]) {
        window.open(bookmarkResults[activeIndex].url, '_blank', 'noopener,noreferrer')
        setQuery('')
        setShowDropdown(false)
        return
      }

      if (!query.trim()) return

      // Web search
      const baseUrl = PROVIDER_URLS[searchProvider] ?? PROVIDER_URLS.duckduckgo
      window.open(`${baseUrl}${encodeURIComponent(query.trim())}`, '_blank', 'noopener,noreferrer')
      setQuery('')
      setShowDropdown(false)
    },
    [query, searchProvider, activeIndex, bookmarkResults]
  )

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (!showDropdown) return

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIndex((prev) => Math.min(prev + 1, bookmarkResults.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIndex((prev) => Math.max(prev - 1, -1))
      } else if (e.key === 'Escape') {
        setShowDropdown(false)
        setActiveIndex(-1)
      }
    },
    [showDropdown, bookmarkResults.length]
  )

  const handleBookmarkClick = useCallback((bookmark: BookmarkResult) => {
    window.open(bookmark.url, '_blank', 'noopener,noreferrer')
    setQuery('')
    setShowDropdown(false)
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        !inputRef.current?.contains(e.target as Node) &&
        !dropdownRef.current?.contains(e.target as Node)
      ) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    }
  }, [])

  // Highlight matched text in result
  const highlight = (text: string, q: string): React.ReactNode => {
    if (!q.trim()) return text
    const idx = text.toLowerCase().indexOf(q.toLowerCase())
    if (idx === -1) return text
    return (
      <>
        {text.slice(0, idx)}
        <mark className="bg-accent/30 text-foreground rounded">{text.slice(idx, idx + q.length)}</mark>
        {text.slice(idx + q.length)}
      </>
    )
  }

  const renderIcon = (icon: string) => {
    if (icon.startsWith('builtin:material:')) {
      return (
        <Icon
          icon={`material-symbols:${icon.replace('builtin:material:', '')}`}
          width={20}
          height={20}
          className="text-accent shrink-0"
          aria-hidden="true"
        />
      )
    }
    if (icon.startsWith('builtin:simple:')) {
      return (
        <Icon
          icon={`simple-icons:${icon.replace('builtin:simple:', '')}`}
          width={20}
          height={20}
          className="text-accent shrink-0"
          aria-hidden="true"
        />
      )
    }
    if (icon.startsWith('upload:')) {
      return (
        <img
          src={`/api/icons/${icon.replace('upload:', '')}`}
          alt=""
          width={20}
          height={20}
          className="object-contain shrink-0"
        />
      )
    }
    return null
  }

  const showEmptyState = hasSearched && bookmarkResults.length === 0 && query.trim() && !isSearching

  return (
    <div
      data-testid="search-bar"
      className="w-full mx-auto relative"
      style={{ maxWidth: '800px' }}
    >
      <form onSubmit={handleSubmit} role="search" className="relative">
        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none"
            aria-hidden="true"
          />
          <input
            ref={inputRef}
            data-testid="search-input"
            type="search"
            value={query}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (query.trim()) setShowDropdown(true)
            }}
            placeholder="Search the web or bookmarks..."
            autoComplete="off"
            spellCheck={false}
            inputMode="search"
            className="w-full h-12 pl-12 pr-12 rounded-lg border-2 border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
            style={{
              minWidth: '320px',
              minHeight: '48px',
              fontSize: 'max(16px, 1rem)',
            }}
            aria-label="Search the web or filter bookmarks"
            aria-autocomplete="list"
            aria-controls={showDropdown ? 'search-suggestions' : undefined}
            aria-activedescendant={activeIndex >= 0 ? `suggestion-${activeIndex}` : undefined}
            aria-expanded={showDropdown}
          />
          {isSearching && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" aria-hidden="true" />
            </div>
          )}
        </div>

        {/* Live search dropdown */}
        {showDropdown && query.trim() && (
          <div
            ref={dropdownRef}
            id="search-suggestions"
            data-testid="search-dropdown"
            role="listbox"
            aria-label="Bookmark suggestions"
            className="absolute z-50 w-full mt-2 bg-background border-2 border-border rounded-lg shadow-lg overflow-hidden"
          >
            {bookmarkResults.length > 0 ? (
              <>
                <div className="px-3 py-1.5 text-xs text-muted-foreground border-b border-border bg-muted/50">
                  Bookmarks
                </div>
                {bookmarkResults.map((bookmark, i) => (
                  <a
                    key={bookmark.id}
                    id={`suggestion-${i}`}
                    href={bookmark.url}
                    data-testid={`search-result-${bookmark.name}`}
                    role="option"
                    aria-selected={i === activeIndex}
                    onClick={(e) => {
                      e.preventDefault()
                      handleBookmarkClick(bookmark)
                    }}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`
                      flex items-center gap-3 px-4 py-3 transition-colors duration-100
                      border-b border-border last:border-b-0
                      ${i === activeIndex ? 'bg-accent/10' : 'hover:bg-muted'}
                    `}
                  >
                    <div className="flex items-center justify-center w-6 h-6 shrink-0">
                      {renderIcon(bookmark.icon)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-foreground text-sm truncate">
                        {highlight(bookmark.name, query)}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {new URL(bookmark.url).hostname}
                      </div>
                    </div>
                    <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0" aria-hidden="true" />
                  </a>
                ))}
                <div className="px-3 py-2 border-t border-border">
                  <button
                    type="submit"
                    className="w-full text-xs text-muted-foreground hover:text-foreground text-left flex items-center gap-2 py-1"
                  >
                    <Search className="h-3 w-3" aria-hidden="true" />
                    Search web for &quot;{query}&quot;
                  </button>
                </div>
              </>
            ) : showEmptyState ? (
              <div data-testid="search-empty-state" className="px-4 py-6 text-center space-y-2">
                <p className="text-sm font-medium text-foreground">No bookmarks found</p>
                <p className="text-xs text-muted-foreground">
                  No bookmarks match &quot;{query}&quot;
                </p>
                <button
                  type="submit"
                  className="text-xs text-primary hover:underline mt-1"
                >
                  Search the web instead →
                </button>
              </div>
            ) : null}
          </div>
        )}
      </form>

      {/* Screen reader announcements */}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {hasSearched && !isSearching && query.trim() && (
          bookmarkResults.length > 0
            ? `${bookmarkResults.length} bookmark${bookmarkResults.length === 1 ? '' : 's'} found`
            : 'No bookmarks found'
        )}
      </div>
    </div>
  )
}
