# Tasks: Arike App Icon & Brand Identity

**Input**: Design documents from `/specs/004-arike-app-icon/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

---

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no unmet dependencies)
- **[Story]**: Which user story this task belongs to ([US1], [US2], [US3])
- Exact file paths in every task description

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create directory structure and generation tooling before any asset work begins.

- [X] T001 Create `docs/brand/` directory for master SVG source assets
- [X] T002 [P] Create `scripts/generate-icons.mjs` — Node.js ESM script using `sharp` to resize dark-variant SVG to all required PNG/ICO outputs: 16×16, 32×32, 180×180, 192×192, 512×512 PNG + 16/32 ICO (see data-model.md derivation pipeline)
- [X] T003 [P] Add `"generate-icons": "node scripts/generate-icons.mjs"` script to `package.json`

**Checkpoint**: Directory structure ready; generation script executable via `npm run generate-icons`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The AI-generated SVG master assets must exist before any derived file can be produced. This phase covers the one-time manual generation step plus committing the master sources.

**⚠️ CRITICAL**: All downstream phases depend on `docs/brand/arike-icon-dark.svg` and `docs/brand/arike-icon-light.svg` existing.

- [X] T004 Generate `docs/brand/arike-icon-dark.svg` using Recraft.ai (paid, Basic $10/mo) or ChatGPT/DALL-E 3 (free) with the exact prompt from `research.md` section 5; verify the icon is legible at 16×16 px before committing
- [X] T005 Generate `docs/brand/arike-icon-light.svg` — transparent background, dark navy icon paths — from the same AI platform (see `quickstart.md` Stage 1 light-variant instructions)
- [X] T006 Verify license compliance: confirm the chosen platform's terms permit open-source (MIT) redistribution; document the platform used and license basis in a comment at the top of both SVG files
  - Platform: Recraft.ai Basic plan ($10/mo, 2026-05-16); full commercial rights retained by owner per paid-tier terms; safe for MIT redistribution
- [X] T007 Run `npm run generate-icons` to produce all derived raster assets; verify all output files exist at their expected paths (see data-model.md Asset Entities table)

**Checkpoint**: All brand asset files committed; `docs/brand/` contains two SVGs; `src/app/` and `public/` contain all generated PNG/ICO/SVG files

---

## Phase 3: User Story 1 — Browser Tab Recognition (Priority: P1) 🎯 MVP

**Goal**: Arike shows its own icon in the browser tab instead of the browser default.

**Independent Test**: Load `http://localhost:3000` in any modern browser — the tab shows the Arike icon. Add Arike to browser bookmarks — the Arike icon appears alongside the bookmark name.

### Implementation for User Story 1

- [X] T008 [P] [US1] Place generated `src/app/favicon.ico` (16×16 + 32×32 ICO) — verify Next.js auto-serves it at `/favicon.ico` (file-based convention, no code change needed)
- [X] T009 [P] [US1] Place generated `src/app/icon.svg` (dark variant, scalable) — verify Next.js injects `<link rel="icon" type="image/svg+xml" sizes="any">`
- [X] T010 [US1] Place generated `src/app/icon.png` (512×512, dark variant) — verify Next.js injects `<link rel="icon" type="image/png" sizes="512x512">`
- [X] T011 [US1] Update `src/app/layout.tsx`: add `metadataBase` and `viewport` export per `quickstart.md` Stage 3a; verify TypeScript compiles cleanly (`npm run build`)
- [X] T011a [P] [US1] Add Playwright E2E test `tests/e2e/icon.spec.ts`: load `http://localhost:3000`, assert `<link rel="icon">` with `href` containing `favicon.ico` or `icon.` is present in `<head>`; assert `<link rel="manifest">` is present; assert `<meta property="og:image">` is present — run with `npx playwright test tests/e2e/icon.spec.ts`

**Checkpoint**: Browser tab shows the Arike icon. `npm run build` passes. Playwright icon test passes. US1 independently complete.

---

## Phase 4: User Story 2 — GitHub Repository Presence (Priority: P2)

**Goal**: Arike's GitHub repository page shows a branded logo in the README and a social preview image when links are shared.

**Independent Test**: View the README on github.com — the Arike logo appears as a visual header. Share the GitHub repository URL in a chat — the link unfurl shows the Arike icon and name.

### Implementation for User Story 2

- [X] T012 [P] [US2] Place generated `src/app/opengraph-image.png` (1200×630, dark variant icon centered on navy background) and create `src/app/opengraph-image.alt.txt` containing `Arike — Your Personal Dashboard`
- [X] T013 [US2] Update `src/app/layout.tsx`: add `openGraph` metadata block (title, description, type, images array pointing to `/opengraph-image.png`) per `quickstart.md` Stage 3a; verify `metadataBase` is set so relative URL resolves correctly
- [X] T014 [US2] Update `README.md`: add `<p align="center"><img src="docs/brand/arike-icon-light.svg" alt="Arike logo" height="120" /></p>` immediately before the first `#` heading
- [X] T015 [US2] Configure GitHub repository social preview: upload `src/app/opengraph-image.png` (1200×630) as the repository's social preview image via GitHub Settings → Social preview (manual step; document in `CONTRIBUTING.md` under "First-time repo setup")
  - Completed 2026-05-16: opengraph-image.png uploaded as GitHub repository social preview.

