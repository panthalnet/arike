# Feature Specification: GitHub Actions CI/CD with Versioning and Docker Hub Publishing

**Feature Branch**: `003-github-actions-cicd`  
**Created**: 2026-05-02  
**Status**: Draft  
**Input**: User description: "Enable GitHub Actions, versioning/releases, and Docker image publishing to Docker Hub"

## Clarifications

### Session 2026-05-02

- Q: What pre-release tag format should be used? → A: `v1.0.0-beta.1` (strict SemVer, dot-separated counter)
- Q: Should pre-release Docker images also get a floating `:beta` tag on Docker Hub? → A: Yes — exact version tag plus floating `:beta` tag (e.g., `v1.0.0-beta.1` and `beta`)
- Q: What rule governs MAJOR / MINOR / PATCH version increments? → A: Standard app-level SemVer — MAJOR for breaking changes (config format, manual DB migration, removed features), MINOR for new backward-compatible features, PATCH for bug fixes and security updates
- Q: What is the first release version, given the product is still in beta? → A: `v0.1.0-beta.1` — `package.json` will be downgraded from `1.0.0` to `0.1.0-beta.1`; `v1.0.0` is reserved for the first stable release declaration
- Q: What style of README status indicators should be used? → A: shields.io badges (not OpenSSF Scorecard)
- Q: Which specific badges should appear in the README? → A: Essential 5 — Version, CI status, Docker Hub pulls, License, Docker Image Size
- Q: Is fixing the broken `next lint` command in scope for this feature? → A: Yes — it is a prerequisite for CI. Root cause: project uses ESLint 9 but has no `eslint.config.mjs` flat config file (required by Next.js 16 + ESLint 9). Fix: create `eslint.config.mjs` with Next.js standard flat config. This is a single-file addition with no risk of scope creep.
- Q: How should version synchronization be enforced? → A: The local `scripts/release.sh` helper updates and commits `package.json` before tagging, and the release workflow must fail before publishing if the pushed git tag does not match the committed `package.json` version.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - CI Validates Every Code Change (Priority: P1)

As a project maintainer, when I push code to any branch or open a pull request, I want automated checks to run — including linting, unit tests, and a production build — so that I can catch broken code before it reaches the main branch.

**Why this priority**: This is the foundation of a healthy open-source project. It protects the `main` branch from broken code, and it signals to contributors that the project has quality standards. This is the most immediately useful workflow.

**Independent Test**: Can be fully tested by pushing a commit or opening a pull request to the repository and observing that automated checks appear on the PR/commit status within a few minutes, reporting pass or fail.

**Acceptance Scenarios**:

1. **Given** a developer pushes a commit to any branch, **When** the push is received by GitHub, **Then** a CI workflow runs lint checks, unit tests, and a production build within 5 minutes and reports the result as a green check or red ✗ on the commit.
2. **Given** a contributor opens a pull request, **When** the PR is created or updated, **Then** all CI checks must pass before the PR can be merged (branch protection enforces this).
3. **Given** any CI check fails (e.g., a test breaks), **When** the failure occurs, **Then** the maintainer receives a notification and the commit/PR is marked as failing, preventing accidental merges.
4. **Given** all CI checks pass, **When** the workflow completes, **Then** the commit is marked with a green status indicating it is safe to merge.

---

### User Story 2 - Maintainer Creates a Version Release (Priority: P2)

As the project maintainer, when I decide my changes are stable and ready for users, I want to create a versioned release by tagging the code — and have GitHub automatically create a polished GitHub Release with a changelog, so that users can find stable versions of the project.

**Why this priority**: Versioning is what allows users to trust which version they are running, and releases are how open-source users discover and adopt new versions. Without this, users have no way to distinguish a stable snapshot from a work-in-progress.

**Independent Test**: Can be fully tested by creating a git tag (e.g., `v1.1.0`) and pushing it to GitHub, then observing that a new GitHub Release appears automatically with version notes — without any Docker publishing needed at this stage.

**Acceptance Scenarios**:

