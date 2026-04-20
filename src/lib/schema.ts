import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

// Bookmark table
export const bookmarks = sqliteTable('bookmarks', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  url: text('url').notNull(),
  icon: text('icon').notNull(), // Format: builtin:material:name | builtin:simple:name | upload:uuid.ext
  tileSize: text('tile_size').notNull().default('medium'), // small | medium | large (Bento Grid)
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
})

// Collection table (formerly tabs/groups)
export const collections = sqliteTable('collections', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  order: integer('order').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
})

// Junction table for many-to-many relationship
export const collectionBookmarks = sqliteTable('collection_bookmarks', {
  collectionId: text('collection_id').notNull().references(() => collections.id, { onDelete: 'cascade' }),
  bookmarkId: text('bookmark_id').notNull().references(() => bookmarks.id, { onDelete: 'cascade' }),
  order: integer('order').notNull(),
})

// Theme settings table
export const themeSettings = sqliteTable('theme_settings', {
  id: integer('id').primaryKey(), // Always 1 for single-user v1
  selectedTheme: text('selected_theme').notNull().default('gruvbox'), // gruvbox | catppuccin | everforest | modern
  customPrimary: text('custom_primary'), // hex color or null
  customBackground: text('custom_background'),
  customText: text('custom_text'),
  customBorder: text('custom_border'),
  searchProvider: text('search_provider').notNull().default('duckduckgo'), // duckduckgo | google | bing | brave
  blurIntensity: integer('blur_intensity').notNull().default(12), // 8–20px; Modern theme only
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
})

// Wallpaper assets table (Modern theme backgrounds)
export const wallpaperAssets = sqliteTable('wallpaper_assets', {
  id: text('id').primaryKey(), // UUID
  sourceType: text('source_type').notNull(), // 'upload' | 'builtin'
  sourceReference: text('source_reference').notNull(), // filename or symbolic name
  filePath: text('file_path'), // null for builtins
  displayName: text('display_name').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
})

// Layout preferences table (uniform-grid | bento-grid)
export const layoutPreferences = sqliteTable('layout_preferences', {
  id: integer('id').primaryKey(), // Always 1 for single-user v1
  layoutMode: text('layout_mode').notNull().default('uniform-grid'), // 'uniform-grid' | 'bento-grid'
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
})

// Type exports for TypeScript
export type Bookmark = typeof bookmarks.$inferSelect
export type NewBookmark = typeof bookmarks.$inferInsert

export type Collection = typeof collections.$inferSelect
export type NewCollection = typeof collections.$inferInsert

export type CollectionBookmark = typeof collectionBookmarks.$inferSelect
export type NewCollectionBookmark = typeof collectionBookmarks.$inferInsert

export type ThemeSetting = typeof themeSettings.$inferSelect
export type NewThemeSetting = typeof themeSettings.$inferInsert

export type WallpaperAsset = typeof wallpaperAssets.$inferSelect
export type NewWallpaperAsset = typeof wallpaperAssets.$inferInsert

export type LayoutPreference = typeof layoutPreferences.$inferSelect
export type NewLayoutPreference = typeof layoutPreferences.$inferInsert
