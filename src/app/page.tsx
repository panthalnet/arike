import { Clock } from '@/components/clock'
import { SearchBar } from '@/components/search_bar'
import { SettingsPanel } from '@/components/settings_panel'
import { DashboardContent } from '@/components/dashboard_content'
import { getThemeSettings } from '@/services/theme_service'
import { getLayoutMode } from '@/services/layout_service'
import { getAllCollections } from '@/services/collection_service'
import { getAllBookmarks } from '@/services/bookmark_service'

/**
 * Homepage / Dashboard
 * Mobile-first single-column layout
 * Displays: Clock, SearchBar, Settings, Collection Tabs, and Bookmarks
 * Meets FR-001: date/time top-left, centered search bar, settings access
 * Meets FR-002: Bookmark management with grid display
 * Meets FR-004: Collection tabs with active filtering
 */
export default async function Home() {
  // Fetch all server-side data for initial render
  const [settings, collections, allBookmarks, layoutMode] = await Promise.all([
    getThemeSettings(),
    getAllCollections(),
    getAllBookmarks(),
    getLayoutMode(),
  ])

  return (
    <main className="min-h-screen w-full">
      {/* Header Section - Clock and Settings */}
      <header className="w-full px-4 py-6 md:px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-start">
          {/* Clock - top-left per spec */}
          <Clock />

          {/* Settings Button - top-right */}
          <SettingsPanel initialSettings={settings} initialLayoutMode={layoutMode} />
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

      {/* Bookmarks Section with Collection Tabs */}
      <section className="w-full px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <DashboardContent
            initialCollections={collections}
            initialBookmarks={allBookmarks}
            initialLayoutMode={layoutMode}
          />
        </div>
      </section>
    </main>
  )
}
