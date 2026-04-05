<!--
SYNC IMPACT REPORT
==================
Version change: (template placeholders) → 1.0.0
Bump rationale: Initial constitution adoption (MAJOR)

Modified principles: N/A (all new)

Added sections:
- Core Principles (7 principles)
- Workflow Gates
- Definition of Done
- Governance

Removed sections: N/A (template placeholders replaced)

Templates status:
- .specify/templates/plan-template.md: ✅ Compatible (Constitution Check section works generically)
- .specify/templates/spec-template.md: ✅ Compatible (user scenarios support acceptance criteria)
- .specify/templates/tasks-template.md: ⚠️ Recommend future update: tests should be mandatory per 90% coverage rule

Follow-up TODOs: None
-->

# Arike Constitution

## Core Principles

### I. Self-Hosted First

Arike MUST operate as a fully self-hosted application with zero cloud dependencies.

- **Offline-capable**: All core functionality MUST work without internet connectivity
- **No external services required**: The application MUST NOT depend on cloud APIs for basic operation
- **UI-driven configuration**: All user settings MUST be configurable through the UI; YAML files or
  application restarts are PROHIBITED for user-facing configuration changes
- **Performance**: First paint MUST complete in under 2 seconds; this is a browser homepage and
  startup latency is unacceptable

**Rationale**: Users choose self-hosted solutions for privacy, reliability, and control. Cloud
dependencies undermine these goals and create single points of failure.

### II. Responsive by Design

The application MUST deliver a native-quality experience on both mobile and desktop from initial release.

- **Mobile-first responsive**: Every component MUST be designed mobile-first, then enhanced for desktop
- **Design tokens**: Theming MUST use design tokens for colors, spacing, border-radius, and motion
- **No viewport-specific features**: Features MUST NOT be desktop-only or mobile-only unless
  physically impossible (e.g., hover states on touch devices)

**Rationale**: Browser homepages are accessed from all devices. Treating mobile as an afterthought
creates a fragmented user experience.

### III. Layered Architecture

The codebase MUST maintain strict separation between UI, domain logic, and persistence layers.

- **Typed contracts**: All layer boundaries MUST have explicit TypeScript interfaces defining the contract
- **Vertical slices only**: Every feature MUST be implemented as a complete vertical slice from UI to
  database; horizontal "foundation" layers without user-facing functionality are PROHIBITED
- **Pluggable adapters**: External integrations (search engines, calendars, RSS feeds, icon providers)
  MUST use adapter interfaces allowing runtime substitution
- **Graceful degradation**: When external providers fail or are unavailable, the application MUST
  continue functioning with clear user feedback about reduced functionality

**Rationale**: Layered architecture with typed contracts enables testing, maintainability, and the
ability to swap implementations without cascading changes.

### IV. Modern Stable Stack

Technology choices MUST prioritize stability and strong typing over novelty.

- **2026 standards**: Use current stable versions of frameworks and libraries; "cutting edge" is
  acceptable, "bleeding edge" is not
- **Strong typing everywhere**: TypeScript strict mode is MANDATORY; `any` types require explicit
  justification in code review
- **Docker-first delivery**: The primary distribution method MUST be Docker images; users SHOULD be
  able to deploy with a single `docker run` command
- **Reproducible development**: Development environment MUST be reproducible via containerization or
  locked dependency manifests; "works on my machine" is a blocking defect
- **No experimental dependencies**: Dependencies MUST have stable releases (v1.0+) unless explicitly
  justified in a design document and approved

**Rationale**: Stability reduces maintenance burden. Strong typing catches errors at compile time.
Docker ensures consistent deployment across environments.

### V. Quality Gates (NON-NEGOTIABLE)

Quality standards are mandatory checkpoints, not aspirational goals.

- **Test coverage**: Minimum 90% coverage across unit, integration, and E2E tests; PRs reducing
  coverage below threshold MUST be rejected
- **E2E testability**: Every feature MUST be designed for E2E testing; if a feature cannot be
  automatically tested end-to-end, the design MUST be revised
