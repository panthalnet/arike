# Tasks: Add Modern Theme

**Input**: Design documents from `/home/praveen/Dev/arike/specs/002-add-modern-theme/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Required. The feature specification and implementation plan require unit, integration, E2E, accessibility, and coverage validation.

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel after prerequisite tasks complete
- **[Story]**: Maps tasks to a specific user story (`[US1]`, `[US2]`, `[US3]`, `[US4]`, `[US5]`)
- Each task includes the exact file path to change

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the shared files and scaffolding the feature work will build on.

- [ ] T001 Create shared Modern theme domain types in `src/types/modern_theme.ts`
- [ ] T002 [P] Create Modern theme and layout stylesheet entry points in `src/styles/theme/modern.css`, `src/styles/theme/glassmorphism.css`, and `src/styles/layout/bento_grid.css`
- [ ] T003 [P] Create layout and wallpaper service module scaffolding in `src/services/layout_service.ts` and `src/services/wallpaper_service.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Extend shared persistence and settings infrastructure before any user story work begins.

**⚠️ CRITICAL**: Complete this phase before starting any user story.

- [ ] T004 Extend the shared Drizzle schema for Modern settings, wallpapers, layout mode, and tile presentation in `src/lib/schema.ts`
- [ ] T005 Create the Modern theme migration and default records in `drizzle/0001_add_modern_theme.sql`
- [ ] T006 Extend startup defaults and singleton seeding for Modern theme data in `src/lib/migrate.ts`
- [ ] T007 [P] Extend file storage helpers to manage `data/wallpapers/` alongside icons in `src/lib/storage.ts`
- [ ] T008 Update shared theme settings reads and writes for new persisted fields while keeping Gruvbox as the default in `src/services/theme_service.ts`
- [ ] T009 Update the settings API to accept theme, wallpaper, blur, and layout payloads in `src/app/api/settings/route.ts`

**Checkpoint**: Shared persistence, storage, and settings APIs are ready for independent story delivery.

---

## Phase 3: User Story 1 - Select Modern Theme (Priority: P1) 🎯 MVP

**Goal**: Let users select the Modern theme and immediately see the glassmorphism styling across the homepage and settings surfaces.

**Independent Test**: Switch from Gruvbox to Modern in settings and verify the homepage, search bar, collection chrome, bookmark cards, and settings modal adopt Modern styling immediately and still work after reload.

### Tests for User Story 1

- [ ] T010 [P] [US1] Add Modern theme service coverage in `tests/unit/theme_service.test.ts`
- [ ] T011 [P] [US1] Add Modern theme settings integration coverage in `tests/integration/theme_settings.test.ts`
- [ ] T012 [P] [US1] Add Modern theme switching and persistence coverage in `tests/e2e/homepage.spec.ts`

### Implementation for User Story 1

- [ ] T013 [US1] Add `modern` theme enums, token resolution, and runtime persistence without changing the Gruvbox default in `src/services/theme_service.ts`
- [ ] T014 [P] [US1] Load and apply Modern CSS variables from persisted settings in `src/components/theme-provider.tsx`
- [ ] T015 [P] [US1] Import Modern theme styles in `src/app/layout.tsx` and define Modern CSS variables in `src/app/globals.css` and `src/styles/theme/modern.css`
- [ ] T016 [US1] Expose the Modern option and Modern-only settings sections in `src/components/settings_panel.tsx`
- [ ] T017 [P] [US1] Apply Modern glass surface styling to `src/components/search_bar.tsx`, `src/components/bookmark_card.tsx`, and `src/components/dashboard_content.tsx`
- [ ] T018 [US1] Hydrate the homepage with Modern theme settings on first render in `src/app/page.tsx`

**Checkpoint**: User Story 1 is independently functional and demonstrates the MVP value of the feature.

---

## Phase 4: User Story 2 - Configure Modern Backgrounds (Priority: P1)

**Goal**: Let users choose built-in or uploaded wallpapers for the Modern theme with reliable validation, persistence, and fallback behavior.

**Independent Test**: Activate Modern, choose a built-in wallpaper, upload a valid wallpaper, reload the app, and verify the same wallpaper persists; then trigger a validation failure and confirm the default gradient remains active.

### Tests for User Story 2

- [ ] T019 [P] [US2] Add wallpaper validation and fallback coverage in `tests/unit/wallpaper_service.test.ts`
- [ ] T020 [P] [US2] Add wallpaper settings integration coverage in `tests/integration/wallpaper_settings.test.ts`
- [ ] T021 [P] [US2] Add wallpaper upload, selection, and fallback coverage in `tests/e2e/wallpaper_upload.spec.ts`

### Implementation for User Story 2