**Checkpoint**: README shows Arike logo on GitHub. Sharing the repo URL produces a branded link preview. US2 independently complete.

---

## Phase 5: User Story 3 — Home Screen / PWA Installation (Priority: P3)

**Goal**: Users can install Arike as a PWA or home screen shortcut and see the Arike icon (not a screenshot fallback).

**Independent Test**: On Chrome desktop: click address-bar install button — installed app shows Arike icon in OS app launcher. On iOS: "Add to Home Screen" — home screen icon shows Arike icon.

### Implementation for User Story 3

- [X] T016 [P] [US3] Place generated `src/app/apple-icon.png` (180×180, dark variant) — verify Next.js injects `<link rel="apple-touch-icon">`
- [X] T017 [P] [US3] Place generated `public/icon-192.png` and `public/icon-512.png` for PWA manifest use
- [X] T018 [US3] Create `src/app/manifest.ts` with typed `MetadataRoute.Manifest` export per `quickstart.md` Stage 3b and `contracts/manifest.schema.json`; verify output at `/manifest.webmanifest` matches the JSON schema contract
- [X] T019 [US3] Update `src/app/layout.tsx`: add `manifest: '/manifest.webmanifest'` and `appleWebApp` block per `quickstart.md` Stage 3a; verify DevTools → Application → Manifest shows all icons loading without errors

**Checkpoint**: Chrome shows PWA install button. iOS "Add to Home Screen" produces Arike icon. DevTools Application→Manifest reports no errors. US3 independently complete.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Docker Hub branding, Dockerfile OCI annotation, and final verification across all placements.

- [X] T020 Update `Dockerfile`: add `LABEL org.opencontainers.image.logo="https://raw.githubusercontent.com/panthalnet/arike/main/public/icon-512.png"` in the runner stage (after existing `ENV` lines, before `EXPOSE`) per `quickstart.md` Stage 3c
- [X] T021 Upload Docker Hub repository logo: log in to hub.docker.com → panthalnet/arike → Settings → Repository logo → upload `public/icon-512.png` (manual step; document in `CONTRIBUTING.md` under "First-time repo setup")
  - N/A: Docker Hub custom repository logos are only supported for organization accounts, not personal accounts. `panthalnet` is a personal account. OCI annotation in Dockerfile serves as the alternative. CONTRIBUTING.md updated.
- [X] T022 [P] Run full build and verify no TypeScript/lint errors: `npm run build && npm run lint`
- [X] T023 [P] Manual cross-browser favicon check: open Arike in Chrome, Firefox, and Safari — verify tab icon appears correctly in all three; verify bookmarking produces correct icon
- [X] T024 Update `docs/design.md` to add a "Brand Assets" section documenting the icon concept ("closer to home"), variants, generation platform, derivation pipeline, and placement map — per Constitution Principle VI (docs updated in same PR)

---

## Dependencies

```
Phase 1 (T001-T003)
    └── Phase 2 (T004-T007)  ← master SVG assets must exist
            ├── Phase 3 (T008-T011)   US1: browser tab (P1, MVP)
            ├── Phase 4 (T012-T015)   US2: GitHub presence (P2)
            ├── Phase 5 (T016-T019)   US3: PWA/home screen (P3)
            └── Phase 6 (T020-T024)   Polish & Docker
```

Phases 3, 4, 5, 6 can all begin in parallel once Phase 2 is complete (T007 passed — all derived assets exist).

Within each phase, tasks marked [P] can run in parallel.

---

## Parallel Execution Examples

**After T007 completes**, all of the following can run simultaneously:

| Worker A | Worker B | Worker C |
|----------|----------|----------|
| T008, T009, T010, T011 (US1) | T012, T013, T014, T015 (US2) | T016, T017, T018, T019 (US3) |

**In Phase 6**: T020, T022, T023 can run in parallel; T021 and T024 are independent of each other.

---

## Implementation Strategy

**MVP** = Phase 1 + Phase 2 + Phase 3 only (T001–T011)

This delivers User Story 1 — the browser tab favicon — which is the most visible, highest-impact change. It requires no external services, no manual Docker Hub steps, and no README changes.

**Full delivery** = all phases (T001–T024).

**Suggested sequence for a single developer**:
1. Complete Phase 1 (setup, ~15 min)
2. Generate icons manually (Phase 2, T004–T006 — time varies by AI platform)
3. Run generation script T007 (~2 min)
4. Implement US1 (Phase 3, ~20 min) — **ship MVP**
5. Implement US2 (Phase 4, ~20 min)
6. Implement US3 (Phase 5, ~20 min)
7. Polish (Phase 6, ~15 min + Docker Hub manual upload)

---

## Task Count Summary

| Phase | Tasks | User Story | Parallelizable |
|-------|-------|-----------|----------------|
| Phase 1: Setup | 3 | — | 2 of 3 |
| Phase 2: Foundation | 4 | — | 0 of 4 (sequential) |
| Phase 3: US1 Browser Tab | 4 | US1 (P1) | 2 of 4 |
| Phase 4: US2 GitHub | 4 | US2 (P2) | 1 of 4 |
| Phase 5: US3 PWA | 4 | US3 (P3) | 2 of 4 |
| Phase 6: Polish | 5 | — | 3 of 5 |
| **Total** | **24** | | **10 of 24** |

**MVP scope**: T001–T011 (11 tasks, US1 only)
