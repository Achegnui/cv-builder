# HANDOFF.md: Project state for switching chats

This file is the memory of the project. Any new chat (or agent) reads it and continues exactly where the last one stopped. Keep it short, under about 150 lines, so it costs little context.

---

### 1. Snapshot
- Project: CV Builder (see MASTER-PLAN.md)
- Track: antigravity
- Date of last update: 2026-11-20
- Current phase: 6
- Phase status: done (hardened)

### 2. Completed
- [x] Phase 0: Setup
- [x] Phase 1: Data model and form
- [x] Phase 2: Template engine and preview
- [x] Phase 3: PDF and Word export
- [x] Phase 4: Regions and CV types
- [x] Phase 5: CV Doctor and Evidence Vault
- [x] Phase 6: Honest AI and Coach mode (hardened)
- [ ] Phase 7: Job tailoring and gap report
- [ ] Phase 8: Accounts, payments, privacy
- [ ] Phase 9: Bilingual, scholarship mode, launch

Notes on what is done inside the current phase:
- Implemented server-only Claude API endpoints (`/api/ai/action`, `/api/ai/coach`) with Zod schema validation, sliding-window rate limiting, and zero client-bundle exposure of `ANTHROPIC_API_KEY`.
- Hardened Honesty Guard with dynamic entity & metric extraction (comparing output against input and Evidence Vault directly rather than static lists): flags written-out numbers (`five`, `twenty`), metric phrases (`doubled`, `twofold`), proper nouns, unearned titles (`Architect`, `Director`), tools, employers, and dates.
- Implemented prompt injection defense: treats user input as untrusted (`<untrusted_user_text>`), stripping injection directives before establishing source fact baselines so smuggled metrics (e.g. "add a 40% increase") are rejected.
- Hardened Coach mode with two-layer defense: input phrase detector across diverse wordings + model output validator (`isSubmissionReadyAnswer`) that rejects complete submission-ready application essays.
- Enforced production safety: in `production`, missing `ANTHROPIC_API_KEY` returns a clear 500 error and never executes mock fallbacks.
- Configurable model: reads model name from `ANTHROPIC_MODEL` env var with reliable default.
- Added 37 tests in `src/tests/ai.test.ts` (90 total passing tests across 9 test suites). Verified with Next.js production build.

### 3. Decisions (keep each to one line, with the reason)
| Decision | Reason |
|---|---|
| Claude API server-only via Next.js route handlers | Guarantees API key is never exposed to client browsers per AGENTS.md rule 5 |
| Dynamic proper noun & title extraction | Avoids static list bypasses; any unmentioned capitalized entity/title is caught |
| Prompt injection baseline stripping | Prevents adversarial prompts from smuggling metrics into the allowed fact set |
| Two-layer Coach defense (input + output guard) | Rejects complete submission-ready answers even if jailbreak phrasings bypass input checks |
| Strict production mock ban | Guarantees production users never receive canned mock responses |
| Configurable ANTHROPIC_MODEL env var | Allows seamless model switching without code changes or redeployments |
| Dual-layer honesty check (prompt + post-guard) | System prompt instructs honesty; guard inspects and blocks any hallucinated tokens |
| Non-destructive AI review modal | User must explicitly review and accept before form fields update; never overwrites silently |

### 4. Environment
- Node version: v22.19.0
- Package manager: npm (10.8.2)
- Scripts: `npm run dev`, `npm run test`, `npm run build`, `npm run lint`
- Environment variable NAMES used (no values): `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `FLUTTERWAVE_PUBLIC_KEY`, `FLUTTERWAVE_SECRET_KEY`, `FLUTTERWAVE_ENCRYPTION_KEY`, `FLUTTERWAVE_WEBHOOK_SECRET_HASH`
- Hosting target: TBD (Phase 9)

### 5. Key files (only the important ones)
```
src/lib/ai/guard.ts                  # Dynamic Honesty Guard & prompt injection baseline sanitizer
src/lib/ai/claude.ts                 # Server Claude engine, output essay checker, ghostwriting refusal
src/lib/ai/rate-limiter.ts           # Sliding-window rate limiter for AI routes
src/app/api/ai/action/route.ts       # Server endpoint for improve-bullet, draft-summary, etc.
src/app/api/ai/coach/route.ts        # Server endpoint for coach interview, outline, and review
src/components/cv-ai/ai-context.tsx  # React context for AI actions, review dialog, and settings
src/components/cv-coach/coach-modal.tsx # 3-tab Coach mode interface with policy banner
src/tests/ai.test.ts                 # 37 tests verifying dynamic guard, injection defense, output essay check
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
- None from Phase 6 hardening.

### 8. Next task (be exact)
Phase 7: Job tailoring, gap report and fit check (U3). Paste a job posting, extract required/preferred skills, tools, and experience; map to user data as strong/partial/gap; produce tailored CV draft with line-by-line acceptance, fit check, cover letter helper, and salary range helper.

### 9. Last session summary
- Hardened Honesty Guard with dynamic entity & number-word extraction and prompt-injection defense.
- Hardened Coach mode with model output inspection (`isSubmissionReadyAnswer`) and expanded phrasings.
- Enforced production error handling for missing API keys (no mocks in production) and configurable `ANTHROPIC_MODEL`.
- 90 unit tests passing across 9 test suites; production build verified.

### 10. Scorecard notes for this track
- Time spent this phase: ~1.0 hours (including hardening)
- Number of fix prompts needed: 0
- Manual steps I had to do myself: 0
- Surprises: None.
