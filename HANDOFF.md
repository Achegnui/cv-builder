# HANDOFF.md: Project state for switching chats

This file is the memory of the project. Any new chat (or agent) reads it and continues exactly where the last one stopped. Keep it short, under about 150 lines, so it costs little context.

---

### 1. Snapshot
- Project: CV Builder (see MASTER-PLAN.md)
- Track: antigravity
- Date of last update: 2026-11-11
- Current phase: 1
- Phase status: done

### 2. Completed
- [x] Phase 0: Setup
- [x] Phase 1: Data model and form
- [ ] Phase 2: Template engine and preview
- [ ] Phase 3: PDF and Word export
- [ ] Phase 4: Regions and CV types
- [ ] Phase 5: CV Doctor and Evidence Vault
- [ ] Phase 6: Honest AI and Coach mode
- [ ] Phase 7: Job tailoring and gap report
- [ ] Phase 8: Accounts, payments, privacy
- [ ] Phase 9: Bilingual, scholarship mode, launch

Notes on what is done inside the current phase:
- Defined structured Zod schemas and TypeScript types in `src/lib/schema/` with YYYY-MM date enforcement.
- Kept GPA and degree classification as strictly separate fields.
- Implemented multi-section form with React Hook Form covering profile, summary, experience, education, skills, projects, certifications, awards, languages, and 4 academic sections.
- Enabled adding, removing, and reordering entries with up/down controls.
- Implemented auto-save to browser `localStorage` that persists across reloads, plus JSON import and export backups.
- Added fictional sample CV data for testing and demonstrations.
- Added 20 unit tests across schemas, storage, and JSON I/O (all passing).

### 3. Decisions (keep each to one line, with the reason)
| Decision | Reason |
|---|---|
| Next.js App Router + TS strict mode | Required stack, modern standard for server routes and metadata |
| Vitest with path aliases | Fast unit testing for logic with native ESM and `@/*` mapping |
| Root outputFileTracingRoot in next.config | Prevents Next.js from falsely inferring user parent directory as workspace root |
| Dates as YYYY-MM regex strings | Standardized, sortable, prevents timezone shifts across regions |
| GPA & degree classification separated | Prevents mixing US 4.0 GPA with UK honours classifications |
| Client-side auto-save with Zod validation | Guarantees stored data validity and prevents work loss without server roundtrips |

### 4. Environment
- Node version: v22.19.0
- Package manager: npm (10.8.2)
- Scripts: `npm run dev`, `npm run test`, `npm run build`, `npm run lint`
- Environment variable NAMES used (no values): `ANTHROPIC_API_KEY`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `FLUTTERWAVE_PUBLIC_KEY`, `FLUTTERWAVE_SECRET_KEY`, `FLUTTERWAVE_ENCRYPTION_KEY`, `FLUTTERWAVE_WEBHOOK_SECRET_HASH`
- Hosting target: TBD (Phase 9)

### 5. Key files (only the important ones)
```
src/lib/schema/cv.ts                # Zod schemas & types for all CV sections
src/lib/schema/sample-data.ts        # Fictional sample CV data
src/lib/schema/defaults.ts           # Empty initial CV state
src/lib/storage.ts                   # localStorage save/load/clear with Zod check
src/lib/json-io.ts                   # JSON backup export and import
src/components/cv-form/cv-form.tsx   # Top-level multi-section form manager
src/components/cv-form/              # Section subcomponents (profile, exp, edu, etc.)
src/tests/schema.test.ts             # Schema validation unit tests
src/tests/storage.test.ts            # Browser storage unit tests
src/tests/json-io.test.ts            # JSON import/export unit tests
```

### 6. Conventions in use
- Follows AGENTS.md
- Strict TypeScript (`noImplicitAny`, strict null checks)
- Dates stored as `YYYY-MM` strings
- Components stay small; logic lives in `src/lib`

### 7. Known issues and TODO
- None from Phase 1.

### 8. Next task (be exact)
Phase 2: Build the template registry in `src/lib/templates` and create the first single-column ATS-safe template with style options (A4/US Letter, black-only/accent color, safe fonts, compact/normal spacing) and live preview next to the form.

### 9. Last session summary
- Implemented full CV data model in Zod with TypeScript types.
- Built interactive multi-section form with add/remove/reorder and validation messages.
- Added browser persistence and JSON backup import/export.
- Verified test suite (20 tests passed) and production build.

### 10. Scorecard notes for this track
- Time spent this phase: ~1.0 hour
- Number of fix prompts needed: 0
- Manual steps I had to do myself: 0
- Surprises: None.
