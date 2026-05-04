# Tasks: GitHub Actions CI/CD with Versioning and Docker Hub Publishing

**Input**: Design documents from `/specs/003-github-actions-cicd/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: No new automated test files are required by this feature. Existing repository checks (`npm run lint`, `npx tsc --noEmit`, `npm run build`, `npm run test:coverage`, `npm run test:e2e`) are wired into CI and used as the validation gates for implementation.

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish repository-level prerequisites for workflow automation.

- [X] T001 Update CI/release package metadata and add ESLint flat-config compatibility dependency in package.json
- [X] T002 Refresh dependency lockfile entries for the CI/release prerequisite changes in package-lock.json

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Fix repository automation prerequisites that block the workflows from running successfully.

**⚠️ CRITICAL**: No user story work should be considered complete until these prerequisites are in place.

- [X] T003 [P] Create ESLint 9 flat configuration compatible with Next.js 16 in eslint.config.mjs
- [X] T004 [P] Add CI-friendly production `webServer` settings for Playwright in playwright.config.ts

**Checkpoint**: Repository automation prerequisites are fixed; CI and release workflow implementation can proceed.

---

## Phase 3: User Story 1 - CI Validates Every Code Change (Priority: P1) 🎯 MVP

**Goal**: Run lint, typecheck, build, coverage, and E2E checks on every push and pull request.

**Independent Test**: Push a branch or open a pull request and confirm GitHub runs the `quality` and `e2e` jobs from `.github/workflows/ci.yml`, reporting pass/fail status back to the commit or PR.

### Implementation for User Story 1

- [X] T005 [US1] Create push/PR CI workflow with `quality` and `e2e` jobs, concurrency control, npm caching, and minimal permissions in .github/workflows/ci.yml
- [X] T006 [P] [US1] Document the required `quality` status check and branch-protection expectation for contributors in README.md
- [X] T007 [US1] Validate the quality-gate commands and observed CI runtime in .github/workflows/ci.yml against the repository scripts, config, and the 5-minute success criterion

**Checkpoint**: User Story 1 is functional when commit and PR automation runs all required checks and exposes merge-ready status.

---

## Phase 4: User Story 2 - Maintainer Creates a Version Release (Priority: P2)

**Goal**: Turn a pushed SemVer tag into a GitHub Release with generated notes and a repeatable maintainer release flow.

**Independent Test**: Run `bash scripts/release.sh 0.1.0-beta.1`, push the resulting tag, and confirm `.github/workflows/release.yml` publishes a GitHub Release marked as pre-release with auto-generated notes.

### Implementation for User Story 2

- [X] T008 [P] [US2] Create maintainer release helper that bumps version, commits, tags, and pushes in scripts/release.sh
- [X] T009 [US2] Create tag-triggered GitHub Release automation with SemVer tag filters, prerelease detection, tag-to-package.json version guard, and release permissions in .github/workflows/release.yml
- [X] T010 [P] [US2] Add maintainer-facing versioning and release instructions for beta and stable tags in README.md
- [X] T011 [US2] Validate tag filters, prerelease handling, tag-to-package.json version consistency enforcement, GitHub Release generation behavior, and observed release workflow runtime in .github/workflows/release.yml against the 10-minute success criterion

**Checkpoint**: User Story 2 is functional when the maintainer can create a beta or stable tag and GitHub publishes the correct release entry automatically.

---

## Phase 5: User Story 3 - Docker Image Published on Every Release (Priority: P3)

**Goal**: Publish multi-platform Docker images to Docker Hub for each release, with correct `latest` and `beta` tag behavior.

**Independent Test**: Trigger a release tag and confirm `.github/workflows/release.yml` pushes `panthalnet/arike` images for `linux/amd64` and `linux/arm64`, with `:latest` only for stable releases and `:beta` only for pre-releases.

### Implementation for User Story 3

- [X] T012 [US3] Extend .github/workflows/release.yml with Docker Buildx, QEMU, Docker Hub login, multi-platform build, cache, and publish steps
- [X] T013 [US3] Add a container smoke-test step to .github/workflows/release.yml that runs the built image and verifies the existing health endpoint responds successfully
- [X] T014 [P] [US3] Add Docker Hub account setup, secret names, image pull commands, and stable/beta tag guidance in README.md
- [X] T015 [US3] Validate Docker tag derivation, multi-platform targets, container startup, health-check behavior, and secret usage rules implemented in .github/workflows/release.yml

**Checkpoint**: User Story 3 is functional when a release produces the expected Docker Hub image tags and users can pull the documented image names.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Finalize user-facing documentation and harden workflow consistency across stories.

- [X] T016 [P] Add the 5 auto-updating shields.io badges row below the project title in README.md
- [X] T017 Harden shared workflow defaults such as permissions, concurrency, and cache consistency across .github/workflows/ci.yml and .github/workflows/release.yml
- [X] T018 Validate the first-release flow, documented commands, and observed CI/release durations in scripts/release.sh and README.md against the success criteria

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1: Setup**: No dependencies; start immediately.
- **Phase 2: Foundational**: Depends on Phase 1; blocks completion of all user stories because lint and E2E bootstrapping must work before automation is trustworthy.
- **Phase 3: User Story 1**: Depends on Phase 2.
- **Phase 4: User Story 2**: Depends on Phase 2.
- **Phase 5: User Story 3**: Depends on Phase 4 because Docker publishing extends the release workflow created for User Story 2.
- **Phase 6: Polish**: Depends on the user stories you want included in the release-ready increment.

### User Story Dependencies

- **User Story 1 (P1)**: No dependency on other stories after Foundational.
- **User Story 2 (P2)**: No dependency on User Story 1 after Foundational, but should only be merged once repository quality gates are reliable.
- **User Story 3 (P3)**: Depends on User Story 2 because it extends `.github/workflows/release.yml` and reuses the release ceremony.

### Within Each User Story

- Configure supporting files before validating workflow behavior.
- Workflow/job implementation before documentation that references the final job names or commands.
- Story-specific validation after the story’s implementation tasks complete.

---

## Parallel Opportunities

- **Foundational**: T003 and T004 can run in parallel because they touch different files.
- **User Story 1**: T006 can run in parallel with T005 because it documents the final `quality` job name and contributor expectations in a different file.
- **User Story 2**: T008 and T010 can run in parallel while T009 is being prepared, because the release script and README instructions live in different files.
- **User Story 3**: T014 can run in parallel with T012 because it documents Docker Hub usage in a different file.
- **Polish**: T016 can run in parallel with T017 because README badge wiring and workflow hardening touch different files.

---

## Parallel Example: User Story 1

```bash
Task: "Document the required `quality` status check and branch-protection expectation for contributors in README.md"
Task: "Create push/PR CI workflow with `quality` and `e2e` jobs, concurrency control, npm caching, and minimal permissions in .github/workflows/ci.yml"
```

## Parallel Example: User Story 2

```bash
Task: "Create maintainer release helper that bumps version, commits, tags, and pushes in scripts/release.sh"
Task: "Add maintainer-facing versioning and release instructions for beta and stable tags in README.md"
```

## Parallel Example: User Story 3

```bash
Task: "Extend .github/workflows/release.yml with Docker Buildx, QEMU, Docker Hub login, multi-platform build, cache, and publish steps"
Task: "Add Docker Hub account setup, secret names, image pull commands, and stable/beta tag guidance in README.md"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational prerequisites.
3. Complete Phase 3: User Story 1.
4. Validate push/PR CI behavior from `.github/workflows/ci.yml` before moving to release automation.

### Incremental Delivery

1. Finish Setup + Foundational so lint and Playwright CI prerequisites are stable.
2. Deliver User Story 1 to protect all future changes with CI.
3. Deliver User Story 2 so version tags create GitHub Releases.
4. Deliver User Story 3 so releases also publish Docker images.
5. Finish Polish to make the repository landing page and workflow defaults production-ready.

### Suggested Team Strategy

1. One engineer handles Phase 1 and Phase 2.
2. After Foundational completes:
   - Engineer A: User Story 1
   - Engineer B: User Story 2
3. After User Story 2 lands:
   - Engineer C (or Engineer B): User Story 3
4. Finish with a shared Polish pass over README and workflow defaults.
