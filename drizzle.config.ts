import type { Config } from 'drizzle-kit'
import path from 'path'

const DB_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data')

export default {
  schema: './src/lib/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: path.join(DB_DIR, 'arike.db'),
  },
} satisfies Config
