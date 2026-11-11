# HANDOFF.md: Project state for switching chats

This file is the memory of the project. Any new chat (or agent) reads it and continues exactly where the last one stopped. Keep it short, under about 150 lines, so it costs little context.

---

### 1. Snapshot
- Project: CV Builder (see MASTER-PLAN.md)
- Track: antigravity
- Date of last update: 2026-11-10
- Current phase: 0
- Phase status: done

### 2. Completed
- [x] Phase 0: Setup
- [ ] Phase 1: Data model and form
- [ ] Phase 2: Template engine and preview
- [ ] Phase 3: PDF and Word export
- [ ] Phase 4: Regions and CV types
- [ ] Phase 5: CV Doctor and Evidence Vault
- [ ] Phase 6: Honest AI and Coach mode
- [ ] Phase 7: Job tailoring and gap report
- [ ] Phase 8: Accounts, payments, privacy
- [ ] Phase 9: Bilingual, scholarship mode, launch

Notes on what is done inside the current phase:
- Initialized Next.js App Router app with TypeScript strict mode and Tailwind CSS.
- Installed Zod, React Hook Form, and Vitest testing suite.
- Verified test suite (`npm run test`) and production build (`npm run build`).
- Created folder structure from section 4 of MASTER-PLAN.md with placeholder files.
- Added `.env.example`, `.agents/rules/project-rules.md`, and clean home page displaying "CV Builder".

### 3. Decisions (keep each to one line, with the reason)
| Decision | Reason |
|---|---|
| Next.js App Router + TS strict mode | Required stack, modern standard for server routes and metadata |
| Vitest with path aliases | Fast unit testing for logic with native ESM and `@/*` mapping |
| Root outputFileTracingRoot in next.config | Prevents Next.js from falsely inferring user parent directory as workspace root |
| Tailwind CSS v3 | Stable utility styling for responsive mobile-first layouts |

### 4. Environment
- Node version: v22.19.0
- Package manager: npm (10.8.2)
- Scripts: `npm run dev`, `npm run test`, `npm run build`, `npm run lint`
- Environment variable NAMES used (no values): `ANTHROPIC_API_KEY`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `FLUTTERWAVE_PUBLIC_KEY`, `FLUTTERWAVE_SECRET_KEY`, `FLUTTERWAVE_ENCRYPTION_KEY`, `FLUTTERWAVE_WEBHOOK_SECRET_HASH`
- Hosting target: TBD (Phase 9)

### 5. Key files (only the important ones)
```
src/app/page.tsx
src/app/layout.tsx
src/app/globals.css
src/tests/sample.test.ts
src/lib/schema/index.ts
src/lib/templates/index.ts
src/lib/regions/index.ts
src/lib/validation/index.ts
src/lib/vault/index.ts
src/lib/ai/index.ts
src/lib/export/index.ts
src/lib/i18n/index.ts
.env.example
vitest.config.ts
tailwind.config.ts
next.config.ts
```

### 6. Conventions in use
- Follows AGENTS.md
- Strict TypeScript (`noImplicitAny`, strict null checks)
- Dates stored as `YYYY-MM` strings

### 7. Known issues and TODO
- None for Phase 0.

### 8. Next task (be exact)
Phase 1: Implement the CV data model from section 3 of cv-builder-project-brief.md as Zod schemas and TypeScript types in `src/lib/schema`, and build the multi-section form with browser storage persistence.

### 9. Last session summary
- Scaffolded Next.js project with TypeScript, Tailwind CSS, Zod, React Hook Form, and Vitest.
- Set up project structure, placeholders, and `.env.example`.
- Verified tests and production build pass cleanly.

### 10. Scorecard notes for this track
- Time spent this phase: ~0.5 hours
- Number of fix prompts needed: 0
- Manual steps I had to do myself: 1 (initial git branch setup)
- Surprises: Parent directory had untracked user files needing explicit root boundary.
