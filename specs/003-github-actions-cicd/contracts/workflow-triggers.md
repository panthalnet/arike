# Contract: Workflow Triggers

**Feature**: 003-github-actions-cicd  
**Date**: 2026-05-02

This contract defines the exact GitHub events that trigger each workflow, the conditions under which jobs run, and the permissions each workflow requires.

---

## `ci.yml` — Continuous Integration

### Triggers

| Event | Filter | Description |
|-------|--------|-------------|
| `push` | Any branch | Runs on every commit pushed to any branch |
| `pull_request` | Target branch: `main` | Runs when a PR is opened, updated, or synchronized targeting `main` |

### Jobs and Run Conditions

| Job | Runs when | Depends on |
|-----|-----------|-----------|
| `quality` | Always (on any trigger above) | — |
| `e2e` | Only if `quality` job passes | `quality` |

### Permissions

```yaml
permissions:
  contents: read
```

### Concurrency

```yaml
concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true
```

*Explanation*: If a new push arrives on the same branch while CI is running, the older run is cancelled. This prevents queue build-up on rapid commits and saves Actions minutes.

---

## `release.yml` — Release and Docker Publish

### Triggers

| Event | Filter | Description |
|-------|--------|-------------|
| `push` | Tags matching `v[0-9]+.[0-9]+.[0-9]+*` | Triggers on any valid SemVer version tag push |

### Tag pattern matching examples

| Tag pushed | Matches pattern? | Release triggered? |
|-----------|-----------------|-------------------|
| `v0.1.0-beta.1` | ✅ Yes | ✅ Yes |
| `v1.0.0` | ✅ Yes | ✅ Yes |
| `v1.2.3-rc.1` | ✅ Yes | ✅ Yes |
| `v1` | ❌ No | ❌ No |
| `release-1.0` | ❌ No | ❌ No |
| `v` | ❌ No | ❌ No |

### Jobs and Run Conditions

| Job | Runs when | Depends on | Permissions needed |
|-----|-----------|-----------|-------------------|
| `release` | Always on trigger | — | `contents: write` |
| `docker` | Only if `release` job succeeds | `release` | `contents: read` |

### Why `docker` depends on `release`

If GitHub Release creation fails (e.g., duplicate tag), Docker images should NOT be published. A Docker image without a corresponding GitHub Release creates an orphaned image that users cannot correlate to a changelog. The dependency enforces atomicity: both succeed or only the earlier job fails.

### Permissions

```yaml
# release job
permissions:
  contents: write   # Required to create GitHub Releases

# docker job  
permissions:
  contents: read    # Minimum needed
```

---

## Security Boundary: Fork Pull Requests

GitHub Actions secrets are NOT passed to workflows triggered by `pull_request` events from forked repositories. This is a GitHub platform security guarantee.

**Impact**: 
- `DOCKERHUB_TOKEN` is never accessible to external contributor PRs ✅
- CI checks (lint, typecheck, build, unit tests, E2E) work without secrets ✅  
- A malicious PR cannot exfiltrate Docker Hub credentials ✅
