# Quickstart: Arike App Icon & Brand Identity

**Feature**: 004-arike-app-icon  
**Date**: 2026-05-16  
**Audience**: Developer implementing this feature

---

## Overview

This feature is split into two stages:

1. **Generate the icon** — using an AI platform (one-time manual step)
2. **Integrate the icon** — add assets to the repo and wire up Next.js metadata, PWA manifest, Dockerfile OCI label, README, and Docker Hub

---

## Stage 1: Generate the Icon (One-Time Manual Step)

### Primary Path: Recraft.ai (recommended — native SVG)

**Why**: Recraft is the only mainstream AI platform that outputs native, editable SVG — no raster-to-vector conversion needed. One month of the Basic plan ($10) gives commercial use rights that are retained permanently after cancellation.

**Steps**:

1. Create an account at [recraft.ai](https://www.recraft.ai) and subscribe to Basic ($10/mo)
2. Click **New Image** → select style **"Vector illustration"** or **"Flat icon"**
3. Set the color palette:
   - Background: `#1a2035` (deep navy)
   - Accent: `#f59e0b` (amber/gold)
4. Enter this prompt:

   ```
   A minimal flat app icon for a browser new-tab app called "Arike"
   (meaning "closer" in Malayalam). The icon concept is "closer to home" —
   a simple, clean house/home silhouette centered on a deep navy background
   (#1a2035). The house shape is rendered in warm amber-gold (#f59e0b) with
   a soft warm inner glow suggesting warmth and proximity. The house is
   geometric and minimal — a simple triangular roof over a rectangular body,
   no details. A small warm amber heart or glowing dot floats centered just
   above the house peak, suggesting closeness and warmth. Dark navy
   background fills the entire square canvas. Style: flat icon, minimal,
   clean, bold, icon-safe at 16×16 pixels. No text, no drop shadow, no
   gradient background. Square aspect ratio. SVG output.
   ```

5. Iterate until satisfied (30 free preview credits/day; paid generation for final)
6. Download as **SVG** → save as `docs/brand/arike-icon-dark.svg`
7. Cancel the subscription after downloading

**Light variant**: In Recraft, duplicate the icon and:
- Change background to **transparent**
- Change the house/icon color to `#1a2035` (dark navy on transparent)
- Download as SVG → save as `docs/brand/arike-icon-light.svg`

---

### Alternative Path: ChatGPT / DALL-E 3 (free, requires extra step)

**Why**: OpenAI explicitly assigns output ownership to the user on both free and paid tiers — the strongest free-tier license. Requires one extra SVG conversion step.

**Steps**:

1. Open [chatgpt.com](https://chatgpt.com) (free account)
2. Use the same prompt as above (Recraft version)
3. Download the generated PNG
4. Convert PNG → SVG:
   - **Option A** (easiest): Upload to [vectorizer.ai](https://vectorizer.ai) → download SVG
   - **Option B** (local): `inkscape --export-type=svg --export-plain-svg input.png` then clean paths in Inkscape
5. Save result as `docs/brand/arike-icon-dark.svg`
6. For light variant: edit SVG in text editor — swap `fill="#1a2035"` background rect to `fill="none"` and icon paths to `#1a2035`

---

## Stage 2: Run the Icon Generation Script

Once `docs/brand/arike-icon-dark.svg` and `docs/brand/arike-icon-light.svg` exist:

```bash
node scripts/generate-icons.mjs
```

This script produces all required derived assets:

| Output | Size | Location |
|--------|------|----------|
| `favicon.ico` | 16×16 + 32×32 | `src/app/favicon.ico` |
| `icon.svg` | scalable | `src/app/icon.svg` |
| `icon.png` | 512×512 | `src/app/icon.png` |
| `apple-icon.png` | 180×180 | `src/app/apple-icon.png` |
| `opengraph-image.png` | 1200×630 | `src/app/opengraph-image.png` |
| `icon-192.png` | 192×192 | `public/icon-192.png` |
| `icon-512.png` | 512×512 | `public/icon-512.png` |

All generated files are committed to the repository. The script uses `sharp` (already a transitive Next.js dependency) for PNG resizing.

---

## Stage 3: Code Changes

### 3a. `src/app/layout.tsx` — Add metadata

```ts
import type { Metadata, Viewport } from 'next'

export const viewport: Viewport = {
  themeColor: '#1a1a2e',
}

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'),
  title: 'Arike - Your Personal Dashboard',
  description: 'Self-hosted browser startup page and personal dashboard',
  manifest: '/manifest.webmanifest',
  openGraph: {
    title: 'Arike',
    description: 'Self-hosted browser startup page and personal dashboard',
    type: 'website',
    images: [{ url: '/opengraph-image.png', width: 1200, height: 630, alt: 'Arike — Your Personal Dashboard' }],
  },
  appleWebApp: {
    capable: true,
    title: 'Arike',
    statusBarStyle: 'black-translucent',
  },
}
```

*File-based icons (`favicon.ico`, `icon.svg`, `icon.png`, `apple-icon.png`) are auto-wired by Next.js — no `icons` field needed in `metadata`.*

### 3b. `src/app/manifest.ts` — Create PWA manifest

```ts
import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Arike',
    short_name: 'Arike',
    description: 'Self-hosted browser startup page and personal dashboard',
    start_url: '/',
    display: 'standalone',
    background_color: '#0f0f1a',
    theme_color: '#1a1a2e',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
```

### 3c. `Dockerfile` — Add OCI label

After the existing `LABEL` or `ENV` lines in the runner stage, add:

```dockerfile
LABEL org.opencontainers.image.logo="https://raw.githubusercontent.com/panthalnet/arike/main/public/icon-512.png"
```

### 3d. `README.md` — Add logo header

At the top of README.md, before the first heading, add:

```markdown
<p align="center">
  <img src="docs/brand/arike-icon-light.svg" alt="Arike logo" height="120" />
</p>
```

---

## Stage 4: Docker Hub (Manual Step)

1. Log in to [hub.docker.com](https://hub.docker.com)
2. Navigate to **panthalnet/arike** repository → **Settings** → **Repository logo**
3. Upload `public/icon-512.png` (512×512 PNG)
4. Save

*This is a one-time manual step in the Docker Hub UI — there is no Docker CLI command for it.*

---

## Verification

```bash
# Start the app and check favicon
npm run dev
# Open http://localhost:3000 — browser tab should show Arike icon

# Verify manifest is served
curl http://localhost:3000/manifest.webmanifest | jq .

# Build and check no metadata errors
npm run build
```

**Browser DevTools check**:
- Open DevTools → Application → Manifest → verify icons load
- Open DevTools → Elements → `<head>` → verify `<link rel="manifest">`, `<meta property="og:image">`, `<link rel="apple-touch-icon">`
