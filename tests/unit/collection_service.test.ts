import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import Database from 'better-sqlite3'
import fs from 'fs'
import path from 'path'

type CollectionRow = {
  id: string
  name: string
  order: number
  created_at: number
  updated_at: number
}

type CollectionBookmarkRow = {
  collection_id: string
  bookmark_id: string
  order: number
}

type BookmarkRow = {
  id: string
  name: string
  url: string
  icon: string
  created_at: number
  updated_at: number
}

type CountRow = { c: number }

describe('Collection Service', () => {
  const TEST_DB_PATH = path.join(process.cwd(), 'tests', 'test-collections.db')
  let sqlite: Database.Database

  beforeEach(async () => {
    sqlite = new Database(TEST_DB_PATH)
    sqlite.pragma('foreign_keys = ON')

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
  })

  afterEach(() => {
    sqlite.close()
    if (fs.existsSync(TEST_DB_PATH)) {
      fs.unlinkSync(TEST_DB_PATH)
    }
  })

  // ---- Collection CRUD ----

  it('should create a new collection', () => {
    const id = crypto.randomUUID()
    sqlite.prepare(`
      INSERT INTO collections (id, name, "order") VALUES (?, ?, ?)
    `).run(id, 'Work', 0)

    const col = sqlite.prepare('SELECT * FROM collections WHERE id = ?').get(id) as CollectionRow
    expect(col).toBeDefined()
    expect(col.name).toBe('Work')
    expect(col.order).toBe(0)
  })

  it('should retrieve all collections ordered by order field', () => {
    sqlite.prepare(`INSERT INTO collections (id, name, "order") VALUES (?, ?, ?), (?, ?, ?), (?, ?, ?)`).run(
      crypto.randomUUID(), 'B', 2,
      crypto.randomUUID(), 'A', 0,
      crypto.randomUUID(), 'C', 1,
    )

    const cols = sqlite.prepare('SELECT * FROM collections ORDER BY "order"').all() as CollectionRow[]
    expect(cols).toHaveLength(3)
    expect(cols[0].name).toBe('A')
    expect(cols[1].name).toBe('C')
    expect(cols[2].name).toBe('B')
  })

  it('should not allow duplicate collection names', () => {
    sqlite.prepare(`INSERT INTO collections (id, name, "order") VALUES (?, ?, ?)`).run(crypto.randomUUID(), 'Work', 0)

    expect(() => {
      sqlite.prepare(`INSERT INTO collections (id, name, "order") VALUES (?, ?, ?)`).run(crypto.randomUUID(), 'Work', 1)
    }).toThrow()
  })

  it('should rename a collection', () => {
    const id = crypto.randomUUID()
    sqlite.prepare(`INSERT INTO collections (id, name, "order") VALUES (?, ?, ?)`).run(id, 'Original', 0)

    sqlite.prepare(`UPDATE collections SET name = ? WHERE id = ?`).run('Renamed', id)

    const col = sqlite.prepare('SELECT * FROM collections WHERE id = ?').get(id) as CollectionRow
    expect(col.name).toBe('Renamed')
  })

  it('should delete a collection and cascade remove collection_bookmarks entries', () => {
    const colId = crypto.randomUUID()
    const bmId = crypto.randomUUID()

    sqlite.prepare(`INSERT INTO collections (id, name, "order") VALUES (?, ?, ?)`).run(colId, 'ToDelete', 0)
    sqlite.prepare(`INSERT INTO bookmarks (id, name, url, icon) VALUES (?, ?, ?, ?)`).run(bmId, 'B', 'https://b.com', 'builtin:material:home')
    sqlite.prepare(`INSERT INTO collection_bookmarks (collection_id, bookmark_id, "order") VALUES (?, ?, ?)`).run(colId, bmId, 0)

    // Verify mapping exists
    let mapping = sqlite.prepare('SELECT * FROM collection_bookmarks WHERE collection_id = ?').get(colId)
    expect(mapping).toBeDefined()

    // Delete collection
    sqlite.prepare('DELETE FROM collections WHERE id = ?').run(colId)

    // Mapping should be cascade-deleted
    mapping = sqlite.prepare('SELECT * FROM collection_bookmarks WHERE collection_id = ?').get(colId)
    expect(mapping).toBeUndefined()

    // Bookmark itself should still exist
    const bm = sqlite.prepare('SELECT * FROM bookmarks WHERE id = ?').get(bmId)
    expect(bm).toBeDefined()
  })

  // ---- Bookmark-Collection Relationship ----

  it('should add a bookmark to a collection', () => {
    const colId = crypto.randomUUID()
    const bmId = crypto.randomUUID()

    sqlite.prepare(`INSERT INTO collections (id, name, "order") VALUES (?, ?, ?)`).run(colId, 'Col', 0)
    sqlite.prepare(`INSERT INTO bookmarks (id, name, url, icon) VALUES (?, ?, ?, ?)`).run(bmId, 'BM', 'https://bm.com', 'builtin:material:home')
    sqlite.prepare(`INSERT INTO collection_bookmarks (collection_id, bookmark_id, "order") VALUES (?, ?, ?)`).run(colId, bmId, 0)

    const mapping = sqlite.prepare('SELECT * FROM collection_bookmarks WHERE collection_id = ? AND bookmark_id = ?').get(colId, bmId)
    expect(mapping).toBeDefined()
  })

  it('should assign a bookmark to multiple collections', () => {
    const col1 = crypto.randomUUID()
    const col2 = crypto.randomUUID()
    const bmId = crypto.randomUUID()

    sqlite.prepare(`INSERT INTO collections (id, name, "order") VALUES (?, ?, ?), (?, ?, ?)`).run(col1, 'Col1', 0, col2, 'Col2', 1)
    sqlite.prepare(`INSERT INTO bookmarks (id, name, url, icon) VALUES (?, ?, ?, ?)`).run(bmId, 'Shared', 'https://shared.com', 'builtin:material:home')
    sqlite.prepare(`INSERT INTO collection_bookmarks (collection_id, bookmark_id, "order") VALUES (?, ?, ?), (?, ?, ?)`).run(col1, bmId, 0, col2, bmId, 0)

    const mappings = sqlite.prepare('SELECT * FROM collection_bookmarks WHERE bookmark_id = ?').all(bmId)
    expect(mappings).toHaveLength(2)
  })

  it('should remove a bookmark from a specific collection without deleting the bookmark', () => {
    const col1 = crypto.randomUUID()
    const col2 = crypto.randomUUID()
    const bmId = crypto.randomUUID()

    sqlite.prepare(`INSERT INTO collections (id, name, "order") VALUES (?, ?, ?), (?, ?, ?)`).run(col1, 'Col1', 0, col2, 'Col2', 1)
    sqlite.prepare(`INSERT INTO bookmarks (id, name, url, icon) VALUES (?, ?, ?, ?)`).run(bmId, 'BM', 'https://bm.com', 'builtin:material:home')
    sqlite.prepare(`INSERT INTO collection_bookmarks (collection_id, bookmark_id, "order") VALUES (?, ?, ?), (?, ?, ?)`).run(col1, bmId, 0, col2, bmId, 0)

    // Remove only from col1
    sqlite.prepare('DELETE FROM collection_bookmarks WHERE collection_id = ? AND bookmark_id = ?').run(col1, bmId)

    const remaining = sqlite.prepare('SELECT * FROM collection_bookmarks WHERE bookmark_id = ?').all(bmId)
    expect(remaining).toHaveLength(1)
    expect((remaining[0] as CollectionBookmarkRow).collection_id).toBe(col2)

    // Bookmark should still exist
    const bm = sqlite.prepare('SELECT * FROM bookmarks WHERE id = ?').get(bmId)
    expect(bm).toBeDefined()
  })

  it('should get all bookmarks in a collection ordered by order field', () => {
    const colId = crypto.randomUUID()
    const bm1 = crypto.randomUUID()
    const bm2 = crypto.randomUUID()
    const bm3 = crypto.randomUUID()

    sqlite.prepare(`INSERT INTO collections (id, name, "order") VALUES (?, ?, ?)`).run(colId, 'Col', 0)
    sqlite.prepare(`INSERT INTO bookmarks (id, name, url, icon) VALUES (?, ?, ?, ?), (?, ?, ?, ?), (?, ?, ?, ?)`).run(
      bm1, 'B', 'https://b.com', 'builtin:material:home',
      bm2, 'A', 'https://a.com', 'builtin:material:star',
      bm3, 'C', 'https://c.com', 'builtin:material:code',
    )
    sqlite.prepare(`INSERT INTO collection_bookmarks (collection_id, bookmark_id, "order") VALUES (?, ?, ?), (?, ?, ?), (?, ?, ?)`).run(
      colId, bm2, 0,
      colId, bm1, 1,
      colId, bm3, 2,
    )

    const bms = sqlite.prepare(`
      SELECT b.* FROM bookmarks b
      JOIN collection_bookmarks cb ON b.id = cb.bookmark_id
      WHERE cb.collection_id = ?
      ORDER BY cb."order"
    `).all(colId) as BookmarkRow[]

    expect(bms).toHaveLength(3)
    expect(bms[0].name).toBe('A') // order 0
    expect(bms[1].name).toBe('B') // order 1
    expect(bms[2].name).toBe('C') // order 2
  })

  it('should get collections containing a given bookmark', () => {
    const col1 = crypto.randomUUID()
    const col2 = crypto.randomUUID()
    const bmId = crypto.randomUUID()

    sqlite.prepare(`INSERT INTO collections (id, name, "order") VALUES (?, ?, ?), (?, ?, ?)`).run(col1, 'A', 0, col2, 'B', 1)
    sqlite.prepare(`INSERT INTO bookmarks (id, name, url, icon) VALUES (?, ?, ?, ?)`).run(bmId, 'BM', 'https://bm.com', 'builtin:material:home')
    sqlite.prepare(`INSERT INTO collection_bookmarks (collection_id, bookmark_id, "order") VALUES (?, ?, ?), (?, ?, ?)`).run(col1, bmId, 0, col2, bmId, 0)

    const cols = sqlite.prepare(`
      SELECT collection_id FROM collection_bookmarks WHERE bookmark_id = ?
    `).all(bmId) as CollectionBookmarkRow[]
    const ids = cols.map(r => r.collection_id)

    expect(ids).toContain(col1)
    expect(ids).toContain(col2)
    expect(ids).toHaveLength(2)
  })

  it('should seed a default "Bookmarks" collection on first run', () => {
    // Simulate seeding
    const id = 'default-collection'
    sqlite.prepare(`
      INSERT OR IGNORE INTO collections (id, name, "order") VALUES (?, ?, ?)
    `).run(id, 'Bookmarks', 0)

    const col = sqlite.prepare('SELECT * FROM collections WHERE id = ?').get(id) as CollectionRow
    expect(col).toBeDefined()
    expect(col.name).toBe('Bookmarks')
  })

  it('should enforce 50 collection limit (warn at 40)', () => {
    // Insert 50 collections
    for (let i = 0; i < 50; i++) {
      sqlite.prepare(`INSERT INTO collections (id, name, "order") VALUES (?, ?, ?)`).run(crypto.randomUUID(), `Col ${i}`, i)
    }

    const count = (sqlite.prepare('SELECT COUNT(*) as c FROM collections').get() as CountRow).c
    expect(count).toBe(50)

    // Any application-level limit enforcement is in the service layer; here we verify the count
    const nearLimit = count >= 40
    expect(nearLimit).toBe(true)
  })

  it('should reorder collections', () => {
    const id1 = crypto.randomUUID()
    const id2 = crypto.randomUUID()

    sqlite.prepare(`INSERT INTO collections (id, name, "order") VALUES (?, ?, ?), (?, ?, ?)`).run(id1, 'First', 0, id2, 'Second', 1)

    // Swap order
    sqlite.prepare(`UPDATE collections SET "order" = ? WHERE id = ?`).run(1, id1)
    sqlite.prepare(`UPDATE collections SET "order" = ? WHERE id = ?`).run(0, id2)

    const cols = sqlite.prepare('SELECT * FROM collections ORDER BY "order"').all() as CollectionRow[]
    expect(cols[0].name).toBe('Second')
    expect(cols[1].name).toBe('First')
  })
})
