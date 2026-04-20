# Feature Specification: Add Modern Theme

**Feature Branch**: `002-add-modern-theme`  
**Created**: 2026-04-19  
**Status**: Draft  
**Input**: User description: "Add a new built-in theme to Arike called Modern with glassmorphism visual style, bento grid layout, wallpaper support, tile sizing, and adjustable blur intensity."

## Clarifications

### Session 2026-04-19
- Q: Should Modern support both dark and light variants in v1? → A: No; Modern is dark-only in v1, light variant deferred.
- Q: Should Bento Grid replace the existing way bookmarks are shown in collections? → A: Layout is a separate setting from theme; provide Uniform Grid and Bento Grid for all themes, with Modern defaulting to Bento.
- Q: What should be the default theme for a new user? → A: Gruvbox remains the default theme for new users in v1.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Select Modern Theme (Priority: P1)

Users want to select a new built-in Modern theme so the homepage has a visually distinct glass-like design while preserving existing behavior.

**Why this priority**: Theme selection is the entry point for all other Modern-theme capabilities and must work seamlessly with existing themes.

**Independent Test**: Switch from an existing theme to Modern and verify the homepage and settings surfaces adopt Modern visuals immediately and remain usable.

**Acceptance Scenarios**:

1. **Given** the user is in settings, **When** they select "Modern", **Then** the homepage and settings surfaces update immediately to the Modern appearance without requiring restart.
2. **Given** Modern is active, **When** the homepage loads, **Then** cards, panels, bookmark tiles, collection headers, search bar, and settings modal all display frosted-glass style surfaces with readable text.
3. **Given** the user switches from Modern to Catppuccin and back to Modern, **When** the switch completes, **Then** Modern token values are restored correctly.

---

### User Story 2 - Configure Modern Backgrounds (Priority: P1)

Users want their own wallpaper or high-quality defaults so the Modern glass effect has meaningful depth and personalization.

**Why this priority**: Modern visuals depend on having a background layer that works with translucent surfaces.

**Independent Test**: Activate Modern, upload a wallpaper, restart the app, and verify the same wallpaper appears; then clear wallpaper and verify fallback background appears.

**Acceptance Scenarios**:

1. **Given** Modern is active and no wallpaper is set, **When** the homepage loads, **Then** a default gradient background is shown behind glass surfaces.
2. **Given** Modern is active, **When** the user uploads a supported wallpaper image, **Then** the wallpaper is applied and persists across restarts.
3. **Given** Modern is active, **When** the user chooses a built-in wallpaper, **Then** the selected wallpaper is applied immediately and persists.
4. **Given** an uploaded wallpaper is corrupt or unsupported, **When** validation fails, **Then** the app shows an error and falls back to the default gradient.

---

### User Story 3 - Use Bento Grid Layout (Priority: P1)

Users want an asymmetric but organized bookmark layout so the homepage can be expressive without coupling layout choice to a specific theme.

**Why this priority**: Layout choice directly impacts daily homepage usability and should work consistently across theme selections.

**Independent Test**: Add bookmarks of different tile sizes, remove one, and confirm remaining tiles realign without visual holes across desktop and tablet widths.

**Acceptance Scenarios**:

1. **Given** any theme is active and layout is set to Bento Grid on desktop, **When** bookmarks are displayed, **Then** the bookmark area uses a multi-column bento layout with balanced tile placement.
2. **Given** any theme is active and layout is set to Bento Grid on tablet, **When** bookmarks are displayed, **Then** the bookmark area uses a reduced-column bento layout appropriate to tablet size.
3. **Given** a bookmark tile is deleted, **When** layout recomputes, **Then** remaining tiles auto-align and fill gaps without persistent blank holes.
4. **Given** viewport width is below mobile threshold, **When** Bento Grid is selected, **Then** layout collapses to a single-column vertical stack consistent with existing mobile behavior.
5. **Given** Modern is selected and no layout was manually chosen, **When** the homepage loads, **Then** default layout is Bento Grid.

---

### User Story 4 - Resize Bookmark Tiles (Priority: P2)

Users want to set bookmark tile size to small, medium, or large so they can prioritize visual hierarchy in the bento grid.

**Why this priority**: Tile sizing adds control and personalization after the base layout is available.

**Independent Test**: Change a bookmark from small to large and verify the tile span updates and persists in Modern.

**Acceptance Scenarios**:

1. **Given** Modern is active, **When** the user sets tile size to small, medium, or large, **Then** the tile span changes accordingly in the grid.
2. **Given** tile sizes are configured, **When** the app restarts, **Then** each bookmark retains its assigned size.

---

### User Story 5 - Adjust Glass Blur Intensity (Priority: P2)

Users want to tune blur intensity to match readability and personal preference.

**Why this priority**: Blur adjustment improves comfort and accessibility for varying backgrounds and display conditions.

**Independent Test**: Change blur intensity within the 8px-20px supported range and verify all glass surfaces update immediately and persist after restart.

**Acceptance Scenarios**:

