# Feature Specification: Arike First Release

**Feature Branch**: `001-first-releasable-arike`  
**Created**: 2026-04-04
**Status**: Draft  
**Input**: User description: "Build the first releasable version of Arike as a self-hosted, open-source browser startup page and personal dashboard for everyday users."

## Clarifications

### Session 2026-04-04
- Q: whether a bookmark can belong to multiple tabs? → A: Yes, it can and it is user's choice
- Q: how uploaded bookmark icons are stored and reused? → A: Store icon files in a persistent volume directory; store file path/ID in bookmark metadata.
- Q: whether theme settings are per user or app-wide? → A: Per user (Note: For the first release, as multi-user is excluded, this implies per-installation configuration).
- Q: what mobile behavior should be considered mandatory in release 1? → A: Single-column vertical stacking; touch-optimized UI; no mobile-specific navigation required.
- Q: rename tab groups to 'collections'? → A: Yes, rename 'tabs/groups' to 'collections'.
- Q: support command-line startup without Docker? → A: Yes, first-class command-line startup is supported in v1.
- Q: Which default icon packs are provided in the built-in icon library and what is the policy for their selection? → A: Only a single well-known open-source icon pack (e.g., Material Icons or RemixIcon, licensed Apache 2.0 or MIT, from icon-sets.iconify.design) is included by default; users may upload custom icons.

## User Scenarios & Testing

### User Story 1 - Set Up and Configure Homepage (Priority: P1)

Users need to self-host Arike and configure it as their browser startup page to start their day.

**Why this priority**: Core value proposition for the first release.

**Independent Test**: Successfully deploy the application and confirm the homepage loads in a browser.

**Acceptance Scenarios**:

1. **Given** a fresh installation, **When** the user opens the application URL in a browser, **Then** the homepage displays the current time, a search bar, and an empty bookmark section.
2. **Given** the homepage is loaded, **When** the user updates the theme or search provider in settings, **Then** the changes are applied immediately without a restart.

---

### User Story 2 - Bookmark Management (Priority: P1)

Users need to manage bookmarks to organize their frequently visited sites.

**Why this priority**: Fundamental feature for a browser homepage.

**Independent Test**: Successfully add, edit, and delete a bookmark.

**Acceptance Scenarios**:

1. **Given** the homepage, **When** the user adds a new bookmark with a URL and icon, **Then** the bookmark appears on the homepage.
2. **Given** existing bookmarks, **When** the user deletes a bookmark, **Then** it is removed from the homepage and storage.

---

### User Story 3 - Organize Bookmarks (Priority: P2)

Users need to organize bookmarks into collections to maintain a clean homepage.

**Why this priority**: Essential for usability as the number of bookmarks grows.

**Independent Test**: Successfully create a collection and move bookmarks into it.

**Acceptance Scenarios**:

1. **Given** the homepage, **When** the user creates a new collection, **Then** it is visible on the dashboard.
2. **Given** multiple collections, **When** the user assigns a bookmark to a specific collection, **Then** the bookmark only appears in that collection.
3. **Given** an existing bookmark, **When** the user assigns it to multiple collections, **Then** the bookmark appears in all associated collections.

---

### Edge Cases

- **Invalid URLs**: What happens when a user enters an malformed URL?
- **Empty Collections**: What happens when a user deletes all bookmarks in a collection?
- **Duplicate Names**: How does the system handle two bookmarks with the same name?
- **Missing Icons**: How are bookmarks displayed if an uploaded icon is missing?
- **First Startup**: How does the system handle the initial load with zero existing data?
- **Mobile Layout**: How does the dashboard behave when viewed on small mobile screens?

## Requirements

### Functional Requirements

- **FR-001**: System MUST display current date, time, search bar, and bookmark area on the homepage.
- **FR-002**: Users MUST be able to create, edit, and delete bookmarks through the UI.
- **FR-003**: System MUST allow users to choose from a built-in icon library consisting of a single well-known open-source icon pack (e.g., Material Icons or RemixIcon, licensed Apache 2.0 or MIT, from icon-sets.iconify.design), or upload their own icons. Uploaded icons MUST be persisted in a dedicated directory on a persistent volume and linked via path/ID in bookmark metadata.
- **FR-004**: Users MUST be able to organize the homepage into multiple collections. A bookmark MUST support being assigned to multiple collections.
- **FR-005**: Search bar MUST support both web search and bookmark search.
- **FR-006**: Users MUST be able to select a search provider.
- **FR-007**: UI MUST support themes (Gruvbox, Catppuccin, Everforest) and user-defined color customization. These settings MUST be applied per user (as the system is single-user for v1, this corresponds to per-installation settings).
- **FR-008**: System MUST persist all user data and preferences across restarts and redeployments.
- **FR-009**: Mobile interface MUST use a single-column vertical layout that is touch-optimized, requiring no mobile-specific navigation structures.
- **FR-010**: System MUST support first-class command-line startup without Docker, using the same persisted dashboard data and settings as the Docker deployment path.

### Key Entities

- **Bookmark**: Represents a URL, name, and icon reference (file path/ID). Can be associated with multiple collections.
- **Collection**: Represents a container for bookmarks.
- **Theme**: Represents color customization values and selected search provider settings.
- **Deployment Mode**: Represents the supported runtime path for the application, including Docker and command-line startup.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Users can set up and start using Arike in under 5 minutes.
- **SC-002**: Homepage loads in under 2 seconds.
- **SC-003**: 100% of user data and preferences persist across application restarts.
- **SC-004**: Homepage is fully functional and responsive on both desktop and mobile devices (single-column vertical stacking).
- **SC-005**: Users can start Arike from the command line without Docker and access the same persisted dashboard data.

## Assumptions

- Users have basic technical knowledge required to self-host Arike using Docker or the command line.
- Modern browsers (Chrome, Firefox, Safari) are used for accessing the dashboard.
- Default settings for themes and search are acceptable for a new installation.
