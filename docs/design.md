# Design Document: Arike v1

## Overview

Arike is a self-hosted browser startup page. The v1 release provides:

- A real-time clock and configurable web search bar
- Bookmark management with icon support
- Collection-based bookmark organisation
- Full theme customisation (built-in + custom colors)
- **Modern glassmorphism theme** with wallpaper support and adjustable blur intensity
- **Layout modes**: Uniform Grid (equal-size tiles) and Bento Grid (per-bookmark tile sizes: small / medium / large)
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
│       ├── collections/     # Collection CRUD + reorder
│       ├── icons/           # Upload + serve icons
│       ├── settings/        # Theme + search provider settings
│       ├── layout/          # Layout mode preference
│       ├── wallpapers/      # Wallpaper upload, list, activate, delete
│       └── health/          # Docker health check
├── components/
│   ├── clock.tsx            # Live clock (client component)
│   ├── search_bar.tsx       # Web search + live bookmark search dropdown
│   ├── settings_panel.tsx   # Theme, search provider, blur, layout settings
│   ├── dashboard_content.tsx  # Collection tabs + BookmarksGrid (client)
│   ├── collection_manager.tsx # Create/delete collections dialog
│   ├── bookmarks_grid.tsx   # Bookmark CRUD grid (Uniform Grid + Bento Grid)
│   ├── bookmark_card.tsx    # Individual bookmark card (tile size aware)
│   ├── bookmark_form.tsx    # Add/edit bookmark dialog with IconPicker
│   ├── icon_picker.tsx      # Material / brand icon grid + upload
│   ├── wallpaper_uploader.tsx # Wallpaper upload + activate/deactivate
│   ├── theme-provider.tsx   # Single source of truth for DOM theme mutations
│   └── ui/                  # shadcn primitives
├── services/
│   ├── bookmark_service.ts  # Bookmark CRUD + collection membership
│   ├── collection_service.ts  # Collection CRUD + seed default
│   ├── theme_service.ts     # Theme settings CRUD
│   ├── wallpaper_service.ts # Wallpaper upload, activate, delete
│   ├── layout_service.ts    # Layout mode preference CRUD
│   └── tile_size_service.ts # Per-bookmark tile size updates
└── lib/
    ├── db.ts                # SQLite + Drizzle init (WAL, foreign keys)
    ├── schema.ts            # Drizzle schema (all tables)
    ├── storage.ts           # Icon + wallpaper file system operations
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
| tile_size | TEXT | `small` \| `medium` \| `large`; default `medium` (Bento Grid) |
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
| selected_theme | TEXT | `gruvbox` \| `catppuccin` \| `everforest` \| `modern` |
| custom_primary | TEXT | Hex color or null |
| custom_background | TEXT | Hex color or null |
| custom_text | TEXT | Hex color or null |
| custom_border | TEXT | Hex color or null |
| search_provider | TEXT | `duckduckgo` \| `google` \| `bing` \| `brave` |
| blur_intensity | INTEGER | 8–20 (px); Modern theme glass blur; default 12 |
| updated_at | INTEGER | |

### wallpaper_assets
| Column | Type | Notes |
|--------|------|-------|
| id | TEXT PK | UUID |
| source_type | TEXT | `upload` \| `builtin` |
| source_reference | TEXT | Filename or symbolic name |
| file_path | TEXT | Null for builtins; server-internal, never sent to clients |
| display_name | TEXT | Human-readable label |
| is_active | INTEGER | Boolean; at most one row true at a time |
| created_at | INTEGER | |
| updated_at | INTEGER | |

### layout_preferences
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | Always 1 (single-user) |
| layout_mode | TEXT | `uniform-grid` \| `bento-grid`; default `uniform-grid` |
| created_at | INTEGER | |
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

`src/lib/migrate.ts` → `initializeDefaults()` runs on every startup via `src/instrumentation.ts`. It idempotently creates the default “Bookmarks” collection, theme settings row, and layout preferences row if they don’t exist.

### Modern theme and glassmorphism

The Modern theme applies CSS backdrop-filter blur and translucent surfaces to all card elements. All glassmorphism rules in `src/styles/theme/glassmorphism.css` are scoped under `[data-theme="modern"]` to prevent any visual side effects on Gruvbox, Catppuccin, and Everforest.

