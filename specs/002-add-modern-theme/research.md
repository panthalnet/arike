# Research: Add Modern Theme

**Phase**: 0 (Research phase completed 2026-04-19)  
**Feature**: Add Modern Theme with glassmorphism, bento grid layout, wallpaper support  
**Input**: Technical Context + Functional Requirements from plan.md

## Design Patterns Research

### Glassmorphism CSS Implementation

**Decision**: Use `backdrop-filter: blur()` with semi-transparent backgrounds for frosted glass effect.

**Rationale**: 
- Native CSS property with broad browser support (Chrome 76+, Firefox 103+, Safari 9+)
- Hardware-accelerated rendering for smooth performance
- No additional JavaScript libraries required

**Implementation**:
```css
.glass-surface {
  background: rgba(255, 255, 255, 0.08);  /* Dark theme: semi-transparent white */
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 16px;
}
```

**Fallback**: For unsupported browsers (detected via CSS.supports('backdrop-filter', 'blur()')), render semi-opaque solid background with enhanced opacity for readability. Do not use alternative libraries; keep implementation simple.

**Accessibility**: Ensure 4.5:1 contrast ratio on all glass surfaces. Use white text (#ffffff) on dark glass; test with WCAG AA contrast checkers.

---

### Bento Grid Layout Algorithm

**Decision**: Use CSS Grid with `grid-auto-flow: dense` for auto-compaction and asymmetric tile placement.

**Research Findings**:
- CSS Grid `dense` algorithm automatically fills gaps when tiles of different span sizes are placed
- Supports responsive grid columns: 6-col desktop (1024px+), 3-col tablet (768-1023px), 1-col mobile (<768px)
- Tile sizes map to grid spans: small=1 col, medium=2 col, large=3 col (or 2x2 on tablet)

**Implementation**:
```css
.bento-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  grid-auto-flow: dense;
  gap: 12px;
}
```

**Tile span classes**:
- `tile-small`: `grid-column: span 1;`
- `tile-medium`: `grid-column: span 2;`
- `tile-large`: `grid-column: span 3;`

**Responsive adjustments**:
- Desktop (≥1024px): Base 6-column grid
- Tablet (768-1023px): Base 3-column grid; reduce tile spans proportionally
- Mobile (<768px): Single column; collapse all tiles to span 1

**Alternatives Rejected**:
- Masonry layouts (require JS; inconsistent browser support)
- Manual drag-and-drop reordering (out of scope; deferred to future feature)

---

### Wallpaper Image Storage & Validation

**Decision**: Store uploaded wallpapers in `./data/wallpapers/` directory with UUID filenames; validate on upload, persist path in database.

**Validation Requirements**:
- File types: PNG, JPEG, WebP, SVG only
- Max size: 2MB
- Max dimensions: 1024×1024px
- Content scan for SVG: Remove `<script>` tags and external references

**Storage Strategy**:
- Uploaded wallpapers: `./data/wallpapers/[uuid].[ext]` (e.g., `a1b2c3d4.webp`)
- Built-in wallpapers: Bundled in `/public/wallpapers/builtin/` (3 gradients + 1 image)
- Database stores reference: `wallpaper_source: 'upload:[uuid]'` or `wallpaper_source: 'builtin:gradient-1'`

**Performance**:
- Lazy-load wallpaper images; preload when theme is selected
- Cache wallpaper blob in localStorage after first fetch to reduce future loads
- Serve optimized WebP format via Next.js Image component when possible

---

### Theme Token Management

**Decision**: Use CSS custom properties (CSS variables) for all theme values; dynamically update via `document.documentElement.style.setProperty()`.

**Token Structure**:
```typescript
interface ThemeTokens {
  // Colors
  colorBackground: string;      // Page background (or wallpaper)
  colorSurface: string;         // Glass surface base color (rgba)
  colorText: string;            // Primary text
  colorTextMuted: string;       // Secondary text
  colorPrimary: string;         // Accent/buttons
  colorBorder: string;          // Glass edges (rgba)
  
  // Effects
  blurIntensity: string;        // '12px', '8px'–'20px' user-adjustable
  borderRadius: string;         // '16px' default
  
  // Shadows
  shadowSoft: string;           // '0 8px 32px rgba(0,0,0,0.25)'
}
```

**Update Mechanism**:
```typescript
function applyThemeTokens(tokens: ThemeTokens) {
  const root = document.documentElement;
  Object.entries(tokens).forEach(([key, value]) => {
    root.style.setProperty(`--theme-${key}`, value);
  });
}
```

**Storage**:
- Store selected theme name and custom overrides in SQLite
- On app load, fetch from DB → apply tokens → render
- Theme switch fires transition event; UI updates within 300ms

---

### Icon Library Integration

**Decision**: Use Iconify CSS (icon-sets.iconify.design) for Material Icons and Simple Icons; auto-inherit theme primary color via `currentColor`.

**Libraries Confirmed**:
- Material Icons (Apache 2.0): 2000+ UI icons, perfect for buttons/navigation
- Simple Icons (CC0): 3000+ brand logos, perfect for website bookmarks

**Implementation**:
- Embed Iconify CSS in Next.js head
- Use `<i class="iconify" data-icon="mdi:bookmark"></i>` for Material Icons
- Use `<i class="iconify" data-icon="simple-icons:github"></i>` for Simple Icons
- Style with `color: var(--theme-colorPrimary)` to auto-tint icons

---

### Mobile Responsive Patterns

**Decision**: Ensure all components support mobile-first responsive behavior per Constitution Principle II.

**Key Breakpoints**:
- Mobile: <480px (very small phones)
- Mobile base: 480-768px
- Tablet: 768-1024px
- Desktop: ≥1024px

**Touch Targets**: All interactive elements ≥44×44px on mobile (WCAG AA).

**Collection Tabs**: Horizontal scrollable on mobile; full tabs visible on desktop.

**Settings Modal**: Full-screen overlay on mobile; side panel or modal on desktop.

---

### Browser Compatibility & Fallbacks

**backdrop-filter Support**:
- Chrome 76+: Full support
- Firefox 103+: Full support
- Safari 9+: Full support
- Edge 79+: Full support
- IE 11: Not supported (use fallback)

**Fallback Cascade**:
1. Detect support: `CSS.supports('backdrop-filter', 'blur(12px)')`
2. If supported: Render frosted glass with blur
3. If unsupported: Render semi-opaque solid surface with higher opacity for readability

**Testing**: Run Playwright tests on Chrome and Firefox minimum; iOS Safari via BrowserStack or local device.

---

## Best Practices Confirmed

✅ **CSS Custom Properties**: Use for all theming; enables runtime switching without restart  
✅ **Accessibility**: Enforce 4.5:1 contrast; test with axe DevTools; prefers-reduced-motion support  
✅ **Performance**: Lazy-load wallpapers; cache in localStorage; minimize repaints during blur adjustment  
✅ **Responsive**: Mobile-first; CSS Grid for bento; no hardcoded pixel values for breakpoints  
✅ **Storage**: Persist theme prefs + wallpaper paths in SQLite; wallpaper files in `./data/` volume  
✅ **Error Handling**: Validate on upload; fallback on failure; show user-friendly error messages  

---

## Decisions Summary

| Design Area | Decision | Rationale |
|---|---|---|
| Glass effect | CSS backdrop-filter blur | Native, performant, broad browser support |
| Layout | CSS Grid with dense flow | No JS required; automatic gap filling; responsive |
| Wallpapers | UUID files in ./data/wallpapers/ | Persistent, scalable, separate from app code |
| Tokens | CSS custom properties | Runtime switching; no restart; easy maintenance |
| Icons | Iconify CSS (Material + Simple) | Already vetted libraries; permissive licensing |
| Fallbacks | Solid color surfaces | Simple, readable, no external dependencies |

---

**Status**: ✅ Research complete. All clarifications resolved. Ready for Phase 1 design.
