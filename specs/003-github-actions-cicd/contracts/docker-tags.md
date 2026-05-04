# Contract: Docker Image Tags

**Feature**: 003-github-actions-cicd  
**Date**: 2026-05-02

This contract defines the complete set of Docker image tags that are published to Docker Hub for each type of release. It is the authoritative reference for users and automation.

---

## Image Registry

| Field | Value |
|-------|-------|
| Registry | Docker Hub (hub.docker.com) |
| Image name | `panthalnet/arike` |
| Full pull URL | `docker pull panthalnet/arike:<tag>` |
| Repository page | https://hub.docker.com/r/panthalnet/arike |

---

## Tag Matrix

| Git tag pushed | Release type | Tags published | `:latest` updated? | `:beta` updated? |
|---------------|-------------|---------------|-------------------|-----------------|
| `v0.1.0-beta.1` | Pre-release | `v0.1.0-beta.1`, `beta` | ❌ No | ✅ Yes |
| `v0.1.0-beta.2` | Pre-release | `v0.1.0-beta.2`, `beta` | ❌ No | ✅ Yes |
| `v0.1.0-rc.1` | Pre-release | `v0.1.0-rc.1`, `beta` | ❌ No | ✅ Yes |
| `v0.1.0` | Stable | `v0.1.0`, `latest` | ✅ Yes | ❌ No |
| `v0.2.0` | Stable | `v0.2.0`, `latest` | ✅ Yes | ❌ No |
| `v1.0.0` | Stable | `v1.0.0`, `latest` | ✅ Yes | ❌ No |

---

## Tag Semantics

### Exact version tags (`v0.1.0-beta.1`, `v1.2.3`)
- Immutable — once published, this tag always points to the same image digest
- Never overwritten by a later release
- The canonical way to pin to a specific release: `docker pull panthalnet/arike:v1.2.3`

### `:latest`
- Mutable — always points to the most recent **stable** release
- Updated only when a tag with no hyphen is pushed
- Users who want automatic updates to stable use: `docker pull panthalnet/arike:latest`
- **Warning**: `:latest` is never a pre-release image — use `:beta` to track pre-releases

### `:beta`
- Mutable — always points to the most recent **pre-release** (beta or RC)
- Updated on every tag push that contains a hyphen
- For beta testers who want to track bleeding-edge: `docker pull panthalnet/arike:beta`
- Once the final stable is released (`v1.0.0`), `:beta` may lag behind `:latest` — this is expected

---

## Supported Platforms

Each image tag is a multi-platform manifest list containing:

| Platform | Architecture | Use case |
|----------|-------------|---------|
| `linux/amd64` | x86-64 | Standard VPS, cloud VMs, WSL2, most Linux servers |
| `linux/arm64` | ARM 64-bit | Apple Silicon (M1/M2/M3) via Docker Desktop, Raspberry Pi 4/5 |

Docker automatically selects the correct platform when you run `docker pull` — no `--platform` flag needed for standard usage.

---

## Example Usage for End Users

```bash
# Run the latest stable release
docker run -d \
  -p 3000:3000 \
  -v $(pwd)/data:/app/data \
  panthalnet/arike:latest

# Run a specific version (recommended for production)
docker run -d \
  -p 3000:3000 \
  -v $(pwd)/data:/app/data \
  panthalnet/arike:v0.1.0

# Run the latest beta
docker run -d \
  -p 3000:3000 \
  -v $(pwd)/data:/app/data \
  panthalnet/arike:beta
```

---

## Pre-release Detection Logic

A tag is classified as pre-release if and only if the tag string contains a hyphen (`-`).

```
v0.1.0-beta.1  → contains '-'  → IS pre-release → publish to :beta, NOT :latest
v0.1.0         → no '-'        → IS stable      → publish to :latest, NOT :beta
```

This logic is implemented in the workflow as:
```yaml
enable=${{ contains(github.ref_name, '-') }}   # for :beta tag
enable=${{ !contains(github.ref_name, '-') }}  # for :latest tag
```
