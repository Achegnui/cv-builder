# CV Builder: Master Plan

One file with the whole build: product, unique features, stack, and ten phases (0 to 9). Each phase has a goal, an explanation of what happens, a prompt to paste, and a "done when" checklist.

Two tracks build the same product in parallel:
- **Track A: Antigravity** (agent edits files and runs the app in your folder)
- **Track B: Claude** (chat on the free tier, you copy files into your own folder)

Use the same prompts and the same checklists for both so the comparison in `SCORECARD.md` is fair. Background knowledge and lessons from a real CV rework are in `cv-builder-project-brief.md`.

---

## 1. Product summary

A paid web app where people build a CV in the format their target country or purpose needs. They enter their information once. The app adapts the format, checks for mistakes, and offers AI help that never invents facts. They export PDF and Word files.

Who it is for: students and graduates, career changers, remote job seekers applying across countries, and people applying for Masters programs, scholarships and grants.

---

## 2. Unique features (what makes it different)

| ID | Feature | Built in phase |
|---|---|---|
| U1 | **Honest AI with an Evidence Vault.** Every number, tool and result is stored once as a fact the user entered. AI text may only use those facts. Any number not in the vault is flagged. | 5, 6 |
| U2 | **Region switch.** One profile adapts to US, UK, German, Europass-style, academic, technical and combination CVs, with warnings (photo, date of birth, length, paper size). | 4 |
| U3 | **Gap report and fit check.** Paste a job posting, see strong matches, partial matches and gaps in plain language, plus honest next steps. | 7 |
| U4 | **Coach mode.** For application questions, the AI interviews the user, organizes their own notes and reviews drafts. It does not write the final answer. Useful when employers ask for human-written answers. | 6 |
| U5 | **Fair pricing.** Free to build and preview. Paid one-time pass or per-export price. No auto-renewing trial. Mobile money and local currency options. | 8 |
| U6 | **English and French** interface and CV conventions. | 9 |
| U7 | **Academic and scholarship mode.** Publications, grants, teaching, plus coaching for statements and motivation answers. | 4, 9 |
| U8 | **Mobile-first and light pages.** Works well on a phone and slow connections. (Assumption to confirm with real users.) | 9, all |
| U9 | **CV Doctor.** Finds duplicate entries, impossible dates, repeated content, mislabeled fields (for example GPA versus degree classification), mixed bullet styles and conflicting claims. | 5 |
| U10 | **Always-safe export.** Every template can export an ATS-safe single-column version and a black-only version. | 2, 3 |

---

## 3. Stack

- Next.js (App Router), TypeScript (strict), Tailwind CSS
- Zod for data validation, React Hook Form for forms
- `docx` library for Word export
- PDF: Playwright or Puppeteer on a server route, with browser print as a fallback (decide in Phase 3 and record it in `HANDOFF.md`)
- AI: Claude API called from server routes only
- Auth and database: Supabase, Appwrite or Firebase (choose in Phase 8)
- Payments: Flutterwave (mobile money and cards in Cameroon) or a local gateway such as PayUnit or Campay. Compare fees in Phase 8.
- Tests: Vitest for logic, Playwright for key flows

---

## 4. Project structure (target)

```
cv-builder/
  AGENTS.md
  HANDOFF.md
  MASTER-PLAN.md
  SCORECARD.md
  .agents/rules/project-rules.md      (copy of AGENTS.md, for Antigravity)
  src/
    app/                               pages and API routes
    components/
    lib/
      schema/                          Zod schemas and types
      templates/                       template registry and renderers
      regions/                         region profiles and warnings
      validation/                      CV Doctor checks
      vault/                           evidence vault logic
      ai/                              prompts, guardrails, coach mode
      export/                          pdf and docx
      i18n/
    tests/
  public/
```

---

## 5. How to use the prompts

**Track A (Antigravity).** Open the project folder. Use Planning mode for each phase. Start every prompt with:
> Read AGENTS.md, HANDOFF.md and the Phase N section of MASTER-PLAN.md. Show me a plan first and wait for my approval. After you finish, update HANDOFF.md.

**Track B (Claude chat).** Start a new chat for each phase. Attach `AGENTS.md`, `HANDOFF.md` and `MASTER-PLAN.md`. Start every prompt with:
> I attached AGENTS.md, HANDOFF.md and MASTER-PLAN.md. We are on Phase N. Give me files one at a time, each with its full path, and explain what each file does. Stop after each file and wait until I say "next". At the end, give me the full updated HANDOFF.md.

Each phase below has a **Core prompt**. Add the Track A or Track B opening line before it.

