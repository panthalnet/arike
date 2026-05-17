<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan
at specs/004-arike-app-icon/plan.md
<!-- SPECKIT END -->

## Active Technologies
- TypeScript / Node.js 20, Next.js 16 (App Router) + Next.js built-in metadata API (`src/app/icon.*`, `src/app/favicon.ico`, `src/app/opengraph-image.*`); `sharp` (already transitive via Next.js) for PNG resizing; no new runtime dependencies (004-arike-app-icon)
- Static files in `public/` and `src/app/` (no database changes) (004-arike-app-icon)

## Recent Changes
- 004-arike-app-icon: Added TypeScript / Node.js 20, Next.js 16 (App Router) + Next.js built-in metadata API (`src/app/icon.*`, `src/app/favicon.ico`, `src/app/opengraph-image.*`); `sharp` (already transitive via Next.js) for PNG resizing; no new runtime dependencies
