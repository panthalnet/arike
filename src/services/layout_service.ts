import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { layoutPreferences } from '@/lib/schema'

export type LayoutMode = 'uniform-grid' | 'bento-grid'

export const VALID_LAYOUT_MODES: readonly LayoutMode[] = ['uniform-grid', 'bento-grid'] as const

export interface LayoutPreferenceDTO {
  id: number
  layoutMode: LayoutMode
  updatedAt: string
}

function rowToDTO(row: typeof layoutPreferences.$inferSelect): LayoutPreferenceDTO {
  return {
    id: row.id,
    layoutMode: row.layoutMode as LayoutMode,
    updatedAt: row.updatedAt ? new Date(row.updatedAt).toISOString() : new Date().toISOString(),
  }
}

export async function getLayoutPreferences(): Promise<LayoutPreferenceDTO> {
  const rows = await db.select().from(layoutPreferences).where(eq(layoutPreferences.id, 1)).all()
  if (rows.length === 0) {
    // Auto-seed the singleton row if it doesn't exist
    await db.insert(layoutPreferences).values({ id: 1, layoutMode: 'uniform-grid' }).run()
    return { id: 1, layoutMode: 'uniform-grid', updatedAt: new Date().toISOString() }
  }
  return rowToDTO(rows[0])
}

export async function getLayoutMode(): Promise<LayoutMode> {
  const pref = await getLayoutPreferences()
  return pref.layoutMode
}

export async function setLayoutMode(mode: LayoutMode): Promise<LayoutPreferenceDTO> {
  if (!(VALID_LAYOUT_MODES as readonly string[]).includes(mode)) {
    throw new Error(`Invalid layout mode: "${mode}". Must be one of: ${VALID_LAYOUT_MODES.join(', ')}`)
  }

  // Ensure the singleton row exists before updating (upsert pattern)
  await getLayoutPreferences()

  await db
    .update(layoutPreferences)
    .set({ layoutMode: mode, updatedAt: new Date() })
    .where(eq(layoutPreferences.id, 1))
    .run()

  return getLayoutPreferences()
}