1. **Given** Modern is active, **When** the user adjusts blur intensity within the supported range, **Then** all Modern glass surfaces update immediately.
2. **Given** blur intensity is set to minimum, **When** Modern surfaces render, **Then** surfaces remain readable using a subtle fallback surface treatment.

---

### Edge Cases

- If visual blur effects are not supported by the browser, the system falls back to a semi-opaque surface style that preserves readability and contrast.
- If uploaded wallpaper files are invalid, corrupted, or unsupported, the upload is rejected with a clear error and the default gradient remains active.
- If malformed theme, wallpaper, layout, or tile-size requests reach the system, they are rejected with a clear validation error and persisted state remains unchanged.
- If wallpaper upload or activation fails after file handling begins, the system cleans up partial files and preserves the previously active background.
- If bento tiles would overflow on smaller screens, the layout enforces single-column stacking below the mobile breakpoint.
- If blur intensity is set to the minimum supported value of 8px, text remains readable through a reinforced background treatment.
- If users switch repeatedly between Modern and other built-in themes, each theme restores its own tokens and saved settings without leakage.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide "Modern" as an additional built-in theme option alongside existing built-in themes, with a dark-only Modern variant in v1.
- **FR-002**: When Modern is selected, system MUST apply a frosted-glass visual treatment to cards, panels, bookmark tiles, collection headers, search bar, and settings modal.
- **FR-003**: System MUST provide a complete Modern token set for background, surface, text, accent, border, blur intensity, and border radius values that follow the existing runtime theming contract.
- **FR-004**: System MUST apply Modern theme changes at runtime without restart and persist selected Modern token values across restarts.
- **FR-005**: System MUST provide a Modern background mode with user wallpaper and a default gradient fallback when no wallpaper is set.
- **FR-006**: Users MUST be able to upload a custom wallpaper while Modern is active, and the wallpaper MUST persist across restarts in persistent storage.
- **FR-007**: System MUST provide at least three built-in wallpapers for Modern that can be selected without uploading files.
- **FR-008**: System MUST provide layout as an independent setting from theme with options: Uniform Grid and Bento Grid.
- **FR-009**: System MUST default layout to Bento Grid when Modern is selected, while preserving user-selected layout overrides across all themes.
- **FR-010**: When layout is set to Bento Grid, system MUST render the bookmark area using a responsive bento grid pattern on desktop and tablet, and single-column layout on mobile.
- **FR-011**: Users MUST be able to set bookmark tile sizes to small, medium, or large when Bento Grid is active, and the selected size MUST persist per bookmark.
- **FR-012**: System MUST auto-align and compact bento tiles after bookmark deletions or changes so no persistent blank holes remain.
- **FR-013**: Users MUST be able to adjust Modern blur intensity between 8px and 20px inclusive, and changes MUST apply immediately and persist.
- **FR-014**: System MUST maintain minimum WCAG AA body text contrast (4.5:1) on Modern surfaces across supported backgrounds.
- **FR-015**: If wallpaper validation fails or visual blur capability is unavailable, system MUST use defined fallback behavior that preserves usability and readability.
- **FR-016**: For fresh installations and new users, system MUST default theme selection to Gruvbox; Modern remains user-selectable but not default in v1.

### Key Entities *(include if feature involves data)*

- **ModernThemePreference**: Stores whether Modern is selected and the current Modern token overrides, including blur intensity.
- **WallpaperAsset**: Represents an uploaded or built-in wallpaper selection, including source type, reference, and active status.
- **LayoutPreference**: Stores the persisted layout mode independently from theme selection so user-selected overrides survive theme switches.
- **BookmarkTilePresentation**: Represents per-bookmark presentation settings for Modern, including tile size category (small/medium/large).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of theme switches between Modern and existing built-in themes apply within 300ms and without restart in validation tests.
- **SC-002**: In visual QA checks, 100% of required Modern surfaces exhibit frosted-glass styling with readable text at or above 4.5:1 contrast.
- **SC-003**: In restart persistence tests, wallpaper selection, blur intensity, and tile sizes are retained in 100% of runs.
- **SC-004**: In responsive layout tests, Bento Grid uses multi-column layout on desktop/tablet and single-column layout on mobile in 100% of test viewports across all themes.
- **SC-005**: After deleting tiles in bento layout tests, grid compaction removes persistent blank holes in at least 95% of generated layout permutations.

## Assumptions

- Modern extends the existing single-user, per-installation theme preference model already defined for v1.
- Modern remains dark-only in v1 to align with the current built-in dark theme set; light Modern variant is deferred.
- Layout is configured independently from theme with Uniform Grid and Bento Grid available to all themes; Modern defaults to Bento Grid.
- Gruvbox remains the default theme for new users in v1 unless explicitly changed by the user.
- Wallpaper upload constraints follow existing image safety and validation standards used elsewhere in the product.
- Built-in wallpapers include at least three curated options bundled with the release and available offline.
- Tile sizing affects only visual span when Bento Grid is active and does not alter bookmark data semantics.
