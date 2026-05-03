/**
 * Instrumentation hook - runs once when Next.js starts.
 * Node.js-specific modules (fs, path, better-sqlite3) are dynamically
 * imported inside the runtime guard so the Edge runtime never tries to
 * evaluate them at parse time.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return
    }

    console.log('🚀 Initializing Arike database...')

    try {
      const { runMigrations, initializeDefaults } = await import('./lib/migrate')

      runMigrations()
      initializeDefaults()

      console.log('✅ Database initialization complete')
    } catch (error) {
      console.error('❌ Database initialization failed:', error)
      throw error
    }
  }
}
