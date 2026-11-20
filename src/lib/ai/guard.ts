import type { VaultFact } from "@/lib/vault";
import type { HonestyGuardConfig, GuardResult, GuardViolation } from "./types";
import { extractClaimNumbers } from "@/lib/vault";

export const DEFAULT_BANNED_WORDS = [
  "passionate",
  "robust",
  "proven track record",
  "dynamic",
  "cutting-edge",
  "seamless",
  "results-driven",
  "synergy",
  "hardworking",
  "go-getter",
  "team player",
  "thought leader",
  "innovative thinker",
  "detail-oriented",
];

export const DEFAULT_GUARD_CONFIG: HonestyGuardConfig = {
  bannedWords: DEFAULT_BANNED_WORDS,
  avoidEmDashes: false,
};

/**
 * Common technical tools, frameworks, and platforms (case-insensitive check)
 */
export const COMMON_TECH_TOOLS = [
  "kubernetes",
  "docker",
  "aws",
  "azure",
  "gcp",
  "graphql",
  "redux",
  "kafka",
  "terraform",
  "ci/cd",
  "redis",
  "elasticsearch",
  "microservices",
  "figma",
  "jira",
  "jenkins",
  "tableau",
  "salesforce",
];

export const COMMON_EMPLOYERS = [
  "google",
  "microsoft",
  "amazon",
  "apple",
  "meta",
  "netflix",
  "uber",
  "airbnb",
  "twitter",
  "stripe",
];

/**
 * Title keywords that indicate elevated organizational positions
 */
export const TITLE_KEYWORDS = [
  "architect",
  "director",
  "manager",
  "lead",
  "head",
  "chief",
  "officer",
  "vp",
  "president",
  "principal",
  "consultant",
  "specialist",
  "fellow",
  "supervisor",
];

/**
 * Written-out number words mapped to their digit representations
 */
export const NUMBER_WORDS: Record<string, string> = {
  zero: "0",
  one: "1",
  two: "2",
  three: "3",
  four: "4",
  five: "5",
  six: "6",
  seven: "7",
  eight: "8",
  nine: "9",
  ten: "10",
  eleven: "11",
  twelve: "12",
  thirteen: "13",
  fourteen: "14",
  fifteen: "15",
  sixteen: "16",
  seventeen: "17",
  eighteen: "18",
  nineteen: "19",
  twenty: "20",
  thirty: "30",
  forty: "40",
  fifty: "50",
  sixty: "60",
  seventy: "70",
  eighty: "80",
  ninety: "90",
  hundred: "100",
  thousand: "1000",
  million: "1000000",
  billion: "1000000000",
};

/**
 * Relative or proportional metric phrases indicating unverified claims
 */
export const METRIC_PHRASES = [
  "doubled",
  "tripled",
  "quadrupled",
  "twofold",
  "threefold",
  "fourfold",
  "tenfold",
  "halved",
  "10x",
  "2x",
  "3x",
  "5x",
];

export const MONTH_NAMES = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
  "jan",
  "feb",
  "mar",
  "apr",
  "jun",
  "jul",
  "aug",
  "sep",
  "sept",
  "oct",
  "nov",
  "dec",
];

/**
 * Normalizes text for comparison (lowercased, punctuation stripped)
 */
export function normalize(str: string): string {
  return str.toLowerCase().replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim();
}

/**
 * Detects adversarial prompt injection attempts embedded in user CV text.
 */
export function detectPromptInjection(text: string): boolean {
  const injectionPatterns = [
    /\b(?:ignore|disregard|override|forget)\s+(?:all\s+)?(?:your\s+)?(?:previous\s+)?(?:rules|instructions|prompts|guidelines)\b/i,
    /\b(?:add|include|make\s+up|pretend|say\s+that|state\s+that|claim|invent)\s+[^.,;\n]*(?:increase|metric|result|growth|boost|improvement|employer|tool|company)\b/i,
    /\b(?:system\s+prompt|developer\s+mode|jailbreak|unrestricted\s+mode)\b/i,
    /\b(?:do\s+not\s+follow|bypass)\s+(?:the\s+)?(?:rules|guard|policy)\b/i,
  ];

  return injectionPatterns.some((pattern) => pattern.test(text));
}

