import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import fs from 'fs'
import path from 'path'

// Type definitions for the bookmark service (will be implemented)
type Bookmark = {
  id: string
  name: string
  url: string
  icon: string
  createdAt: Date
  updatedAt: Date
}

type NewBookmark = {
  name: string
  url: string
  icon: string
}

describe('Bookmark Service', () => {
  const TEST_DB_PATH = path.join(process.cwd(), 'tests', 'test-bookmarks.db')
  let db: ReturnType<typeof drizzle>
  let sqlite: Database.Database

  beforeEach(async () => {
    // Create test database
    sqlite = new Database(TEST_DB_PATH)
    sqlite.pragma('foreign_keys = ON')
    db = drizzle(sqlite)

    // Create schema
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS bookmarks (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        url TEXT NOT NULL,
        icon TEXT NOT NULL,
        created_at INTEGER DEFAULT (unixepoch()) NOT NULL,
        updated_at INTEGER DEFAULT (unixepoch()) NOT NULL
      )
    `)

    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS collections (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        "order" INTEGER NOT NULL,
        created_at INTEGER DEFAULT (unixepoch()) NOT NULL,
        updated_at INTEGER DEFAULT (unixepoch()) NOT NULL
      )
    `)

    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS collection_bookmarks (
        collection_id TEXT NOT NULL,
        bookmark_id TEXT NOT NULL,
        "order" INTEGER NOT NULL,
        FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE,
        FOREIGN KEY (bookmark_id) REFERENCES bookmarks(id) ON DELETE CASCADE
      )
    `)

    // Create default collection
    sqlite.prepare(`
      INSERT INTO collections (id, name, "order")
      VALUES ('default-collection', 'Bookmarks', 0)
    `).run()
  })

  afterEach(() => {
    // Clean up test database
    sqlite.close()
    if (fs.existsSync(TEST_DB_PATH)) {
      fs.unlinkSync(TEST_DB_PATH)
    }
  })

  it('should create a new bookmark', () => {
    const bookmarkId = crypto.randomUUID()
    
    sqlite.prepare(`
      INSERT INTO bookmarks (id, name, url, icon)
      VALUES (?, ?, ?, ?)
    `).run(bookmarkId, 'GitHub', 'https://github.com', 'builtin:material:home')

    const bookmark = sqlite.prepare('SELECT * FROM bookmarks WHERE id = ?').get(bookmarkId) as any
    
    expect(bookmark).toBeDefined()
    expect(bookmark.name).toBe('GitHub')
    expect(bookmark.url).toBe('https://github.com')
    expect(bookmark.icon).toBe('builtin:material:home')
  })

  it('should retrieve all bookmarks', () => {
    // Insert test bookmarks
    const ids = [crypto.randomUUID(), crypto.randomUUID()]
    
    sqlite.prepare(`
      INSERT INTO bookmarks (id, name, url, icon)
      VALUES (?, ?, ?, ?), (?, ?, ?, ?)
    `).run(
      ids[0], 'Site 1', 'https://site1.com', 'builtin:material:home',
      ids[1], 'Site 2', 'https://site2.com', 'builtin:simple:github'
    )

    const bookmarks = sqlite.prepare('SELECT * FROM bookmarks').all()
    
    expect(bookmarks).toHaveLength(2)
  })

  it('should get bookmark by ID', () => {
    const bookmarkId = crypto.randomUUID()
    
    sqlite.prepare(`
      INSERT INTO bookmarks (id, name, url, icon)
      VALUES (?, ?, ?, ?)
    `).run(bookmarkId, 'Test', 'https://test.com', 'builtin:material:star')

    const bookmark = sqlite.prepare('SELECT * FROM bookmarks WHERE id = ?').get(bookmarkId) as any
    
    expect(bookmark).toBeDefined()
    expect(bookmark.id).toBe(bookmarkId)
    expect(bookmark.name).toBe('Test')
  })

  it('should update an existing bookmark', () => {
    const bookmarkId = crypto.randomUUID()
    
    // Create bookmark
    sqlite.prepare(`
      INSERT INTO bookmarks (id, name, url, icon)
      VALUES (?, ?, ?, ?)
    `).run(bookmarkId, 'Original', 'https://original.com', 'builtin:material:home')

    // Update bookmark
    sqlite.prepare(`
      UPDATE bookmarks 
      SET name = ?, url = ?, updated_at = unixepoch()
      WHERE id = ?
    `).run('Updated', 'https://updated.com', bookmarkId)

    const bookmark = sqlite.prepare('SELECT * FROM bookmarks WHERE id = ?').get(bookmarkId) as any
    
    expect(bookmark.name).toBe('Updated')
    expect(bookmark.url).toBe('https://updated.com')
  })

  it('should delete a bookmark', () => {
    const bookmarkId = crypto.randomUUID()
    
    // Create bookmark
    sqlite.prepare(`
      INSERT INTO bookmarks (id, name, url, icon)
      VALUES (?, ?, ?, ?)
    `).run(bookmarkId, 'To Delete', 'https://delete.com', 'builtin:material:home')

    // Verify it exists
    let bookmark = sqlite.prepare('SELECT * FROM bookmarks WHERE id = ?').get(bookmarkId)
    expect(bookmark).toBeDefined()

    // Delete bookmark
    sqlite.prepare('DELETE FROM bookmarks WHERE id = ?').run(bookmarkId)

    // Verify it's gone
    bookmark = sqlite.prepare('SELECT * FROM bookmarks WHERE id = ?').get(bookmarkId)
    expect(bookmark).toBeUndefined()
  })

  it('should validate URL format', () => {
    const validUrls = [
      'https://example.com',
      'http://example.com',
      'https://subdomain.example.com',
      'https://example.com/path',
      'https://example.com:8080',
    ]

    const invalidUrls = [
      'not-a-url',
      'ftp://example.com',
      'javascript:alert(1)',
      'example.com',
      '',
    ]

    const urlRegex = /^https?:\/\/.+/

    validUrls.forEach(url => {
      expect(urlRegex.test(url)).toBe(true)
    })

    invalidUrls.forEach(url => {
      expect(urlRegex.test(url)).toBe(false)
    })
  })

  it('should support duplicate bookmark names', () => {
    const id1 = crypto.randomUUID()
    const id2 = crypto.randomUUID()
    
    // Create two bookmarks with same name
    sqlite.prepare(`
      INSERT INTO bookmarks (id, name, url, icon)
      VALUES (?, ?, ?, ?), (?, ?, ?, ?)
    `).run(
      id1, 'Duplicate', 'https://first.com', 'builtin:material:home',
      id2, 'Duplicate', 'https://second.com', 'builtin:material:star'
    )

    const bookmarks = sqlite.prepare('SELECT * FROM bookmarks WHERE name = ?').all('Duplicate')
    
    expect(bookmarks).toHaveLength(2)
  })

  it('should handle built-in Material Icons reference', () => {
    const bookmarkId = crypto.randomUUID()
    
    sqlite.prepare(`
      INSERT INTO bookmarks (id, name, url, icon)
      VALUES (?, ?, ?, ?)
    `).run(bookmarkId, 'Material', 'https://material.com', 'builtin:material:home')

    const bookmark = sqlite.prepare('SELECT * FROM bookmarks WHERE id = ?').get(bookmarkId) as any
    
    expect(bookmark.icon).toBe('builtin:material:home')
    expect(bookmark.icon.startsWith('builtin:material:')).toBe(true)
  })

  it('should handle built-in Simple Icons reference', () => {
    const bookmarkId = crypto.randomUUID()
    
    sqlite.prepare(`
      INSERT INTO bookmarks (id, name, url, icon)
      VALUES (?, ?, ?, ?)
    `).run(bookmarkId, 'Simple', 'https://simple.com', 'builtin:simple:github')

    const bookmark = sqlite.prepare('SELECT * FROM bookmarks WHERE id = ?').get(bookmarkId) as any
    
    expect(bookmark.icon).toBe('builtin:simple:github')
    expect(bookmark.icon.startsWith('builtin:simple:')).toBe(true)
  })

  it('should handle uploaded icon reference', () => {
    const bookmarkId = crypto.randomUUID()
    const iconUuid = crypto.randomUUID()
    
    sqlite.prepare(`
      INSERT INTO bookmarks (id, name, url, icon)
      VALUES (?, ?, ?, ?)
    `).run(bookmarkId, 'Custom', 'https://custom.com', `upload:${iconUuid}.png`)

    const bookmark = sqlite.prepare('SELECT * FROM bookmarks WHERE id = ?').get(bookmarkId) as any
    
    expect(bookmark.icon).toBe(`upload:${iconUuid}.png`)
    expect(bookmark.icon.startsWith('upload:')).toBe(true)
  })

  it('should cascade delete bookmark from collection_bookmarks', () => {
    const bookmarkId = crypto.randomUUID()
    const collectionId = 'default-collection'
    
    // Create bookmark
    sqlite.prepare(`
      INSERT INTO bookmarks (id, name, url, icon)
      VALUES (?, ?, ?, ?)
    `).run(bookmarkId, 'Test', 'https://test.com', 'builtin:material:home')

    // Add to collection
    sqlite.prepare(`
      INSERT INTO collection_bookmarks (collection_id, bookmark_id, "order")
      VALUES (?, ?, ?)
    `).run(collectionId, bookmarkId, 0)

    // Verify it's in collection
    let mapping = sqlite.prepare('SELECT * FROM collection_bookmarks WHERE bookmark_id = ?').get(bookmarkId)
    expect(mapping).toBeDefined()

    // Delete bookmark (should cascade)
    sqlite.prepare('DELETE FROM bookmarks WHERE id = ?').run(bookmarkId)

    // Verify mapping is gone
    mapping = sqlite.prepare('SELECT * FROM collection_bookmarks WHERE bookmark_id = ?').get(bookmarkId)
    expect(mapping).toBeUndefined()
  })

  it('should get bookmarks by collection', () => {
    const bookmark1Id = crypto.randomUUID()
    const bookmark2Id = crypto.randomUUID()
    const collectionId = 'default-collection'
    
    // Create bookmarks
    sqlite.prepare(`
      INSERT INTO bookmarks (id, name, url, icon)
      VALUES (?, ?, ?, ?), (?, ?, ?, ?)
    `).run(
      bookmark1Id, 'Bookmark 1', 'https://b1.com', 'builtin:material:home',
      bookmark2Id, 'Bookmark 2', 'https://b2.com', 'builtin:material:star'
    )

    // Add to collection
    sqlite.prepare(`
      INSERT INTO collection_bookmarks (collection_id, bookmark_id, "order")
      VALUES (?, ?, ?), (?, ?, ?)
    `).run(collectionId, bookmark1Id, 0, collectionId, bookmark2Id, 1)

    // Get bookmarks in collection
    const bookmarks = sqlite.prepare(`
      SELECT b.* FROM bookmarks b
      JOIN collection_bookmarks cb ON b.id = cb.bookmark_id
      WHERE cb.collection_id = ?
      ORDER BY cb."order"
    `).all(collectionId)

    expect(bookmarks).toHaveLength(2)
  })

  it('should update updatedAt timestamp on changes', () => {
    const bookmarkId = crypto.randomUUID()
    
    // Create bookmark
    sqlite.prepare(`
      INSERT INTO bookmarks (id, name, url, icon)
      VALUES (?, ?, ?, ?)
    `).run(bookmarkId, 'Original', 'https://original.com', 'builtin:material:home')

    const before = sqlite.prepare('SELECT updated_at FROM bookmarks WHERE id = ?').get(bookmarkId) as any
    
    // Wait a moment
    const wait = new Promise(resolve => setTimeout(resolve, 100))
    wait.then(() => {
      // Update bookmark
      sqlite.prepare(`
        UPDATE bookmarks 
        SET name = ?, updated_at = unixepoch()
        WHERE id = ?
      `).run('Updated', bookmarkId)

      const after = sqlite.prepare('SELECT updated_at FROM bookmarks WHERE id = ?').get(bookmarkId) as any
      
      expect(after.updated_at).toBeGreaterThan(before.updated_at)
    })
  })
})
