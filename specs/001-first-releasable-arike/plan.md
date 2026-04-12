# Implementation Plan: Arike First Release

**Branch**: `001-first-releasable-arike` | **Date**: 2026-04-04 | **Spec**: [specs/001-first-releasable-arike/spec.md](specs/001-first-releasable-arike/spec.md)
**Input**: Feature specification from `specs/001-first-releasable-arike/spec.md`

## Summary

Arike is a self-hosted, open-source browser startup page and personal dashboard. 
The v1 release focuses on:
- Persistent homepage with date/time, search, and bookmark collections.
- Full UI-driven configuration (no config files).
- Modern, responsive design (desktop + mobile) using Tailwind/shadcn.
- Local SQLite persistence and theme support.

## Technical Context

**Language/Version**: Next.js 16.2.2 (App Router) / Node 20
**Primary Dependencies**: Next.js, SQLite, Tailwind, shadcn/ui
**Storage**: SQLite (`./data/arike.db`)
**Testing**: Vitest + Playwright (90%+ coverage mandate)
**Target Platform**: Docker container or command-line (self-hosted)
**Project Type**: Web application (standalone)
**Performance Goals**: <2s first paint
**Constraints**: No external APIs, no auth, no YAML/JSON config editing, mobile responsive single-column
**Scale/Scope**: Single-user, local-only

### Wireframes
- **Homepage Layout**: `temp/arike-homepage-wireframe-v2.html`
- **Core Flows & Modals**: `temp/arike-core-flows-wireframes-v2.html`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] Self-hosted first (no cloud deps)
- [x] UI-driven config (no YAML/restarts)
- [x] Responsive design (mobile + desktop)
- [x] Layered architecture (typed contracts)
- [x] 90%+ test coverage
- [x] Documentation integrity (README + docs/design.md)
- [x] Permissive licensing (MIT/Apache only)

## Project Structure

### Documentation (this feature)

```text
specs/001-first-releasable-arike/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output
```

### Source Code

```text
src/
├── app/                 # Next.js App Router
├── components/          # UI components (shadcn)
├── lib/                 # Database access, utilities
├── services/            # Domain logic (bookmarks, collections)
└── types/               # Typed contracts
tests/
├── e2e/
├── integration/
└── unit/
```

**Structure Decision**: Standard Next.js + SQLite project structure using domain-driven separation.

## Delivery Approach

The implementation is organized as vertical slices per user story. Shared infrastructure work should be introduced only when it directly enables a user-facing capability and should remain coupled to the story that consumes it.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A       | N/A        | N/A                                 |
