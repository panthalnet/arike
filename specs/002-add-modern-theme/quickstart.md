# Quickstart: Add Modern Theme

**Purpose**: Integration guide for implementing the Modern theme feature  
**Target**: Developers implementing this feature  
**Created**: 2026-04-19

---

## Overview

This guide explains how to integrate the Modern theme feature into Arike following the design specified in [plan.md](plan.md), [data-model.md](data-model.md), and [contracts/](contracts/).

The feature consists of four independent pieces that can be developed in parallel:
1. **Theme System**: Add Modern token definitions and theme switching
2. **Layout Engine**: Implement Bento Grid layout and layout mode toggle
3. **Wallpaper System**: Upload, validate, and persist wallpapers
4. **UI Integration**: Update settings panel and homepage to expose features

---

## 1. Database Migration

**File**: `drizzle/migrations/add-modern-theme.sql`

**Steps**:
1. Run the migration SQL (see [data-model.md](data-model.md#migrations))
2. Initialize singleton `ModernThemePreference` row with defaults
3. Populate 3 built-in wallpapers
4. Verify via `sqlite3 ./data/arike.db "SELECT * FROM modern_theme_preference;"`

**Verify**:
```bash
npm run db:migrate
npm run db:introspect  # Regenerate Drizzle schema
```

---

## 2. Theme System Implementation

### 2.1 Create Token Definitions

**File**: `src/services/theme/modernTheme.ts`

Define Modern token values (glassmorphism colors, blur, borders, etc.). Reference:
- [contracts/theme.ts](contracts/theme.ts) for interface
- [research.md#glassmorphism](research.md#glassmorphism-css-implementation) for CSS values

**Example**:
```typescript
export const MODERN_TOKENS: ThemeTokens = {
  background: 'linear-gradient(135deg, #1e3a5f 0%, #2d1b5e 100%)',
  surface: 'rgba(255, 255, 255, 0.08)',
  glassBlur: '12px',
  // ... other tokens
};
```

### 2.2 Update Theme Service

**File**: `src/services/theme/themeService.ts`

Extend existing theme service to:
- Register Modern in `THEME_REGISTRY` (see [contracts/theme.ts](contracts/theme.ts))
- Load `ModernThemePreference` on app init
- Apply tokens via CSS custom properties: `root.style.setProperty('--theme-xxx', value)`
- Persist selection to database

**Interface to implement**:
```typescript
async selectTheme(name: ThemeName): Promise<void>;
async updateBlurIntensity(pixels: number): Promise<void>; // 8–20 range
async getTheme(): Promise<ThemeName>;
```

### 2.3 Add Theme CSS

**File**: `src/styles/theme/modern.css`

```css
/* Modern theme token definitions */
:root {
  --theme-background: linear-gradient(135deg, #1e3a5f 0%, #2d1b5e 100%);
  --theme-surface: rgba(255, 255, 255, 0.08);
  --theme-glassBlur: 12px;
  /* ... all tokens from MODERN_TOKENS */
}

/* Glassmorphism styling */
.glass-surface {
  background: var(--theme-surface);
  backdrop-filter: blur(var(--theme-glassBlur));
  border: 1px solid var(--theme-border);
  border-radius: var(--theme-borderRadiusLarge);
  color: var(--theme-text);
}

/* Fallback for browsers without backdrop-filter support */
@supports not (backdrop-filter: blur(1px)) {
  .glass-surface {
    background: var(--theme-surfaceNoBlur, rgba(255, 255, 255, 0.15));
  }
}
```

**Apply to**:
- Settings modal
- Collection headers
- Bookmark tiles (when using Modern theme)
- Search bar
- All surface-like components

---

## 3. Layout Engine Implementation

### 3.1 Create Layout Service

**File**: `src/services/layout/layoutEngine.ts`

Implement:
- Get/set layout mode (Uniform Grid vs. Bento Grid)
- Get/set tile sizes per bookmark
- Calculate grid spans based on viewport

**Interface**: See [contracts/layout.ts](contracts/layout.ts)

### 3.2 Add Bento Grid CSS

**File**: `src/styles/layout/bentoGrid.css`

```css
.bento-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  grid-auto-flow: dense;
  gap: 12px;
}

.bento-grid.tile-small { grid-column: span 1; }
.bento-grid.tile-medium { grid-column: span 2; }
.bento-grid.tile-large { grid-column: span 3; }

/* Tablet: Reduce spans */
@media (max-width: 1023px) {
  .bento-grid.tile-large { grid-column: span 2; }
}

/* Mobile: All tiles span 1 */
@media (max-width: 767px) {
  .bento-grid.tile-small,
  .bento-grid.tile-medium,
  .bento-grid.tile-large {
    grid-column: span 1;
  }
}
```

### 3.3 Update BookmarkTile Component

**File**: `src/components/BookmarkTile.tsx`

Add:
- `tileSize` prop (passed from service)
- Apply CSS class based on `tileSize` and layout mode
- Click handler to resize tile (updated via service)

---

## 4. Wallpaper System Implementation

### 4.1 Create Wallpaper Service

**File**: `src/services/theme/wallpaperService.ts`

Implement:
- Validate file (size, type, dimensions)
- Upload to `./data/wallpapers/` with UUID filename
- Store record in `WallpaperAsset` table
- Serve wallpaper via API endpoint
- Fallback to built-in gradient if upload fails or file missing

**Interface**: See [contracts/wallpaper.ts](contracts/wallpaper.ts)

### 4.2 Create Wallpaper Upload Component

**File**: `src/components/WallpaperUploader.tsx`

UI:
- Drag-and-drop file input
- Preview of selected wallpaper
- Built-in wallpaper gallery
- "Set as background" button
- Error display for validation failures

### 4.3 Create Wallpaper API Route

**File**: `src/app/api/wallpapers/route.ts`

Endpoints:
- `GET /api/wallpapers` – List all wallpapers
- `POST /api/wallpapers` – Upload new wallpaper
- `PUT /api/wallpapers/:id` – Set as active
- `DELETE /api/wallpapers/:id` – Delete uploaded wallpaper

---

## 5. UI Integration

### 5.1 Update Settings Panel

**File**: `src/app/(settings)/theme/page.tsx`

Add:
- Theme selector dropdown (including Modern)
- If Modern selected:
  - Wallpaper uploader component
  - Built-in wallpaper gallery
  - Blur intensity slider (8–20px)
  - Layout mode toggle (Uniform Grid / Bento Grid)
  - Preview pane showing live token updates

### 5.2 Update Homepage

**File**: `src/app/page.tsx`

Add:
- Load current layout mode preference
- Render bookmarks in appropriate grid (Uniform vs. Bento)
- Apply Modern tokens if Modern theme selected

### 5.3 Update ThemeProvider

**File**: `src/components/ThemeProvider.tsx`

Add:
- Load Modern preference + wallpaper on init
- Apply CSS custom properties
- Listen for layout mode changes
- Update DOM when blur intensity adjusted

---

## 6. Testing Strategy

### Unit Tests

**Files**: `tests/unit/themeService.test.ts`, `tests/unit/layoutEngine.test.ts`, `tests/unit/wallpaperService.test.ts`

Test:
- Theme switching and token application
- Layout span calculation across viewports
- Wallpaper validation (size, type, dimensions)
- Bento grid compaction algorithm
- Blur intensity bounds (8–20px)

### Integration Tests

**Files**: `tests/integration/themeSettings.test.ts`, `tests/integration/wallpaperIntegration.test.ts`

Test:
- Theme selector UI updates app state
- Wallpaper upload workflow (file → preview → set active → persist)
- Layout mode toggle updates grid immediately
- Blur slider updates all glass surfaces

### E2E Tests

**Files**: `tests/e2e/modern-theme.spec.ts` (or separate per feature)

Test user journeys:
1. User selects Modern theme → homepage updates to glass styling ✅
2. User uploads wallpaper → wallpaper persists after restart ✅
3. User selects Bento Grid → bookmarks reflow ✅
4. User resizes bookmark tiles → sizes persist ✅
5. User adjusts blur → all glass surfaces update ✅

**Coverage requirement**: Minimum 90% across all tests (per Constitution V)

---

## 7. Acceptance Checklist

- [ ] Modern theme token definitions complete
- [ ] Theme service loads/saves Modern preference
- [ ] CSS custom properties applied at runtime
- [ ] Glassmorphism styling on all surfaces
- [ ] Bento Grid CSS implemented and responsive
- [ ] Layout mode toggle working
- [ ] Tile sizing persists per bookmark
- [ ] Wallpaper upload validates and stores files
- [ ] Wallpaper persists across restarts
- [ ] Built-in wallpaper gallery working
- [ ] Blur intensity slider works (8–20px)
- [ ] Settings UI complete and functional
- [ ] Theme switcher shows Modern option
- [ ] Gruvbox remains default for new users
- [ ] Contrast ratios meet WCAG AA (4.5:1)
- [ ] Mobile responsive (all breakpoints)
- [ ] E2E tests passing
- [ ] Coverage ≥90%
- [ ] README updated with Modern theme documentation
- [ ] docs/design.md updated with architecture notes

---

## 8. Development Order

**Recommended sequence** (can be done in parallel with coordination):

1. **Phase 1 (Backend)**: Database migration, theme service, wallpaper service
2. **Phase 2 (Styles)**: CSS token definitions, glassmorphism, bento grid CSS
3. **Phase 3 (Components)**: WallpaperUploader, BentoGrid, updated BookmarkTile
4. **Phase 4 (UI)**: Settings panel integration, theme selector, layout toggle
5. **Phase 5 (Testing)**: Unit → integration → E2E tests (parallel with development)
6. **Phase 6 (Polish)**: Accessibility audit (WCAG AA), mobile testing, documentation

---

## 9. Rollback Plan

If issues arise before release:

1. **Database**: Keep data; Modern preference optional (fallback to Gruvbox)
2. **Feature Flag**: Hide Modern theme selector behind feature flag if needed
3. **Revert**: Modern theme never becomes default; can be disabled without affecting core flow

---

**Status**: ✅ Quickstart guide complete. Ready for implementation.
