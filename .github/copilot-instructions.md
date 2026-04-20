<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan:
**Feature Branch**: `002-add-modern-theme`  
**Plan**: [specs/002-add-modern-theme/plan.md](specs/002-add-modern-theme/plan.md)  
**Spec**: [specs/002-add-modern-theme/spec.md](specs/002-add-modern-theme/spec.md)  

**Active Feature**: Add Modern Theme with glassmorphism, bento grid layout, wallpaper support, and adjustable blur intensity. Modern theme defaults to Bento Grid layout; layout modes (Uniform Grid / Bento Grid) are available to all themes. Dark-only in v1; Gruvbox remains default for new users.

**Tech Stack**: Next.js 16.2.2 (App Router), TypeScript strict, SQLite, Tailwind CSS, shadcn/ui, CSS custom properties for theming, Drizzle ORM. No cloud dependencies. Offline-capable. WCAG AA accessibility mandatory. 90% test coverage required.

**Key Contracts**: [theme.ts](specs/002-add-modern-theme/contracts/theme.ts), [wallpaper.ts](specs/002-add-modern-theme/contracts/wallpaper.ts), [layout.ts](specs/002-add-modern-theme/contracts/layout.ts)

**Implementation Guide**: [quickstart.md](specs/002-add-modern-theme/quickstart.md)  
**Data Model**: [data-model.md](specs/002-add-modern-theme/data-model.md)  
**Research & Design Decisions**: [research.md](specs/002-add-modern-theme/research.md)
<!-- SPECKIT END -->
