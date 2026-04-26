# Design Document: Arike v1

## Overview

Arike is a self-hosted browser startup page. The v1 release provides:

- A real-time clock and configurable web search bar
- Bookmark management with icon support
- Collection-based bookmark organisation
- Full theme customisation (built-in + custom colors)
- **Modern glassmorphism theme** with wallpaper support and adjustable blur intensity
- **Bento Grid layout** with per-bookmark tile size controls (small / medium / large)
- Docker and Node.js CLI deployment

## Technology Decisions

### Next.js 16.2.2 with App Router

- **Rationale**: Server-side rendering ensures fast first paint (<2s target). App Router provides clean co-location of route handlers and UI. Stable ecosystem for self-hosting.
- **Alternatives rejected**: Express (too low-level, no SSR), Remix (good but less community support for self-hosting patterns).

### SQLite via Drizzle ORM

- **Rationale**: Single-file database, zero external dependencies, perfect for single-user self-hosted use. Drizzle provides typed queries and schema-as-code.
- **File location**: `./data/arike.db` (configurable via `DATA_DIR`).
- **Alternatives rejected**: PostgreSQL (too heavy for dashboard use case), file-based JSON (no transactions, slower queries at scale).

### Tailwind CSS + shadcn/ui

- **Rationale**: Tailwind enables rapid, consistent styling. shadcn/ui components are unstyled primitives that inherit the theme, giving full control without fighting a design system.
- **Alternatives rejected**: Material UI (opinionated, hard to theme), raw CSS (too slow for iteration).

### Iconify (Material Symbols + Simple Icons)

- **Rationale**: Apache 2.0 / MIT licensed, large icon sets, tree-shakeable, CSS `currentColor` inheritance for theme integration.
- **Icon reference format**: `builtin:material:<name>` | `builtin:simple:<name>` | `upload:<uuid>.<ext>`

### Docker: `node:20-alpine`

- **Rationale**: Standard, reproducible, lightweight (<150MB target).

---

## Architecture

```
src/
├── app/                     # Next.js App Router
│   ├── page.tsx             # Dashboard (server component, hydrates DashboardContent)
│   ├── layout.tsx           # Root layout + ThemeProvider
│   └── api/
│       ├── bookmarks/       # CRUD + collection membership
│       ├── collections/     # Collection CRUD
│       ├── icons/           # Upload + serve icons
│       ├── settings/        # Theme settings
│       └── health/          # Docker health check
├── components/
│   ├── clock.tsx            # Live clock (client component)
│   ├── search_bar.tsx       # Web search + live bookmark search dropdown
│   ├── settings_panel.tsx   # Theme + search provider settings
│   ├── dashboard_content.tsx  # Collection tabs + BookmarksGrid (client)
│   ├── collection_manager.tsx # Create/delete collections dialog
│   ├── bookmarks_grid.tsx   # Bookmark CRUD grid
│   ├── bookmark_card.tsx    # Individual bookmark card
│   ├── bookmark_form.tsx    # Add/edit bookmark dialog with IconPicker
│   ├── icon_picker.tsx      # Material / brand icon grid + upload
│   └── ui/                  # shadcn primitives
├── services/
│   ├── bookmark_service.ts  # Bookmark CRUD + collection membership
│   ├── collection_service.ts  # Collection CRUD + seed default
│   └── theme_service.ts     # Theme settings CRUD
└── lib/
    ├── db.ts                # SQLite + Drizzle init (WAL, foreign keys)
    ├── schema.ts            # Drizzle schema (bookmarks, collections, collectionBookmarks, themeSettings)
    ├── storage.ts           # Icon file system operations
    ├── migrate.ts           # Drizzle migrations + default seeding
    └── icon-utils.ts        # Icon reference validation/parsing
```

---

## Data Model

### bookmarks
| Column | Type | Notes |
|--------|------|-------|
| id | TEXT PK | UUID |
| name | TEXT | Display name (duplicates allowed) |
| url | TEXT | Must start with http:// or https:// |
| icon | TEXT | Icon reference string |
| created_at | INTEGER | Unix timestamp |
| updated_at | INTEGER | Unix timestamp |

### collections
| Column | Type | Notes |
|--------|------|-------|
| id | TEXT PK | UUID |
| name | TEXT UNIQUE | |
| order | INTEGER | Sort order |
| created_at | INTEGER | |
| updated_at | INTEGER | |

### collection_bookmarks (junction)
| Column | Type | Notes |
|--------|------|-------|
| collection_id | TEXT FK | Cascade delete |
| bookmark_id | TEXT FK | Cascade delete |
| order | INTEGER | Bookmark order within collection |

### theme_settings
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | Always 1 (single-user) |
| selected_theme | TEXT | gruvbox \| catppuccin \| everforest |
| custom_primary | TEXT | Hex color or null |
| custom_background | TEXT | Hex color or null |
| custom_text | TEXT | Hex color or null |
| custom_border | TEXT | Hex color or null |
| search_provider | TEXT | duckduckgo \| google \| bing \| brave |
| updated_at | INTEGER | |

---

## Key Design Decisions

### Multi-collection bookmarks (many-to-many)

Bookmarks can belong to multiple collections via the `collection_bookmarks` junction table. Deleting a collection cascades to remove its mappings but does NOT delete the bookmarks themselves.

### Icon reference format

Icons are stored as string references, never inlined:
- `builtin:material:<name>` — Material Symbols (Iconify)
- `builtin:simple:<name>` — Simple Icons / brand icons (Iconify)
- `upload:<uuid>.<ext>` — Custom uploaded file in `data/icons/`

If an uploaded icon is missing, the UI falls back to a default icon (graceful degradation, no user-visible error).

### Startup seeding

`src/lib/migrate.ts` → `initializeDefaults()` runs on every startup via `src/instrumentation.ts`. It idempotently creates the default "Bookmarks" collection and theme settings if they don't exist.

### Session-less, single-user

No authentication. All settings are installation-wide (single `theme_settings` row with `id = 1`). Designed for personal, self-hosted use.

### Performance

- Server-side initial data fetch (page.tsx is a React Server Component)
- WAL journal mode for SQLite concurrent reads during SSG
- Iconify icons are tree-shaken and loaded lazily on the client

---

## Testing Strategy

| Layer | Tool | Notes |
|-------|------|-------|
| Unit | Vitest + better-sqlite3 | Service logic with in-memory SQLite |
| E2E | Playwright | Full browser flows against running server |
| Accessibility | axe-core/playwright | WCAG AA automated scan |
| Types | tsc --noEmit | Compile-time safety |

Coverage target: 90%+ lines/functions/branches/statements.
