const Database = require('better-sqlite3');
const db = new Database('./data/arike.db');
const fs = require('fs');
const sql = fs.readFileSync('./drizzle/0001_add_modern_theme.sql', 'utf8');

const statements = sql
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'));

for (const stmt of statements) {
  try {
    db.exec(stmt + ';');
    console.log('OK:', stmt.slice(0, 70));
  } catch (e) {
    console.log('SKIP:', e.message.slice(0, 100));
  }
}

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('\nTables:', tables.map(t => t.name).join(', '));
db.close();
