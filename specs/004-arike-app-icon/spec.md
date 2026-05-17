# Feature Specification: Arike App Icon & Brand Identity

**Feature Branch**: `004-arike-app-icon`  
**Created**: 2026-05-16  
**Status**: Draft  
**Input**: User description: "I need to generate an icon for Arike. The icon will be used in github and browser tab. Also check if there are places where I should use the icon (considering I'm not a UX engineer) and suggest. If the AI coding agent is the right place to generate icon, we should research and find out the right AI platform to generate icon for this opensource project"

## Clarifications

### Session 2026-05-16

- Q: Should Docker Hub icon presence include the repository logo (visible on hub.docker.com), an OCI image annotation in the Dockerfile, or both? → A: Both — Docker Hub repository logo upload + OCI `org.opencontainers.image.logo` annotation in Dockerfile
- Q: What should the Arike icon look like visually? → A: Thematic symbol — "closer to home"; "Arike" means "closer" in Malayalam, so the icon should convey the concept of being closer to home (a home/warmth/proximity motif)
- Q: What color style should the icon use? → A: Dark background with warm accent — deep navy/charcoal background with a warm amber/gold or soft purple glow, matching Arike's existing glassmorphism aesthetic
- Q: Should AI platform research and icon generation both happen within this feature, or research only? → A: Both — tasks include evaluating AI platforms, generating the icon using the chosen tool, and committing resulting assets
- Q: Should the icon include a light-background variant for README/documentation contexts? → A: Two variants — dark-background icon (favicon, browser tab, Docker Hub, social preview) + transparent/light variant (README and documentation on light backgrounds)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browser Tab Recognition (Priority: P1)

As an end user opening Arike in their browser, I want to see a recognizable Arike icon in the browser tab so I can quickly identify the Arike tab when I have many tabs open.

**Why this priority**: The browser tab favicon is the most visible and frequently seen representation of the app. Without a favicon, browsers show a generic default icon, which undermines perceived professionalism and brand recognition.

**Independent Test**: Can be fully tested by loading the Arike app and observing the browser tab — it should display the Arike icon instead of the browser default.

**Acceptance Scenarios**:

1. **Given** the Arike app is running, **When** a user navigates to Arike in their browser, **Then** the browser tab displays the Arike icon (not a blank/default icon)
2. **Given** the browser tab shows the Arike icon, **When** the user views the tab in a standard tab strip, **Then** the icon is clear and recognizable at 16×16 and 32×32 pixel sizes
3. **Given** the Arike app is bookmarked in the browser, **When** the user views their bookmarks, **Then** the Arike icon appears alongside the bookmark name

---

### User Story 2 - GitHub Repository Presence (Priority: P2)

As a potential user or contributor browsing GitHub, I want to see a recognizable Arike icon/logo on the repository page so that I immediately understand this is a real, maintained project with a distinct identity.

**Why this priority**: GitHub is the primary discovery channel for open-source projects. A recognizable icon in the repository social preview and README improves first impressions and signals project quality.

**Independent Test**: Can be tested by visiting the Arike GitHub repository and confirming an identifiable icon is present in the repository header/README.

**Acceptance Scenarios**:

1. **Given** someone lands on the Arike GitHub repository page, **When** they view the README, **Then** the Arike icon/logo appears at the top of the README as a project header image
2. **Given** the Arike repo has a social preview image configured, **When** someone shares the GitHub link (on Slack, Twitter, etc.), **Then** the link unfurl/preview shows the Arike icon prominently
3. **Given** a contributor shares the Arike link in a chat or document, **When** the URL is previewed, **Then** the preview image includes the Arike icon and name

---

### User Story 3 - Home Screen / PWA Installation (Priority: P3)

As a user who installs Arike as a Progressive Web App or home screen shortcut, I want the installed app icon to look polished so that Arike looks like a first-class app on my device.

**Why this priority**: PWA/home screen installations are a natural use case for a browser startup page app. A missing icon falls back to a screenshot, which looks amateurish.