Blur intensity is stored as an integer (px) in `theme_settings.blur_intensity` (range 8–20, default 12) and applied as the `--glass-blur` CSS custom property at runtime by `ThemeProvider`.

### Wallpaper support

Wallpapers are stored in `data/wallpapers/`. Built-in wallpapers use `source_type = 'builtin'` (gradient CSS values, no file) while uploaded wallpapers use `source_type = 'upload'` with a server-local `file_path`. The `file_path` column is **never returned to clients** — the API strips it before responding. Clients reference wallpapers by UUID and fetch image data via `/api/wallpapers/file/[id]`.

At most one wallpaper is active (`is_active = true`) at a time; activating a wallpaper deactivates all others in a single transaction.

### Layout modes

Layout mode (`uniform-grid` or `bento-grid`) is stored in the `layout_preferences` singleton table (id = 1). In Uniform Grid all bookmark tiles are the same size. In Bento Grid each bookmark has an individual `tile_size` (`small` / `medium` / `large`) stored on the `bookmarks` table. Selecting the Modern theme defaults new users to Bento Grid; switching to another theme retains the current layout.

### ThemeProvider

`src/components/theme-provider.tsx` is the single source of truth for all DOM theme mutations. It owns writes to the `data-theme` attribute on `<html>`, the `--glass-blur` CSS variable, the `--theme-background` variable (wallpaper CSS value), and all custom color CSS variables. Child components call context setters (`setTheme`, `setBlurIntensity`, `setActiveWallpaper`) after a successful API save; the provider's `useEffect` then applies the changes to the DOM.

### Session-less, single-user

No authentication. All settings are installation-wide. Designed for personal, self-hosted use.

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

---

## Brand Assets

### Icon Concept

The Arike icon depicts a **home and bookmark side-by-side** — a literal representation of the app's two core capabilities: a personal dashboard (home) and a bookmarks manager. The home shape is a minimal house silhouette; the bookmark is a classic ribbon-tab shape. Together they communicate the app's purpose at a glance without relying on abstract metaphor.

### Design Specifications

| Attribute | Value |
|-----------|-------|
| Icon concept | Home + bookmark side-by-side — dashboard and bookmarks |
| Dark variant bg | `#303437` (dark charcoal) |
| Home outline | `#5BA298` (teal) |
| Bookmark shape | `#CB6C40` / `#8C4E2F` (burnt orange / brown) |
| Light variant bg | Transparent; `#DADBDB` (light grey) icon background |
| Light variant accent | `#5DA298` (teal), `#8F4F2E` (brown) |
| Artboard | 1024×1024 px SVG viewBox |
| Style | Flat icon, minimal, home silhouette + bookmark ribbon |

### Asset Variants

| File | Usage |
|------|-------|
| `docs/brand/arike-icon-dark.svg` | Canonical dark master (source for all derived raster assets) |
| `docs/brand/arike-icon-light.svg` | Light/transparent variant — README, documentation on white backgrounds |

### Generation Platform

Assets generated via Recraft.ai Basic plan (2026-05-16). Full commercial rights retained by the owner per Recraft.ai paid-tier terms. License: safe for MIT open-source redistribution.

### Derivation Pipeline

All derived raster assets are generated from `docs/brand/arike-icon-dark.svg` via `npm run generate-icons` (uses `sharp`):

```
docs/brand/arike-icon-dark.svg
    ├── src/app/favicon.ico         (16×16 + 32×32 ICO)
    ├── src/app/icon.svg            (copy, scalable)
    ├── src/app/icon.png            (512×512 PNG)
    ├── src/app/apple-icon.png      (180×180 PNG)
    ├── src/app/opengraph-image.png (1200×630 PNG)
    ├── public/icon-192.png         (192×192 PNG)
    └── public/icon-512.png         (512×512 PNG)
```

### Placement Map

| Asset | Where used |
|-------|-----------|
| `src/app/favicon.ico` | Browser tab favicon (Next.js auto-serves at `/favicon.ico`) |
| `src/app/icon.svg` | SVG favicon (modern browsers) |
| `src/app/icon.png` | Primary tab icon (512×512) |
| `src/app/apple-icon.png` | iOS home screen shortcut |
| `src/app/opengraph-image.png` | Social sharing preview (Open Graph / Twitter card) |
| `public/icon-192.png` + `public/icon-512.png` | PWA manifest icons |
| `docs/brand/arike-icon-light.svg` | README header logo (GitHub renders on white background) |

