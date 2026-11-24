# HANDOFF.md: Project state for switching chats

This file is the memory of the project. Any new chat (or agent) reads it and continues exactly where the last one stopped. Keep it short, under about 150 lines, so it costs little context.

---

### 1. Snapshot
- Project: CV Builder (see MASTER-PLAN.md)
- Track: antigravity
- Date of last update: 2026-11-24
- Current phase: 8b
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
- [x] Phase 8b: Payments (Flutterwave, watermarks, webhook verification, idempotency, receipts)
- [ ] Phase 9: Bilingual, scholarship mode, launch

Notes on what is done inside the current phase:
- Integrated Flutterwave in test mode supporting cards and Mobile Money (Cameroon MTN/Orange, international).
- Checkout sessions are initiated strictly on the server (`/api/payments/checkout`) with rate limiting and payload validation.
- Implemented dual-layer payment verification: `verif-hash` signature check on webhooks and independent server-side lookup via Flutterwave verification API.
- Implemented idempotent fulfillment in `fulfillTransaction` to prevent double-crediting on retried or replayed webhooks.
- Free exports enforce a visible watermark: DOCX export (`/api/export/docx`) adds header/footer banners; Print route (`/print`) renders overlay watermark unless a verified paid pass exists.
- Supports both consumable single-export credits and lifetime passes with upfront price transparency (USD, XAF, EUR, GBP) and zero recurring subscriptions.
- Official digital receipts issued and viewable via `ReceiptsModal`.
- Added 12 unit tests in `src/tests/payments.test.ts` covering forged webhooks, replay idempotency, watermark enforcement, and zero CV logging. All 129 tests passing across 12 test suites.

### 3. Decisions (keep each to one line, with the reason)
| Decision | Reason |
|---|---|
| Server-initiated checkout | Guarantees price, currency, and plan cannot be manipulated on the client |
| Dual webhook verification | Signature check plus live Flutterwave API lookup prevents forged webhook attacks |
| Idempotent fulfillment | Checking transaction status and timestamp prevents replayed webhooks from granting duplicate passes |
| Server-enforced watermarks | Enforcing watermarks in `/api/export/docx` and `/print` prevents client-side bypass of payment requirements |
| One-time passes, no auto-renewal | Honest monetization model without unexpected trial conversions or hidden recurring charges |
| Supabase for backend storage | PostgreSQL Row Level Security (RLS) guarantees database-engine level isolation of user CV data |
| Free builder without login | Users can create, edit, validate, and export locally; saving multiple cloud versions is the account benefit |
| 404 for unauthorized CV access | Returning 404 instead of 403 prevents User B from detecting the existence of User A's CV IDs |
| Cascading delete for account removal | `ON DELETE CASCADE` guarantees complete removal of all CV versions and vault facts when account is deleted |
| Untrusted job posting sanitization | Directives inside job posting text are stripped so injected commands cannot alter match scores |
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
src/lib/payments/types.ts            # Payment models: plans, currencies, transactions, receipts, entitlements
src/lib/payments/pricing.ts          # Transparent pricing table across USD, XAF, EUR, GBP
src/lib/payments/flutterwave.ts      # Server-side checkout creation, webhook signature, and transaction verification
src/lib/payments/store.ts            # Entitlements and idempotent fulfillment store
src/lib/payments/rate-limiter.ts     # Rate limiter and payload size validation
src/app/api/payments/checkout/       # Server checkout initiation endpoint
src/app/api/payments/webhook/        # Webhook handler with signature verification and idempotent processing
src/app/api/payments/entitlement/    # Server entitlement query endpoint
src/app/api/payments/receipts/       # User receipts query endpoint
src/components/payments/             # PricingModal and ReceiptsModal UI
src/lib/export/docx.ts               # DOCX export with server-injected watermark support
src/app/print/page.tsx               # Print view with server-verified clean badge or watermark overlay
src/tests/payments.test.ts           # 12 unit tests for payments, webhooks, idempotency, and watermarks
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
- Payment status verified only on the server; browser state is never trusted for entitlement
- Zero CV content in server logs or payment payloads

### 7. Known issues and TODO
- None from Phase 8b.

### 8. Next task (be exact)
Phase 9: Bilingual (EN/FR), scholarship mode, mobile polish, and launch checklist. Add full French localization, scholarship-specific CV format/guidance, final 360px mobile audit, and deployment preparation.

### 9. Last session summary
- Implemented Phase 8b: Payments, watermarks, webhook verification, and receipts.
- Server-side checkout initiation with Flutterwave test mode (cards and mobile money).
- Secure webhook processing with constant-time signature verification (`verif-hash`) and Flutterwave API verification.
- Idempotency guarantees preventing duplicate fulfillment on retried webhooks.
- Watermark enforcement on DOCX export (`/api/export/docx`) and Print view (`/print`) for unpaid exports.
- Transparent upfront pricing (single export and lifetime pass) across USD, XAF, EUR, GBP with zero auto-renewal.
- Official receipt generation and viewing modal.
- Added 12 unit tests in `src/tests/payments.test.ts` (129 total tests passing across 12 test suites) and verified Next.js production build.

### 10. Scorecard notes for this track
- Time spent this phase: ~0.85 hours
- Number of fix prompts needed: 0
- Manual steps I had to do myself: 0
