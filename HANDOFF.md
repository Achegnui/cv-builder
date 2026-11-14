# HANDOFF.md: Project state for switching chats

This file is the memory of the project. Any new chat (or agent) reads it and continues exactly where the last one stopped. Keep it short, under about 150 lines, so it costs little context.

---

### 1. Snapshot
- Project: CV Builder (see MASTER-PLAN.md)
- Track: antigravity
- Date of last update: 2026-11-14
- Current phase: 5
- Phase status: done

### 2. Completed
- [x] Phase 0: Setup
- [x] Phase 1: Data model and form
- [x] Phase 2: Template engine and preview
- [x] Phase 3: PDF and Word export
- [x] Phase 4: Regions and CV types
- [x] Phase 5: CV Doctor and Evidence Vault
- [ ] Phase 6: Honest AI and Coach mode
- [ ] Phase 7: Job tailoring and gap report
- [ ] Phase 8: Accounts, payments, privacy
- [ ] Phase 9: Bilingual, scholarship mode, launch

Notes on what is done inside the current phase:
- Implemented modular CV Doctor validation engine in `src/lib/validation/` with all 8 checks: dates (chronology & future end dates on finished roles), duplicates (organizations/roles), repeated content (summary vs bullets & identical bullets), conflicting claims (inconsistent event rankings e.g. 1st vs 3rd place), label errors (GPA vs degree classification), bullet styles (mixed ending punctuation), placeholders (unfinished placeholders like `[add number]` blocking export), and unverified numbers.
- Implemented Evidence Vault in `src/lib/vault/` with user-controlled verification toggles, metrics extraction, and browser storage persistence.
- Built `CVDoctorPanel` with severity indicators, issue filtering, actionable plain-language suggestions, and smooth field jumping.
- Built `VaultPanel` for adding, viewing, and managing verified facts.
- Enforced strict export blocking across the UI (`CVForm`, `StyleToolbar`, `PrintPage`) and server API route (`/api/export/docx` returning 422) whenever placeholders remain.
- Created deliberately broken test CV in `fixtures.ts` that triggers all 8 checks.
- Added 7 unit tests in `src/tests/validation.test.ts` (53 total passing tests across 8 test suites). Verified with production Next.js build.

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
| Modular validation rules registry | Allows adding or modifying rules without modifying engine or UI code |
| Export blocked on server and client | Ensures placeholders like `[add number]` can never be exported per AGENTS.md rule 3 |
| User-only verification flag on vault facts | Prevents automated false assurances; the user actively verifies their evidence |

### 4. Environment
- Node version: v22.19.0
- Package manager: npm (10.8.2)
- Scripts: `npm run dev`, `npm run test`, `npm run build`, `npm run lint`
- Environment variable NAMES used (no values): `ANTHROPIC_API_KEY`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `FLUTTERWAVE_PUBLIC_KEY`, `FLUTTERWAVE_SECRET_KEY`, `FLUTTERWAVE_ENCRYPTION_KEY`, `FLUTTERWAVE_WEBHOOK_SECRET_HASH`
- Hosting target: TBD (Phase 9)

### 5. Key files (only the important ones)
```
src/lib/validation/engine.ts         # CV Doctor rule runner and severity sorter
src/lib/validation/rules/            # 8 modular validation check implementations
src/lib/validation/fixtures.ts       # Deliberately broken sample CV triggering all 8 checks
src/lib/vault/index.ts               # Evidence Vault storage, fact management, number extraction
src/components/cv-doctor/cv-doctor-panel.tsx # CV Doctor interactive issue panel with jump links
src/components/cv-vault/vault-panel.tsx # Evidence Vault management UI with verification toggles
src/tests/validation.test.ts         # Unit tests for CV Doctor, Evidence Vault, and export blocking
```

### 6. Conventions in use
- Follows AGENTS.md
- Strict TypeScript (`noImplicitAny`, strict null checks)
- Dates stored as `YYYY-MM` strings
- Components stay small; logic lives in `src/lib`
- Unfinished placeholders block export completely on client and server
- Unverified numbers are flagged unless confirmed in Evidence Vault
- No HTML tables or text boxes for layout

### 7. Known issues and TODO
- None from Phase 5.

### 8. Next task (be exact)
Phase 6: Honest AI and Coach mode. Server-only Claude API routes with strict honesty guards (rejecting output that invents numbers/tools/employers/dates), banned-words filter, em dash avoidance option, and Coach mode that interviews and reviews without ghostwriting.

### 9. Last session summary
- Implemented CV Doctor with all 8 checks and Evidence Vault with metric extraction.
- Built CVDoctorPanel and VaultPanel with jump links and verified badges.
- Enforced placeholder export blocking on client UI and API route (HTTP 422).
- Added 7 unit tests (53 total passing tests) and verified Next.js production build.

### 10. Scorecard notes for this track
- Time spent this phase: ~0.75 hours
- Number of fix prompts needed: 0
- Manual steps I had to do myself: 0
- Surprises: None.
