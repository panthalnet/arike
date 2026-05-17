# Implementation Plan: Arike App Icon & Brand Identity

**Branch**: `004-arike-app-icon` | **Date**: 2026-05-16 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/004-arike-app-icon/spec.md`

## Summary

Generate and integrate the Arike brand icon — a "closer to home" thematic symbol with dark-background/warm-accent and transparent/light variants. Assets are produced using a researched AI generation platform, exported at all required sizes, and integrated into the Next.js app (favicon, PWA manifest, OG metadata), README, GitHub social preview, and Docker Hub (repository logo + Dockerfile OCI annotation).

## Technical Context

**Language/Version**: TypeScript / Node.js 20, Next.js 16 (App Router)
**Primary Dependencies**: Next.js built-in metadata API (`src/app/icon.*`, `src/app/favicon.ico`, `src/app/opengraph-image.*`); `sharp` (already transitive via Next.js) for PNG resizing; no new runtime dependencies
**Storage**: Static files in `public/` and `src/app/` (no database changes)
**Testing**: Vitest (unit), Playwright (E2E) — existing test infrastructure; icon presence testable via Playwright page load check for favicon link/metadata
**Target Platform**: Web browser (all modern browsers), iOS home screen, Docker Hub (manual upload)
**Project Type**: Web application — branding/asset feature with minimal code surface
**Performance Goals**: Favicon served with static cache headers; no measurable impact on first paint
**Constraints**: All assets committed to repository (no CDN); icon license must be open-source-compatible (MIT/Apache/CC0 or equivalent AI platform license); no new npm runtime dependencies
**Scale/Scope**: ~12 static asset files; 3 code file changes (layout.tsx, Dockerfile, public/site.webmanifest); 1 README update

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Self-Hosted First | ✅ PASS | All icon assets served from repo-committed static files; no CDN or cloud service required at runtime |
| II. Responsive by Design | ✅ PASS | Apple touch icon + PWA manifest icons cover all device classes |
| III. Layered Architecture | ✅ PASS | No new layers; `site.webmanifest` is a static JSON file; Dockerfile OCI label is pure metadata; no DB mutations; no HTTP boundary changes |
| IV. Modern Stable Stack | ✅ PASS | No new dependencies; SVG/PNG/ICO/JSON are universal standards; OCI image labels are spec-stable |
| V. Quality Gates | ✅ PASS | Minimal code surface (metadata update, webmanifest, Dockerfile label); no reduction in test coverage; E2E test for favicon presence is feasible via Playwright |
| VI. Documentation Discipline | ✅ PASS | README.md update required (in spec); docs/design.md requires no change (no architecture change) |
| VII. Legal Compliance | ✅ PASS (conditional) | AI-generated icon license must be verified as open-source-compatible; research phase resolves this |

**Post-design re-check**: No violations found after Phase 1 design. No complexity justifications required.

## Project Structure

### Documentation (this feature)

```text
specs/004-arike-app-icon/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── site-webmanifest.schema.json   # PWA manifest contract
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
docs/
└── brand/
    ├── arike-icon-dark.svg       # Canonical dark-bg source (AI-generated, committed master)
    └── arike-icon-light.svg      # Canonical light/transparent source

public/
├── icon-192.png                  # PWA manifest icon (referenced in manifest.ts)
└── icon-512.png                  # PWA manifest icon / maskable

src/app/
├── favicon.ico                   # ICO (16×16 + 32×32) — Next.js auto-serves at /favicon.ico
├── icon.svg                      # SVG favicon (modern browsers, sizes="any")
├── icon.png                      # 512×512 PNG — Next.js metadata API primary icon
├── apple-icon.png                # 180×180 PNG — Next.js auto-wires apple-touch-icon
├── opengraph-image.png           # 1200×630 — Next.js auto-wires OG/Twitter card
├── opengraph-image.alt.txt       # OG image alt text
├── manifest.ts                   # Typed PWA manifest (MetadataRoute.Manifest)
└── layout.tsx                    # Updated: metadataBase, manifest, openGraph, appleWebApp, viewport

Dockerfile                        # Updated: OCI org.opencontainers.image.logo label
README.md                         # Updated: Arike logo header (light variant)
scripts/
└── generate-icons.mjs            # Node script: SVG → all required PNG/ICO sizes via sharp
```

**Structure Decision**: Single Next.js web application. Brand master SVGs in `docs/brand/`. All derived assets generated from SVG source via `scripts/generate-icons.mjs` and committed. `src/app/manifest.ts` (typed) replaces `public/site.webmanifest`. Apple touch icon and OG image use file-based Next.js conventions in `src/app/` — no manual `<link>` tags needed.
