# HANDOFF.md: Project state for switching chats

This file is the memory of the project. Any new chat (or agent) reads it and continues exactly where the last one stopped. Keep it short, under about 150 lines, so it costs little context.

---

### 1. Snapshot
- Project: CV Builder (see MASTER-PLAN.md)
- Track: antigravity
- Date of last update: 2026-11-14
- Current phase: 4
- Phase status: done

### 2. Completed
- [x] Phase 0: Setup
- [x] Phase 1: Data model and form
- [x] Phase 2: Template engine and preview
- [x] Phase 3: PDF and Word export
- [x] Phase 4: Regions and CV types
- [ ] Phase 5: CV Doctor and Evidence Vault
- [ ] Phase 6: Honest AI and Coach mode
- [ ] Phase 7: Job tailoring and gap report
- [ ] Phase 8: Accounts, payments, privacy
- [ ] Phase 9: Bilingual, scholarship mode, launch

Notes on what is done inside the current phase:
- Built complete region profiles architecture in `src/lib/regions/` covering all 8 formats: US, UK, German style (Lebenslauf), Europass-style, academic, technical, combination, and one-page.
- Kept all regional metadata, default paper sizes, section orders, regional section headings, and warnings in a single editable file (`src/lib/regions/profiles.ts`).
- Single-column template and `.docx` Word export both dynamically adapt to the active region profile's section order and labels.
- Added user toggles for photo, date of birth, and nationality, plus expandable "Why?" rationale and dismissible warnings with honest "commonly" / "often" phrasing.
- Stored selected region profile and overrides in browser localStorage.
- Added 11 unit tests in `src/tests/regions.test.ts` (46 total tests passing across 7 test suites). Verified with full production Next.js build.

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
| PDF via browser print with /print view | Zero server compute cost ($0), instant 0ms latency, 100% reliable on free hosts |
| Word export via `docx` library | Produces native, editable OpenXML documents matching the ATS template layout |
| Centralized region catalog in profiles.ts | Keeps all regional conventions, translations, and warnings in one editable data file |
| Region profile decoupled from template design | Allows any template to adapt dynamically to any region's section order and headings |
| Honest convention phrasing ("commonly"/"often") | Acknowledges employer variability and avoids dogmatic rules per AGENTS.md rule 10 |

### 4. Environment
- Node version: v22.19.0
- Package manager: npm (10.8.2)
- Scripts: `npm run dev`, `npm run test`, `npm run build`, `npm run lint`
- Environment variable NAMES used (no values): `ANTHROPIC_API_KEY`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `FLUTTERWAVE_PUBLIC_KEY`, `FLUTTERWAVE_SECRET_KEY`, `FLUTTERWAVE_ENCRYPTION_KEY`, `FLUTTERWAVE_WEBHOOK_SECRET_HASH`
- Hosting target: TBD (Phase 9)

### 5. Key files (only the important ones)
```
src/lib/regions/types.ts             # Region profile, override, and warning type definitions
src/lib/regions/profiles.ts          # Catalog of all 8 region profiles and helper functions
src/components/cv-regions/region-switcher.tsx # Target region dropdown selector with UI disclaimer
src/components/cv-regions/warnings-panel.tsx  # Expandable regional warnings with 'Why?' and user toggles
src/lib/templates/single-column.tsx  # Dynamic template rendering with regional ordering & labels
src/lib/export/docx.ts               # Regional Word export generator
src/tests/regions.test.ts            # Unit tests for profiles, overrides, ordering, and template integration
```

### 6. Conventions in use
- Follows AGENTS.md
- Strict TypeScript (`noImplicitAny`, strict null checks)
- Dates stored as `YYYY-MM` strings
- Components stay small; logic lives in `src/lib`
- Regional conventions presented honestly with "commonly" or "often" phrasing and user toggles
- No HTML tables or text boxes for layout

### 7. Known issues and TODO
- None from Phase 4.

### 8. Next task (be exact)
Phase 5: CV Doctor and Evidence Vault. Build validation rules (missing contact info, weak verbs, passive voice, cliché words, date inconsistencies, placeholder text like `[add number]`), and the Evidence Vault for tracking claims and numbers.

### 9. Last session summary
- Implemented 8 region profiles with dynamic section ordering and regional labels.
- Added warnings panel with "Why?" explanations and toggles for photo, date of birth, and nationality.
- Updated SingleColumnTemplate and Word docx export to respect active region profile.
- Added 11 unit tests (46 total tests passing) and confirmed production build.

### 10. Scorecard notes for this track
- Time spent this phase: ~0.75 hours
- Number of fix prompts needed: 0
- Manual steps I had to do myself: 0
- Surprises: None.
