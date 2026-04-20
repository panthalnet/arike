const Database = require('better-sqlite3');
const db = new Database('./data/arike.db');

try {
  db.exec('ALTER TABLE theme_settings ADD COLUMN blur_intensity INTEGER NOT NULL DEFAULT 12');
  console.log('Added blur_intensity');
} catch(e) { console.log('blur_intensity:', e.message); }

try {
  db.exec(`CREATE TABLE IF NOT EXISTS wallpaper_assets (
    id TEXT PRIMARY KEY,
    source_type TEXT NOT NULL,
    source_reference TEXT NOT NULL,
    file_path TEXT,
    display_name TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
  )`);
  console.log('Created wallpaper_assets');
} catch(e) { console.log('wallpaper_assets:', e.message); }

try {
  db.exec(`INSERT OR IGNORE INTO wallpaper_assets (id, source_type, source_reference, file_path, display_name, is_active) VALUES ('builtin-1','builtin','gradient-ocean',NULL,'Ocean Gradient',0),('builtin-2','builtin','gradient-forest',NULL,'Forest Gradient',0),('builtin-3','builtin','gradient-sunset',NULL,'Sunset Gradient',0)`);
  console.log('Seeded wallpapers');
} catch(e) { console.log('seed wallpapers:', e.message); }

try {
  db.exec(`CREATE TABLE IF NOT EXISTS layout_preferences (
    id INTEGER PRIMARY KEY,
    layout_mode TEXT NOT NULL DEFAULT 'uniform-grid',
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
  )`);
  console.log('Created layout_preferences');
} catch(e) { console.log('layout_preferences:', e.message); }

try {
  db.exec(`INSERT OR IGNORE INTO layout_preferences (id, layout_mode) VALUES (1, 'uniform-grid')`);
  console.log('Seeded layout_preferences');
} catch(e) { console.log('seed layout:', e.message); }

try {
  db.exec(`ALTER TABLE bookmarks ADD COLUMN tile_size TEXT NOT NULL DEFAULT 'medium'`);
  console.log('Added tile_size');
} catch(e) { console.log('tile_size:', e.message); }

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('Tables:', tables.map(t => t.name).join(', '));
db.close();
