# Data Model: GitHub Actions CI/CD with Versioning and Docker Hub Publishing

**Feature**: 003-github-actions-cicd  
**Date**: 2026-05-02

This feature has no database entities. Its "data model" describes the structured definitions that govern all workflow behaviour: version tag formats, workflow event triggers, job topology, secret identifiers, and Docker image tag derivation rules. These serve the same role as a schema — they are the canonical reference implementors must follow.

---

## 1. Version Tag

The atomic unit that triggers all release automation.

| Field | Rule | Example |
|-------|------|---------|
| Format | `v` + SemVer string | `v0.1.0-beta.1`, `v1.2.3` |
| Full regex | `^v(0\|[1-9]\d*)\.(0\|[1-9]\d*)\.(0\|[1-9]\d*)(-[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)*)?$` | |
| Stable | No hyphen in the version string | `v1.0.0`, `v1.2.3` |
| Pre-release | Has a hyphen separator | `v0.1.0-beta.1`, `v1.0.0-rc.1` |
| Pre-release label | Lowercase alpha, dot-separated counter | `beta.1`, `beta.2`, `rc.1` |
| Invalid (ignored) | Does not match regex | `v`, `release-draft`, `v1`, `1.0.0` |

**State transitions**:

```
[working code on main]
        │
        ▼ bash scripts/release.sh 0.1.0-beta.1
[package.json bumped, commit: "chore: release v0.1.0-beta.1"]
        │
        ▼ git tag v0.1.0-beta.1 + git push --tags
[GitHub receives tag] ──► release.yml triggers
        │
        ├──► GitHub Release created (marked pre-release)
        └──► Docker image published (panthalnet/arike:v0.1.0-beta.1 + :beta)
```

---

## 2. GitHub Actions Workflow Definitions

### 2a. CI Workflow (`ci.yml`)

| Property | Value |
|----------|-------|
| File path | `.github/workflows/ci.yml` |
| Trigger events | `push` (all branches), `pull_request` (targeting `main`) |
| Jobs | `quality`, `e2e` |
| Job dependency | `e2e` depends on `quality` (runs only if `quality` passes) |
| Runner | `ubuntu-latest` |
| Node.js version | `20` (matches `Dockerfile` and `package.json` engines) |
| Cache | `actions/setup-node@v4` with `cache: 'npm'` |

**`quality` job steps** (sequential):
1. `actions/checkout@v4`
2. `actions/setup-node@v4` with `node-version: 20`, `cache: 'npm'`
3. `npm ci`
4. `npm run lint`
5. `npx tsc --noEmit`
6. `npm run build`
7. `npm run test:coverage`

**`e2e` job steps** (sequential, after `quality`):
1. `actions/checkout@v4`
2. `actions/setup-node@v4` with `node-version: 20`, `cache: 'npm'`
3. `npm ci`
4. `npx playwright install --with-deps chromium` (chromium only in CI)
5. `npm run build`
6. `npm run test:e2e` (Playwright `webServer` config auto-starts the server)

**Permissions**: `contents: read` (default, read-only)

---

### 2b. Release Workflow (`release.yml`)

| Property | Value |
|----------|-------|
| File path | `.github/workflows/release.yml` |
| Trigger event | `push` with tag filter `v[0-9]+.[0-9]+.[0-9]+*` |
| Jobs | `release`, `docker` |
| Job dependency | `docker` depends on `release` (runs only if GitHub Release is created successfully) |
| Runner | `ubuntu-latest` |

**`release` job steps**:
1. `actions/checkout@v4`
2. Read `package.json` version and compare it with `github.ref_name` after stripping the leading `v`; fail the job immediately if they differ
3. Detect pre-release: `IS_PRERELEASE=${{ contains(github.ref_name, '-') }}`
4. `softprops/action-gh-release@v2` with:
   - `generate_release_notes: true`
   - `prerelease: ${{ contains(github.ref_name, '-') }}`
   - `tag_name: ${{ github.ref_name }}`

**Permissions for `release` job**: `contents: write` (required to create GitHub Releases)

**Version consistency guard**:

| Input | Expected transformation | Must equal |
|-------|-------------------------|------------|
| `github.ref_name` | Strip leading `v` | `package.json.version` |
| `v0.1.0-beta.1` | `0.1.0-beta.1` | `0.1.0-beta.1` |
| `v0.1.0` | `0.1.0` | `0.1.0` |

If the transformed tag value and `package.json.version` differ, the `release` job fails before the GitHub Release is created and before the `docker` job can run.

