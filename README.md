# Arike

[![CI](https://github.com/panthalnet/arike/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/panthalnet/arike/actions/workflows/ci.yml)
[![Latest Release](https://img.shields.io/github/v/release/panthalnet/arike?include_prereleases&label=release)](https://github.com/panthalnet/arike/releases)
[![Docker Pulls](https://img.shields.io/docker/pulls/panthalnet/arike)](https://hub.docker.com/r/panthalnet/arike)
[![Image Size](https://img.shields.io/docker/image-size/panthalnet/arike/latest)](https://hub.docker.com/r/panthalnet/arike)
[![License](https://img.shields.io/github/license/panthalnet/arike)](LICENSE)

A self-hosted, open-source browser startup page and personal dashboard.

> [!NOTE]
> Arike is built with AI assistance, but not vibe-coded. The workflow is driven by **[SpecKit](https://github.com/speckit)** — a Specification-Driven Development (SDD) tool that formalises every feature as a spec, design plan, and typed TypeScript contracts *before* any code is written. The AI generates implementations that satisfy those contracts; tests are required, security is reviewed against OWASP Top 10 at every step, and every architectural decision is documented. It's closer to pair programming with a very fast typist than to prompting and hoping.

## Features

- **Persistent homepage** — Live clock, prominent search bar, bookmark collections
- **Bookmark management** — Add, edit, and delete bookmarks with icons (Material, brand, or custom)
- **Collections** — Organise bookmarks into tabs; a bookmark can belong to multiple collections
- **Themeable** — Gruvbox, Catppuccin, Everforest, or fully custom colors; **Modern glassmorphism theme** with wallpaper support and adjustable blur intensity
- **Layout modes** — Uniform Grid or Bento Grid (per-bookmark tile sizes: small / medium / large)
- **Wallpaper support** — Upload custom wallpapers or choose built-in gradients (Modern theme)
- **Live bookmark search** — Inline dropdown as you type; opens bookmarks or falls back to web search
- **Responsive** — Mobile-first single-column layout; desktop multi-column bookmark grid
- **No config files** — All settings managed through the dashboard UI
- **Accessible** — WCAG AA compliant (keyboard nav, screen reader support, focus management)

## Quickstart

### Option 1: Command-line

**Prerequisites**: Node.js 20+

```bash
npm install
npm run build
npm start
```

Open <http://localhost:3000>

Use `PORT=8080 npm start` to run on a different port.

### Option 2: Docker (from Docker Hub)

```bash
# Latest stable release
docker pull panthalnet/arike:latest
docker run -d -p 3000:3000 -v /path/to/data:/app/data panthalnet/arike:latest

# Latest beta release
docker pull panthalnet/arike:beta
docker run -d -p 3000:3000 -v /path/to/data:/app/data panthalnet/arike:beta

# Specific version
docker pull panthalnet/arike:v0.1.0-beta.1
docker run -d -p 3000:3000 -v /path/to/data:/app/data panthalnet/arike:v0.1.0-beta.1
```

Open <http://localhost:3000>

### Option 3: Docker (build from source)

```bash
docker build -t arike .
docker run -p 3000:3000 -v /path/to/data:/app/data arike
```

Open <http://localhost:3000>

## Data persistence

All data is stored in `./data/`:

| File | Contents |
|------|----------|
| `data/arike.db` | SQLite database (bookmarks, collections, settings, wallpapers, layout) |
| `data/icons/` | Uploaded custom bookmark icons |
| `data/wallpapers/` | Uploaded wallpaper images (Modern theme) |

Mount this directory as a Docker volume to persist data across container restarts.

## Development

```bash
npm install
npm run dev         # Start dev server on http://localhost:3000
npm test            # Run unit tests (Vitest)
npm run test:e2e    # Run E2E tests (Playwright — requires a production build: npm run build)
npm run test:coverage  # Unit tests with coverage report
```

## CI Status

Every push and pull request runs the `Quality` status check (lint → typecheck → build → coverage) and the `E2E Tests` job in GitHub Actions.

Branch protection on `main` requires both the `Quality` and `E2E Tests` checks to pass before merging. See [.github/workflows/ci.yml](.github/workflows/ci.yml) for the full workflow definition.

## Configuration

| Environment variable | Default | Description |
|---------------------|---------|-------------|
| `PORT` | `3000` | HTTP port |
| `DATA_DIR` | `./data` | Directory for database and icon files |

## Architecture

See [docs/design.md](docs/design.md) for architectural decisions.

## Docker Hub

Images are published to Docker Hub on every release:

| Git tag | Docker Hub tags |
|---------|----------------|
| `v0.x.x-beta.N` (pre-release) | `panthalnet/arike:v0.x.x-beta.N`, `panthalnet/arike:beta` |
| `v0.x.x` (stable) | `panthalnet/arike:v0.x.x`, `panthalnet/arike:latest` |

## Contributing and Releases

See [CONTRIBUTING.md](CONTRIBUTING.md) for the release ceremony and one-time CI/CD setup guide.

## License

MIT
