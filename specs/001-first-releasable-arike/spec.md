# Feature Specification: Arike First Release

**Feature Branch**: `001-first-releasable-arike`  
**Created**: 2026-04-04
**Last Updated**: 2026-04-05
**Status**: Requirements Review Complete  
**Input**: User description: "Build the first releasable version of Arike as a self-hosted, open-source browser startup page and personal dashboard for everyday users."

## Clarifications

### Session 2026-04-04
- Q: whether a bookmark can belong to multiple tabs? → A: Yes, it can and it is user's choice
- Q: how uploaded bookmark icons are stored and reused? → A: Store icon files in a persistent volume directory; store file path/ID in bookmark metadata.
- Q: whether theme settings are per user or app-wide? → A: Per user (Note: For the first release, as multi-user is excluded, this implies per-installation configuration).
- Q: what mobile behavior should be considered mandatory in release 1? → A: Single-column vertical stacking; touch-optimized UI; no mobile-specific navigation required.
- Q: rename tab groups to 'collections'? → A: Yes, rename 'tabs/groups' to 'collections'.
- Q: support command-line startup without Docker? → A: Yes, first-class command-line startup is supported in v1.
- Q: Which default icon packs are provided in the built-in icon library and what is the policy for their selection? → A: Two icon packs are included: Material Icons (Apache 2.0, 2000+ UI icons) and Simple Icons (CC0, 3000+ brand logos), both from icon-sets.iconify.design. Icons automatically inherit the theme's accent color for visual harmony.

## User Scenarios & Testing

### User Story 1 - Set Up and Configure Homepage (Priority: P1)

Users need to self-host Arike and configure it as their browser startup page to start their day.

**Why this priority**: Core value proposition for the first release.

**Independent Test**: Successfully deploy the application and confirm the homepage loads in a browser.

**Acceptance Scenarios**:

1. **Given** a fresh installation, **When** the user opens the application URL in a browser, **Then** the homepage displays:
   - Current date and time in the format "Day, Month DD, YYYY • HH:MM AM/PM" in the top-left corner
   - A centered search bar occupying 60% of viewport width (minimum 320px, maximum 800px)
   - An empty state message "Add your first bookmark to get started" with a prominent "+ Add Bookmark" button
   - All elements are keyboard accessible with visible focus indicators

2. **Given** the homepage is loaded, **When** the user updates the theme or search provider in settings, **Then**:
   - Changes are applied within 300ms without requiring page refresh
   - Theme colors update smoothly across all UI elements
   - Current application state (scroll position, open modals) is preserved
   - Screen readers announce "Theme updated" or "Search provider changed"

---

### User Story 2 - Bookmark Management (Priority: P1)

Users need to manage bookmarks to organize their frequently visited sites.

**Why this priority**: Fundamental feature for a browser homepage.

**Independent Test**: Successfully add, edit, and delete a bookmark.

**Acceptance Scenarios**:

1. **Given** the homepage, **When** the user adds a new bookmark with URL "https://example.com", name "Example", and icon selection, **Then**:
   - The bookmark appears in the current collection within 200ms
   - The bookmark displays the selected icon (64×64px) and name
   - The bookmark is clickable and opens the URL in a new tab
   - The bookmark has a minimum touch target of 44×44px on mobile
   - Keyboard users can navigate to and activate the bookmark

2. **Given** existing bookmarks, **When** the user deletes a bookmark, **Then**:
   - A confirmation dialog appears: "Delete '[bookmark name]'? This cannot be undone."
   - Upon confirmation, the bookmark is removed from UI and database within 200ms
   - If the bookmark was in multiple collections, it is removed from all of them
   - Screen readers announce "[Bookmark name] deleted"

3. **Given** a bookmark with an uploaded icon, **When** the user edits the bookmark, **Then**:
   - The edit modal pre-fills with current values (name, URL, icon)
   - The user can change the icon or keep the existing one
   - Changes are persisted immediately and reflected in all collections containing the bookmark

---

### User Story 3 - Organize Bookmarks (Priority: P2)

Users need to organize bookmarks into collections to maintain a clean homepage.

**Why this priority**: Essential for usability as the number of bookmarks grows.

**Independent Test**: Successfully create a collection and move bookmarks into it.

**Acceptance Scenarios**:

1. **Given** the homepage, **When** the user creates a new collection named "Work", **Then**:
   - The collection appears in the collection navigation bar
   - The collection is initially empty with message "No bookmarks yet. Add one to get started."
   - The collection name is editable by clicking an edit icon
   - Collections are displayed in creation order (newest last) with drag-to-reorder support

