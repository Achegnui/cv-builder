import type {
  AIActionRequest,
  AIActionResponse,
  CoachRequest,
  CoachResponse,
  HonestyGuardConfig,
} from "./types";
import { runHonestyGuard, DEFAULT_BANNED_WORDS } from "./guard";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const CLAUDE_MODEL = "claude-3-5-sonnet-20241022";

/**
 * System prompt ensuring strict honesty and zero hallucinations.
 */
function buildSystemPrompt(config: Partial<HonestyGuardConfig> = {}): string {
  const banned = (config.bannedWords || DEFAULT_BANNED_WORDS).join(", ");
  const emDashRule = config.avoidEmDashes
    ? "- NEVER use em dashes (—). Use standard hyphens (-) or commas."
    : "";

  return `You are the Honest AI assistant for an ATS-compliant professional CV builder.
CRITICAL HONESTY RULES:
1. NEVER INVENT FACTS. Do NOT invent numbers, percentages, tools, technologies, employers, certifications, dates, or results.
2. Every number and tool you output MUST already exist in the user's input or their verified Evidence Vault.
3. If information is missing, ask the user or leave an honest note rather than guessing.
4. Use plain, direct wording. NEVER use filler clichés or corporate buzzwords: ${banned}.
${emDashRule}
5. You must output clean, valid JSON as instructed without markdown fences or extraneous commentary.`;
}

/**
 * Detects if a user is asking Coach mode to write/ghostwrite their application answer.
 */
export function isGhostwritingRequest(text: string): boolean {
  // If the user is referring to their own existing draft for review, ignore "draft answer" noun phrases
  const sanitized = text.replace(
    /\b(?:my|this|the|a)\s+draft\s+(?:answer|response|essay|statement)\b/gi,
    ""
  );

  const ghostwritingPatterns = [
    /\b(?:write|draft|give|generate|create|compose)\s+(?:me\s+)?(?:an?|the|my)\s+(?:entire\s+)?(?:answer|essay|response|application|cover\s+letter|statement)\b/i,
    /\bwrite\s+(?:my|an?|the)?\s*answer\b/i,
    /\b(?:write\s+it\s+for\s+me|write\s+my\s+answer|do\s+it\s+for\s+me|write\s+for\s+me)\b/i,
    /\b(?:can\s+you\s+(?:just\s+)?write|please\s+write)\s+(?:it|my|an?|the)\b/i,
  ];

  return ghostwritingPatterns.some((pattern) => pattern.test(sanitized));
}

export const COACH_GHOSTWRITING_REFUSAL_MESSAGE =
  "I cannot write your application answer for you. Many employers specifically test for your authentic voice and prohibit AI ghostwriting. Instead, I can interview you about your real experience, organize your thoughts into an outline, or review your draft for clarity and unsupported claims.";

/**
 * Calls Anthropic Claude API from the server
 */
async function callClaudeAPI(systemPrompt: string, userPrompt: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY is not configured in .env.local. Please add your Anthropic API key to enable live AI assistance."
    );
  }

  const response = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    throw new Error(`Claude API request failed with status ${response.status}: ${errorBody}`);
  }

  const data = await response.json();
  const textContent = data.content?.[0]?.text;
  if (!textContent) {
    throw new Error("Received empty text content from Claude API.");
  }

  return textContent;
}

/**
 * Executes a core CV Doctor or text improvement AI action
 */
