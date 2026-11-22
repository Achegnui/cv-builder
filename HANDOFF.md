# HANDOFF.md: Project state for switching chats

This file is the memory of the project. Any new chat (or agent) reads it and continues exactly where the last one stopped. Keep it short, under about 150 lines, so it costs little context.

---

### 1. Snapshot
- Project: CV Builder (see MASTER-PLAN.md)
- Track: antigravity
- Date of last update: 2026-11-22
- Current phase: 7
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
- [ ] Phase 8: Accounts, payments, privacy
- [ ] Phase 9: Bilingual, scholarship mode, launch

Notes on what is done inside the current phase:
- Implemented untrusted job posting parser with injection stripping (`src/lib/tailoring/matcher.ts`) extracting core skills, nice-to-haves, YOE, tools, location, and timezone.
- Replaced 0-100 score with plain assessment labels ("strong fit", "stretch", "long shot") and factorized reasons evaluating candidate's documented experience years against required tenure and core requirement gaps.
- Added bidirectional whole-word synonym and spelling variant handling (`Next.js` <-> `NextJS`, `PostgreSQL` <-> `Postgres`, `Kubernetes` <-> `K8s`, `Customer Onboarding` <-> `Client Onboarding`, `CI/CD` <-> `Continuous Integration`).
- Sourced salary benchmark data in `salary-data.ts` with required `sourceName`, `sourceUrl`, and `retrievedDate` for US, UK, DE, CA, NG, KE, GH, IN. Cameroon (`CM`) explicitly states no verified public survey data is available rather than guessing.
- Built 3-tier evidence matcher cross-referencing experience bullets, projects, skills, and Evidence Vault facts, classifying items as strong match (with citation), partial match (with adjacent skill note), or honest gap (plainly stated without sugarcoating per AGENTS.md Rule 5).
- Built Tailored CV Proposer generating reworded bullets that emphasize keywords only where user facts support them; every proposal is validated through `runHonestyGuard`.
- Built interactive `TailoringModal` with 4 tabs: 1-click sample postings loader, Match & Gap Report with plain fit badges and reasons, Line-by-Line before/after review with individual accept/reject toggles, and Helpers with verified source links.
- Added 17 unit tests in `src/tests/tailoring.test.ts` (107 total passing tests across 10 test suites). Verified with Next.js production build.

### 3. Decisions (keep each to one line, with the reason)
| Decision | Reason |
|---|---|
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
src/lib/tailoring/matcher.ts         # Requirement extraction, 3-tier evidence matcher, fit check
src/lib/tailoring/salary-data.ts     # Curated salary benchmarks across 8 countries and 5 levels
src/lib/tailoring/sample-postings.ts # Realistic sample job postings (Frontend, Fullstack, Analyst)
src/app/api/ai/tailor/route.ts       # Server endpoint for job parsing, matching, and fit checks
src/components/cv-tailoring/tailoring-modal.tsx # 4-tab interactive tailoring, gap report, and helpers UI
src/tests/tailoring.test.ts          # 12 tests verifying extraction, matching, gaps, and line review
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

### 7. Known issues and TODO
- None from Phase 7.

### 8. Next task (be exact)
Phase 8: Accounts, storage, payments and privacy (U5). Propose Supabase, Appwrite and Firebase with pros and cons; implement user accounts for saving multiple CVs, delete-my-data button, watermark on free exports, and server-verified Flutterwave payments (mobile money and cards) with webhook signature verification.

### 9. Last session summary
- Enhanced Job Tailoring with plain assessment labels ("strong fit", "stretch", "long shot") and transparent reasons.
- Added candidate experience tenure calculation from date ranges and matched against required years of experience.
- Implemented bidirectional whole-word synonym mapping for technical tools and job terms.
- Enforced strict provenance on salary benchmarks in `salary-data.ts` (source name, URL, retrieved date) and added Cameroon with transparent "no verified data available" notice.
- Hardened job posting prompt isolation with adversarial injection tests.
- All 107 tests passing across 10 test suites; Next.js production build verified.

### 10. Scorecard notes for this track
- Time spent this phase: ~0.75 hours
- Number of fix prompts needed: 0
- Manual steps I had to do myself: 0
- Surprises: None.