2. **Given** multiple collections ("Personal", "Work"), **When** the user assigns bookmark "GitHub" to collection "Work" only, **Then**:
   - "GitHub" appears in the "Work" collection view
   - "GitHub" does not appear in the "Personal" collection view
   - Switching between collections shows appropriate bookmarks within 100ms

3. **Given** an existing bookmark "Gmail", **When** the user assigns it to both "Personal" and "Work" collections, **Then**:
   - "Gmail" appears in both collection views
   - Editing "Gmail" in one collection updates it in all collections
   - Deleting "Gmail" removes it from all collections after confirmation

---

### Edge Cases & Error Handling

This section defines specific requirements for edge cases and error states:

#### Invalid URLs
- **Requirement**: System MUST validate URLs using a standard URL parser before saving
- **Behavior**: Display error message "Please enter a valid URL (e.g., https://example.com)" below the URL input field
- **Examples**: "example" (missing protocol), "ht!tp://bad" (invalid characters), "ftp://example.com" (unsupported protocol)
- **Accepted protocols**: http://, https://

#### Empty Collections
- **Requirement**: Collections with zero bookmarks MUST display an empty state
- **Behavior**: Show centered message "No bookmarks in this collection yet" with "+ Add Bookmark" button
- **Visual**: Gray icon (128×128px) above text, muted colors to indicate empty state

#### Duplicate Bookmark Names
- **Requirement**: System MUST allow multiple bookmarks with the same name (different URLs)
- **Behavior**: No validation error; bookmarks are distinguished by URL and icon
- **UI Treatment**: Show URL on hover/focus to help users differentiate

#### Missing Uploaded Icons
- **Requirement**: System MUST display a fallback icon when uploaded icon file is missing or corrupted
- **Fallback**: Default bookmark icon from built-in icon library
- **Logging**: Log warning "Icon file not found: [path]" for debugging
- **User notification**: No error shown to user; graceful degradation

#### Invalid Icon Uploads
- **Requirement**: System MUST validate icon uploads for format, size, and dimensions
- **Allowed formats**: PNG, JPEG, WebP, SVG
- **Max file size**: 2MB
- **Max dimensions**: 1024×1024px
- **Error message**: "Icon must be PNG/JPEG/WebP/SVG, under 2MB, and max 1024×1024px"

#### First Startup (Zero Data)
- **Requirement**: Fresh installation MUST initialize with sensible defaults
- **Default state**:
  - One collection named "Bookmarks" (empty)
  - Default theme: First theme in list (Gruvbox)
  - Default search provider: DuckDuckGo
  - Empty bookmark table in database
- **User experience**: Welcoming empty state with clear call-to-action

#### Mobile Layout Behavior
- **Requirement**: All UI elements MUST adapt to mobile viewports (≤768px width)
- **Layout changes**:
  - Single-column vertical stacking
  - Full-width search bar (100% - 32px padding)
  - Collection switcher: Horizontal scrollable tabs
  - Bookmarks: 2-column grid on mobile (1-column on very small <480px)
  - Settings panel: Full-screen overlay on mobile
  - Minimum touch targets: 44×44px (WCAG AA)

#### Long Bookmark Names/URLs
- **Requirement**: UI MUST handle excessively long text gracefully
- **Behavior**:
  - Bookmark names: Truncate at 50 characters, show ellipsis, full name on hover/focus
  - URLs in UI: Display domain only, full URL on hover/focus and in edit modal
  - No horizontal scrolling; text wraps or truncates appropriately

#### Data Corruption on Restart
- **Requirement**: System MUST handle corrupted or missing database gracefully
- **Behavior**:
  - Attempt to repair database on startup
  - If repair fails, back up corrupted file and initialize fresh database
  - Log error: "Database corrupted, initialized fresh database. Backup: [path]"
  - Show user notification: "Database could not be loaded. Starting fresh. Previous data backed up."

#### Maximum Limits
- **Requirement**: System SHOULD support reasonable limits
- **Limits**:
  - Collections: 50 max (UI warning at 40)
  - Bookmarks per collection: 500 max (UI warning at 400)
  - Bookmarks total: 1000 max (UI warning at 800)
  - Collection name length: 100 characters max
  - Bookmark name length: 200 characters max

## Requirements

### Functional Requirements

#### Core Homepage Features

- **FR-001**: System MUST display current date, time, search bar, and bookmark area on the homepage with the following specifications:
  - **Date/Time**: Top-left, format "Day, Month DD, YYYY • HH:MM AM/PM", updates every minute, 14px font size minimum
  - **Search Bar**: Centered horizontally, 60% viewport width (min 320px, max 800px), 48px height minimum
  - **Bookmark Area**: Below search bar, occupies remaining viewport height, scrollable if content exceeds viewport
  - **Visual Hierarchy**: Z-index layers: modals (100), settings panel (50), main content (1)

