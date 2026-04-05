import { runMigrations, initializeDefaults } from './lib/migrate'

/**
 * Instrumentation hook - runs once when Next.js starts
 * Ensures database is migrated and initialized with defaults
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    console.log('🚀 Initializing Arike database...')
    
    try {
      // Run database migrations
      runMigrations()
      
      // Initialize default data (theme settings, default collection)
      initializeDefaults()
      
      console.log('✅ Database initialization complete')
    } catch (error) {
      console.error('❌ Database initialization failed:', error)
      throw error
    }
  }
}