export async function executeAIAction(req: AIActionRequest): Promise<AIActionResponse> {
  const systemPrompt = buildSystemPrompt(req.config);

  let userPrompt = "";
  switch (req.action) {
    case "improve-bullet":
      userPrompt = `Improve this CV bullet to be active, concise, and impact-focused.
Source bullet: "${req.input}"
Rules:
- Keep all numbers and metrics EXACTLY as they appear in the source. Do NOT add or change any numbers.
- Do NOT add tools or technologies not mentioned in the source bullet.
Output JSON: { "improvedBullet": "..." }`;
      break;

    case "draft-summary":
      const vaultNotes = req.context?.vaultFacts?.map((f) => `${f.label}: ${f.value} ${f.unit || ""}`).join(", ") || "None";
      userPrompt = `Draft a concise 2-3 sentence professional summary based ONLY on these confirmed facts:
Confirmed facts: ${vaultNotes}
Current draft/notes: "${req.input}"
Role: ${req.context?.jobTitle || "Software Professional"}
Rules:
- Use ONLY facts and metrics provided above. Never invent additional achievements.
Output JSON: { "summary": "..." }`;
      break;

    case "group-skills":
      userPrompt = `Group these skills into logical categories (e.g. Languages, Frameworks, Tools):
Skills: "${req.input}"
Rules:
- Include ONLY the skills listed above. Do not invent new skills or technologies.
Output JSON: { "groups": [{ "category": "Category Name", "skills": ["skill1", "skill2"] }] }`;
      break;

    case "explain-warning":
      userPrompt = `Explain why the following CV issue or regional convention matters to hiring managers in plain, encouraging language:
Issue: "${req.input}"
Context: ${req.context?.warningMessage || ""}
Output JSON: { "explanation": "..." }`;
      break;

    case "suggest-questions":
      userPrompt = `Identify missing details in this bullet point and suggest 2-3 specific questions to help the user uncover their own real metrics and outcomes:
Bullet: "${req.input}"
Output JSON: { "questions": ["question 1", "question 2"] }`;
      break;
  }

  try {
    let rawResult = "";
    if (process.env.ANTHROPIC_API_KEY) {
      rawResult = await callClaudeAPI(systemPrompt, userPrompt);
    } else {
      // Mock generator for development without an active API key
      rawResult = generateMockAIResponse(req.action, req.input);
    }

    // Parse JSON
    let parsed: any;
    try {
      const cleanedJson = rawResult.replace(/```json/g, "").replace(/```/g, "").trim();
      parsed = JSON.parse(cleanedJson);
    } catch {
      parsed = { result: rawResult };
    }

    const outputText =
      parsed.improvedBullet ||
      parsed.summary ||
      (parsed.groups ? JSON.stringify(parsed.groups) : null) ||
      parsed.explanation ||
      (parsed.questions ? parsed.questions.join("\n") : null) ||
      parsed.result ||
      rawResult;

    // Run Honesty Guard on the generated output!
    const guardResult = runHonestyGuard(
      outputText,
      req.input,
      req.context?.vaultFacts || [],
      req.config
    );

    if (!guardResult.allowed) {
      return {
        success: false,
        action: req.action,
        originalInput: req.input,
        error: guardResult.reason,
        guardViolations: guardResult.violations,
      };
    }

    return {
      success: true,
      action: req.action,
      originalInput: req.input,
      suggestedOutput: guardResult.cleanOutput,
    };
  } catch (err: unknown) {
    return {
      success: false,
      action: req.action,
      originalInput: req.input,
      error: err instanceof Error ? err.message : "An unexpected AI error occurred.",
    };
  }
}

/**
 * Executes a Coach mode request for application questions
 */