- [ ] T022 [US2] Implement wallpaper validation, built-in wallpaper registry, and active wallpaper persistence in `src/services/wallpaper_service.ts`
- [ ] T023 [P] [US2] Add wallpaper list, upload, delete, and set-active handlers in `src/app/api/wallpapers/route.ts` and `src/app/api/wallpapers/[id]/route.ts`
- [ ] T024 [P] [US2] Build the wallpaper uploader and built-in wallpaper picker UI in `src/components/wallpaper_uploader.tsx`
- [ ] T025 [US2] Integrate wallpaper selection, upload errors, and fallback messaging into `src/components/settings_panel.tsx`
- [ ] T026 [US2] Apply the active wallpaper and default gradient fallback in `src/app/page.tsx` and `src/components/theme-provider.tsx`

**Checkpoint**: User Story 2 is independently functional with persisted wallpaper personalization.

---

## Phase 5: User Story 3 - Use Bento Grid Layout (Priority: P1)

**Goal**: Provide Uniform Grid and Bento Grid as independent layout modes, with Bento responsive across desktop, tablet, and mobile.

**Independent Test**: Switch layout to Bento Grid under any theme, verify multi-column placement on desktop and tablet, confirm single-column fallback on mobile, and delete a bookmark to verify compaction removes persistent holes.

### Tests for User Story 3

- [ ] T027 [P] [US3] Add layout mode persistence and compaction coverage in `tests/unit/layout_service.test.ts`
- [ ] T028 [P] [US3] Add layout selector integration coverage in `tests/integration/layout_settings.test.ts`
- [ ] T029 [P] [US3] Add Bento Grid responsiveness and compaction coverage in `tests/e2e/bento_grid.spec.ts`

### Implementation for User Story 3

- [ ] T030 [US3] Implement layout mode persistence, Modern default-to-Bento behavior, and responsive span helpers in `src/services/layout_service.ts`
- [ ] T031 [P] [US3] Add layout mode GET and PUT handlers in `src/app/api/layout/route.ts`
- [ ] T032 [P] [US3] Define responsive Bento Grid rules and dense auto-flow behavior in `src/styles/layout/bento_grid.css`
- [ ] T033 [US3] Render Uniform Grid and Bento Grid from persisted layout state in `src/components/bookmarks_grid.tsx`
- [ ] T034 [US3] Pass layout mode through dashboard state and homepage data hydration in `src/components/dashboard_content.tsx` and `src/app/page.tsx`
- [ ] T035 [US3] Add a layout mode selector to `src/components/settings_panel.tsx`

**Checkpoint**: User Story 3 is independently functional and layout mode is no longer coupled to theme selection.

---

## Phase 6: User Story 4 - Resize Bookmark Tiles (Priority: P2)

**Goal**: Let users set small, medium, or large tile sizes per bookmark when Bento Grid is active.

**Independent Test**: In Bento Grid mode, change a bookmark from small to large, verify the span updates immediately, reload the app, and confirm the same size is restored.

### Tests for User Story 4

- [ ] T036 [P] [US4] Add per-bookmark tile size persistence coverage in `tests/unit/layout_service.test.ts`
- [ ] T037 [P] [US4] Add tile size controls integration coverage in `tests/integration/tile_size_settings.test.ts`
- [ ] T038 [P] [US4] Add bookmark tile resizing coverage in `tests/e2e/bookmarks.spec.ts`

### Implementation for User Story 4

- [ ] T039 [US4] Implement per-bookmark tile size storage and defaulting in `src/services/layout_service.ts`
- [ ] T040 [P] [US4] Add tile size update handlers in `src/app/api/bookmarks/[id]/tile-size/route.ts`
- [ ] T041 [P] [US4] Add tile size controls and size-specific card variants in `src/components/bookmark_card.tsx`
- [ ] T042 [US4] Apply saved small, medium, and large spans in `src/components/bookmarks_grid.tsx` and `src/services/bookmark_service.ts`

**Checkpoint**: User Story 4 is independently functional and tile sizing persists per bookmark.

---

## Phase 7: User Story 5 - Adjust Glass Blur Intensity (Priority: P2)

**Goal**: Let users tune blur intensity for Modern surfaces while preserving readability and fallback behavior.

**Independent Test**: With Modern active, move the blur control across its allowed range, verify glass surfaces update immediately, reload the app, and confirm the same blur level persists with readable fallback surfaces.

### Tests for User Story 5

- [ ] T043 [P] [US5] Add blur bounds and fallback coverage in `tests/unit/theme_service.test.ts`
- [ ] T044 [P] [US5] Add live blur update integration coverage in `tests/integration/blur_settings.test.ts`
- [ ] T045 [P] [US5] Add blur adjustment persistence coverage in `tests/e2e/blur_intensity.spec.ts`

### Implementation for User Story 5

- [ ] T046 [US5] Persist blur intensity and derived fallback surface values in `src/services/theme_service.ts`
- [ ] T047 [P] [US5] Apply blur CSS variables and `@supports` fallbacks in `src/styles/theme/glassmorphism.css` and `src/components/theme-provider.tsx`
- [ ] T048 [US5] Add the blur intensity control, validation, and announcements to `src/components/settings_panel.tsx`
- [ ] T049 [US5] Consume the shared blur variable across Modern surfaces in `src/components/search_bar.tsx`, `src/components/bookmark_card.tsx`, and `src/components/settings_panel.tsx`

