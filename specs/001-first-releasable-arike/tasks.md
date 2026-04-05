---
description: "Task list template for feature implementation"
---

# Tasks: Arike First Release

**Input**: Design documents from `specs/001-first-releasable-arike/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Testing is mandated with a 90%+ coverage goal (Vitest + Playwright). E2E and unit test tasks are included per user story.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Initialize Next.js 16.2.2 project with App Router and Tailwind CSS by updating `package.json`
- [x] T002 Install and configure shadcn/ui components in `components.json` and `tailwind.config.ts`
- [x] T002b [P] Install and configure Iconify for Material Icons and Simple Icons integration in `package.json`
- [x] T003 [P] Configure Vitest and Playwright test environment (including axe-core for WCAG AA compliance) in `vitest.config.ts` and `playwright.config.ts`
- [x] T004 [P] Create Dockerfile and `docker-compose.yml` for persistence configuration

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Setup SQLite database connection and initialization logic in `src/lib/db.ts`
- [x] T006 Define SQLite database schema (Bookmark, Collection, CollectionBookmark, ThemeSetting) in `src/lib/schema.ts`
- [x] T007 Implement base application layout and ThemeProvider in `src/app/layout.tsx`
- [x] T008 [P] Implement file system storage utility for icon uploads in `src/lib/storage.ts`
- [x] T008b [P] Create base UI state components (Loading, Error, Empty) to ensure 4-state completeness in `src/components/ui/states.tsx`
- [x] T008c [P] Implement health check endpoint returning 200 OK for Docker health monitoring in `src/app/api/health/route.ts`
- [x] T008d [P] Implement icon color theming CSS utilities using `currentColor` inheritance from theme accent color in `src/styles/icons.css`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Set Up and Configure Homepage (Priority: P1) 🎯 MVP

**Goal**: Set up the homepage with current time, search bar, and configurable theme/search provider settings.

**Independent Test**: Load the dashboard, verify the clock and search load properly, change the theme in settings, and observe immediate update without restart.

### Tests for User Story 1

- [ ] T009 [P] [US1] Write E2E test for homepage rendering and theme switching in `tests/e2e/homepage.spec.ts`
- [ ] T010 [P] [US1] Write unit test for theme service in `tests/unit/theme_service.test.ts`

### Implementation for User Story 1

- [ ] T011 [P] [US1] Create ThemeSetting model and service, and seed required default themes (Gruvbox, Catppuccin, Everforest) in `src/services/theme_service.ts`
- [ ] T012 [P] [US1] Create Clock component (mobile-first) to display date and time in `src/components/clock.tsx`
- [ ] T013 [P] [US1] Create SearchBar component (mobile-first) with provider selection and local bookmark search integration in `src/components/search_bar.tsx`
- [ ] T014 [US1] Implement Settings UI panel (mobile-first) for theme customization, including user-defined colors in `src/components/settings_panel.tsx` (Reference `temp/arike-core-flows-wireframes-v2.html` for layout)
- [ ] T015 [US1] Implement server API route for theme settings in `src/app/api/settings/route.ts`
- [ ] T016 [US1] Create main dashboard page assembling Clock, SearchBar, and Settings (mobile-first single-column layout) in `src/app/page.tsx` (Reference `temp/arike-homepage-wireframe-v2.html` for layout)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Bookmark Management (Priority: P1)

**Goal**: Add, edit, and delete a bookmark with URL and icon.

**Independent Test**: Successfully add, edit, and delete a bookmark through the UI.

### Tests for User Story 2

- [ ] T017 [P] [US2] Write E2E test for adding, editing, and deleting a bookmark in `tests/e2e/bookmarks.spec.ts`
- [ ] T018 [P] [US2] Write unit test for bookmark service in `tests/unit/bookmark_service.test.ts`

### Implementation for User Story 2

- [ ] T019 [P] [US2] Implement Bookmark model and service for SQLite CRUD, including duplicate name resolution and icon reference metadata (`builtin:material:[name]`, `builtin:simple:[name]`, `upload:[uuid]`), in `src/services/bookmark_service.ts`
- [ ] T020 [P] [US2] Implement API endpoint for icon file uploads with validation (PNG/JPEG/WebP/SVG, 2MB max, 1024x1024px max, SVG sanitization) in `src/app/api/icons/route.ts`
- [ ] T021 [US2] Implement API endpoints for bookmarks in `src/app/api/bookmarks/route.ts` and `src/app/api/bookmarks/[id]/route.ts`
- [ ] T022 [US2] Create Bookmark Form dialog for adding and editing bookmarks with URL validation and icon picker integration (Material Icons, Simple Icons, and upload options), in `src/components/bookmark_form.tsx` (Reference `temp/arike-core-flows-wireframes-v2.html` for layout)
- [ ] T023 [US2] Create Bookmark Card component to display individual bookmarks, including missing-icon fallback handling, in `src/components/bookmark_card.tsx` (Reference `temp/arike-homepage-wireframe-v2.html` for layout)
- [ ] T024 [US2] Integrate bookmark grid display into the main dashboard in `src/app/page.tsx`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Organize Bookmarks (Priority: P2)

**Goal**: Organize bookmarks into collections and allow a bookmark to belong to multiple collections.

**Independent Test**: Create a collection, move bookmarks into it, and verify visibility.

### Tests for User Story 3

- [ ] T025 [P] [US3] Write E2E test for collection management and bookmark assignment in `tests/e2e/collections.spec.ts`
- [ ] T026 [P] [US3] Write unit test for collection service in `tests/unit/collection_service.test.ts`

### Implementation for User Story 3

- [ ] T027 [P] [US3] Implement Collection and CollectionBookmark models and services in `src/services/collection_service.ts`
- [ ] T028 [US3] Implement API endpoints for managing collections in `src/app/api/collections/route.ts`
- [ ] T029 [US3] Create Collection Manager UI for creating and deleting collections, including empty collection handling, in `src/components/collection_manager.tsx` (Reference `temp/arike-core-flows-wireframes-v2.html` for layout)
- [ ] T030 [US3] Update Bookmark Form to allow assigning bookmarks to multiple collections in `src/components/bookmark_form.tsx`
- [ ] T031 [US3] Implement Collection Tabs to filter bookmarks on the dashboard in `src/app/page.tsx`

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T032 [P] Configure and run automated accessibility auditing (e.g., axe-core with Playwright) in `tests/e2e/accessibility.spec.ts`
- [ ] T032b [P] Add Lighthouse CI performance benchmarking task to validate <2s first paint in `tests/e2e/performance.spec.ts`
- [ ] T033 Implement built-in icon pack picker supporting Material Icons and Simple Icons with searchable grid, pack filter, 40 icons/page pagination, and hover tooltips in `src/components/icon_picker.tsx` (Reference spec §FR-003 for dual-pack requirements and theme color integration)
- [ ] T034 Validate application startup and storage persistence using the command-line start script in `package.json`
- [ ] T035 Update `README.md` with quickstart instructions and maintain `docs/design.md` with architectural decisions

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Integrates into US1 UI but fully testable
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Extends US2 UI and models

### Within Each User Story

- Tests MUST be written before implementation (per project setup)
- Models before services
- Services before endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel
- All tests for a user story marked [P] can run in parallel
- Models within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all models/services for User Story 1 together:
Task: "Create ThemeSetting model and service in src/services/theme_service.ts"
Task: "Create Clock component to display date and time in src/components/clock.tsx"
Task: "Create SearchBar component with provider selection in src/components/search_bar.tsx"

# Launch all tests for User Story 1 together:
Task: "Write E2E test for homepage rendering and theme switching in tests/e2e/homepage.spec.ts"
Task: "Write unit test for theme service in tests/unit/theme_service.test.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Stories complete and integrate independently