1. **Given** the maintainer creates and pushes a version tag (e.g., `v1.2.0`), **When** the tag reaches GitHub, **Then** a release workflow triggers automatically.
2. **Given** the release workflow runs, **When** it completes successfully, **Then** a GitHub Release is published under the "Releases" section of the repository, showing the version number and a summary of changes since the previous release.
3. **Given** the release is published, **When** a user visits the repository, **Then** they can clearly see the latest release version, download the source archive, and read what changed.
4. **Given** a pre-release tag is used (e.g., `v1.0.0-beta.1`), **When** the workflow runs, **Then** the release is marked as "pre-release" on GitHub so users know it is experimental.
5. **Given** an invalid or partial tag is pushed (e.g., `v` or `release-draft`), **When** the workflow evaluates the tag, **Then** the release workflow does NOT trigger, preventing accidental partial releases.

---

### User Story 3 - Docker Image Published on Every Release (Priority: P3)

As a self-hosted user of arike, when a new version is released, I want to pull the latest Docker image from Docker Hub using a simple command, so that I can update my instance without building from source.

**Why this priority**: Docker Hub publishing removes the barrier for non-technical users to run and update arike. While CI and releases work independently, Docker publishing completes the deployment story and makes the project accessible to a wider audience.

**Independent Test**: Can be fully tested after story 2 is working: trigger a release, then verify the Docker image appears on Docker Hub tagged with the version number and `:latest`, and confirm a user can run `docker pull panthalnet/arike:latest` and start the container.

**Acceptance Scenarios**:

1. **Given** a version tag is pushed and the release workflow runs, **When** the Docker build succeeds, **Then** the image is pushed to Docker Hub tagged with both the exact version (e.g., `panthalnet/arike:v1.2.0`) and the floating `:latest` tag.
2. **Given** a user wants to run arike, **When** they run `docker pull panthalnet/arike:latest`, **Then** they receive the most recently released stable image.
3. **Given** a Docker build or push fails during a release, **When** the failure occurs, **Then** the maintainer is notified, the GitHub Release is still created (decoupled from Docker publishing), and the image is NOT partially pushed.
4. **Given** a pre-release tag triggers a release, **When** Docker images are published, **Then** the image is tagged with both the exact pre-release version (e.g., `v1.0.0-beta.1`) and a floating `:beta` tag, and does NOT update the `:latest` tag.
5. **Given** the project's Dockerfile already exists and is functional, **When** the CI/CD workflow builds it, **Then** the resulting image starts correctly and passes the existing health check endpoint.

---

### Edge Cases

- What happens when a CI check passes locally but fails in the automated environment (e.g., due to missing environment variables or OS differences)?
- How does the system handle a release tag being pushed before all code is merged (out-of-order tagging)?
- What happens if Docker Hub credentials expire or are revoked — does the release still succeed without the Docker push?
- How does the versioning handle hotfixes on older versions (e.g., a `v1.0.x` patch while `v1.2.0` is the current release)?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST automatically run lint checks, unit tests, and a production build on every push to any branch in the repository.
- **FR-002**: The system MUST automatically run all CI checks on every pull request and report pass/fail status back to the pull request, preventing merges when checks fail.
- **FR-003**: The system MUST automatically create a GitHub Release whenever a version tag following semantic versioning format (e.g., `v1.2.3`) is pushed to the repository.
- **FR-004**: The GitHub Release MUST include an automatically generated list of changes (commits or pull request titles) since the previous release.
- **FR-005**: The system MUST automatically build a Docker image from the repository's existing Dockerfile and publish it to Docker Hub whenever a new version tag is pushed.
- **FR-006**: Docker images MUST be tagged with the exact version string (e.g., `v1.2.3`) and also with `:latest` for stable (non-pre-release) releases.
- **FR-007**: Pre-release version tags following strict SemVer format (e.g., `v1.0.0-beta.1`, `v1.0.0-rc.1`) MUST result in a GitHub Release marked as "pre-release", and Docker images tagged with both the exact version (e.g., `panthalnet/arike:v1.0.0-beta.1`) and a floating `:beta` tag. Pre-release images MUST NOT update the `:latest` tag.
- **FR-008**: Docker Hub credentials MUST be stored as encrypted secrets in GitHub and never exposed in workflow logs or build output.
- **FR-009**: The project README MUST display a row of shields.io badges at the top of the file, immediately below the project title, containing exactly: (1) current version linked to the GitHub Releases page, (2) CI workflow status for the `main` branch, (3) Docker Hub pull count for `panthalnet/arike`, (4) license type, (5) Docker image size. All badges must be auto-updating (no manual edits required after initial setup) and render correctly on the GitHub repository homepage.
- **FR-010**: The system MUST support multi-platform Docker image builds (at minimum `linux/amd64` and `linux/arm64`) so users on Apple Silicon and standard servers can both use the image.
- **FR-011**: The repository MUST have a valid ESLint flat configuration file (`eslint.config.mjs`) compatible with ESLint 9 and Next.js 16, so that `npm run lint` executes successfully. This is a prerequisite for the CI workflow and fixes a pre-existing gap where the project declared ESLint 9 as a dependency but had no corresponding configuration file.
- **FR-012**: The release workflow MUST validate that the pushed git tag version matches the committed `package.json` `version` field before creating a GitHub Release or publishing any Docker image. If they do not match, the workflow MUST fail immediately and publish nothing.

