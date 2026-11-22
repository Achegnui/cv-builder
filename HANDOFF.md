# HANDOFF.md: Project state for switching chats

This file is the memory of the project. Any new chat (or agent) reads it and continues exactly where the last one stopped. Keep it short, under about 150 lines, so it costs little context.

---

### 1. Snapshot
- Project: CV Builder (see MASTER-PLAN.md)
- Track: antigravity
- Date of last update: 2026-11-22
- Current phase: 8a
- Phase status: done

### 2. Completed
- [x] Phase 0: Setup
- [x] Phase 1: Data model and form
- [x] Phase 2: Template engine and preview
- [x] Phase 3: PDF and Word export
- [x] Phase 4: Regions and CV types
- [x] Phase 5: CV Doctor and Evidence Vault
- [x] Phase 6: Honest AI and Coach mode (hardened)
- [x] Phase 7: Job tailoring, gap report, plain fit labels, synonym matching, and sourced salary benchmarks
- [x] Phase 8a: Accounts and storage (Supabase, multi-version CVs, RLS isolation, delete all data)
- [ ] Phase 8b: Payments (Flutterwave, watermarks, webhook verification)
- [ ] Phase 9: Bilingual, scholarship mode, launch

Notes on what is done inside the current phase:
- Evaluated Supabase, Appwrite, and Firebase across auth, data access rules, free tier limits, and isolation difficulty. Selected Supabase for engine-level PostgreSQL Row Level Security (RLS) and App Router alignment.
- Created Supabase PostgreSQL migration schema (`src/lib/supabase/schema.sql`) with `cv_versions` table, cascade foreign keys, and RLS policies enforcing that users can only select, insert, update, and delete their own records.
- Built multi-tenant store (`src/lib/supabase/store.ts`) connecting to Supabase HTTP APIs (GoTrue and PostgREST) with zero-dependency fallback for offline/local development and testing.
- Created server route handlers with strict user verification: `/api/auth/signup`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`, `/api/auth/delete-account`, `/api/cvs` (GET/POST), and `/api/cvs/[id]` (GET/PUT/DELETE).
- User A vs. User B isolation strictly enforced: querying or modifying another user's CV returns 404, preventing information disclosure.
- Built accessible UI components: `AuthModal`, `SavedCVsModal` (save current version, load into editor, delete), `DeleteAccountModal` ("type DELETE" permanent cascade purge), and `AuthNav` toolbar header.
- Maintained 100% free guest builder: users can build, edit, and export locally without an account.
- Audited privacy: zero CV content is printed to server logs per AGENTS.md Rule 5.
- Added 10 unit tests in `src/tests/auth-storage.test.ts` (117 total passing tests across 11 test suites). Verified with Next.js production build.

### 3. Decisions (keep each to one line, with the reason)
| Decision | Reason |
|---|---|
| Supabase for backend storage | PostgreSQL Row Level Security (RLS) guarantees database-engine level isolation of user CV data |
| Free builder without login | Users can create, edit, validate, and export locally; saving multiple cloud versions is the account benefit |
| 404 for unauthorized CV access | Returning 404 instead of 403 prevents User B from detecting the existence of User A's CV IDs |
| Cascading delete for account removal | `ON DELETE CASCADE` guarantees complete removal of all CV versions and vault facts when account is deleted |
| Untrusted job posting sanitization | Directives inside job posting text are stripped so injected commands cannot alter match scores |
| 3-tier matching (strong/partial/gap) | Distinguishes verified strong matches from foundational partials and transparent gaps |
| Line-by-line bullet review | User maintains full control over proposed rewordings, preventing silent bulk changes |
| Non-ghostwriting cover letter outline | Provides honest outline addressing gaps rather than fabricated narrative |
| Sourced salary market references | Provides transparent benchmark ranges with explicit educational disclaimer and units |
| Dual-layer honesty check (prompt + post-guard) | System prompt instructs honesty; guard inspects and blocks any hallucinated tokens |
| Claude API server-only via Next.js route handlers | Guarantees API key is never exposed to client browsers per AGENTS.md rule 5 |

### 4. Environment
- Node version: v22.19.0
- Package manager: npm (10.8.2)
- Scripts: `npm run dev`, `npm run test`, `npm run build`, `npm run lint`
- Environment variable NAMES used (no values): `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `FLUTTERWAVE_PUBLIC_KEY`, `FLUTTERWAVE_SECRET_KEY`, `FLUTTERWAVE_ENCRYPTION_KEY`, `FLUTTERWAVE_WEBHOOK_SECRET_HASH`
- Hosting target: TBD (Phase 9)

### 5. Key files (only the important ones)
```
src/lib/supabase/schema.sql          # Supabase PostgreSQL schema with RLS policies and cascading triggers
src/lib/supabase/store.ts           # Multi-tenant auth & CV storage with strict RLS simulation fallback
src/lib/supabase/server-auth.ts      # Server-side Bearer and cookie session validator
src/app/api/auth/                    # Sign-up, login, logout, me, and delete-account endpoints
src/app/api/cvs/                     # CV version CRUD endpoints with ownership enforcement
src/components/auth/                 # AuthModal, SavedCVsModal, DeleteAccountModal, AuthNav, AuthContext
src/tests/auth-storage.test.ts       # 10 tests verifying auth flow, RLS isolation, cascade delete, and zero-log policy
```

### 6. Conventions in use
- Follows AGENTS.md
- Strict TypeScript (`noImplicitAny`, strict null checks)
- Dates stored as `YYYY-MM` strings
- Components stay small; logic lives in `src/lib`
- Unfinished placeholders block export completely on client and server
- Unverified numbers are flagged unless confirmed in Evidence Vault
- AI output is validated by Honesty Guard before reaching the user; never invents facts
- Gaps in job tailoring are presented plainly, never concealed
- Row Level Security enforces that users can only read, write, or delete their own data
- Zero CV content in server logs

### 7. Known issues and TODO
- None from Phase 8a.

### 8. Next task (be exact)
Phase 8b: Payments, watermarks, and checkout (U5). Add watermark on free exports ("Built with CV Builder (Free Edition)"), paid one-time pass and per-export purchases via Flutterwave (mobile money and cards in Cameroon / international), server-created checkout, webhook signature verification before unlocking exports, no auto-renewing trials, and a plain-language privacy notice.

### 9. Last session summary
- Implemented Phase 8a: Accounts and Storage with Supabase.
- Built authentication endpoints (sign-up, login, logout, me) with session cookies and Bearer tokens.
- Built multi-version CV storage with strict server-side ownership enforcement (`/api/cvs`, `/api/cvs/[id]`).
- Implemented "Delete My Account and All Data" cascade purge button and endpoint.
- Maintained 100% free local builder for unauthenticated guests.
- Added 10 tests in `src/tests/auth-storage.test.ts` proving User A vs. User B isolation and zero-log privacy compliance (117 total passing tests across 11 test suites). Verified Next.js production build.

### 10. Scorecard notes for this track
- Time spent this phase: ~0.75 hours
- Number of fix prompts needed: 0
- Manual steps I had to do myself: 0
- Surprises: None.