**`docker` job steps**:
1. `actions/checkout@v4`
2. `docker/setup-qemu-action@v3` (enables arm64 emulation)
3. `docker/setup-buildx-action@v3`
4. `docker/login-action@v3` with `username: ${{ secrets.DOCKERHUB_USERNAME }}`, `password: ${{ secrets.DOCKERHUB_TOKEN }}`
5. Generate tags:
   - Always: `panthalnet/arike:${{ github.ref_name }}`
   - If stable (no `-`): also `panthalnet/arike:latest`
   - If pre-release (has `-`): also `panthalnet/arike:beta`
6. `docker/build-push-action@v6` with:
   - `platforms: linux/amd64,linux/arm64`
   - `push: true`
   - `tags: [generated above]`
   - `cache-from: type=gha`
   - `cache-to: type=gha,mode=max`

**Permissions for `docker` job**: `contents: read` (default)

---

## 3. Secrets

| Secret name | Type | Purpose | How to obtain |
|-------------|------|---------|---------------|
| `DOCKERHUB_USERNAME` | Plain string | Docker Hub login username | Your Docker Hub username: `panthalnet` |
| `DOCKERHUB_TOKEN` | Sensitive token | Docker Hub push credentials | Docker Hub → Account Settings → Security → Access Tokens → New Token (Read & Write) |

**Storage**: GitHub repository → Settings → Secrets and variables → Actions → Repository secrets

**Security properties**:
- Secrets are encrypted at rest by GitHub; never appear in workflow logs
- `DOCKERHUB_TOKEN` is a scoped access token, not the account password — revocable independently
- Secrets are not passed to workflows triggered by forks (pull requests from external contributors cannot access secrets — correct security boundary)

---

## 4. Docker Image Tag Derivation Rules

| Git tag | `IS_PRERELEASE` | Tags published to Docker Hub |
|---------|-----------------|------------------------------|
| `v0.1.0-beta.1` | `true` | `panthalnet/arike:v0.1.0-beta.1`, `panthalnet/arike:beta` |
| `v0.1.0-beta.2` | `true` | `panthalnet/arike:v0.1.0-beta.2`, `panthalnet/arike:beta` |
| `v0.1.0-rc.1` | `true` | `panthalnet/arike:v0.1.0-rc.1`, `panthalnet/arike:beta` |
| `v0.1.0` | `false` | `panthalnet/arike:v0.1.0`, `panthalnet/arike:latest` |
| `v1.2.3` | `false` | `panthalnet/arike:v1.2.3`, `panthalnet/arike:latest` |

**Pre-release detection**: `contains(github.ref_name, '-')` — any hyphen in the tag string = pre-release. This correctly handles all SemVer pre-release labels (`-beta.1`, `-rc.1`, `-alpha.1`).

---

## 6. `eslint.config.mjs` (New File — CI Prerequisite)

The project declares `eslint: ^9.17.0` and `eslint-config-next: 16.2.2` in `package.json` but has no ESLint configuration file. Next.js 16 with ESLint 9 requires a flat config file — without it, `next lint` fails with "Invalid project directory provided". This file must be created as part of this feature.

| Field | Value |
|-------|-------|
| File path | `eslint.config.mjs` (repository root) |
| ESLint version | 9 (flat config format — `eslint.config.mjs`, not `.eslintrc`) |
| Extends | `next/core-web-vitals`, `next/typescript` |
| Why `FlatCompat` | `eslint-config-next` ships legacy config format; `FlatCompat` bridges it to ESLint 9 flat config |
| Dependency needed | `@eslint/eslintrc` (provides `FlatCompat`) — add to `devDependencies` |

**Content**:
```js
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default eslintConfig;
```

---

## 5. `playwright.config.ts` Change (Supporting Data)

One existing config file requires a targeted update to enable E2E tests in CI without manual server management.

**Field to add** to `playwright.config.ts`:

| Field | Value | Purpose |
|-------|-------|---------|
| `webServer.command` | `npm start` | Starts the production Next.js server |
| `webServer.url` | `http://localhost:3000` | URL Playwright polls to detect server readiness |
| `webServer.reuseExistingServer` | `!process.env.CI` | In CI always start fresh; locally reuse if already running |
| `webServer.timeout` | `120000` (2 min) | Grace period for the server to become ready |

**Note**: This requires the app to be built (`npm run build`) before E2E tests run, since `npm start` serves the production build. The `e2e` CI job already runs `npm run build` before `npm run test:e2e`.
