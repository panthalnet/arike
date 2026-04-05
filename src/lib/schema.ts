import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

// Bookmark table
export const bookmarks = sqliteTable('bookmarks', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  url: text('url').notNull(),
  icon: text('icon').notNull(), // Format: builtin:material:name | builtin:simple:name | upload:uuid.ext
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
  selectedTheme: text('selected_theme').notNull().default('gruvbox'), // gruvbox | catppuccin | everforest
  customPrimary: text('custom_primary'), // hex color or null
  customBackground: text('custom_background'),
  customText: text('custom_text'),
  customBorder: text('custom_border'),
  searchProvider: text('search_provider').notNull().default('duckduckgo'), // duckduckgo | google | bing | brave
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