#### Bookmark Management

- **FR-002**: Users MUST be able to create, edit, and delete bookmarks through the UI with the following capabilities:
  - **Create**: Modal dialog with fields: Name (required, max 200 chars), URL (required, validated), Icon (required, from library or upload)
  - **Edit**: Same modal, pre-filled with current values, updates persist immediately across all collections
  - **Delete**: Confirmation dialog, removes from all collections and database
  - **Keyboard accessible**: All actions available via keyboard (Enter to save, Esc to cancel)

- **FR-003**: System MUST allow users to choose from a built-in icon library or upload custom icons:
  - **Built-in library**: Two icon packs included:
    - **Material Icons** (Apache 2.0): 2,000+ UI icons (navigation, actions, content types, communication)
    - **Simple Icons** (CC0): 3,000+ brand logos (GitHub, social media, dev tools, popular websites)
  - **Icon source**: icon-sets.iconify.design
  - **Theme integration**: Icons automatically inherit theme accent color via CSS `currentColor` for visual harmony
  - **Default icon**: Material Icons `bookmark_border` used when no icon selected or icon missing
  - **Library UI**: Searchable grid with pack filter (Material/Simple Icons), 40 icons per page, paginated, shows icon name on hover
  - **Upload**: File input accepting PNG/JPEG/WebP/SVG, max 2MB, max 1024×1024px
  - **Storage**: Uploaded icons persisted in `./data/icons/` directory, filename: `[uuid].[ext]`
  - **Metadata**: Bookmark stores icon reference as `builtin:material:[icon-name]`, `builtin:simple:[icon-name]`, or `upload:[uuid].[ext]`
  - **Display**: All icons rendered at 64×64px with object-fit:contain

#### Collections

- **FR-004**: Users MUST be able to organize bookmarks into multiple collections:
  - **Create collection**: Input field with validation (max 100 chars, no duplicates), default name "New Collection"
  - **Collection switching**: Horizontal tab navigation on desktop, scrollable tabs on mobile
  - **Bookmark assignment**: Multi-select checkbox interface, bookmark can belong to 0+ collections
  - **Collection order**: Drag-and-drop reordering of collection tabs (changes tab order), persisted to database  
    *(Note: Bookmark order within a collection is by creation time in v1; bookmark drag-and-drop reordering is out of scope)*
  - **Visual indicator**: Active collection highlighted, badge showing bookmark count

#### Search

- **FR-005**: Search bar MUST support both web search and bookmark search:
  - **Mode toggle**: Dropdown or toggle switch in search bar, shows current mode (Web/Bookmarks)
  - **Web search**: Opens selected provider in new tab with query: `[provider-url]?q=[encoded-query]`
  - **Bookmark search**: Live filtering as user types, searches name and URL, case-insensitive, highlights matches
  - **Empty results**: Show "No bookmarks found" message with option to search web instead
  - **Keyboard**: Enter submits web search, Arrow keys navigate bookmark results

- **FR-006**: Users MUST be able to select a search provider from a predefined list:
  - **Providers**: DuckDuckGo (default), Google, Bing, Brave Search
  - **Selection UI**: Dropdown in settings panel
  - **Persistence**: Selected provider saved to database, applied immediately
  - **Custom providers**: Out of scope for v1

#### Themes & Customization

- **FR-007**: UI MUST support built-in themes and custom color customization:
  - **Built-in themes**: Gruvbox (default), Catppuccin Mocha, Everforest Dark
  - **Custom colors**: User can override primary, background, text colors via color pickers
  - **Color properties**: Primary (buttons, links), Background (page, cards), Text (body, headings), Border (separators)
  - **Icon colors**: Icons automatically use theme accent color (Primary color property); custom accent colors apply to icons
  - **Application**: Theme changes apply immediately without page refresh, using CSS custom properties
  - **Persistence**: Theme selection and custom colors saved to database per-installation (single user in v1)
  - **Preview**: Live preview in settings panel as colors are adjusted

#### Data Persistence

- **FR-008**: System MUST persist all user data and preferences across restarts and redeployments:
  - **Database**: SQLite file at `./data/arike.db`
  - **Persisted entities**: Bookmarks, Collections, CollectionBookmark mappings, Theme settings, Search provider preference
  - **Atomicity**: All write operations use transactions
  - **Backup**: Database backed up on corrupted read to `./data/arike.db.backup.[timestamp]`
  - **Migration**: Schema version tracked, automatic migrations on startup (v1 schema is initial)

