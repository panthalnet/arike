# Data Model: Add Modern Theme

**Phase**: 1 (Design phase)  
**Feature**: Add Modern Theme  
**Created**: 2026-04-19

## Entity: ModernThemePreference

**Purpose**: Stores user's theme selection, Modern-specific token customizations, and blur intensity preference.

**Fields**:
- `id` (integer, PRIMARY KEY): Always 1 in v1 (single user)
- `selected_theme` (string, enum): One of 'gruvbox' | 'catppuccin' | 'everforest' | 'modern'
- `custom_primary` (string, nullable): Hex color override for primary accent (e.g., '#38bdf8')
- `custom_background` (string, nullable): Hex color override for background
- `custom_text` (string, nullable): Hex color override for text
- `blur_intensity` (integer): Blur amount in pixels; range 8–20; default 12
- `created_at` (timestamp): When preference record was created
- `updated_at` (timestamp): When any field was last modified

**Relationships**:
- 1-to-1 with application state (only one active theme at a time)
- No foreign keys (self-contained)

**Constraints**:
- `id` is always 1; application enforces singleton
- `selected_theme` validated against enum whitelist
- `blur_intensity` constraint: 8 ≤ value ≤ 20
- `custom_*` values must be valid hex colors or NULL

**Example Data**:
```json
{
  "id": 1,
  "selected_theme": "modern",
  "custom_primary": "#a78bfa",
  "custom_background": null,
  "custom_text": null,
  "blur_intensity": 14,
  "created_at": "2026-04-19T10:00:00Z",
  "updated_at": "2026-04-19T10:05:00Z"
}
```

---

## Entity: WallpaperAsset

**Purpose**: Represents a wallpaper background image—either user-uploaded or built-in.

**Fields**:
- `id` (uuid, PRIMARY KEY): Unique wallpaper identifier
- `source_type` (string, enum): 'upload' | 'builtin'
- `source_reference` (string): File path or built-in name
  - For uploads: UUID filename (e.g., 'a1b2c3d4.webp')
  - For built-ins: Symbolic name (e.g., 'gradient-ocean', 'gradient-forest')
- `file_path` (string, nullable): Absolute path to file on disk; null for built-ins
- `display_name` (string): User-facing name (e.g., "Ocean Gradient" or "My Wallpaper")
- `is_active` (boolean): Whether this wallpaper is currently selected
- `created_at` (timestamp): Upload or creation time
- `updated_at` (timestamp): Last modification time

**Relationships**:
- 0-to-many with ModernThemePreference (can upload multiple, only one active)
- No foreign key to theme (decoupled; wallpapers available to all themes)

**Constraints**:
- `id` must be UUID format
- `source_reference` must be non-empty string
- Exactly one wallpaper can have `is_active = true` (application enforces)
- `file_path` must be null for source_type='builtin'

**Example Data**:
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "source_type": "upload",
    "source_reference": "a1b2c3d4.webp",
    "file_path": "./data/wallpapers/a1b2c3d4.webp",
    "display_name": "Mountain Sunset",
    "is_active": true,
    "created_at": "2026-04-19T09:30:00Z",
    "updated_at": "2026-04-19T09:30:00Z"
  },
  {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "source_type": "builtin",
    "source_reference": "gradient-ocean",
    "file_path": null,
    "display_name": "Ocean Gradient",
    "is_active": false,
    "created_at": "2026-04-19T00:00:00Z",
    "updated_at": "2026-04-19T00:00:00Z"
  }
]
```

---

## Entity: LayoutPreference

**Purpose**: Stores the globally selected layout mode independently from theme selection.

**Fields**:
- `id` (integer, PRIMARY KEY): Always 1 in v1 (single user)
- `layout_mode` (string, enum): 'uniform-grid' | 'bento-grid'
- `created_at` (timestamp): When the preference record was created
- `updated_at` (timestamp): When the layout mode was last modified

**Relationships**:
- 1-to-1 with application state (only one active layout preference in v1)
- Independent from theme selection; theme service can set an initial default without owning the record

**Constraints**:
- `id` is always 1; application enforces singleton
- `layout_mode` validated against enum whitelist

**Example Data**:
```json
{
  "id": 1,
  "layout_mode": "bento-grid",
  "created_at": "2026-04-19T10:00:00Z",
  "updated_at": "2026-04-19T10:05:00Z"
}
```

---

## Entity: BookmarkTilePresentation

**Purpose**: Stores per-bookmark display preferences for the Modern theme when Bento Grid layout is active.

**Fields**:
- `id` (uuid, PRIMARY KEY): Unique identifier
- `bookmark_id` (uuid, FOREIGN KEY): Reference to Bookmark entity
- `tile_size` (string, enum): 'small' | 'medium' | 'large'
  - small: 1 grid column span
  - medium: 2 grid columns span
  - large: 3 grid columns span (2x2 on tablet, 1x2 fallback on mobile)
- `created_at` (timestamp): When preference was set
- `updated_at` (timestamp): When last modified

**Relationships**:
- Many-to-1 with Bookmark (each bookmark can have one tile size preference)
- Optional: Bookmarks without a record default to 'small'

**Constraints**:
- `bookmark_id` must reference an existing Bookmark
- `tile_size` validated against enum whitelist
- One record per bookmark (unique constraint on bookmark_id)

**Example Data**:
```json
[
  {
    "id": "660e8400-e29b-41d4-a716-446655440010",
    "bookmark_id": "550e8400-e29b-41d4-a716-446655440100",
    "tile_size": "large",
    "created_at": "2026-04-19T10:00:00Z",
    "updated_at": "2026-04-19T10:15:00Z"
  },
  {
    "id": "660e8400-e29b-41d4-a716-446655440011",
    "bookmark_id": "550e8400-e29b-41d4-a716-446655440101",
    "tile_size": "medium",
    "created_at": "2026-04-19T10:02:00Z",
    "updated_at": "2026-04-19T10:02:00Z"
  }
]
```

---

## Database Schema (Drizzle ORM)

```typescript
// Modern theme preference table
export const modernThemePreference = sqliteTable('modern_theme_preference', {
  id: integer('id').primaryKey({ autoIncrement: false }).notNull(), // Always 1
  selected_theme: text('selected_theme')
    .notNull()
    .default('gruvbox'),
  custom_primary: text('custom_primary'),
  custom_background: text('custom_background'),
  custom_text: text('custom_text'),
  blur_intensity: integer('blur_intensity').notNull().default(12),
  created_at: text('created_at').notNull(),
  updated_at: text('updated_at').notNull(),
});