export async function executeCoachRequest(req: CoachRequest): Promise<CoachResponse> {
  // Rule 8: Coach mode NEVER ghostwrites. Refuse any ghostwriting request immediately.
  const fullInput = `${req.question} ${req.userDraft || ""} ${req.userNotes?.join(" ") || ""}`;
  if (isGhostwritingRequest(fullInput)) {
    return {
      success: true,
      mode: req.mode,
      refusedGhostwriting: true,
      refusalReason: COACH_GHOSTWRITING_REFUSAL_MESSAGE,
    };
  }

  const systemPrompt = `You are a strict, supportive Coach for job applications.
CRITICAL COACH RULES:
1. You NEVER write or ghostwrite the final application answer for the user.
2. In interview mode, you ask ONE clear, probing question at a time to uncover their authentic story.
3. In outline mode, you organize an answer structure using ONLY the user's provided notes and phrases.
4. In review mode, you evaluate their draft for clarity, length, risky/unsubstantiated claims, and unanswered parts.
5. Remind users to check employer AI policies.`;

  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      // Mock response for development/testing
      return generateMockCoachResponse(req);
    }

    let userPrompt = "";
    if (req.mode === "interview") {
      userPrompt = `Application Question: "${req.question}"
User's notes so far: ${JSON.stringify(req.userNotes || [])}
Ask the NEXT single question to help them reflect on their real experience.
Output JSON: { "questionResponse": "..." }`;
    } else if (req.mode === "outline") {
      userPrompt = `Application Question: "${req.question}"
User's notes and responses: ${JSON.stringify(req.userNotes || [])}
Create an outline made ONLY of the user's points and phrases. Do not invent new narrative facts.
Output JSON: { "outline": ["1. Situation: ...", "2. Task: ...", "3. Action: ...", "4. Result: ..."] }`;
    } else if (req.mode === "review") {
      userPrompt = `Application Question: "${req.question}"
User's Draft: "${req.userDraft || ""}"
Review this draft.
Output JSON: {
  "clarity": "Feedback on clarity...",
  "length": "Feedback on length...",
  "riskyClaims": ["any claims that sound exaggerated without proof"],
  "unansweredParts": ["any part of the prompt left unaddressed"],
  "encouragingTakeaway": "Positive closing guidance"
}`;
    }

    const rawResult = await callClaudeAPI(systemPrompt, userPrompt);
    const cleaned = rawResult.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return {
      success: true,
      mode: req.mode,
      questionResponse: parsed.questionResponse,
      outline: parsed.outline,
      review: parsed.clarity ? parsed : undefined,
    };
  } catch (err: unknown) {
    return {
      success: false,
      mode: req.mode,
      error: err instanceof Error ? err.message : "Coach mode request failed.",
    };
  }
}

/**
 * Mock generator for development without an active API key
 */
function generateMockAIResponse(action: string, input: string): string {
  switch (action) {
    case "improve-bullet":
      return JSON.stringify({
        improvedBullet: input.trim().replace(/^built /i, "Engineered ").replace(/^helped /i, "Collaborated with team to "),
      });
    case "draft-summary":
      return JSON.stringify({
        summary: "Results-focused software engineering student with proven coursework and internship experience in full-stack web applications.",
      });
    case "group-skills":
      return JSON.stringify({
        groups: [
          { category: "Technical Skills", skills: input.split(",").map((s) => s.trim()).filter(Boolean) },
        ],
      });
    case "explain-warning":
      return JSON.stringify({
        explanation: "Hiring managers look for verifiable, outcome-based evidence to assess practical competence.",
      });
    case "suggest-questions":
      return JSON.stringify({
        questions: [
          "What specific tools or frameworks did you use for this task?",
          "How many users or team members benefited from your work?",
        ],
      });
    default:
      return JSON.stringify({ result: input });
  }
}

function generateMockCoachResponse(req: CoachRequest): CoachResponse {
  if (req.mode === "interview") {
    return {
      success: true,
      mode: "interview",
      questionResponse: `Can you describe the specific challenge you encountered when starting "${req.question}"?`,
    };
  }
  if (req.mode === "outline") {
    return {
      success: true,
      mode: "outline",
      outline: [
        "1. Context: " + (req.userNotes?.[0] || "Initial situation"),
        "2. Action taken: " + (req.userNotes?.[1] || "Specific steps implemented"),
        "3. Impact: " + (req.userNotes?.[2] || "Result achieved"),
      ],
    };
  }
  return {
    success: true,
    mode: "review",
    review: {
      clarity: "The progression of actions is clear and directly relates to the question.",
      length: "Concise and fits well within typical 250-word response limits.",
      riskyClaims: [],
      unansweredParts: [],
      encouragingTakeaway: "Strong structure that clearly highlights your direct involvement.",
    },
  };
}
