# Quickstart: CI/CD Setup and First Release

**Feature**: 003-github-actions-cicd  
**Date**: 2026-05-02  
**Audience**: Project maintainer (you) — step-by-step guide for first-time setup and creating your first release

---

## Part 1: One-Time Setup (do this once, before your first release)

### Step 1: Create a Docker Hub Account

1. Go to https://hub.docker.com
2. Click **Sign Up**
3. Use the username `panthalnet` (this must match exactly — it becomes part of all image names)
4. Verify your email address

### Step 2: Create a Docker Hub Repository

1. Log in to Docker Hub
2. Click **Create Repository**
3. Set **Repository Name**: `arike`
4. Set **Visibility**: **Public** (required for free accounts to allow unlimited pulls)
5. Click **Create**

Your image will now be available as `panthalnet/arike` on Docker Hub.

### Step 3: Create a Docker Hub Access Token

Access tokens are safer than using your password in CI — they can be revoked independently.

1. Docker Hub → click your avatar (top right) → **Account Settings**
2. Left sidebar → **Security**
3. Click **New Access Token**
4. **Description**: `arike-github-actions` (so you know what it's for)
5. **Access permissions**: `Read, Write, Delete` (or `Read & Write` — both work)
6. Click **Generate** — **copy the token now**, it will NOT be shown again

### Step 4: Add GitHub Repository Secrets

1. Go to your GitHub repository: https://github.com/panthalnet/arike
2. Click **Settings** → left sidebar → **Secrets and variables** → **Actions**
3. Click **New repository secret** — add the first secret:
   - **Name**: `DOCKERHUB_USERNAME`
   - **Value**: `panthalnet`
   - Click **Add secret**
4. Click **New repository secret** — add the second secret:
   - **Name**: `DOCKERHUB_TOKEN`
   - **Value**: paste the access token you copied in Step 3
   - Click **Add secret**

You should now see both secrets listed (values are hidden).

### Step 5: Enable Branch Protection on `main` (Recommended)

This prevents accidentally merging broken code by requiring CI to pass first.

1. GitHub repository → **Settings** → **Branches**
2. Click **Add branch protection rule** (or **Add classic branch protection rule**)
3. **Branch name pattern**: `main`
4. Check: ✅ **Require status checks to pass before merging**
5. Search for and add: `Quality` (the CI quality job from `ci.yml`)
6. Search for and add: `E2E Tests` (the CI end-to-end job from `ci.yml`)
7. Check: ✅ **Require branches to be up to date before merging**
8. Click **Save changes**

---

## Part 2: CI is Now Active

Once the workflow files are merged to `main`, CI will automatically run on every push and pull request. You can see results:

- On the commit: green ✓ or red ✗ next to the commit hash on GitHub
- On PRs: a status check block at the bottom of the pull request
- In **Actions** tab: full logs for every workflow run

No further setup is needed for CI.

---

## Part 3: Creating Your First Release (`v0.1.0-beta.1`)

### Step 1: Make sure you're on `main` with a clean tree

```bash
git checkout main
git pull origin main
git status   # should show "nothing to commit, working tree clean"
```

### Step 2: Run the release script

```bash
bash scripts/release.sh 0.1.0-beta.1
```

**What happens**:
```
✓ Updated package.json version to 0.1.0-beta.1
✓ Updated package-lock.json
✓ Created commit: chore: release v0.1.0-beta.1
✓ Created tag: v0.1.0-beta.1
✓ Pushed commit to main
✓ Pushed tag v0.1.0-beta.1
```

### Step 3: Watch it happen on GitHub

1. Go to https://github.com/panthalnet/arike/actions
2. You'll see a new **Release** workflow run triggered by the tag push
3. The `release` job runs first (~1 min) → creates the GitHub Release
4. The `docker` job runs next (~6–8 min) → builds and pushes the Docker image
5. Total time: approximately 8–10 minutes

### Step 4: Verify the release

**GitHub Release**:
- https://github.com/panthalnet/arike/releases
- You should see `v0.1.0-beta.1` listed with "Pre-release" badge
- Release notes auto-generated from your commit history

**Docker Hub**:
- https://hub.docker.com/r/panthalnet/arike/tags
- You should see two new tags: `v0.1.0-beta.1` and `beta`
- Both support `linux/amd64` and `linux/arm64`

**Test pulling the image**:
```bash
docker pull panthalnet/arike:v0.1.0-beta.1
docker run -d -p 3000:3000 -v $(pwd)/data:/app/data panthalnet/arike:v0.1.0-beta.1
# Open http://localhost:3000 — arike should be running
```

---

## Part 4: Creating Future Releases

For every subsequent release, just run the script with the new version:

```bash
# Second beta
bash scripts/release.sh 0.1.0-beta.2

# First stable release
bash scripts/release.sh 0.1.0

# Next feature release
bash scripts/release.sh 0.2.0-beta.1
```

The full release (GitHub Release + Docker publish) is fully automated after the tag push.

---

## Appendix: Version Bump Reference

| Situation | Version change | Example |
|-----------|---------------|---------|
| Bug fix, no new features | Increment PATCH | `0.1.0-beta.1` → `0.1.1-beta.1` or `0.1.0` → `0.1.1` |
| New feature, backward-compatible | Increment MINOR, reset PATCH | `0.1.0` → `0.2.0` |
| Breaking change (users must take action to upgrade) | Increment MAJOR | `0.x.x` → `1.0.0` |
| Next beta of same version | Increment beta counter | `0.1.0-beta.1` → `0.1.0-beta.2` |
| Promote beta to stable | Remove pre-release label | `0.1.0-beta.2` → `0.1.0` |
