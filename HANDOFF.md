# HANDOFF.md: Project state for switching chats

This file is the memory of the project. Any new chat (or agent) reads it and continues exactly where the last one stopped. Keep it short, under about 150 lines, so it costs little context.

**Rule:** at the end of every task, and before leaving a chat, ask the AI to output an updated version of this file. Paste it over the old one in your project folder.

Keep one copy per track: one in `cv-builder-antigravity/` and one in `cv-builder-claude/`.

---

## When to switch to a new chat

Switch at a natural break (finished a file or task), not in the middle of one. Signs that the chat is getting too full:
- The chat is very long and replies are slower or get cut off
- The AI forgets earlier decisions or repeats a mistake you already fixed
- It starts rewriting files you did not ask about
- You hit the daily limit on the free tier
- You finished a phase (always start a fresh chat for the next phase)

**Switching procedure (about two minutes):**
1. In the old chat, paste the **Update prompt** below.
2. Save the returned file as `HANDOFF.md` in your project folder (replace the old one).
3. Open a new chat. Attach `AGENTS.md`, `HANDOFF.md`, `MASTER-PLAN.md`.
4. Paste the **Resume prompt** below.
5. Check the AI's 5-line summary. If it is wrong, correct it before any coding.

### Update prompt (paste in the old chat)
> Stop coding. Output a complete, updated HANDOFF.md using the template structure. Include what we finished, decisions with reasons, the current file tree (key files only), known issues, and the exact next task. Do not include secrets or long code. Keep it under 150 lines.

### Resume prompt (paste in the new chat)
> I attached AGENTS.md, HANDOFF.md and MASTER-PLAN.md. Read them. Before writing any code, summarize in 5 lines: the project, the current phase, what is done, the decisions that matter, and the next task. Wait for my confirmation, then continue with the next task. Give files one at a time with full paths, and explain simply.

### Saving tokens on the free tier
- Ask for one file or one change per message.
- Ask for "only the changed parts with a few lines of context" when editing existing files.
- Paste only the relevant file or error message, not the whole project.
- Do not paste long logs. Paste the first error and the lines around it.

---

## TEMPLATE (copy from here, fill in, keep updated)

### 1. Snapshot
- Project: CV Builder (see MASTER-PLAN.md)
- Track: [antigravity | claude]
- Date of last update: [YYYY-MM-DD]
- Current phase: [0 to 9]
- Phase status: [not started | in progress | blocked | done]

### 2. Completed
- [ ] Phase 0: Setup
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
- [short list]

### 3. Decisions (keep each to one line, with the reason)
| Decision | Reason |
|---|---|
| PDF method: [server render | browser print] | [reason] |
| Database/auth: [Supabase | Appwrite | Firebase] | [reason] |
| Payments: [Flutterwave | PayUnit | Campay | other] | [reason] |
| Fonts and theme defaults | [reason] |
| Anything else that would be painful to rediscover | [reason] |

### 4. Environment
- Node version: [x]
- Package manager: [npm | pnpm]
- Scripts: `npm run dev`, `npm run test`, `npm run build`
- Environment variable NAMES used (no values): [list]
- Hosting target: [x]

### 5. Key files (only the important ones)
```
src/lib/schema/...
src/lib/templates/...
src/lib/regions/...
(update as the project grows)
```

### 6. Conventions in use
- Follows AGENTS.md
- Extra project-specific conventions: [short list]

### 7. Known issues and TODO
- [ ] [issue, where, what was tried]
- [ ] [TODO]

### 8. Next task (be exact)
[One clear task. Example: "Phase 3: write the docx export route in src/app/api/export/docx/route.ts using the style config, then test that the file contains the summary text."]

### 9. Last session summary
- [3 to 5 lines: what changed, what broke, what was learned]

### 10. Scorecard notes for this track
- Time spent this phase: [x hours]
- Number of fix prompts needed: [x]
- Manual steps I had to do myself: [x]
- Surprises: [short]
