# arike Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-05-16

## Active Technologies
- TypeScript / Node.js 20, Next.js 16 (App Router) + Next.js built-in metadata API (`src/app/icon.*`, `src/app/favicon.ico`, `src/app/opengraph-image.*`); `sharp` (already transitive via Next.js) for PNG resizing; no new runtime dependencies (004-arike-app-icon)
- Static files in `public/` and `src/app/` (no database changes) (004-arike-app-icon)

- Next.js 16.2.2 (App Router) / Node 20 + Next.js, SQLite, Tailwind, shadcn/ui (001-first-releasable-arike)

## Project Structure

```text
src/
tests/
```

## Commands

# Add commands for Next.js 16.2.2 (App Router) / Node 20

## Code Style

Next.js 16.2.2 (App Router) / Node 20: Follow standard conventions

## Recent Changes
- 004-arike-app-icon: Added TypeScript / Node.js 20, Next.js 16 (App Router) + Next.js built-in metadata API (`src/app/icon.*`, `src/app/favicon.ico`, `src/app/opengraph-image.*`); `sharp` (already transitive via Next.js) for PNG resizing; no new runtime dependencies

- 001-first-releasable-arike: Added Next.js 16.2.2 (App Router) / Node 20 + Next.js, SQLite, Tailwind, shadcn/ui

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
