# Research: GitHub Actions CI/CD with Versioning and Docker Hub Publishing

**Feature**: 003-github-actions-cicd  
**Date**: 2026-05-02  
**Status**: Complete — all unknowns resolved

---

## 1. CI Workflow: Which Steps to Run and How

**Decision**: Single `quality` job running lint → typecheck → build → unit-tests sequentially, plus a separate `e2e` job that depends on `quality`.

**Rationale**: Running steps sequentially within one job is faster for a small project (no job startup overhead per step). Separating E2E into its own job allows it to fail independently without blocking the quality gate report, and it needs a full production build before it can start.

**Step details**:
- Lint: `npm run lint` (Next.js ESLint, configured via `next.config.ts`)
- Typecheck: `npx tsc --noEmit` (TypeScript strict mode, already enabled)
- Build: `npm run build` (Next.js production build, validates the app compiles and no missing env vars break it)
- Unit tests: `npm run test:coverage` (Vitest with V8 coverage, 90% threshold already configured in `vitest.config.mts` — the threshold itself enforces the gate, workflow just runs the command)
- E2E: `npm run test:e2e` (Playwright, chromium only in CI to keep runtime under 5 minutes; `playwright.config.ts` already sets `retries: 2` and `workers: 1` when `CI=true`)

**E2E server start in CI**: `playwright.config.ts` does not yet have a `webServer` config. The E2E job must build the app, then start it with `npm start &`, wait for port 3000 using `npx wait-on http://localhost:3000`, then run tests. `wait-on` is already available via `@playwright/test`'s peer dependencies or can be added. Alternative: add `webServer` to `playwright.config.ts` — this is cleaner and is the officially recommended Playwright approach. **Selected: add `webServer` to `playwright.config.ts`** (1 line change, keeps the workflow simple).

**Alternatives considered**:
- Matrix strategy per step: rejected — adds ~30s job startup overhead per check, unnecessary for a small project
- Running E2E in the same job as quality: rejected — if unit tests fail, E2E would never run; separate jobs give clearer failure signals

---

## 2. Release Action: Which Tool to Create GitHub Releases

**Decision**: `softprops/action-gh-release@v2`