After every phase: run the "done when" checks, commit, tag the commit `phase-N-done`, update `HANDOFF.md`, and fill `SCORECARD.md`.

---

## Phase 0: Setup

**Goal:** a running empty project with the planning files in place.

**What happens:** you install Node.js (LTS) and VS Code, create the Next.js app, add the planning files and make the first commit. Both tracks start from the same commit so the comparison is fair.

**Manual steps (both tracks):**
1. Install Node.js LTS and Git. Check with `node -v` and `git --version`.
2. Create a folder `cv-builder-kit` and put these files in it: `MASTER-PLAN.md`, `AGENTS.md`, `HANDOFF.md`, `SCORECARD.md`, `cv-builder-project-brief.md`.
3. Make two copies: `cv-builder-antigravity` and `cv-builder-claude`.

**Core prompt:**
> Create a Next.js app in this folder with TypeScript, Tailwind CSS, ESLint and the App Router. Add Zod and React Hook Form. Set up Vitest. Create the folder structure from section 4 of MASTER-PLAN.md with empty placeholder files where useful. Explain every command and every option you choose, in simple terms. Add a home page that says "CV Builder" and a `.env.example` file listing the variable names we will need later (no values).

**Done when:**
- [ ] `npm run dev` shows the home page
- [ ] `npm run test` runs (even with one sample test)
- [ ] Planning files are in the project root
- [ ] Git repo exists with a first commit and tag `phase-0-done`

---

## Phase 1: Data model and form

**Goal:** the user can enter a full CV and it is saved in the browser.

**What happens:** we define the CV as structured data (see section 3 of the brief). A form edits each section. Data is stored in the browser so refreshing does not lose it. Sample data is fictional.

**Core prompt:**
> Implement the CV data model from section 3 of cv-builder-project-brief.md as Zod schemas and TypeScript types in `src/lib/schema`. Dates are `YYYY-MM`. Keep degree classification and GPA as separate fields. Build a multi-section form (profile, summary, experience, education, skills groups, projects, certifications, awards, languages, plus academic sections: publications, grants, teaching, conferences). Entries can be added, removed and reordered. Save to browser storage and reload on page open. Add JSON import and export as a backup, and a button that loads fictional sample data. Add validation messages next to fields. Explain how the form state and the schema connect.

**Done when:**
- [ ] All sections can be filled, saved, and survive a refresh
- [ ] Invalid dates and empty required fields show clear messages
- [ ] JSON export then import restores the same data
- [ ] Sample data loads and is clearly fictional

---

## Phase 2: Template engine and live preview

**Goal:** a live preview of the CV in a clean ATS-safe template with theme options.

**What happens:** a template registry takes the CV data and a "style config" and renders a page. The first template is single column. The preview updates as you type.

**Core prompt:**
> Build a template registry in `src/lib/templates`. Create the first template: single column, standard headings (Summary, Skills, Experience, Education, Projects, Certifications, Languages), right-aligned dates, consistent bullets. Add style options: paper size (A4 or US Letter), accent color or black-only, font choice from three safe fonts, and compact or normal spacing. Build a live preview page next to the form. Add print CSS so the browser print output matches the preview. Keep it usable at 360px width (preview scrolls inside its own container). Explain how the registry keeps data and design separate.

**Done when:**
- [ ] Preview updates while typing
- [ ] Black-only theme makes every text and line black
- [ ] A4 and Letter both work and the page break is sensible
- [ ] No tables or text boxes are used for layout

---

## Phase 3: Export to PDF and Word

**Goal:** download PDF and Word files that match each other.

**What happens:** the same data and style config produce both files. Word uses the `docx` library with tab stops for right-aligned dates. PDF is generated server-side from the HTML template, or via print if server rendering is not possible yet. Record the choice and the reason in `HANDOFF.md`.

**Core prompt:**
> Add export routes. PDF: render the template to PDF with real selectable text. Word: build a `.docx` with the `docx` library from the same data and style config, using right-aligned tab stops for dates, consistent bullet numbering and the chosen paper size. Add Export buttons. Explain the trade-offs between server-side PDF and browser print for hosting costs and reliability, then implement the option that works on a free or low-cost host, with the other as fallback. Write tests that check the Word file contains the expected text.

**Done when:**
- [ ] PDF text can be selected and copied
- [ ] Word file opens correctly in Word or LibreOffice
- [ ] PDF and Word look the same in structure and content
- [ ] Black-only and paper size options carry into both files

---

## Phase 4: Regions and CV types (U2, U7)

**Goal:** one profile, many CV formats, each with the right conventions and warnings.