- **Accessibility**: WCAG AA compliance is MANDATORY; full keyboard navigation MUST be supported;
  reduced motion preferences MUST be respected
- **State completeness**: Every feature MUST implement and test all four states: empty, loading,
  error, and success; missing states block merge

**Rationale**: Quality gates prevent technical debt accumulation. Accessibility is a legal
requirement in many jurisdictions and an ethical imperative everywhere.

### VI. Documentation Discipline

Documentation MUST be minimal, accurate, and maintained.

- **Two files only**:
  - `README.md`: User-facing guide including features, installation, configuration, and screenshots
  - `docs/design.md`: Architecture decisions, system design, and technical rationale
- **Always current**: Documentation MUST be updated in the same PR as code changes; outdated
  documentation is a blocking defect
- **No duplication**: Information MUST exist in exactly one place; cross-references are preferred
  over copy-paste

**Rationale**: Excessive documentation becomes stale and misleading. Two well-maintained files
provide more value than a sprawling wiki.

### VII. Legal Compliance

All code MUST have clear, permissive licensing with no legal encumbrances.

- **No copyleft code**: Code from AGPL, GPL, or other copyleft-licensed projects MUST NOT be copied
  or adapted; inspiration is acceptable, implementation MUST be original
- **Permissive dependencies only**: All dependencies MUST be licensed under MIT, Apache 2.0, BSD,
  or similarly permissive licenses
- **License verification**: Dependency licenses MUST be verified before addition; automated license
  scanning SHOULD be part of CI
- **Original implementation**: All features MUST be original implementations; when referencing
  existing solutions for design inspiration, implementation MUST be written from scratch

**Rationale**: License compliance protects the project and its users from legal liability.
Permissive licensing enables broad adoption.

## Workflow Gates

Development workflow MUST enforce quality through mandatory checkpoints.

- **Spec-first development**: No implementation work MAY begin without an approved specification
  document; "approved" means explicit sign-off from a project maintainer
- **Human review for critical changes**: Architecture modifications and persistence layer changes
  REQUIRE human review and explicit approval before merge; automated approval is PROHIBITED for
  these change types
- **Constitution enforcement**: Pull requests violating any constitutional principle MUST be
  rejected regardless of other merits; "we'll fix it later" is not acceptable

## Definition of Done

A feature is complete ONLY when ALL of the following are true:

- [ ] **Spec implemented**: All requirements from the approved specification are implemented
- [ ] **Tests pass**: All tests pass with minimum 90% coverage maintained
- [ ] **Mobile validated**: Feature tested and functional on mobile viewport (375px minimum)
- [ ] **Docs updated**: README.md and/or docs/design.md updated if feature affects users or architecture
- [ ] **No license violations**: All new dependencies verified for permissive licensing

Work not meeting ALL criteria is incomplete and MUST NOT be merged.

## Governance

This constitution is the supreme authority for project decisions. All practices, processes, and
code MUST comply with these principles.

### Amendment Procedure

1. Proposed amendments MUST be documented in a dedicated PR with rationale
2. Amendments REQUIRE explicit approval from project maintainers
3. Breaking changes to principles REQUIRE migration plan for existing code
4. Version number MUST be incremented according to semantic versioning:
   - MAJOR: Principle removal or incompatible redefinition
   - MINOR: New principle or material expansion
   - PATCH: Clarification or non-semantic refinement

### Compliance

- All pull requests MUST include constitution compliance verification
- Reviewers MUST reject non-compliant changes regardless of other factors
- Complexity additions MUST be justified against constitutional principles
- Runtime development guidance is available in project documentation

### Rejection Policy

This constitution MANDATES rejection of any work that:
- Introduces cloud dependencies for core functionality
- Requires YAML editing or restarts for user configuration
- Breaks mobile responsiveness
- Falls below 90% test coverage
- Lacks accessibility compliance
- Uses copyleft-licensed code or dependencies
- Proceeds without approved specification

**Version**: 1.0.0 | **Ratified**: 2026-04-04 | **Last Amended**: 2026-04-04