**Checkpoint**: User Story 5 is independently functional with persisted blur customization.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, accessibility coverage, and documentation updates across stories.

- [ ] T050 [P] Expand Modern-theme accessibility and contrast audits in `tests/e2e/accessibility.spec.ts`
- [ ] T051 [P] Update user-facing Modern theme documentation and persistence notes in `README.md`
- [ ] T052 [P] Update architecture notes for theme, wallpaper, layout, and tile persistence in `docs/design.md`
- [ ] T053 Run the quickstart acceptance checklist and record any implementation-specific updates in `specs/002-add-modern-theme/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1: Setup**: No dependencies; can start immediately.
- **Phase 2: Foundational**: Depends on Phase 1; blocks all user story work.
- **Phase 3: User Story 1**: Depends on Phase 2; delivers the MVP.
- **Phase 4: User Story 2**: Depends on Phase 3 because wallpaper behavior is only exposed for the Modern theme.
- **Phase 5: User Story 3**: Depends on Phase 2; layout mode is theme-independent.
- **Phase 6: User Story 4**: Depends on Phase 5 because tile sizing only applies to Bento Grid.
- **Phase 7: User Story 5**: Depends on Phase 3 because blur controls only apply to the Modern theme.
- **Phase 8: Polish**: Depends on all desired user stories being complete.

### User Story Dependencies

- **US1 (P1)**: Starts after Foundational; no story dependency.
- **US2 (P1)**: Starts after US1.
- **US3 (P1)**: Starts after Foundational; no story dependency.
- **US4 (P2)**: Starts after US3.
- **US5 (P2)**: Starts after US1.

### Within Each User Story

- Write the story tests first and confirm they fail before implementation.
- Finish service and persistence changes before API handlers.
- Finish API handlers before wiring UI controls.
- Finish UI wiring before story-specific polish and verification.

## Parallel Opportunities

- Phase 1 setup tasks `T002` and `T003` can run in parallel.
- In Phase 2, `T007` can run in parallel with schema and migration work once the storage approach is confirmed.
- After Phase 2, US1 and US3 can proceed in parallel.
- After US1 completes, US2 and US5 can proceed in parallel.
- Inside each user story, the test tasks and marked `[P]` implementation tasks can be split across developers.

---

## Parallel Example: User Story 1

```bash
# After T013 completes
T014 Load and apply Modern CSS variables in src/components/theme-provider.tsx
T015 Import Modern theme styles in src/app/layout.tsx and define CSS variables in src/app/globals.css and src/styles/theme/modern.css
T017 Apply Modern glass surface styling in src/components/search_bar.tsx, src/components/bookmark_card.tsx, and src/components/dashboard_content.tsx
```

## Parallel Example: User Story 2

```bash
# After T022 completes
T023 Add wallpaper API handlers in src/app/api/wallpapers/route.ts and src/app/api/wallpapers/[id]/route.ts
T024 Build the wallpaper uploader UI in src/components/wallpaper_uploader.tsx
```

## Parallel Example: User Story 3

```bash
# After T030 completes
T031 Add layout mode handlers in src/app/api/layout/route.ts
T032 Define responsive Bento Grid rules in src/styles/layout/bento_grid.css
```

## Parallel Example: User Story 4

```bash
# After T039 completes
T040 Add tile size update handlers in src/app/api/bookmarks/[id]/tile-size/route.ts
T041 Add tile size controls in src/components/bookmark_card.tsx
```

## Parallel Example: User Story 5

```bash
# After T046 completes
T047 Apply blur CSS variables and fallbacks in src/styles/theme/glassmorphism.css and src/components/theme-provider.tsx
T048 Add the blur intensity control in src/components/settings_panel.tsx
```

---

## Implementation Strategy

### MVP First

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 (US1) and validate Modern theme switching independently.
3. Stop after US1 if an MVP-only release is needed.

### Incremental Delivery

1. Ship US1 for Modern theme selection.
2. Add US3 for layout independence and Bento Grid.
3. Add US2 for wallpaper personalization.
4. Add US5 for blur tuning.
5. Add US4 for tile sizing.

### Parallel Team Strategy

1. One developer completes Phase 1 and Phase 2.
2. After Foundational, split work between US1 and US3.
3. After US1 lands, split follow-up work between US2 and US5.
4. Finish US4 after Bento Grid is stable.

---

## Notes

- `[P]` marks tasks that can run in parallel after their prerequisite tasks complete.
- Every user story remains independently testable against its stated test criteria.
- Gruvbox remains the default theme for new users throughout the implementation.
- Favor small commits grouped by completed task or checkpoint.