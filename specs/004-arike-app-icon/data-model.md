# Data Model: Arike App Icon & Brand Identity

**Feature**: 004-arike-app-icon  
**Date**: 2026-05-16

## Overview

This feature introduces no database schema changes. All entities are static file assets and configuration files. The "data model" for this feature is the **canonical asset inventory** — the set of files that must exist, their derivation relationships, and their contracts.

---

## Asset Entities

### Brand Source (Master)

These are the canonical source assets from which all derived files are generated. They are committed to `docs/brand/` and MUST NOT be overwritten by the build pipeline.

| Asset | Path | Format | Dimensions | Description |
|-------|------|--------|------------|-------------|
| Dark variant | `docs/brand/arike-icon-dark.svg` | SVG | scalable | Dark navy background (`#1a2035`) + warm amber/gold accent (`#f59e0b`). Used as source for favicon, PWA icons, Docker Hub, social preview. |
| Light variant | `docs/brand/arike-icon-light.svg` | SVG | scalable | Transparent background, dark icon for use on light backgrounds (README, docs). |

**Key attributes**:
- Square aspect ratio (1:1)
- Artboard: 512×512 px viewBox
- Legible at 16×16 px (simple geometric home motif)
- No embedded raster images (pure vector paths)
- No external font references

---

### Derived Assets — Browser & App

Generated from `docs/brand/arike-icon-dark.svg` (dark variant) unless noted. All generated via `scripts/generate-icons.mjs`.

| Asset | Path | Source Variant | Format | Dimensions | Serve Mechanism |
|-------|------|---------------|--------|------------|----------------|
| Favicon ICO | `src/app/favicon.ico` | dark | ICO (multi-size) | 16×16 + 32×32 | Next.js file-based (auto `/favicon.ico`) |
| SVG icon | `src/app/icon.svg` | dark | SVG | scalable | Next.js file-based (sizes="any") |
| PNG icon | `src/app/icon.png` | dark | PNG | 512×512 | Next.js file-based (primary tab icon) |
| Apple touch icon | `src/app/apple-icon.png` | dark | PNG | 180×180 | Next.js file-based (`apple-touch-icon`) |
| OG image | `src/app/opengraph-image.png` | dark | PNG | 1200×630 | Next.js file-based (Open Graph / Twitter) |
| OG alt text | `src/app/opengraph-image.alt.txt` | — | text | — | Next.js file-based |
| PWA icon 192 | `public/icon-192.png` | dark | PNG | 192×192 | Static (`manifest.ts` reference) |
| PWA icon 512 | `public/icon-512.png` | dark | PNG | 512×512 | Static (`manifest.ts` reference) |

---

### Derived Assets — Documentation

| Asset | Path | Source Variant | Format | Dimensions | Usage |
|-------|------|---------------|--------|------------|-------|
| README logo | committed inline | light | PNG | ~120px height | `README.md` `<img>` tag at top |

*Note: The light variant SVG is referenced directly from the raw GitHub URL in README.md so GitHub renders it on the white page background.*

---

### Configuration Files

| File | Path | Type | Notes |
|------|------|------|-------|
| PWA Manifest | `src/app/manifest.ts` | TypeScript (Next.js `MetadataRoute.Manifest`) | Typed; served at `/manifest.webmanifest` |
| layout.tsx metadata | `src/app/layout.tsx` | TypeScript | Updated: `metadataBase`, `manifest`, `openGraph`, `appleWebApp`, `viewport` |
| Dockerfile OCI label | `Dockerfile` | Dockerfile | `LABEL org.opencontainers.image.logo=<url>` |

---

## Derivation Pipeline

```
docs/brand/arike-icon-dark.svg
    │
    ├── scripts/generate-icons.mjs
    │       ├── → src/app/favicon.ico     (16×16 + 32×32, ICO)
    │       ├── → src/app/icon.svg        (copy, SVG)
    │       ├── → src/app/icon.png        (512×512, PNG)
    │       ├── → src/app/apple-icon.png  (180×180, PNG)
    │       ├── → src/app/opengraph-image.png (1200×630, PNG — icon centered on dark bg)
    │       ├── → public/icon-192.png     (192×192, PNG)
    │       └── → public/icon-512.png     (512×512, PNG)
    │
docs/brand/arike-icon-light.svg
    │
    └── README.md                         (referenced via raw GitHub URL)
```

*The generation script uses `sharp` (already available as a transitive Next.js dependency) for PNG resizing and `png-to-ico` or ImageMagick for ICO creation.*

---

## State Transitions

This feature has no runtime state transitions. All assets are static files. The only "state" is:

- **Missing**: Default browser icon shown (pre-feature state)
- **Present**: Arike icon shown (post-feature state)

---

## Validation Rules

| Asset | Rule |
|-------|------|
| All SVG sources | Must be valid SVG (parseable XML); no embedded rasters; no external `href` references |
| `favicon.ico` | Must contain both 16×16 and 32×32 frames |
| `apple-icon.png` | Must be exactly 180×180 px |
| `icon-192.png` | Must be exactly 192×192 px |
| `icon-512.png` | Must be exactly 512×512 px |
| `opengraph-image.png` | Must be exactly 1200×630 px |
| `manifest.ts` | Must export a valid `MetadataRoute.Manifest` object with `name`, `icons` (192 + 512) |
| Dockerfile OCI label | URL must be a valid absolute HTTPS URL pointing to a committed asset |
