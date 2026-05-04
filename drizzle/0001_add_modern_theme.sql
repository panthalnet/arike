-- Migration: 0001_add_modern_theme
-- Adds Modern theme support: blur intensity, wallpaper assets, layout preferences, and bookmark tile size

-- Phase 1 (US1/US5): Add blur_intensity to theme_settings
ALTER TABLE theme_settings ADD COLUMN blur_intensity INTEGER NOT NULL DEFAULT 12;
--> statement-breakpoint

-- Phase 2 (US2): Add wallpaper_assets table
CREATE TABLE IF NOT EXISTS wallpaper_assets (
  id TEXT PRIMARY KEY, -- UUID
  source_type TEXT NOT NULL CHECK(source_type IN ('upload', 'builtin')),
  source_reference TEXT NOT NULL, -- filename for uploads, symbolic name for builtins
  file_path TEXT, -- NULL for builtins
  display_name TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 0 CHECK(is_active IN (0, 1)),
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);
--> statement-breakpoint

-- Seed built-in wallpapers
INSERT OR IGNORE INTO wallpaper_assets (id, source_type, source_reference, file_path, display_name, is_active)
VALUES
  ('builtin-1', 'builtin', 'gradient-ocean',  NULL, 'Ocean Gradient',  0),
  ('builtin-2', 'builtin', 'gradient-forest', NULL, 'Forest Gradient', 0),
  ('builtin-3', 'builtin', 'gradient-sunset', NULL, 'Sunset Gradient', 0);
--> statement-breakpoint

-- Phase 3 (US3): Add layout_preferences table
CREATE TABLE IF NOT EXISTS layout_preferences (
  id INTEGER PRIMARY KEY, -- Always 1 for single-user v1
  layout_mode TEXT NOT NULL DEFAULT 'uniform-grid' CHECK(layout_mode IN ('uniform-grid', 'bento-grid')),
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);
--> statement-breakpoint

-- Seed singleton layout preference
INSERT OR IGNORE INTO layout_preferences (id, layout_mode) VALUES (1, 'uniform-grid');
--> statement-breakpoint

-- Phase 4 (US4): Add tile_size column to bookmarks
ALTER TABLE bookmarks ADD COLUMN tile_size TEXT NOT NULL DEFAULT 'medium' CHECK(tile_size IN ('small', 'medium', 'large'));