**What happens:** each "region profile" defines paper size, length guidance, whether a photo or date of birth is expected, section order and section names. Switching profile re-renders the same data and shows a warnings panel. Conventions differ between sources, so photo, date of birth and length are toggles with a short "why" note.

**Profiles to build:** US, UK, German style (Lebenslauf), Europass-style, academic, technical, combination (skills first), one-page.

**Core prompt:**
> Build region profiles in `src/lib/regions`. Each profile sets: paper size, recommended page count, photo (not used, optional, commonly expected), personal details allowed (date of birth, nationality), section order, section labels, and date format. Implement these profiles: US, UK, German style, Europass-style, academic (publications, grants, teaching, conferences, no page limit), technical (skills grouped, projects with stack and links), combination (skills first), and one-page (strict trimming with a warning when content overflows). Add a profile switcher that re-renders the preview, and a warnings panel (for example "UK CV: photo is usually left out"). Make photo, date of birth and length user toggles, and show a short "why" note per warning. Say clearly in the UI that conventions vary by employer. Explain how profiles reuse templates.

**Done when:**
- [ ] Switching profile changes order, labels, paper size and available fields
- [ ] Warnings appear and can be dismissed
- [ ] Academic profile shows the academic sections and is not forced to two pages
- [ ] The same data is used for every profile

---

## Phase 5: CV Doctor and Evidence Vault (U1, U9)

**Goal:** catch the kinds of mistakes found in real CVs, and track which facts are verified.

**What happens:** a set of validation checks runs on the CV and lists problems with plain explanations. The Evidence Vault is a list of facts (numbers, tools, results, dates) the user entered with an optional note. Bullets can reference facts. Numbers not found in the vault are flagged as unverified.

**Checks to implement:**
1. Dates are valid, in order, and checked against today's real date. Entries marked "expected" (for example expected graduation) are allowed in the future.
2. Duplicate or near-duplicate entries (same organisation and similar text). Ask whether it is one role with two periods (merge) or a mistake.
3. Repeated content (a paragraph followed by bullets that say the same thing).
4. Conflicting claims (the same achievement described two ways, such as "3rd place" versus "regional finalist").
5. Label errors (GPA field filled with a classification).
6. Mixed bullet styles and inconsistent date formats.
7. Unfinished placeholders such as `[add number]`, which block export.
8. Numbers in text that are missing from the vault.

**Core prompt:**
> Implement a CV Doctor in `src/lib/validation` with the eight checks listed in section Phase 5 of MASTER-PLAN.md. Each check returns severity, location, a plain-language explanation and a suggested fix. Show results in a panel that links to the field. Implement an Evidence Vault in `src/lib/vault`: facts with a label, value, unit, optional note and a verified flag set only by the user. Let bullets reference facts, and flag any number in bullet text that is not in the vault. Block export while placeholders remain. Write unit tests using a deliberately broken sample CV that contains a duplicate entry, a future end date for a finished job, a GPA mislabel and conflicting competition results. Explain how the checks are structured so new ones are easy to add.

**Done when:**
- [ ] The broken sample CV triggers every check
- [ ] A clean sample CV triggers none
- [ ] Unverified numbers are flagged
- [ ] Export is blocked while placeholders remain

---

## Phase 6: Honest AI and Coach mode (U1, U4)

**Goal:** AI actions that improve wording without inventing anything, and a coaching mode that never ghostwrites.

**What happens:** server routes call the Claude API. Prompts follow the honesty rules in section 7 of the brief. A post-check rejects any AI output that adds numbers, tools, employers or dates that were not in the input. Coach mode asks questions one at a time and only reorganizes the user's own words.

**Actions:** improve a bullet, draft a summary from vault facts, group skills, explain a CV Doctor warning, suggest questions for missing information.

**Core prompt:**
> Add server-only API routes that call the Claude API (key in `.env.local`, never sent to the browser). Implement these actions with strict JSON output: improve bullet, draft summary, group skills, explain warning, suggest missing-information questions. Prompts must follow section 7 of cv-builder-project-brief.md: no invented facts, ask before assuming, flag placeholders, plain wording, user-selectable banned words list, and an option to avoid em dashes. After each AI response, run a guard that rejects output containing numbers, tools, employers or dates not present in the input, and shows the user why. Then build Coach mode for application questions: the AI asks one question at a time about the user's real experience, produces an outline made only of the user's own phrases, and reviews the user's draft for clarity, length, risky claims and unanswered parts. It must refuse to write the final answer and say so. Show a banner telling users to check each employer's rules about AI. Add rate limiting and basic abuse protection. Write tests for the guard and for the refusal behavior. Explain the flow of one AI request from button click to result.