**Rationale**: The most widely used, actively maintained GitHub Release action. Supports auto-generated release notes via `generate_release_notes: true` (uses GitHub's own changelog generation from PR titles/commits), pre-release detection, and body overrides. The GitHub CLI (`gh release create`) is equally valid but `softprops/action-gh-release` is more ergonomic in YAML and is the de-facto standard in the community.

**Auto-generated release notes**: Enabled via `generate_release_notes: true`. GitHub compares commits between the current tag and the previous tag, groups them by PR label (bug, feature, etc.), and generates a markdown changelog automatically. No `.github/release-drafter.yml` config file needed for the basic version.

**Pre-release detection**: The action accepts a `prerelease` boolean. We detect pre-release by checking if the tag contains a hyphen: `contains(github.ref_name, '-')`. This correctly identifies `v0.1.0-beta.1` as pre-release and `v0.1.0` as stable.

**Alternatives considered**:
- `actions/create-release`: deprecated, no longer maintained — rejected
- `release-drafter/release-drafter`: powerful but requires a separate config file and a draft release workflow — overkill for a solo project
- GitHub CLI `gh release create`: valid but more verbose in YAML — kept as a fallback option

---

## 3. Docker Multi-Platform Build Setup

**Decision**: Docker Buildx with QEMU emulation using `docker/setup-qemu-action@v3` + `docker/setup-buildx-action@v3`, targeting `linux/amd64,linux/arm64`.

**Rationale**: The existing `Dockerfile` is a standard multi-stage Node.js Alpine build that is architecture-agnostic. `linux/amd64` covers standard Linux servers (VPS, cloud VMs). `linux/arm64` covers Apple Silicon Macs running Docker Desktop and Raspberry Pi 4/5 — both common self-hosting platforms for tools like arike.

**Build time impact**: Multi-platform builds using QEMU emulation are slower than native builds (arm64 emulation on amd64 runners can be 3–5× slower). For a Next.js standalone build, expected arm64 build time is ~4–6 minutes. Total release workflow (CI + release + docker) should still complete within 10 minutes if CI is reused from the tag's commit status rather than re-run.

**Optimization**: The release workflow will NOT re-run CI checks from scratch. Instead, it will use `needs: []` and rely on the fact that the tag was pushed from a commit that already passed CI. The release workflow only runs: release creation + docker build. This keeps total release time under 10 minutes.

**Caching**: `cache-from: type=gha` and `cache-to: type=gha,mode=max` (GitHub Actions cache) will be used to speed up subsequent Docker builds by caching layers.

**Alternatives considered**:
- Native arm64 runners: GitHub now offers them but they are not free on the standard plan — rejected
- Single-platform `linux/amd64` only: rejected — spec FR-010 requires both architectures

---

## 4. Docker Image Tag Strategy

**Decision**: Use `docker/metadata-action@v5` to generate tags automatically from the git tag.

**Tag rules**:
| Git tag pushed | Docker Hub tags published |
|---------------|--------------------------|
| `v0.1.0-beta.1` (pre-release: contains `-`) | `panthalnet/arike:v0.1.0-beta.1`, `panthalnet/arike:beta` |
| `v0.1.0` (stable: no `-`) | `panthalnet/arike:v0.1.0`, `panthalnet/arike:latest` |
| `v1.2.3` (stable) | `panthalnet/arike:v1.2.3`, `panthalnet/arike:latest` |

**`docker/metadata-action` flavor/tags config**:
```yaml
tags: |
  type=semver,pattern={{version}}
  type=raw,value=latest,enable=${{ !contains(github.ref_name, '-') }}
  type=raw,value=beta,enable=${{ contains(github.ref_name, '-') }}
```

The `type=semver,pattern={{version}}` rule strips the leading `v` for Docker compatibility (Docker Hub tags conventionally omit it, e.g., `0.1.0-beta.1`). However, many projects keep the `v` prefix in Docker tags for clarity. **Selected: keep `v` prefix** using `type=raw,value=${{ github.ref_name }}` for the exact version tag to match the GitHub Release tag exactly.

**Revised tags config**:
```yaml
tags: |
  type=raw,value=${{ github.ref_name }}
  type=raw,value=latest,enable=${{ !contains(github.ref_name, '-') }}
  type=raw,value=beta,enable=${{ contains(github.ref_name, '-') }}
```

**Alternatives considered**:
- `type=semver` without `v` prefix: rejected — inconsistent with GitHub Release tag name, confusing for users
- Separate `rc` tag for release candidates: deferred — can be added later when `v1.0.0-rc.1` tags are used

---

## 5. Docker Hub Authentication: Token vs Password

**Decision**: Docker Hub Access Token (not password), stored as GitHub encrypted secret `DOCKERHUB_TOKEN`.

**Rationale**: Docker Hub access tokens can be scoped to "Read, Write, Delete" or narrower "Read & Write" — the minimum needed to push images. If the token is ever compromised, it can be revoked without changing the Docker Hub account password. This is the security best practice.

**Secrets required**:
| Secret name | Value | Where to set |
|-------------|-------|-------------|
| `DOCKERHUB_USERNAME` | `panthalnet` | GitHub → Settings → Secrets → Actions |
| `DOCKERHUB_TOKEN` | Docker Hub access token | GitHub → Settings → Secrets → Actions |

**How to create a Docker Hub access token**: Docker Hub → Account Settings → Security → Access Tokens → New Access Token → "Read & Write" permissions. See `quickstart.md` for step-by-step.

---

## 6. Version Sync: Local Script vs Workflow Write-Back

**Decision**: Local `scripts/release.sh` helper — maintainer runs it locally to bump `package.json`, commit, tag, and push. No workflow write-back. The release workflow validates that the pushed git tag matches the committed `package.json` version before it publishes anything.

**Rationale**: Workflow write-back (where the GitHub Actions workflow commits a version bump back to `main`) requires granting the workflow `contents: write` permission and dealing with push protection rules. It also creates a commit AFTER the tagged commit, meaning the tag does not point to the "chore: release" commit — which is confusing. The local script approach is simpler, more transparent, and avoids giving CI write access to the repository. A release-time guard in `.github/workflows/release.yml` closes the safety gap by failing immediately if `github.ref_name` does not match the committed `package.json` version.

**Release ceremony** (what the maintainer runs for every release):
```bash
# From the main branch, with a clean working tree:
bash scripts/release.sh 0.1.0-beta.1
# This script does:
# 1. npm version 0.1.0-beta.1 --no-git-tag-version  (updates package.json + package-lock.json)
# 2. git add package.json package-lock.json
# 3. git commit -m "chore: release v0.1.0-beta.1"
# 4. git tag v0.1.0-beta.1
# 5. git push && git push --tags
```

**Release-time guard**: Before `softprops/action-gh-release@v2` runs, the release workflow must read `package.json`, compare its `version` field to `github.ref_name` after stripping the leading `v`, and fail if they differ. This prevents accidental releases where the tag and source tree disagree.

**Alternatives considered**:
- Workflow write-back with `GITHUB_TOKEN`: works but creates a post-tag commit that is not tagged — rejected for clarity
- `semantic-release` bot: powerful but adds a large dependency and removes manual control — overkill for a solo project, rejected

---

## 7. Node.js Dependency Caching in CI

**Decision**: Use `actions/setup-node@v4` with `cache: 'npm'` built-in caching.

**Rationale**: `actions/setup-node@v4` has built-in npm cache support via `cache: 'npm'` — it caches `~/.npm` based on `package-lock.json` hash. This is simpler than manually configuring `actions/cache@v4` and is the recommended approach. Cache restores take ~10–15 seconds vs ~60–90 seconds for a cold `npm ci` on a Node.js project of this size.

---

## 8. shields.io Badge URLs

**Badge URLs** for `panthalnet/arike` (to be added to README.md):

| Badge | URL |
|-------|-----|
| Version (from GitHub latest release) | `https://img.shields.io/github/v/release/panthalnet/arike?include_prereleases&label=version` |
| CI status (main branch) | `https://img.shields.io/github/actions/workflow/status/panthalnet/arike/ci.yml?branch=main&label=CI` |
| Docker Hub pulls | `https://img.shields.io/docker/pulls/panthalnet/arike` |
| License | `https://img.shields.io/github/license/panthalnet/arike` |
| Docker image size | `https://img.shields.io/docker/image-size/panthalnet/arike/latest` |

**Notes**:
- The version badge uses `include_prereleases` so that `v0.1.0-beta.1` shows up (without this flag, it only shows stable releases and would show nothing until `v1.0.0`)
- The Docker pulls and image size badges will show "0" / "N/A" until the first Docker image is published — this is expected and not a bug
- All badges link to their respective pages (GitHub Releases, Actions, Docker Hub) via standard shields.io link parameters
