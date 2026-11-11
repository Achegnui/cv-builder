# HANDOFF.md: Project state for switching chats

This file is the memory of the project. Any new chat (or agent) reads it and continues exactly where the last one stopped. Keep it short, under about 150 lines, so it costs little context.

---

### 1. Snapshot
- Project: CV Builder (see MASTER-PLAN.md)
- Track: antigravity
- Date of last update: 2026-11-11
- Current phase: 2
- Phase status: done

### 2. Completed
- [x] Phase 0: Setup
- [x] Phase 1: Data model and form
- [x] Phase 2: Template engine and preview
- [ ] Phase 3: PDF and Word export
- [ ] Phase 4: Regions and CV types
- [ ] Phase 5: CV Doctor and Evidence Vault
- [ ] Phase 6: Honest AI and Coach mode
- [ ] Phase 7: Job tailoring and gap report
- [ ] Phase 8: Accounts, payments, privacy
- [ ] Phase 9: Bilingual, scholarship mode, launch

Notes on what is done inside the current phase:
- Created extensible Template Registry in `src/lib/templates/registry.ts`.
- Implemented first ATS-safe single-column template (`single-column.tsx`) with zero HTML tables or text boxes.
- Implemented `StyleConfig` supporting paper size (A4 / US Letter), color mode (accent color / black-only), 3 safe font stacks (sans, serif, mono), and spacing (normal / compact).
- Built live preview with real-time updates as the user types, desktop dual-pane grid, and mobile toggle with isolated horizontal scroll container for 360px viewport support.
- Added comprehensive print stylesheets enforcing clean `@page` sizing, hiding UI chrome, and preventing awkward entry/heading page breaks.
- Added 8 unit tests in `src/tests/templates.test.ts` (28 total tests passing across project).

### 3. Decisions (keep each to one line, with the reason)
| Decision | Reason |
|---|---|
| Next.js App Router + TS strict mode | Required stack, modern standard for server routes and metadata |
| Vitest with path aliases | Fast unit testing for logic with native ESM and `@/*` mapping |
| Root outputFileTracingRoot in next.config | Prevents Next.js from falsely inferring user parent directory as workspace root |
| Dates as YYYY-MM regex strings | Standardized, sortable, prevents timezone shifts across regions |
| GPA & degree classification separated | Prevents mixing US 4.0 GPA with UK honours classifications |
| Client-side auto-save with Zod validation | Guarantees stored data validity and prevents work loss without server roundtrips |
| Semantic HTML for templates (no tables) | Ensures ATS parsing accuracy and strict compliance with accessibility standards |
| Black-only mode as first-class setting | Critical for traditional employers, government portals, and ATS scanners |

### 4. Environment
- Node version: v22.19.0
- Package manager: npm (10.8.2)
- Scripts: `npm run dev`, `npm run test`, `npm run build`, `npm run lint`
- Environment variable NAMES used (no values): `ANTHROPIC_API_KEY`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `FLUTTERWAVE_PUBLIC_KEY`, `FLUTTERWAVE_SECRET_KEY`, `FLUTTERWAVE_ENCRYPTION_KEY`, `FLUTTERWAVE_WEBHOOK_SECRET_HASH`
- Hosting target: TBD (Phase 9)

### 5. Key files (only the important ones)
```
src/lib/templates/types.ts           # StyleConfig, PaperSize, FontFamily types
src/lib/templates/registry.ts        # Extensible template registry
src/lib/templates/single-column.tsx  # First ATS-safe single-column template
src/components/cv-preview/           # Preview container & style toolbar
src/components/cv-form/cv-form.tsx   # Dual-pane form + live preview coordinator
src/tests/templates.test.ts          # Template rendering & black-only mode tests
src/app/globals.css                  # Print CSS rules (@media print)
```

### 6. Conventions in use
- Follows AGENTS.md
- Strict TypeScript (`noImplicitAny`, strict null checks)
- Dates stored as `YYYY-MM` strings
- Components stay small; logic lives in `src/lib`
- No HTML tables or text boxes for layout

### 7. Known issues and TODO
- None from Phase 2.

### 8. Next task (be exact)
Phase 3: Export to PDF and Word. Add export routes: PDF (server-side generation with browser print as fallback) and Word (.docx via the `docx` library with right-aligned tab stops for dates, bullet formatting, and style options).

### 9. Last session summary
- Implemented template registry, style options, and ATS-safe single-column template.
- Built live real-time preview beside the form with mobile tab switching and print stylesheets.
- Verified 28 unit tests and production build.

### 10. Scorecard notes for this track
- Time spent this phase: ~0.75 hours
- Number of fix prompts needed: 0
- Manual steps I had to do myself: 0
- Surprises: None.
