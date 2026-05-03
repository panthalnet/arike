# Contributing to Arike

This guide covers one-time setup for the CI/CD pipeline and the release ceremony for the project maintainer.

## One-Time CI/CD Setup

### 1. Create a Docker Hub Account and Repository

1. Sign up at https://hub.docker.com with username `panthalnet`
2. Create a public repository named `arike` — images will publish as `panthalnet/arike`

### 2. Create a Docker Hub Access Token

Docker Hub → avatar → **Account Settings** → **Security** → **New Access Token**

- Description: `arike-github-actions`
- Permissions: Read & Write
- Copy the token immediately — it is shown only once

### 3. Add GitHub Repository Secrets

GitHub repository → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

| Secret name | Value |
|-------------|-------|
| `DOCKERHUB_USERNAME` | `panthalnet` |
| `DOCKERHUB_TOKEN` | The access token from step 2 |

### 4. Enable Branch Protection on `main`

GitHub repository → **Settings** → **Branches** → **Add rule**

- Branch name pattern: `main`
- ✅ Require status checks to pass before merging
- Add status check: `quality`
- ✅ Require branches to be up to date before merging

---

## Release Ceremony

Arike uses [Semantic Versioning](https://semver.org/). The `scripts/release.sh` helper handles the full ceremony.

### Prerequisites

- On branch `main` with a clean working tree
- All changes committed and pushed
- CI passing on `main`

### Run the Release Script

```bash
# Beta release
bash scripts/release.sh 0.1.0-beta.1

# Stable release
bash scripts/release.sh 0.1.0
```

The script:
1. Validates the version argument and working-tree state
2. Updates `package.json` version
3. Commits as `chore: release v<version>`
4. Creates annotated tag `v<version>`
5. Pushes commit and tag to `origin main`

GitHub Actions then runs automatically:
- `release` job (~1 min) → creates a GitHub Release with auto-generated notes
- `docker` job (~6–8 min) → builds `linux/amd64` + `linux/arm64` images and pushes to Docker Hub

| Git tag | GitHub Release | Docker Hub tags |
|---------|---------------|----------------|
| `v0.x.x-beta.N` | Pre-release | `panthalnet/arike:v0.x.x-beta.N`, `panthalnet/arike:beta` |
| `v0.x.x` | Release | `panthalnet/arike:v0.x.x`, `panthalnet/arike:latest` |

### Version Increment Reference

| Situation | Example |
|-----------|---------|
| Bug fix | `0.1.0` → `0.1.1` |
| New feature (backward-compatible) | `0.1.0` → `0.2.0` |
| Breaking change | `0.x.x` → `1.0.0` |
| Next beta of same version | `0.1.0-beta.1` → `0.1.0-beta.2` |
| Promote beta to stable | `0.1.0-beta.2` → `0.1.0` |

---

## Development Workflow

```bash
npm install
npm run dev            # Dev server at http://localhost:3000
npm run lint           # ESLint
npx tsc --noEmit       # Typecheck
npm run test:coverage  # Unit tests with 90% coverage gate
npm run build && npm run test:e2e  # E2E tests (requires production build)
```

Every push and pull request runs the `quality` status check (lint → typecheck → build → coverage) and the `e2e` job via [.github/workflows/ci.yml](.github/workflows/ci.yml).
