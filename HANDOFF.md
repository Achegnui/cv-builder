# HANDOFF.md: Project state for switching chats

This file is the memory of the project. Any new chat (or agent) reads it and continues exactly where the last one stopped. Keep it short, under about 150 lines, so it costs little context.

---

### 1. Snapshot
- Project: CV Builder (see MASTER-PLAN.md)
- Track: antigravity
- Date of last update: 2026-11-11
- Current phase: 3
- Phase status: done

### 2. Completed
- [x] Phase 0: Setup
- [x] Phase 1: Data model and form
- [x] Phase 2: Template engine and preview
- [x] Phase 3: PDF and Word export
- [ ] Phase 4: Regions and CV types
- [ ] Phase 5: CV Doctor and Evidence Vault
- [ ] Phase 6: Honest AI and Coach mode
- [ ] Phase 7: Job tailoring and gap report
- [ ] Phase 8: Accounts, payments, privacy
- [ ] Phase 9: Bilingual, scholarship mode, launch

Notes on what is done inside the current phase:
- Implemented Microsoft Word export generator in `src/lib/export/docx.ts` using `docx` with right-aligned tab stops for dates, bullet formatting, A4/Letter sizing, and black-only/accent styling.
- Created server-side API route handler at `POST /api/export/docx` streaming `.docx` binary attachments with sanitized filenames.
- Built dedicated clean print view at `/print` for zero-cost, high-reliability vector PDF generation via browser print.
- Added Export buttons for Word (.docx) and PDF across both the preview toolbar and the top form actions bar.
- Added 7 unit tests in `src/tests/export.test.ts` verifying binary validity, internal OpenXML contents, right tab stops, black-only color enforcement, and API route responses (35 total tests passing).

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

### 4. Environment
- Node version: v22.19.0
- Package manager: npm (10.8.2)
- Scripts: `npm run dev`, `npm run test`, `npm run build`, `npm run lint`
- Environment variable NAMES used (no values): `ANTHROPIC_API_KEY`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `FLUTTERWAVE_PUBLIC_KEY`, `FLUTTERWAVE_SECRET_KEY`, `FLUTTERWAVE_ENCRYPTION_KEY`, `FLUTTERWAVE_WEBHOOK_SECRET_HASH`
- Hosting target: TBD (Phase 9)

### 5. Key files (only the important ones)
```
src/lib/export/docx.ts               # Word document generation with tab stops & styling
src/app/api/export/docx/route.ts     # POST route streaming .docx binary attachment
src/app/print/page.tsx               # Dedicated clean print-to-PDF view
src/components/cv-preview/style-toolbar.tsx # Export Word & Export PDF action triggers
src/tests/export.test.ts             # Word export & API route unit tests
```

### 6. Conventions in use
- Follows AGENTS.md
- Strict TypeScript (`noImplicitAny`, strict null checks)
- Dates stored as `YYYY-MM` strings
- Components stay small; logic lives in `src/lib`
- No HTML tables or text boxes for layout

### 7. Known issues and TODO
- None from Phase 3.

### 8. Next task (be exact)
Phase 4: Regions and CV types. Build region profiles in `src/lib/regions` (US, UK, German style Lebenslauf, Europass-style, academic, technical, combination, one-page) with a warnings panel and toggles for photo, date of birth, and length.

### 9. Last session summary
- Built `.docx` Word export engine matching the single-column template layout with right-aligned tab stops.
- Created `POST /api/export/docx` route handler and dedicated `/print` view.
- Added 7 export unit tests and verified production build.

### 10. Scorecard notes for this track
- Time spent this phase: ~0.75 hours
- Number of fix prompts needed: 0
- Manual steps I had to do myself: 0
- Surprises: None.