### Key Entities

- **Version Tag**: A git tag in the format `vMAJOR.MINOR.PATCH` (e.g., `v1.2.0`) that marks a specific commit as a stable release point. Pre-release tags follow strict SemVer format `vMAJOR.MINOR.PATCH-LABEL.N` with a dot before the counter (e.g., `v1.0.0-beta.1`, `v1.0.0-beta.2`, `v1.0.0-rc.1`). The dot-separated format ensures compatibility with npm, GitHub Actions parsers, and SemVer tooling.
- **GitHub Release**: A named snapshot in the GitHub repository, linked to a version tag, containing release notes and optionally downloadable assets.
- **Docker Image**: A packaged, runnable container image built from the project's Dockerfile, published to Docker Hub for end users to pull and run.
- **CI Workflow**: An automated sequence of checks (lint, test, build) that runs on code pushes and pull requests.
- **Release Workflow**: An automated sequence triggered by version tags that creates a GitHub Release and publishes a Docker image.
- **GitHub Secret**: An encrypted value stored in GitHub repository settings, used to securely provide credentials (e.g., Docker Hub password) to workflows without exposing them.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new code push triggers CI checks that complete and report a result within 5 minutes.
- **SC-002**: A version tag push triggers a complete release — GitHub Release created AND Docker image published to Docker Hub — within 10 minutes, requiring zero manual steps from the maintainer after pushing the tag.
- **SC-003**: A new contributor can understand how to create a release by reading only the project README or CONTRIBUTING guide — no tribal knowledge required.
- **SC-004**: A self-hosted user can update to the latest release by running a single `docker pull` command without building from source.
- **SC-005**: 100% of releases have both a GitHub Release entry and a corresponding Docker image on Docker Hub within the same automated workflow run.
- **SC-006**: Zero Docker Hub credentials or API secrets appear in workflow logs or build artifacts.

## Assumptions

- The project will follow **Semantic Versioning (SemVer)**: `MAJOR.MINOR.PATCH` with the following conventions: **MAJOR** is incremented for breaking changes (configuration format changes, database migrations requiring manual user steps, removed features); **MINOR** is incremented when new features are added in a backward-compatible way; **PATCH** is incremented for bug fixes, security patches, and dependency updates. Version numbers are incremented manually by the maintainer by creating a git tag — there is no automated version bumping bot.
- The **first release version** is `v0.1.0-beta.1`. The `package.json` `version` field will be downgraded from `1.0.0` to `0.1.0-beta.1` as part of this feature's implementation. The `0.x` version range signals active development / not yet stable. `v1.0.0` will be declared only when the project is considered production-ready and stable.
- The Docker Hub account name is `panthalnet` (matching the GitHub organization), and the image will be named `panthalnet/arike`. The Docker Hub account does not yet exist and will need to be created before the publishing workflow can be enabled. Setup instructions will be provided in the implementation plan.
- The maintainer will create a free Docker Hub account before enabling the publishing workflow. Docker Hub free accounts support unlimited public image repositories.
- Release notes will be automatically generated from commit/PR history using GitHub's built-in release notes generation feature — no manual changelog writing required.
- The existing `Dockerfile` in the repository is the canonical build definition and does not need to change for CI/CD integration.
- Branch protection on `main` will be enabled to require CI checks to pass before merging — this is a GitHub repository setting, not a workflow file.
- The project uses `package.json` `version` field as the source of truth for version tracking, but the actual release trigger is the git tag, not a change to `package.json`.
- The `package.json` `version` field MUST be updated and committed before each release tag is pushed, using the local `scripts/release.sh` helper. The release workflow does NOT write changes back to the repository; instead, it validates that the pushed tag matches the already committed `package.json` version before publishing anything.
