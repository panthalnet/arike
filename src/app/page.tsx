import { Clock } from '@/components/clock'
import { SearchBar } from '@/components/search_bar'
import { SettingsPanel } from '@/components/settings_panel'
import { getThemeSettings } from '@/services/theme_service'

/**
 * Homepage / Dashboard
 * Mobile-first single-column layout
 * Displays: Clock, SearchBar, Settings, and Bookmarks (to be added in Phase 4)
 * Meets FR-001 requirements: date/time top-left, centered search bar, settings access
 */
export default async function Home() {
  // Fetch theme settings server-side for initial render
  const settings = await getThemeSettings()

  return (
    <main className="min-h-screen w-full">
      {/* Header Section - Clock and Settings */}
      <header className="w-full px-4 py-6 md:px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-start">
          {/* Clock - top-left per spec */}
          <Clock />
          
          {/* Settings Button - top-right */}
          <SettingsPanel initialSettings={settings} />
        </div>
      </header>

      {/* Search Section - centered, prominent */}
      <section className="w-full px-4 py-8 md:py-12">
        <div className="max-w-7xl mx-auto flex justify-center">
          <div className="w-full" style={{ maxWidth: '800px' }}>
            <SearchBar searchProvider={settings.searchProvider} />
          </div>
        </div>
      </section>

      {/* Bookmarks Section - will be added in Phase 4 (User Story 2) */}
      <section className="w-full px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-16">
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
            <h2 className="text-xl font-semibold text-foreground mb-2">
              No bookmarks yet
            </h2>
            <p className="text-muted-foreground">
              Bookmark management coming in Phase 4
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