**Independent Test**: Can be tested by using "Add to Home Screen" on mobile or "Install App" on desktop Chrome and verifying the resulting icon matches the Arike brand.

**Acceptance Scenarios**:

1. **Given** a user adds Arike to their home screen, **When** they view their home screen, **Then** the Arike icon is shown at the expected size (not a blank or generic icon)
2. **Given** the icon is installed on mobile, **When** the user views it at standard home screen icon sizes (60×60 to 192×192), **Then** the icon is sharp and unambiguous

---

### Edge Cases

- What happens if the icon file is missing or fails to load? The browser falls back to a default generic icon — this is acceptable behavior.
- How does the icon appear at very small sizes (16×16)? The icon design must remain identifiable when reduced to favicon size.
- Does the icon work on both light and dark browser themes? The icon should be legible against both light and dark browser chrome.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: An Arike brand icon MUST be designed and made available in SVG format (scalable, suitable as the source asset), in two variants: (a) dark-background with warm accent for app/favicon/Docker/social use, and (b) transparent-background with dark icon for README and light-context documentation
- **FR-002**: The icon MUST be exported in raster sizes: 16×16, 32×32, 180×180 (Apple touch), 192×192, and 512×512 pixels in PNG format (48×48 is not required — no modern browser favicon spec mandates it separately from 32×32 and 64×64)
- **FR-003**: A `.ico` file containing 16×16 and 32×32 variants MUST be provided for maximum browser compatibility
- **FR-004**: The Next.js application MUST serve the favicon from the `app/` directory so it appears in the browser tab automatically
- **FR-005**: The Next.js app metadata MUST be updated to include `icons` and Open Graph image references
- **FR-006**: A `site.webmanifest` file MUST be created and linked in the app metadata, referencing the 192×192 and 512×512 icons for PWA support
- **FR-007**: An Apple touch icon (180×180) MUST be included and referenced in the app metadata for iOS home screen installations
- **FR-008**: The README MUST be updated to display the Arike icon at the top as a project logo
- **FR-009**: A social preview image (1200×630 px) MUST be created for GitHub repository Open Graph use (GitHub accepts 1200×630; this is the same image served by Next.js at `/opengraph-image.png`)
- **FR-010**: An AI icon generation platform MUST be researched and recommended for creating the initial icon artwork, with preference for free/open-source-friendly tools
- **FR-010a**: The icon MUST be generated using the chosen AI platform as part of this feature — resulting SVG/PNG assets MUST be committed to the repository

### AI Platform Research Requirement

- **FR-011**: Research MUST identify the top candidates for AI-assisted icon/logo generation suitable for an open-source project, evaluating: free tier availability, SVG export capability, commercial use license, and output quality for simple iconographic art
- **FR-012**: The research output MUST recommend a single primary platform and an alternative, with reasoning

### Docker Hub Branding Requirements

- **FR-013**: The Arike icon MUST be uploaded as the Docker Hub repository logo on hub.docker.com/r/panthalnet/arike (manual step; instructions MUST be documented)
- **FR-014**: The Dockerfile MUST include an OCI image annotation label `org.opencontainers.image.logo` pointing to the canonical icon URL (e.g., the raw GitHub asset URL for the 512×512 PNG)

### Key Entities

- **Brand Icon**: The primary visual mark for Arike — a thematic symbol conveying "closer to home" (inspired by the Malayalam meaning of "Arike" = closer). Visual motif: a home/house shape combined with a warmth or proximity element (e.g., a subtle glow, concentric arcs, or a gentle curve suggesting nearness). Key attributes: SVG source, two color variants — (a) dark-background/warm-accent for app contexts, (b) transparent/light-background for documentation — square aspect ratio, legible at 16×16 px
- **Favicon**: Browser tab icon derived from the brand icon. Formats: `.ico` (16/32), `favicon.svg`, `favicon-96x96.png`
- **PWA Manifest Icons**: Raster PNG icons used by the web app manifest for installation. Sizes: 192×192, 512×512
- **Apple Touch Icon**: 180×180 PNG for iOS home screen
- **Social Preview Image**: 1200×630 PNG for GitHub and Open Graph link previews

