# Implementation Plan: GitHub Actions CI/CD with Versioning and Docker Hub Publishing

**Branch**: `003-github-actions-cicd` | **Date**: 2026-05-02 | **Spec**: [spec.md](spec.md)  
**Input**: Feature specification from `specs/003-github-actions-cicd/spec.md`

## Summary

Add GitHub Actions CI/CD pipelines to arike: a `ci.yml` workflow that runs lint, typecheck, build, unit tests (90% coverage), and E2E tests on every push and pull request; a `release.yml` workflow that triggers on SemVer version tags (`v*.*.*`) to create a GitHub Release with auto-generated notes, build a multi-platform Docker image (`linux/amd64` + `linux/arm64`), and publish it to Docker Hub as `panthalnet/arike`. A local `scripts/release.sh` helper scripts the full release ceremony (version bump → commit → tag → push). README.md gains 5 auto-updating shields.io badges. First release will be `v0.1.0-beta.1`.

## Technical Context

**Language/Version**: TypeScript / Node.js 20 (Next.js 16.2.2)  
**Primary Dependencies**: GitHub Actions (ubuntu-latest runners), Docker Buildx, `docker/metadata-action@v5`, `docker/build-push-action@v6`, `docker/setup-buildx-action@v3`, `docker/login-action@v3`, `softprops/action-gh-release@v2`, `actions/setup-node@v4`, `actions/cache@v4`  
**Storage**: N/A — workflow artifacts are ephemeral; SQLite database is not involved in CI/CD  
**Testing**: Vitest (unit + coverage, 90% threshold), Playwright (E2E, chromium), `next lint`, `tsc --noEmit`  
**Target Platform**: GitHub Actions runners (`ubuntu-latest`), Docker Hub (`panthalnet/arike`, public repository)  
**Project Type**: CI/CD configuration (YAML workflow files) for an existing Next.js web application  
**Performance Goals**: CI workflow completes in under 5 minutes; release workflow completes in under 10 minutes  
**Constraints**: Public GitHub repository (unlimited free Actions minutes); free Docker Hub account (unlimited public image repos); Docker Hub account `panthalnet` not yet created — setup required before first release  
**Scale/Scope**: Single maintainer, solo open-source project; two workflow files + one helper script + README badge row

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Self-Hosted First | ✅ Pass | CI/CD does not introduce cloud dependencies; app remains fully self-hostable |
| II. Responsive by Design | ✅ N/A | No UI changes in this feature |
| III. Layered Architecture | ✅ Pass | No application code changes; workflows do not touch layer boundaries |
| IV. Modern Stable Stack — Docker-first delivery | ✅ **Directly implements** | This feature IS the Docker image publishing pipeline; directly mandated by the constitution |
| V. Quality Gates — lint, typecheck, build, 90% coverage | ✅ **Directly implements** | CI workflow enforces all quality gates on every push and PR |
| VI. Documentation Discipline | ✅ Pass | README.md badge row is the only doc change; it will be updated in this PR |
| VII. Legal Compliance | ✅ Pass | All GitHub Actions used are MIT or Apache 2.0 licensed |

**Gate result: PASS — no violations. Proceed to Phase 0.**

## Project Structure

### Documentation (this feature)

```text
specs/003-github-actions-cicd/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output — Docker Hub setup guide + release ceremony
├── contracts/
│   ├── workflow-triggers.md   # What events trigger which workflows
│   ├── release-process.md     # Maintainer release ceremony contract
│   └── docker-tags.md         # Docker image tag naming contract
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
.github/
└── workflows/
    ├── ci.yml           # Continuous integration: lint, typecheck, build, test, E2E
    └── release.yml      # Release: GitHub Release creation + Docker Hub publish

scripts/
└── release.sh           # Local helper: version bump → commit → tag → push

README.md                # Updated: 5 shields.io badges added below project title
```

**Structure Decision**: Single project layout. New files are GitHub Actions configuration in `.github/workflows/` and a helper script in `scripts/`. Existing files modified by this feature are `README.md`, `package.json`, `package-lock.json`, and `playwright.config.ts`. No changes are planned for `src/`, `tests/`, or application runtime code.

## Complexity Tracking

> No constitution violations. Section not applicable.