/**
 * Strips adversarial injection directives from user text so their embedded numbers
 * or false claims are NOT counted as legitimate source facts.
 */
export function stripInjectionDirectives(text: string): string {
  return text
    .replace(
      /\b(?:ignore|disregard|override|forget)\s+(?:all\s+)?(?:your\s+)?(?:previous\s+)?(?:rules|instructions|prompts|guidelines)[^.,;\n]*/gi,
      " "
    )
    .replace(
      /\b(?:add|include|make\s+up|pretend|say\s+that|state\s+that|claim|invent)\s+[^.,;\n]*(?:increase|metric|result|growth|boost|improvement|employer|tool|company)[^.,;\n]*/gi,
      " "
    )
    .replace(/\b(?:ignore\s+your\s+rules\s+and\s+add\s+[^.,;\n]*)/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Extracts proper nouns, camelCase terms, and acronyms from text.
 */
export function extractEntitiesAndProperNouns(text: string): string[] {
  const entities: string[] = [];
  const sentences = text.split(/(?<=[.?!])\s+/);

  for (const sentence of sentences) {
    const words = sentence.trim().split(/\s+/);
    for (let i = 0; i < words.length; i++) {
      const rawWord = words[i].replace(/^[("']+|[)"',.;:!?]+$/g, "");
      if (!rawWord || rawWord.length < 2) continue;

      // 1. Acronyms (e.g. AWS, GCP, K8S, SQL, CI/CD, SRE)
      if (/^[A-Z0-9]{2,}(?:\/[A-Z0-9]+)?$/.test(rawWord)) {
        if (!["AI", "OK", "AM", "PM", "US", "UK"].includes(rawWord)) {
          entities.push(rawWord);
          continue;
        }
      }

      // 2. PascalCase or camelCase words (e.g. TypeScript, PostgreSQL, MongoDB, GraphQL)
      if (
        /^[A-Z][a-z0-9]+[A-Z][a-zA-Z0-9]*$/.test(rawWord) ||
        /^[a-z]+[A-Z][a-zA-Z0-9]*$/.test(rawWord)
      ) {
        entities.push(rawWord);
        continue;
      }

      // 3. Mid-sentence capitalized words (proper nouns, tools, employers)
      if (i > 0 && /^[A-Z][a-z0-9]+$/.test(rawWord)) {
        const lower = rawWord.toLowerCase();
        // Ignore standard grammar words, pronouns, and days
        if (
          !MONTH_NAMES.includes(lower) &&
          !["i", "my", "the", "a", "an", "and", "or", "to", "for", "with", "in", "on", "at", "by"].includes(
            lower
          )
        ) {
          entities.push(rawWord);
        }
      }
    }
  }

  return Array.from(new Set(entities));
}

/**
 * Inspects AI-generated content before returning it to the user.
 * Strictly rejects output that adds invented numbers (numeric or word),
 * proper nouns, tools, titles, dates, or employers not present in the input or vault.
 */
export function runHonestyGuard(
  aiOutput: string,
  sourceInput: string,
  vaultFacts: VaultFact[] = [],
  config: Partial<HonestyGuardConfig> = {}
): GuardResult {
  const finalConfig: HonestyGuardConfig = {
    ...DEFAULT_GUARD_CONFIG,
    ...config,
    bannedWords: config.bannedWords || DEFAULT_BANNED_WORDS,
  };

  const violations: GuardViolation[] = [];
  let cleanOutput = aiOutput.trim();

  // 1. Treat user text as untrusted: strip prompt injection directives before establishing source baseline
  const legitimateSourceInput = stripInjectionDirectives(sourceInput);
  const sourceNorm = normalize(legitimateSourceInput);
  const vaultNorm = normalize(
    vaultFacts.map((f) => `${f.label} ${f.value} ${f.unit || ""} ${f.note || ""}`).join(" ")
  );

  // Check if input had prompt injection and AI output reflects it
  if (detectPromptInjection(sourceInput)) {
    // If output contains numbers or claims from injection not in legitimate source
    const rawSourceNumbers = extractClaimNumbers(sourceInput);
    const legitimateNumbers = extractClaimNumbers(legitimateSourceInput);
    const outputNumbers = extractClaimNumbers(cleanOutput);

    for (const num of outputNumbers) {
      if (rawSourceNumbers.includes(num) && !legitimateNumbers.includes(num)) {
        violations.push({
          type: "injection",
          term: num,
          details: `Output contains metric "${num}" injected via adversarial user prompt instructions.`,
        });
      }
    }
  }

  // 2. Em dash check (Rule 7)
  if (finalConfig.avoidEmDashes) {
    if (cleanOutput.includes("—")) {
      violations.push({
        type: "em_dash",
        term: "—",
        details: "Em dashes are prohibited by your style preferences.",
      });
      cleanOutput = cleanOutput.replace(/—/g, " - ");
    }
  }

  // 3. Banned cliché words check (Rule 6)
  const normOutput = normalize(cleanOutput);
  for (const banned of finalConfig.bannedWords) {
    const normBanned = normalize(banned);
    if (normBanned && normOutput.includes(normBanned)) {
      violations.push({
        type: "banned_word",
        term: banned,
        details: `Uses filler word/cliché "${banned}" from your banned words list.`,
      });
    }
  }

  // 4. Invented numbers check (digits, decimals, percentages)
  const outputNumbers = extractClaimNumbers(cleanOutput);
  const legitimateSourceNumbers = extractClaimNumbers(legitimateSourceInput);
  const vaultNumberSet = new Set(
    vaultFacts.map((f) => f.value.replace(/%/g, "").replace(/,/g, "").trim())
  );

  for (const num of outputNumbers) {
    const presentInSource = legitimateSourceNumbers.includes(num);
    const presentInVault = vaultNumberSet.has(num);

    if (!presentInSource && !presentInVault) {
      violations.push({
        type: "number",
        term: num,
        details: `Invented number "${num}" was not found in your source input or Evidence Vault.`,
      });
    }
  }

  // 5. Invented number words (e.g., "three", "twenty", "hundred")
  for (const [word, digit] of Object.entries(NUMBER_WORDS)) {
    // Skip "one" if used grammatically (e.g. "one of the", "one another")
    if (word === "one") {
      const oneCountRegex = /\bone\s+(?:more|new|additional|extra|project|client|team|service|feature|bug|test|role)\b/i;
      if (oneCountRegex.test(cleanOutput)) {
        const inSource = sourceNorm.includes("one") || legitimateSourceNumbers.includes("1");
        const inVault = vaultNorm.includes("one") || vaultNumberSet.has("1");
        if (!inSource && !inVault) {
          violations.push({
            type: "number",
            term: "one",
            details: `Invented count/number word "one" was not found in your source input or Evidence Vault.`,
          });
        }
      }
      continue;
    }

    const wordRegex = new RegExp(`\\b${word}\\b`, "i");
    if (wordRegex.test(cleanOutput)) {
      const inSource = sourceNorm.includes(word) || legitimateSourceNumbers.includes(digit);
      const inVault = vaultNorm.includes(word) || vaultNumberSet.has(digit);
      if (!inSource && !inVault) {
        violations.push({
          type: "number",
          term: word,
          details: `Invented number word "${word}" (${digit}) was not found in your source input or Evidence Vault.`,
        });
      }
    }
  }

  // 6. Invented relative metric phrases (e.g., "doubled", "tripled", "twofold", "10x")
  for (const phrase of METRIC_PHRASES) {
    const phraseRegex = new RegExp(`\\b${phrase}\\b`, "i");
    if (phraseRegex.test(cleanOutput)) {
      const inSource = phraseRegex.test(sourceNorm);
      const inVault = phraseRegex.test(vaultNorm);
      if (!inSource && !inVault) {
        violations.push({
          type: "metric_phrase",
          term: phrase,
          details: `Invented metric phrase "${phrase}" was not present in your input or Evidence Vault.`,
        });
      }
    }
  }

  // 7. Dynamic proper nouns, tools, frameworks & entity check (no static list limit)
  const entities = extractEntitiesAndProperNouns(cleanOutput);
  for (const entity of entities) {
    const entityNorm = normalize(entity);
    const inSource = sourceNorm.includes(entityNorm);
    const inVault = vaultNorm.includes(entityNorm);

    if (!inSource && !inVault) {
      let type: GuardViolation["type"] = "proper_noun";
      if (TITLE_KEYWORDS.includes(entityNorm)) {
        type = "title";
      } else if (COMMON_EMPLOYERS.includes(entityNorm)) {
        type = "employer";
      } else if (COMMON_TECH_TOOLS.includes(entityNorm)) {
        type = "tool";
      }

      if (!violations.some((v) => v.term.toLowerCase() === entityNorm)) {
        violations.push({
          type,
          term: entity,
          details: `Invented ${type.replace("_", " ")} "${entity}" was not found in your input or Evidence Vault.`,
        });
      }
    }
  }

  // 8. Case-insensitive common tools and employers check (catches lowercase tools e.g. "kubernetes", "docker")
  for (const tool of COMMON_TECH_TOOLS) {
    const toolRegex = new RegExp(`\\b${tool}\\b`, "i");
    if (toolRegex.test(cleanOutput)) {
      const inSource = toolRegex.test(sourceNorm);
      const inVault = toolRegex.test(vaultNorm);
      if (!inSource && !inVault && !violations.some((v) => v.term.toLowerCase() === tool)) {
        violations.push({
          type: "tool",
          term: tool,
          details: `Invented tool/technology "${tool}" was not present in your input or Evidence Vault.`,
        });
      }
    }
  }

  for (const emp of COMMON_EMPLOYERS) {
    const empRegex = new RegExp(`\\b${emp}\\b`, "i");
    if (empRegex.test(cleanOutput)) {
      const inSource = empRegex.test(sourceNorm);
      const inVault = empRegex.test(vaultNorm);
      if (!inSource && !inVault && !violations.some((v) => v.term.toLowerCase() === emp)) {
        violations.push({
          type: "employer",
          term: emp,
          details: `Invented employer/organization "${emp}" was not present in your input or Evidence Vault.`,
        });
      }
    }
  }

  // 9. Invented title keywords (e.g. "Lead", "Director", "Architect", "VP")
  for (const title of TITLE_KEYWORDS) {
    const titleRegex = new RegExp(`\\b${title}\\b`, "i");
    if (titleRegex.test(cleanOutput)) {
      const inSource = titleRegex.test(sourceNorm);
      const inVault = titleRegex.test(vaultNorm);
      if (!inSource && !inVault) {
        violations.push({
          type: "title",
          term: title,
          details: `Invented title/role level "${title}" was not present in your input or Evidence Vault.`,
        });
      }
    }
  }

  // 10. Invented years, dates, and month names
  const yearRegex = /\b(19\d{2}|20\d{2})\b/g;
  let yearMatch: RegExpExecArray | null;
  const seenYears = new Set<string>();
  while ((yearMatch = yearRegex.exec(cleanOutput)) !== null) {
    const year = yearMatch[1];
    if (!seenYears.has(year)) {
      seenYears.add(year);
      if (!legitimateSourceInput.includes(year) && !vaultNorm.includes(year)) {
        violations.push({
          type: "date",
          term: year,
          details: `Invented year/date "${year}" was not present in your input or Evidence Vault.`,
        });
      }
    }
  }

  for (const month of MONTH_NAMES) {
    const monthRegex = new RegExp(`\\b${month}\\b`, "i");
    if (monthRegex.test(cleanOutput)) {
      const inSource = monthRegex.test(sourceNorm);
      const inVault = monthRegex.test(vaultNorm);
      if (!inSource && !inVault && !violations.some((v) => v.term.toLowerCase() === month)) {
        violations.push({
          type: "date",
          term: month,
          details: `Invented month/date "${month}" was not present in your input or Evidence Vault.`,
        });
      }
    }
  }

  // Determine pass or fail
  if (violations.length > 0) {
    const summary = violations.map((v) => v.details).join(" ");
    return {
      allowed: false,
      reason: `Honesty Guard rejected AI output: ${summary}`,
      violations,
    };
  }

  return {
    allowed: true,
    cleanOutput,
  };
}