#### Mobile Responsiveness

- **FR-009**: Mobile interface MUST use a single-column vertical layout with touch optimization:
  - **Breakpoint**: Mobile behavior applies at ≤768px viewport width
  - **Layout**: Single column, full-width elements with 16px horizontal padding
  - **Touch targets**: Minimum 44×44px for all interactive elements (WCAG AA compliance)
  - **Spacing**: Minimum 8px between adjacent interactive elements
  - **Collections**: Horizontal scrollable tabs, swipe gestures enabled
  - **Keyboard**: Mobile keyboard appears when search input focused
    - **Keyboard type**: `inputMode="search"` for search-optimized keyboard layout
    - **Action button**: "Go" or "Search" button on keyboard (browser default behavior)
    - **Autocomplete**: `autocomplete="off"` to prevent browser autofill suggestions
  - **Orientation**: Support both portrait and landscape, no layout breaks

#### Command-Line Deployment

- **FR-010**: System MUST support first-class command-line startup without Docker:
  - **Command**: `npm start` or `node server.js` (or equivalent for chosen framework)
  - **Port**: Default 3000, configurable via environment variable `PORT`
  - **Data location**: `./data/` directory in project root, created automatically if missing
  - **Shared data**: Same database file used for both Docker and command-line deployments
  - **Output**: Startup logs showing port, data directory, and ready message
  - **Shutdown**: Graceful shutdown on SIGINT/SIGTERM, closes database connections

### Non-Functional Requirements

#### Performance

- **NFR-001**: Homepage MUST load and render within 2 seconds (First Contentful Paint metric):
  - **Measurement**: Lighthouse Performance score ≥90 on desktop, ≥80 on mobile
  - **Optimization**: Code splitting, lazy loading for settings panel, optimized images
  - **Database**: Queries complete in <50ms (reasonable for local SQLite)

- **NFR-002**: UI interactions MUST feel responsive:
  - **Click response**: Visual feedback within 100ms
  - **Navigation**: Collection switching completes within 100ms
  - **Search**: Bookmark filtering results appear within 200ms of keystroke
  - **Theme application**: Color changes apply within 300ms

#### Accessibility (WCAG AA Compliance)

- **NFR-003**: Keyboard navigation MUST be fully functional:
  - **Tab order**: Logical top-to-bottom, left-to-right flow
  - **Focus indicators**: Visible outline with 3:1 contrast ratio (2px solid)
  - **Focus management**: Focus trapped in modals, restored to trigger element on close
  - **Shortcuts**: None required for v1 (all actions accessible via Tab/Enter/Esc)
  - **Skip link**: "Skip to main content" link for screen reader users

- **NFR-004**: Screen reader support MUST be comprehensive:
  - **Semantic HTML**: Proper heading hierarchy (h1 for page title, h2 for sections)
  - **ARIA labels**: All icons, buttons, and interactive elements labeled
  - **ARIA roles**: landmark roles for navigation, main, search
  - **ARIA live regions**: Announcements for dynamic updates (bookmark added, theme changed)
  - **Alt text**: All icons have descriptive alt attributes or aria-label

- **NFR-005**: Visual accessibility MUST meet WCAG AA standards:
  - **Color contrast**: 4.5:1 for normal text, 3:1 for large text and UI elements
  - **Text scaling**: Support 200% zoom without horizontal scrolling or layout breaks
  - **Color independence**: Information not conveyed by color alone (use icons + text)
  - **Focus states**: All interactive elements have distinct, high-contrast focus styles

- **NFR-006**: Motion and animation MUST respect user preferences:
  - **prefers-reduced-motion**: Disable all animations when this preference is set
  - **Animation types**: Fade (300ms), slide (200ms), scale (150ms)
  - **Essential animations**: None; all animations are decorative and can be disabled

#### Security

- **NFR-007**: Uploaded icons MUST be validated and sanitized:
  - **File type validation**: Check MIME type and file extension match
  - **Content scanning**: SVG files scanned for script tags, external references removed
  - **Size limits**: Enforce 2MB max size, reject larger files
  - **Storage**: Icons stored with generated UUID filenames, no user-provided filenames

- **NFR-008**: URLs MUST be validated before storage and navigation:
  - **Protocol whitelist**: Only http:// and https:// allowed
  - **XSS prevention**: URLs sanitized before rendering in HTML
  - **Target**: External URLs always open in new tab with rel="noopener noreferrer"

#### Browser Compatibility

