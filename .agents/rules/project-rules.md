# AGENTS.md: Standing rules for any AI agent working on this project

Read this file, `HANDOFF.md` and the current phase in `MASTER-PLAN.md` before doing anything.

For Antigravity: also copy this file to `.agents/rules/project-rules.md` (some guides use `.agent/rules/`). Sources disagree on whether AGENTS.md is loaded automatically, so also start each prompt with "Read AGENTS.md first."

---

## 1. Project in one paragraph

A paid web app where people build a CV in the format their target country or purpose needs (US, UK, German style, Europass-style, academic, technical, combination, one-page). One structured profile feeds every format. The app checks for CV mistakes, offers AI help that never invents facts, and exports PDF and Word. The owner is a student developer who wants to understand each step, so explain what you do.

## 2. Stack

Next.js (App Router), TypeScript (strict), Tailwind CSS, Zod, React Hook Form, `docx`, Vitest. AI calls go to the Claude API from server routes only. Decisions about database, auth, PDF method and payment provider are recorded in `HANDOFF.md`.

## 3. How to work

1. **Plan first.** Show a short plan and wait for approval before changing files.
2. **One task at a time.** Do not start the next phase early.
3. **Explain simply.** After each change, say what it does and why in plain words. The owner is learning.
4. **Small changes.** Prefer editing the part that changes over rewriting whole files. When showing code in a chat, show the full path of each file.
5. **Update `HANDOFF.md`** at the end of each task: status, decisions, file tree changes, known issues, next task.
6. **Ask before assuming** when a requirement is unclear.
7. **Say when something is uncertain** (library behavior, regional CV conventions, payment rules) and tell the owner how to verify it.

## 4. Code standards

- TypeScript strict mode. No `any` unless commented with a reason.
- Validate all external input with Zod (forms, API routes, webhooks, imported JSON).
- Keep components small. Logic lives in `src/lib`, not inside components.
- Dates are stored as `YYYY-MM` strings and formatted only at display time.
- Name files in kebab-case. Name components in PascalCase.
- Write tests for logic: validation checks, evidence vault, AI guard, region profiles, export content.
- Accessibility: labels on inputs, keyboard use, readable contrast.
- Mobile first. Every page must work at 360px width.

## 5. Security and privacy

- Never commit secrets. Keep keys in `.env.local`, list names only in `.env.example`.
- AI and payment keys are used on the server only. Never expose them to the browser.
- Verify payments on the server with webhook signature checking. Never trust the browser for payment status.
- Do not log CV content or AI inputs. Do not send CV content to analytics.
- Collect only the data a CV needs. Never store government ID numbers or card details.
- Provide a way to delete all of a user's data.
- Sample and test data must be fictional and clearly marked as sample.

## 6. Product rules (non-negotiable)

These rules apply to every AI feature and every template.

1. **Never invent facts.** No made-up numbers, dates, employers, tools, titles, certifications or results.
2. **Ask before assuming.** If information is missing, ask the user. If they cannot answer, use cautious wording and mark the line for them to check.
3. **Placeholders block export.** Text like `[add number]` must be resolved or removed before export.
4. **Evidence first.** Numbers in a CV should come from the Evidence Vault. Flag numbers that are not in it.
5. **Show gaps honestly.** In job tailoring, tell the user plainly what a posting asks for that they lack.
6. **Plain wording.** Avoid filler words such as "passionate", "robust", "proven track record", "dynamic", "cutting-edge" and "seamless". The banned-words list is user-editable.
7. **Em dash setting.** Provide a style option to avoid em dashes, and make it a first-class setting.
8. **Coach mode never ghostwrites.** For application questions, the AI interviews, organizes the user's own words and reviews drafts. It declines to write the final answer and explains why. Show a reminder to check each employer's AI rules.
9. **Consistency.** Facts stated in several sections must match.
10. **Honest conventions.** Regional CV rules vary by employer. Present them as toggles with a short "why", not as fixed laws.
11. **Original design.** Do not copy competitors' templates, text or branding.

## 7. Things never to do

- Never replace the user's data with generated data without confirmation.
- Never silently change a number, date or title.
- Never print or log API keys.
- Never skip tests for the AI guard and the validation checks.
- Never mark a phase done until its "done when" checklist in `MASTER-PLAN.md` passes.

## 8. Commit habits

- Small commits with clear messages (for example `phase-3: add docx export`).
- Tag the end of each phase `phase-N-done`.
