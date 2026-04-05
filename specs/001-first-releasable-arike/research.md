# Research: Arike First Release

**Status**: Phase 0 Complete

## Decision Log

- **Decision**: Next.js 16.2.2 with App Router
  - **Rationale**: Stable framework, server-side capabilities for self-hosting performance (<2s paint).
  - **Alternatives**: Express (too low level), Remix (good, but Next.js community/stability preferred for self-hosting).
- **Decision**: SQLite (bookmarks.db)
  - **Rationale**: Minimal setup, single-file persistence, fits single Docker container pattern perfectly.
  - **Alternatives**: Postgres (too heavy for a simple dashboard).
- **Decision**: shadcn/ui + Tailwind
  - **Rationale**: Fast UI component development, excellent custom theming, accessibility-first (matches WCAG AA requirement).
  - **Alternatives**: Material UI (too opinionated/heavy), raw CSS (too slow).
- **Decision**: Docker image (node:20-alpine)
  - **Rationale**: Standard, reproducible, lightweight container image.
  - **Alternatives**: Custom Distroless (too complex for MVP).

## Unknowns Resolved
- **Storage Strategy**: SQLite chosen for ease of deployment.
- **Icon Management**: Filesystem-based persistence (storage volume) with path linking in SQLite records chosen for performance/scalability.
- **Mobile responsiveness**: Single-column vertical layout defined as mandatory.
