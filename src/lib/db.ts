import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import path from 'path'
import fs from 'fs'

const SQLITE_BUSY_TIMEOUT_MS = 5000
const IS_NEXT_PRODUCTION_BUILD = process.env.NEXT_PHASE === 'phase-production-build'

// Database file location
// Stored in a 'db' subdirectory of DATA_DIR so the container entrypoint
// can chown just that subdirectory without touching the bind-mount root.
const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data')
const DB_DIR = path.join(DATA_DIR, 'db')
const DB_PATH = path.join(DB_DIR, 'arike.db')

// Ensure db subdirectory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true })
  if (process.env.NODE_ENV !== 'test') {
    console.log(`Created data directory: ${DB_DIR}`)
  }
}

// Initialize SQLite database
const sqlite = new Database(DB_PATH, { timeout: SQLITE_BUSY_TIMEOUT_MS })

// Wait briefly when another process holds a write lock.
sqlite.pragma(`busy_timeout = ${SQLITE_BUSY_TIMEOUT_MS}`)

// Enable WAL mode for better concurrent access
// Skip in `next build` where concurrent workers can contend on startup.
if (!IS_NEXT_PRODUCTION_BUILD) {
  sqlite.pragma('journal_mode = WAL')
}

// Enable foreign keys
sqlite.pragma('foreign_keys = ON')

// Initialize Drizzle ORM
export const db = drizzle(sqlite)

// Export raw SQLite instance for transactions
export { sqlite }

if (process.env.NODE_ENV !== 'test') {
  console.log(`Database initialized: ${DB_PATH}`)
}