- **NFR-009**: Application MUST support modern browsers:
  - **Supported**: Chrome/Edge ≥100, Firefox ≥100, Safari ≥15, Mobile Chrome ≥100, Mobile Safari ≥15
  - **Features**: ES2020, CSS Grid, CSS Custom Properties, Fetch API, LocalStorage
  - **Testing**: E2E tests run on latest Chrome and Firefox

#### Deployment

- **NFR-010**: Docker deployment MUST be simple and reliable:
  - **Image size**: Target <150MB compressed
  - **Base image**: node:20-alpine or similar lightweight base
  - **Ports**: Expose port 3000
  - **Volumes**: Mount `./data` volume for persistence
  - **Health check**: HTTP GET to `/health` returns 200 when ready

- **NFR-011**: Command-line deployment MUST have minimal prerequisites:
  - **Node.js**: Version 20 or higher required
  - **Dependencies**: Installed via `npm install`
  - **Environment**: Optional `.env` file for PORT configuration
  - **Documentation**: README includes command-line setup instructions

### Key Entities

- **Bookmark**: Represents a saved link
  - Fields: id (uuid), name (string, max 200 chars), url (string, validated), icon (string: builtin:[name] or upload:[uuid.ext]), created_at (timestamp), updated_at (timestamp)
  - Relationships: Many-to-many with Collection

- **Collection**: Represents a bookmark group
  - Fields: id (uuid), name (string, max 100 chars, unique), order (integer), created_at (timestamp), updated_at (timestamp)
  - Relationships: Many-to-many with Bookmark

- **CollectionBookmark**: Junction table for many-to-many relationship
  - Fields: collection_id (uuid, foreign key), bookmark_id (uuid, foreign key), order (integer)

- **ThemeSetting**: Represents theme customization
  - Fields: id (integer, always 1 for single-user), selected_theme (string: gruvbox|catppuccin|everforest), custom_primary (string, hex color or null), custom_background (string, hex color or null), custom_text (string, hex color or null), search_provider (string: duckduckgo|google|bing|brave), updated_at (timestamp)

## Success Criteria

### Measurable Outcomes

- **SC-001**: Users can set up and start using Arike in under 5 minutes:
  - **Docker**: `docker-compose up -d` + open browser = <2 minutes
  - **Command-line**: `npm install && npm start` + open browser = <4 minutes
  - **First bookmark**: Add first bookmark in <1 minute

- **SC-002**: Homepage loads in under 2 seconds (First Contentful Paint):
  - **Measurement**: Lighthouse Performance score ≥90 (desktop), ≥80 (mobile)
  - **Network**: Tested on simulated 3G connection (mobile) and DSL (desktop)

- **SC-003**: 100% of user data and preferences persist across application restarts:
  - **Test**: Create bookmarks, collections, change theme → restart → verify all data present
  - **Coverage**: All entities and user preferences

- **SC-004**: Homepage is fully functional and responsive on both desktop (≥1024px) and mobile (≤768px):
  - **Desktop**: Multi-column bookmark grid, horizontal collection tabs
  - **Mobile**: Single-column layout, scrollable collection tabs, 44×44px touch targets
  - **Testing**: Automated responsive tests in Playwright at 1920×1080, 768×1024, 375×667

- **SC-005**: Users can start Arike from command line and access same persisted data:
  - **Test**: Start via Docker, create data → stop → start via command-line → verify data present
  - **Data location**: `./data/` directory shared between both deployment modes

## Assumptions

- **Technical Prerequisites**: Users can run Docker OR have Node.js 20+ installed and can execute npm commands
- **Browser Support**: Users access Arike on modern browsers (Chrome/Firefox/Safari released in last 2 years)
- **Network**: Application runs locally; no reliance on external services (offline-capable after initial load)
- **Single User**: One person using the instance; no concurrent editing or multi-user features
- **English Language**: UI text in English only for v1
- **Default Settings**: Gruvbox theme and DuckDuckGo search provider are acceptable defaults for most users
- **Icon Library**: Material Icons (2,000+ UI icons) + Simple Icons (3,000+ brand logos) provides sufficient variety covering UI elements, brands, and general web contexts
- **Storage**: Local disk has at least 100MB free space for database and uploaded icons

## Out of Scope (Explicitly Excluded from v1)

- RSS/news feed integrations
- CalDAV calendar sync
- Browser extensions
- Read-later functionality
- Multi-user support or authentication
- Custom search provider URLs
- Import/export of bookmarks
- Bookmark tags or advanced filtering
- Bookmark visit tracking/analytics
- Drag-and-drop bookmark reordering within collections (order is by creation time)
- Keyboard shortcuts (beyond standard navigation)
- Dark/light mode auto-switching based on system preference
- Backup/restore UI
- Internationalization (i18n)
- Cloud sync or remote backup
