# HANDOFF.md: Project state for switching chats

This file is the memory of the project. Any new chat (or agent) reads it and continues exactly where the last one stopped. Keep it short, under about 150 lines, so it costs little context.

---

### 1. Snapshot
- Project: CV Builder (see MASTER-PLAN.md)
- Track: antigravity
- Date of last update: 2026-11-20
- Current phase: 6
- Phase status: done

### 2. Completed
- [x] Phase 0: Setup
- [x] Phase 1: Data model and form
- [x] Phase 2: Template engine and preview
- [x] Phase 3: PDF and Word export
- [x] Phase 4: Regions and CV types
- [x] Phase 5: CV Doctor and Evidence Vault
- [x] Phase 6: Honest AI and Coach mode
- [ ] Phase 7: Job tailoring and gap report
- [ ] Phase 8: Accounts, payments, privacy
- [ ] Phase 9: Bilingual, scholarship mode, launch

Notes on what is done inside the current phase:
- Implemented server-only Claude API endpoints (`/api/ai/action`, `/api/ai/coach`) with Zod schema validation, sliding-window rate limiting, and zero client-bundle exposure of `ANTHROPIC_API_KEY`.
- Built the Honesty Guard (`src/lib/ai/guard.ts`) that strictly rejects output containing unverified numbers, invented tech tools, unmentioned employers, dates/years, or user-configurable banned words (`passionate`, `proven track record`, etc.), with support for an em dash avoidance style setting.
- Built Coach mode (`src/components/cv-coach/coach-modal.tsx`) with an employer AI policy reminder banner, explicit ghostwriting refusal detector (`isGhostwritingRequest`), and 3 active modes: Interview Chat (asks one focused question at a time), Notes & Outline (organizes user's own points), and Draft Reviewer (checks clarity, length, risky claims, unanswered prompts).
- Integrated AI actions into the form: "✨" improve bullet in `ExperienceSection`, "✨ Draft from Vault" in `SummarySection`, and `AIToolbar` for Coach mode and AI settings.
- Built `AIReviewModal` showing before-and-after diffs with Guard pass/fail details and accept/reject confirmation buttons.
- Added 23 new unit tests in `src/tests/ai.test.ts` (76 total passing tests across 9 test suites). Verified with Next.js production build.

### 3. Decisions (keep each to one line, with the reason)
| Decision | Reason |
|---|---|
| Claude API server-only via Next.js route handlers | Guarantees API key is never exposed to client browsers per AGENTS.md rule 5 |
| Dual-layer honesty check (prompt + post-guard) | System prompt instructs honesty; guard inspects and blocks any hallucinated tokens |
| Vault number verification reuse | Links Honesty Guard directly to Evidence Vault facts for zero-hallucination metric validation |
| Ghostwriting refusal with constructive alternative | Fulfills AGENTS.md rule 8; directs users to authentic reflection, outlines, and review |
| In-memory sliding window rate limiter | Protects Claude API quota from loops and abuse without external Redis dependencies |
| Non-destructive AI review modal | User must explicitly review and accept before form fields update; never overwrites silently |

### 4. Environment
- Node version: v22.19.0
- Package manager: npm (10.8.2)
- Scripts: `npm run dev`, `npm run test`, `npm run build`, `npm run lint`
- Environment variable NAMES used (no values): `ANTHROPIC_API_KEY`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `FLUTTERWAVE_PUBLIC_KEY`, `FLUTTERWAVE_SECRET_KEY`, `FLUTTERWAVE_ENCRYPTION_KEY`, `FLUTTERWAVE_WEBHOOK_SECRET_HASH`
- Hosting target: TBD (Phase 9)

### 5. Key files (only the important ones)
```
src/lib/ai/guard.ts                  # Honesty Guard inspecting numbers, tools, dates, employers, clichés
src/lib/ai/claude.ts                 # Server Claude engine, system prompts, ghostwriting refusal logic
src/lib/ai/rate-limiter.ts           # Sliding-window rate limiter for AI routes
src/app/api/ai/action/route.ts       # Server endpoint for improve-bullet, draft-summary, etc.
src/app/api/ai/coach/route.ts        # Server endpoint for coach interview, outline, and review
src/components/cv-ai/ai-context.tsx  # React context for AI actions, review dialog, and settings
src/components/cv-coach/coach-modal.tsx # 3-tab Coach mode interface with policy banner
src/tests/ai.test.ts                 # 23 tests verifying Honesty Guard, refusal guard, and rate limiter
```

### 6. Conventions in use
- Follows AGENTS.md
- Strict TypeScript (`noImplicitAny`, strict null checks)
- Dates stored as `YYYY-MM` strings
- Components stay small; logic lives in `src/lib`
- Unfinished placeholders block export completely on client and server
- Unverified numbers are flagged unless confirmed in Evidence Vault
- AI output is validated by Honesty Guard before reaching the user; never invents facts

### 7. Known issues and TODO
- None from Phase 6.

### 8. Next task (be exact)
Phase 7: Job tailoring, gap report and fit check (U3). Paste a job posting, extract required/preferred skills, tools, and experience; map to user data as strong/partial/gap; produce tailored CV draft with line-by-line acceptance, fit check, cover letter helper, and salary range helper.

### 9. Last session summary
- Implemented Phase 6: Honest AI and Coach mode.
- Built Claude API routes, Honesty Guard, rate limiter, Coach modal, AI review modal, and form integrations.
- Added 23 tests in `src/tests/ai.test.ts` (76 total passing tests across 9 test suites).
- Built and verified Next.js production build (`npm run build`).

### 10. Scorecard notes for this track
- Time spent this phase: ~0.75 hours
- Number of fix prompts needed: 0
- Manual steps I had to do myself: 0
- Surprises: None.
