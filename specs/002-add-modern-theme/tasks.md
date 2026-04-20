# Tasks: Add Modern Theme

**Input**: Design documents from `/home/praveen/Dev/arike/specs/002-add-modern-theme/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Required. The feature specification and implementation plan require unit, integration, E2E, accessibility, and coverage validation.

**Organization**: Tasks are grouped by user story to support vertical-slice implementation and incremental delivery.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel after prerequisite tasks complete
- **[Story]**: Maps tasks to a specific user story (`[US1]`, `[US2]`, `[US3]`, `[US4]`, `[US5]`)
- Each task includes the exact file path to change

## Phase 1: User Story 1 - Select Modern Theme (Priority: P1) 🎯 MVP

**Goal**: Let users select the Modern theme and immediately see the glassmorphism styling across the homepage and settings surfaces.

**Independent Test**: Switch from Gruvbox to Modern in settings and verify the homepage, search bar, collection chrome, bookmark cards, and settings modal adopt Modern styling immediately and still work after reload.

### Tests for User Story 1

- [ ] T001 [P] [US1] Add Modern theme service coverage in `tests/unit/theme_service.test.ts`
- [ ] T002 [P] [US1] Add Modern theme settings integration coverage, including malformed settings payload rejection, in `tests/integration/theme_settings.test.ts`
- [ ] T003 [P] [US1] Add Modern theme switching and persistence coverage in `tests/e2e/homepage.spec.ts`

### Implementation for User Story 1

- [ ] T004 [US1] Add Modern theme support and selected-theme persistence in `src/services/theme_service.ts`
- [ ] T005 [P] [US1] Define Modern CSS variables and shared glass tokens in `src/app/globals.css` and `src/styles/theme/modern.css`
- [ ] T006 [P] [US1] Load and apply Modern CSS variables from persisted settings in `src/components/theme-provider.tsx`
- [ ] T007 [US1] Expose Modern theme selection with pending, success, and error states in `src/components/settings_panel.tsx`
- [ ] T008 [P] [US1] Apply Modern glass surface styling to `src/components/search_bar.tsx`, `src/components/bookmark_card.tsx`, and `src/components/dashboard_content.tsx`
- [ ] T009 [US1] Hydrate Modern theme settings on first render and add shared runtime schema validation for theme-settings request payloads in `src/app/page.tsx` and `src/app/api/settings/route.ts`

**Checkpoint**: User Story 1 is independently functional and delivers the MVP.

---

## Phase 2: User Story 2 - Configure Modern Backgrounds (Priority: P1)

**Goal**: Let users choose built-in or uploaded wallpapers for the Modern theme with reliable validation, persistence, and fallback behavior.

**Independent Test**: Activate Modern, choose a built-in wallpaper, upload a valid wallpaper, reload the app, and verify the same wallpaper persists; then trigger a validation failure and confirm the default gradient remains active.

### Tests for User Story 2

- [ ] T010 [P] [US2] Add wallpaper validation, rollback, and fallback coverage in `tests/unit/wallpaper_service.test.ts`
- [ ] T011 [P] [US2] Add wallpaper settings integration coverage, including invalid upload metadata rejection and no-op persistence on invalid input, in `tests/integration/wallpaper_settings.test.ts`
- [ ] T012 [P] [US2] Add wallpaper upload, selection, fallback, and partial-failure recovery coverage in `tests/e2e/wallpaper_upload.spec.ts`

### Implementation for User Story 2

- [ ] T013 [US2] Add wallpaper persistence schema and migration in `src/lib/schema.ts` and `drizzle/0001_add_modern_theme.sql`
- [ ] T014 [P] [US2] Extend file storage helpers to manage `data/wallpapers/` in `src/lib/storage.ts`
- [ ] T015 [US2] Implement wallpaper validation, built-in wallpaper registry, transaction-backed active wallpaper persistence, and cleanup of failed uploads in `src/services/wallpaper_service.ts` and `src/lib/storage.ts`
- [ ] T016 [P] [US2] Add wallpaper list, upload, delete, and set-active handlers with shared runtime schema validation for request bodies, route params, and upload metadata in `src/app/api/wallpapers/route.ts` and `src/app/api/wallpapers/[id]/route.ts`
- [ ] T017 [P] [US2] Build the wallpaper uploader with empty, loading, error, and success states in `src/components/wallpaper_uploader.tsx`
- [ ] T018 [US2] Integrate wallpaper selection, fallback messaging, and pending/error UI that preserves the last known good background on failed changes in `src/components/settings_panel.tsx` and `src/components/theme-provider.tsx`
- [ ] T019 [US2] Apply the active wallpaper and default gradient fallback in `src/app/page.tsx`

**Checkpoint**: User Story 2 is independently functional with persisted wallpaper personalization.

---

## Phase 3: User Story 3 - Use Bento Grid Layout (Priority: P1)

**Goal**: Provide Uniform Grid and Bento Grid as independent layout modes, with Bento responsive across desktop, tablet, and mobile.

**Independent Test**: Switch layout to Bento Grid under any theme, verify multi-column placement on desktop and tablet, confirm single-column fallback on mobile, and delete a bookmark to verify compaction removes persistent holes.

### Tests for User Story 3

- [ ] T020 [P] [US3] Add layout mode persistence and compaction coverage in `tests/unit/layout_service.test.ts`
- [ ] T021 [P] [US3] Add layout selector integration coverage, including invalid layout payload rejection, in `tests/integration/layout_settings.test.ts`
- [ ] T022 [P] [US3] Add Bento Grid responsiveness and compaction coverage in `tests/e2e/bento_grid.spec.ts`

### Implementation for User Story 3

- [ ] T023 [US3] Add layout preference persistence schema and migration in `src/lib/schema.ts` and `drizzle/0001_add_modern_theme.sql`
- [ ] T024 [US3] Implement layout mode persistence and Modern default-to-Bento behavior in `src/services/layout_service.ts`
- [ ] T025 [P] [US3] Add layout mode GET and PUT handlers with shared runtime schema validation in `src/app/api/layout/route.ts`
- [ ] T026 [P] [US3] Define responsive Bento Grid rules and dense auto-flow behavior in `src/styles/layout/bento_grid.css`
- [ ] T027 [US3] Render Uniform Grid and Bento Grid from persisted layout state in `src/components/bookmarks_grid.tsx`
- [ ] T028 [US3] Pass layout mode through dashboard state and homepage data hydration in `src/components/dashboard_content.tsx` and `src/app/page.tsx`
- [ ] T029 [US3] Add a layout mode selector with loading, rollback, and error states to `src/components/settings_panel.tsx`

**Checkpoint**: User Story 3 is independently functional and layout mode remains decoupled from theme selection.

---

## Phase 4: User Story 4 - Resize Bookmark Tiles (Priority: P2)

**Goal**: Let users set small, medium, or large tile sizes per bookmark when Bento Grid is active.

**Independent Test**: In Bento Grid mode, change a bookmark from small to large, verify the span updates immediately, reload the app, and confirm the same size is restored.

### Tests for User Story 4

- [ ] T030 [P] [US4] Add per-bookmark tile size persistence coverage in `tests/unit/layout_service.test.ts`
- [ ] T031 [P] [US4] Add tile size controls integration coverage, including invalid tile size rejection, in `tests/integration/tile_size_settings.test.ts`
- [ ] T032 [P] [US4] Add bookmark tile resizing coverage in `tests/e2e/bookmarks.spec.ts`

### Implementation for User Story 4

- [ ] T033 [US4] Add bookmark tile presentation persistence schema and migration in `src/lib/schema.ts` and `drizzle/0001_add_modern_theme.sql`
- [ ] T034 [US4] Implement per-bookmark tile size persistence in `src/services/layout_service.ts` and `src/services/bookmark_service.ts`
- [ ] T035 [P] [US4] Add tile size update handlers with shared runtime schema validation in `src/app/api/bookmarks/[id]/tile-size/route.ts`
- [ ] T036 [US4] Add tile size controls with saving and failure states in `src/components/bookmark_card.tsx`
- [ ] T037 [US4] Apply saved small, medium, and large spans in `src/components/bookmarks_grid.tsx` and `src/styles/layout/bento_grid.css`

**Checkpoint**: User Story 4 is independently functional and tile sizing persists per bookmark.

---

## Phase 5: User Story 5 - Adjust Glass Blur Intensity (Priority: P2)

**Goal**: Let users tune blur intensity for Modern surfaces while preserving readability and fallback behavior.

**Independent Test**: With Modern active, move the blur control across the 8px-20px allowed range, verify glass surfaces update immediately, reload the app, and confirm the same blur level persists with readable fallback surfaces.

### Tests for User Story 5

- [ ] T038 [P] [US5] Add blur bounds and fallback coverage in `tests/unit/theme_service.test.ts`
- [ ] T039 [P] [US5] Add live blur update integration coverage in `tests/integration/blur_settings.test.ts`
- [ ] T040 [P] [US5] Add blur adjustment persistence coverage in `tests/e2e/blur_intensity.spec.ts`

### Implementation for User Story 5

- [ ] T041 [US5] Add blur persistence fields and migration in `src/lib/schema.ts` and `drizzle/0001_add_modern_theme.sql`
- [ ] T042 [US5] Persist 8px-20px blur intensity and fallback surface values in `src/services/theme_service.ts`
- [ ] T043 [P] [US5] Apply blur CSS variables and `@supports` fallbacks in `src/styles/theme/glassmorphism.css` and `src/components/theme-provider.tsx`
- [ ] T044 [US5] Add the blur intensity slider with loading, success, and error announcements to `src/components/settings_panel.tsx`
- [ ] T045 [US5] Consume the shared blur variable across Modern surfaces in `src/components/search_bar.tsx`, `src/components/bookmark_card.tsx`, and `src/components/settings_panel.tsx`

**Checkpoint**: User Story 5 is independently functional with persisted blur customization.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, accessibility coverage, and documentation updates across stories.

- [ ] T046 [P] Expand Modern-theme accessibility and contrast audits, including loading and error states, in `tests/e2e/accessibility.spec.ts`
- [ ] T047 [P] Update user-facing Modern theme documentation and persistence notes in `README.md`
- [ ] T048 [P] Update architecture notes for theme, wallpaper, layout, tile persistence, state handling, structured logging, and error taxonomy in `docs/design.md`
- [ ] T049 [P] Add structured logging and stable error categories for theme, wallpaper, layout, and tile-size services and routes in `src/services/theme_service.ts`, `src/services/wallpaper_service.ts`, `src/services/layout_service.ts`, `src/app/api/settings/route.ts`, `src/app/api/wallpapers/route.ts`, `src/app/api/wallpapers/[id]/route.ts`, `src/app/api/layout/route.ts`, and `src/app/api/bookmarks/[id]/tile-size/route.ts`
- [ ] T050 Run lint, typecheck, production build, coverage, E2E, and the quickstart acceptance checklist; record any implementation-specific updates in `specs/002-add-modern-theme/quickstart.md`

---

## Phase 7: Review Gate (Mandatory)

**Purpose**: Satisfy the constitution requirement for explicit human review of persistence and architecture changes before merge.

- [ ] T051 Request and record explicit human review and approval for changes affecting `src/lib/schema.ts`, `drizzle/0001_add_modern_theme.sql`, and `docs/design.md` only after lint, typecheck, production build, coverage, and E2E verification pass

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1: User Story 1**: No dependencies; can start immediately and delivers the MVP.
- **Phase 2: User Story 2**: Depends on User Story 1 because wallpaper behavior is only exposed for the Modern theme.
- **Phase 3: User Story 3**: Depends on User Story 2 because layout persistence lands in the shared schema and migration files after wallpaper persistence.
- **Phase 4: User Story 4**: Depends on User Story 3 because tile sizing builds on Bento Grid and updates the same persistence artifacts.
- **Phase 5: User Story 5**: Depends on User Story 4 because blur persistence is intentionally sequenced after the other schema and migration changes.
- **Phase 6: Polish**: Depends on all desired user stories being complete.
- **Phase 7: Review Gate**: Depends on Phase 6 and blocks merge until explicit human approval is recorded.

### User Story Dependencies

- **US1 (P1)**: Can start immediately.
- **US2 (P1)**: Starts after US1.
- **US3 (P1)**: Starts after US2.
- **US4 (P2)**: Starts after US3.
- **US5 (P2)**: Starts after US4.

### Within Each User Story

- Write the story tests first and confirm they fail before implementation.
- Finish story-scoped persistence and service changes before API handlers.
- Finish API handlers before wiring UI controls.
- Finish UI wiring before story-specific validation and polish.

## Parallel Opportunities

- Inside each user story, the test tasks and marked `[P]` implementation tasks can be split across developers.
- Cross-story work is intentionally sequenced because US2-US5 all modify `src/lib/schema.ts` and `drizzle/0001_add_modern_theme.sql`.

---

## Parallel Example: User Story 1

```bash
# After T004 completes
T005 Define Modern CSS variables in src/app/globals.css and src/styles/theme/modern.css
T006 Load and apply Modern CSS variables in src/components/theme-provider.tsx
T008 Apply Modern glass surface styling in src/components/search_bar.tsx, src/components/bookmark_card.tsx, and src/components/dashboard_content.tsx
```

## Parallel Example: User Story 2

```bash
# After T015 completes
T016 Add wallpaper API handlers in src/app/api/wallpapers/route.ts and src/app/api/wallpapers/[id]/route.ts
T017 Build the wallpaper uploader UI in src/components/wallpaper_uploader.tsx
```

## Parallel Example: User Story 3

```bash
# After T024 completes
T025 Add layout mode handlers in src/app/api/layout/route.ts
T026 Define responsive Bento Grid rules in src/styles/layout/bento_grid.css
```

## Parallel Example: User Story 4

```bash
# After T034 completes
T035 Add tile size update handlers in src/app/api/bookmarks/[id]/tile-size/route.ts
T036 Add tile size controls in src/components/bookmark_card.tsx
```

## Parallel Example: User Story 5

```bash
# After T042 completes
T043 Apply blur CSS variables and fallbacks in src/styles/theme/glassmorphism.css and src/components/theme-provider.tsx
T044 Add the blur intensity control in src/components/settings_panel.tsx
```

---

## Implementation Strategy

### MVP First

1. Complete User Story 1.
2. Stop and validate Modern theme switching independently.
3. Release the MVP if only theme selection is needed.

### Incremental Delivery

1. Ship US1 for Modern theme selection.
2. Add US2 for wallpaper personalization.
3. Add US3 for layout independence and Bento Grid.
4. Add US4 for tile sizing.
5. Add US5 for blur tuning.
6. Complete Polish and the mandatory Review Gate before merge.

### Parallel Team Strategy

1. One developer owns the shared persistence changes across US2-US5 to avoid conflicts in `src/lib/schema.ts` and `drizzle/0001_add_modern_theme.sql`.
2. Other developers parallelize `[P]` tasks inside the currently active story.
3. Request explicit human review after Polish and before merge.

---

## Notes

- `[P]` marks tasks that can run in parallel after their prerequisite tasks complete.
- Every user story remains independently testable against its stated test criteria.
- There is no shared setup or foundational phase; each story owns its persistence, API, UI, and tests.
- US2-US5 are intentionally sequenced because they touch shared persistence artifacts.
- Gruvbox remains the default theme for new users throughout the implementation.
- Favor small commits grouped by completed task or checkpoint.