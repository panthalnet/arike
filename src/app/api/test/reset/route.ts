import { NextResponse } from 'next/server'
import { sqlite } from '@/lib/db'

function isE2eResetEnabled() {
  return process.env.E2E_TEST_MODE === '1'
}

export async function POST() {
  if (!isE2eResetEnabled()) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  try {
    sqlite.exec(`
      DELETE FROM collection_bookmarks;
      DELETE FROM bookmarks;
      DELETE FROM collections;
      DELETE FROM wallpaper_assets;
      DELETE FROM layout_preferences;
      DELETE FROM theme_settings;

      INSERT INTO theme_settings (id, selected_theme, search_provider, blur_intensity)
      VALUES (1, 'gruvbox', 'duckduckgo', 12);

      INSERT INTO collections (id, name, "order")
      VALUES ('default-collection', 'Bookmarks', 0);

      INSERT INTO layout_preferences (id, layout_mode)
      VALUES (1, 'uniform-grid');

      INSERT INTO wallpaper_assets (id, source_type, source_reference, file_path, display_name, is_active)
      VALUES
        ('builtin-1', 'builtin', 'gradient-ocean',  NULL, 'Ocean Gradient',  0),
        ('builtin-2', 'builtin', 'gradient-forest', NULL, 'Forest Gradient', 0),
        ('builtin-3', 'builtin', 'gradient-sunset', NULL, 'Sunset Gradient', 0);
    `)

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Failed to reset e2e state:', error)
    return NextResponse.json({ error: 'Failed to reset e2e state' }, { status: 500 })
  }
}
