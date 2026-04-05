import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { db, sqlite } from './db'

// Run migrations
export function runMigrations() {
  try {
    console.log('Running migrations...')
    migrate(db, { migrationsFolder: './drizzle' })
    console.log('Migrations completed successfully')
  } catch (error) {
    console.error('Migration failed:', error)
    throw error
  }
}

// Initialize database with default data if empty
export function initializeDefaults() {
  try {
    // Check if theme settings exist
    const themeSetting = sqlite.prepare('SELECT * FROM theme_settings WHERE id = 1').get()
    
    if (!themeSetting) {
      console.log('Initializing default theme settings...')
      sqlite.prepare(`
        INSERT INTO theme_settings (id, selected_theme, search_provider)
        VALUES (1, 'gruvbox', 'duckduckgo')
      `).run()
    }

    // Check if default collection exists
    const collections = sqlite.prepare('SELECT COUNT(*) as count FROM collections').get() as { count: number }
    
    if (collections.count === 0) {
      console.log('Creating default collection...')
      const collectionId = crypto.randomUUID()
      sqlite.prepare(`
        INSERT INTO collections (id, name, "order")
        VALUES (?, 'Bookmarks', 0)
      `).run(collectionId)
    }

    console.log('Database initialization complete')
  } catch (error) {
    console.error('Failed to initialize defaults:', error)
    throw error
  }
}