**Done when:**
- [ ] Output with an invented number is rejected in tests
- [ ] Coach mode refuses "write my answer" and offers questions and review instead
- [ ] API key is not present in any client bundle
- [ ] Errors from the API show friendly messages and do not lose user data

---

## Phase 7: Job tailoring, gap report and fit check (U3)

**Goal:** paste a job posting and get an honest match report and a tailored CV draft.

**What happens:** the AI extracts requirements from the posting. The app maps each requirement to evidence in the user's data and labels it strong, partial or gap. The tailored version reorders and reframes existing content. It never adds claims.

**Core prompt:**
> Build a Job Tailoring feature. Input: pasted job posting text. Step 1: extract required skills, preferred skills, years of experience, tools, location and time-zone requirements as structured JSON. Step 2: map each requirement to the user's experience, projects and vault facts and label it strong match, partial match or gap, showing the evidence used. Step 3: produce a tailored CV view that reorders sections and bullets and proposes reworded bullets using only existing facts, shown as a before and after comparison that the user accepts or rejects line by line. Step 4: show a plain-language fit check with reasons and honest next steps (a short course, a different kind of role). Keywords from the posting are only suggested where the user's experience supports them. Add an optional cover letter structure helper (opening tied to the company's mission, a direct statement of gaps, concrete evidence, evidence of fast learning, short close) that follows the same guard as Phase 6, and an optional salary helper that asks for country, level and currency and shows sourced ranges with the unit stated (monthly or yearly), clearly labeled as information and not financial advice. Explain how requirement matching works.

**Done when:**
- [ ] A sample posting produces a report with strong, partial and gap items and evidence
- [ ] Tailored output adds no fact that is not in the data
- [ ] The user can accept or reject each change
- [ ] Gaps are shown plainly, not hidden

---

## Phase 8: Accounts, storage, payments and privacy (U5)

**Goal:** users can save CVs, pay once, and delete their data.

**What happens:** add login and a database. Free users can build, preview and use CV Doctor. Exports are watermarked until a paid pass is bought. Payment is verified on the server. Privacy is built in.

**Pricing rules (decide numbers yourself after checking costs):** one-time pass or per-export price. No auto-renewing trial. Show the full price before checkout. Offer mobile money and cards. Show local currency where possible.

**Core prompt:**
> Add authentication and a database (propose Supabase, Appwrite and Firebase with pros and cons for this app, then implement the one I choose). Users can save multiple CV versions and delete all their data. Free exports carry a watermark. Add a paid pass and an optional per-export purchase using Flutterwave (test mode first, mobile money and card), with the checkout created on the server and the payment verified by a webhook with signature checking before unlocking export. Never trust the browser for payment status. Add receipts, a clear price display, and no auto-renewal. Privacy: do not log CV content or AI inputs, do not use user data to train models, add a delete-my-data button that removes everything, add a privacy page in plain language, and add a consent notice for EU visitors. Store only data the CV needs, and never store ID numbers or card details. Explain the payment flow step by step.

**Done when:**
- [ ] Test-mode payment unlocks watermark-free export
- [ ] A fake or replayed webhook does not unlock anything
- [ ] "Delete my data" removes the user's CVs and account
- [ ] No CV text appears in server logs

---

## Phase 9: Bilingual, scholarship mode, mobile polish and launch (U6, U7, U8)

**Goal:** English and French, scholarship mode, a fast mobile experience, and a deployed beta.

**Core prompt:**
> Add an English and French interface using a simple i18n setup, including French CV section labels and date formats. Add French CV profile notes in the region warnings. Add scholarship mode: CV profile for Masters and grant applications plus Coach mode support for statements of purpose and motivation answers (outline and review only, no ghostwriting). Make every page work at 360px width, reduce JavaScript and image weight, and check accessibility (keyboard use, labels, contrast). Build a landing page that explains the honesty promise and the pricing in plain words. Add privacy-respecting analytics that never record CV content. Prepare deployment (propose a host with a free or low-cost tier, add environment variable instructions) and a launch checklist. Explain what each optimization does.

**Done when:**
- [ ] Full flow works in French and English
- [ ] Landing page scores above 90 for performance and accessibility in Lighthouse
- [ ] A new user can finish a CV and export on a phone
- [ ] Deployed beta is reachable and the launch checklist is complete

---

## 6. After the build

- Run a small beta with students. Ask: what confused you, what did you pay for, what did you not trust.
- Check regional conventions with people who hire in those regions before presenting them as rules.
- Review the legal side of payments, data protection and your terms of service before charging.

---

## 7. Decisions log

Keep important decisions in `HANDOFF.md`, not here. This file should stay stable so both tracks read the same plan.