## Icon Placement Map *(Where the Icon Should Be Used)*

The following locations in the Arike project should use the brand icon, listed in implementation priority order:

| Location | Purpose | Format | Size | Priority |
|----------|---------|--------|------|----------|
| `src/app/favicon.ico` | Browser tab icon (Next.js auto-serves) | ICO | 16×16, 32×32 | P1 |
| `src/app/icon.svg` | Next.js app icon (metadata API, auto-injects `<link rel="icon">`) | SVG | scalable | P1 |
| `src/app/icon.png` | Next.js app icon fallback (metadata API) | PNG | 512×512 | P1 |
| `public/apple-touch-icon.png` | iOS home screen icon | PNG | 180×180 | P2 |
| `public/icon-192.png` | PWA manifest icon | PNG | 192×192 | P2 |
| `public/icon-512.png` | PWA manifest icon (splash) | PNG | 512×512 | P2 |
| `src/app/manifest.ts` | PWA metadata (typed Next.js route, served at `/manifest.webmanifest`) | TypeScript | — | P2 |
| `README.md` header | Project logo in docs | PNG/SVG | ~120px tall | P2 |
| GitHub Social Preview | Repository link unfurl image | PNG | 1200×630 | P2 |
| `public/og-image.png` | Open Graph / Twitter card | PNG | 1200×630 | P3 |
| Docker Hub repository logo | Branding on hub.docker.com/r/panthalnet/arike | PNG | 240×240 | P2 |
| `Dockerfile` OCI label | Machine-readable icon metadata for container image | URL ref | — | P3 |

*Note: Next.js 13+ App Router automatically serves `src/app/favicon.ico` and `src/app/icon.*` — no manual `<link>` tags needed.*

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The Arike browser tab displays a recognizable icon (not the browser default) within 1 second of page load
- **SC-002**: The icon is legible and identifiable at the smallest favicon size (16×16 pixels) without requiring magnification
- **SC-003**: The Arike GitHub repository displays a branded social preview image when its URL is shared in any major social platform or chat tool
- **SC-004**: The Arike app can be added to a device home screen and displays the brand icon (not a screenshot fallback)
- **SC-005**: The README displays the Arike logo as a visual header, making the project immediately identifiable on the GitHub repository page
- **SC-006**: All icon assets (both dark and light variants, all required sizes) are available in the codebase as committed files — no external CDN dependency for core brand assets
- **SC-007**: An AI platform recommendation is documented with clear rationale, licensing terms, and step-by-step instructions for a non-UX developer to generate the icon
- **SC-008**: The Arike Docker Hub repository page (hub.docker.com/r/panthalnet/arike) displays the Arike icon as its repository logo
- **SC-009**: The published Docker container image includes the `org.opencontainers.image.logo` OCI annotation referencing the canonical Arike icon URL

## Assumptions

- The Arike brand color palette is: **dark background** (deep navy or charcoal, e.g. `#0f172a` / `#1e293b`) with a **warm accent** — amber/gold or soft purple glow — matching the existing Modern glassmorphism theme. The icon must look cohesive alongside the app's dark UI.
- "Arike" means "closer" in Malayalam. The icon concept is **"closer to home"** — a thematic symbol combining a home motif with a sense of warmth or proximity. This meaning should inform the AI generation prompt and the overall visual identity.
- Icon generation via AI is acceptable for an open-source project provided the resulting asset has a compatible license for open-source distribution (e.g., CC0 or the AI platform's standard commercial license)
- A coding agent (like GitHub Copilot) is not the right tool to generate visual artwork — a dedicated AI image generation platform is needed; this spec covers researching which one is most appropriate
- The icon does not need to be animated in v1
- Docker Hub container image branding is **in scope**: both the repository logo (manual upload) and the Dockerfile OCI annotation are required
- Internationalization/RTL considerations do not apply to icon assets
