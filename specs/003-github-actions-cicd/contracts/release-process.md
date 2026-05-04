# Contract: Release Process

**Feature**: 003-github-actions-cicd  
**Date**: 2026-05-02

This contract defines the exact steps the maintainer must perform to create a release. It is the authoritative reference — any deviation from this sequence may result in a failed or inconsistent release.

---

## Prerequisites (one-time setup — do this before your first release)

1. **Docker Hub account created** at https://hub.docker.com with username `panthalnet`
2. **Docker Hub Access Token** created (Read & Write scope) — see [quickstart.md](../quickstart.md)
3. **GitHub Secrets configured** in the repository:
   - `DOCKERHUB_USERNAME` = `panthalnet`
   - `DOCKERHUB_TOKEN` = the access token from step 2
4. **Branch protection** enabled on `main` requiring CI to pass (optional but recommended)

---

## Release Ceremony (every release)

### Step 1: Ensure `main` is clean and CI is passing

```bash
git checkout main
git pull origin main
# Verify CI is green on GitHub before proceeding
```

### Step 2: Decide the version number

Apply the SemVer convention:
- **PATCH** (`0.1.0` → `0.1.1`): Bug fixes, security patches, dependency updates
- **MINOR** (`0.1.0` → `0.2.0`): New features, backward-compatible changes
- **MAJOR** (`0.1.0` → `1.0.0`): Breaking changes — config format, forced DB migrations, removed features

For pre-releases, append `-beta.N` (incrementing N for each beta of the same version):
- `0.1.0-beta.1` → `0.1.0-beta.2` → `0.1.0` (final stable)

### Step 3: Run the release script

```bash
# Pass the version WITHOUT the leading 'v'
bash scripts/release.sh 0.1.0-beta.1
```

The script performs these steps automatically:
1. Updates `package.json` and `package-lock.json` version field
2. Creates commit: `chore: release v0.1.0-beta.1`
3. Creates tag: `v0.1.0-beta.1`
4. Pushes the commit to `main`: `git push origin main`
5. Pushes the tag: `git push origin v0.1.0-beta.1`

### Step 3a: Release workflow consistency check

When GitHub receives the tag, `.github/workflows/release.yml` MUST first verify that:

- git tag `vX.Y.Z` becomes `X.Y.Z` after stripping the leading `v`
- that value exactly matches `package.json.version` in the tagged commit

If they do not match, the workflow MUST fail before creating the GitHub Release or publishing any Docker image.

### Step 4: Monitor the release workflow

1. Go to the repository on GitHub → **Actions** tab
2. Find the `Release` workflow run triggered by your tag push
3. Watch the `release` job (creates GitHub Release) then the `docker` job (publishes to Docker Hub)
4. Total expected time: 6–10 minutes

### Step 5: Verify the release

| Check | Where to verify |
|-------|----------------|
| GitHub Release published | Repository → **Releases** tab |
| Release notes auto-generated | Click the release, confirm changelog is populated |
| Pre-release marked correctly | Pre-release releases show "Pre-release" badge |
| Docker image on Docker Hub | https://hub.docker.com/r/panthalnet/arike/tags |
| `:latest` tag updated (stable only) | Docker Hub tags list shows `:latest` updated timestamp |
| `:beta` tag updated (pre-release only) | Docker Hub tags list shows `:beta` updated timestamp |

---

## Invariants (must always be true after a release)

- The git tag `vX.Y.Z` MUST point to the commit that has `"version": "X.Y.Z"` in `package.json`
- Every GitHub Release MUST have a corresponding Docker image on Docker Hub with the matching version tag
- The `:latest` Docker tag MUST always point to the most recently published **stable** release
- The `:beta` Docker tag MUST always point to the most recently published **pre-release**
- Stable releases MUST NOT update the `:beta` tag; pre-releases MUST NOT update the `:latest` tag
- A tag/version mismatch MUST block the release before any release entry or Docker image is published

---

## Failure Recovery

### If the release workflow fails after the tag is pushed

**Do NOT push another tag with the same version.** Instead:

1. Go to GitHub Actions → find the failed run → click **Re-run failed jobs**
2. If re-running fails again, check the logs for the specific error
3. Common causes: Docker Hub token expired, network timeout during multi-platform build, tag does not match `package.json.version`
4. If the Docker job failed but the GitHub Release was created: the release exists but the image is missing. Re-run only the `docker` job, or delete the release, fix the issue, delete the tag, and re-run the release script

### If you pushed the wrong version tag

1. Delete the tag locally: `git tag -d v0.1.0-beta.1`
2. Delete the tag remotely: `git push origin --delete v0.1.0-beta.1`
3. Delete the GitHub Release if it was created (GitHub → Releases → Edit → Delete)
4. Fix whatever was wrong, then re-run the release script with the correct version