// Wallpaper asset table
export const wallpaperAsset = sqliteTable('wallpaper_asset', {
  id: text('id').primaryKey().notNull(), // UUID
  source_type: text('source_type').notNull(), // 'upload' | 'builtin'
  source_reference: text('source_reference').notNull(),
  file_path: text('file_path'),
  display_name: text('display_name').notNull(),
  is_active: integer('is_active', { mode: 'boolean' }).notNull().default(false),
  created_at: text('created_at').notNull(),
  updated_at: text('updated_at').notNull(),
});

// Layout preference table
export const layoutPreference = sqliteTable('layout_preference', {
  id: integer('id').primaryKey({ autoIncrement: false }).notNull(), // Always 1
  layout_mode: text('layout_mode').notNull().default('uniform-grid'),
  created_at: text('created_at').notNull(),
  updated_at: text('updated_at').notNull(),
});

// Bookmark tile presentation table
export const bookmarkTilePresentation = sqliteTable(
  'bookmark_tile_presentation',
  {
    id: text('id').primaryKey().notNull(), // UUID
    bookmark_id: text('bookmark_id')
      .notNull()
      .references(() => bookmark.id, { onDelete: 'cascade' }),
    tile_size: text('tile_size').notNull().default('small'), // 'small' | 'medium' | 'large'
    created_at: text('created_at').notNull(),
    updated_at: text('updated_at').notNull(),
  },
  (table) => ({
    bookmarkIdUnique: uniqueIndex('bookmark_tile_presentation_bookmark_id_unique').on(table.bookmark_id),
  })
);
```

---

## Migrations

### Migration: `0001_add_modern_theme.sql`

```sql
-- Create ModernThemePreference table
CREATE TABLE IF NOT EXISTS modern_theme_preference (
  id INTEGER PRIMARY KEY NOT NULL,
  selected_theme TEXT NOT NULL DEFAULT 'gruvbox',
  custom_primary TEXT,
  custom_background TEXT,
  custom_text TEXT,
  blur_intensity INTEGER NOT NULL DEFAULT 12,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Initialize singleton row
INSERT INTO modern_theme_preference (id, selected_theme, blur_intensity, created_at, updated_at)
VALUES (1, 'gruvbox', 12, datetime('now'), datetime('now'));

-- Create LayoutPreference table
CREATE TABLE IF NOT EXISTS layout_preference (
  id INTEGER PRIMARY KEY NOT NULL,
  layout_mode TEXT NOT NULL DEFAULT 'uniform-grid',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Initialize singleton row
INSERT INTO layout_preference (id, layout_mode, created_at, updated_at)
VALUES (1, 'uniform-grid', datetime('now'), datetime('now'));

-- Create WallpaperAsset table
CREATE TABLE IF NOT EXISTS wallpaper_asset (
  id TEXT PRIMARY KEY NOT NULL,
  source_type TEXT NOT NULL,
  source_reference TEXT NOT NULL,
  file_path TEXT,
  display_name TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Insert built-in wallpapers
INSERT INTO wallpaper_asset (id, source_type, source_reference, display_name, created_at, updated_at)
VALUES
  ('builtin-1', 'builtin', 'gradient-ocean', 'Ocean Gradient', datetime('now'), datetime('now')),
  ('builtin-2', 'builtin', 'gradient-forest', 'Forest Gradient', datetime('now'), datetime('now')),
  ('builtin-3', 'builtin', 'gradient-sunset', 'Sunset Gradient', datetime('now'), datetime('now'));

-- Create BookmarkTilePresentation table
CREATE TABLE IF NOT EXISTS bookmark_tile_presentation (
  id TEXT PRIMARY KEY NOT NULL,
  bookmark_id TEXT NOT NULL UNIQUE,
  tile_size TEXT NOT NULL DEFAULT 'small',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (bookmark_id) REFERENCES bookmark(id) ON DELETE CASCADE
);

-- Add index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_wallpaper_is_active ON wallpaper_asset(is_active);
```

---

## Validation Rules

### ModernThemePreference
- `blur_intensity`: Must be integer between 8 and 20 (inclusive)
- `custom_primary`, `custom_background`, `custom_text`: If provided, must be valid hex color (#RRGGBB) or null
- Only one record exists (id=1 always)

### WallpaperAsset
- `source_type`: Must be 'upload' or 'builtin'
- For uploads: `file_path` must exist and be readable; file must be <2MB, ≤1024×1024px
- For built-ins: `file_path` must be null
- Only one record can have `is_active=true`

### LayoutPreference
- `layout_mode`: Must be 'uniform-grid' or 'bento-grid'
- Only one record exists (id=1 always)

### BookmarkTilePresentation
- `tile_size`: Must be 'small', 'medium', or 'large'
- `bookmark_id`: Must reference an existing Bookmark
- Unique constraint: Only one record per bookmark

---

**Status**: ✅ Data model complete. Ready for Phase 1 contracts and quickstart.
