import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import path from 'path'
import fs from 'fs'

// Database file location
const DB_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data')
const DB_PATH = path.join(DB_DIR, 'arike.db')

// Ensure data directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true })
  console.log(`Created data directory: ${DB_DIR}`)
}

// Initialize SQLite database
const sqlite = new Database(DB_PATH)

// Enable WAL mode for better concurrent access
sqlite.pragma('journal_mode = WAL')

// Enable foreign keys
sqlite.pragma('foreign_keys = ON')

// Initialize Drizzle ORM
export const db = drizzle(sqlite)

// Export raw SQLite instance for transactions
export { sqlite }

console.log(`Database initialized: ${DB_PATH}`)
