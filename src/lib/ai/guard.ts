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
 * Common technical tools, frameworks, and platforms to guard against hallucination
 */
const COMMON_TECH_TOOLS = [
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

const COMMON_EMPLOYERS = [
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
 * Normalizes text for comparison (lowercased, punctuation stripped)
 */
function normalize(str: string): string {
  return str.toLowerCase().replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim();
}

/**
 * Inspects AI-generated content before returning it to the user.
 * Strictly rejects output that adds invented numbers, tools, dates, or employers
 * not present in the user's source input or verified Evidence Vault.
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

  // 1. Em dash check (Rule 7)
  if (finalConfig.avoidEmDashes) {
    if (cleanOutput.includes("—")) {
      violations.push({
        type: "em_dash",
        term: "—",
        details: "Em dashes are prohibited by your style preferences.",
      });
      // Also provide cleaned version with hyphen
      cleanOutput = cleanOutput.replace(/—/g, " - ");
    }
  }

  // 2. Banned cliché words check (Rule 6)
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

  // 3. Invented numbers check (Rule 1 & Rule 4)
  const outputNumbers = extractClaimNumbers(cleanOutput);
  const sourceNumbers = extractClaimNumbers(sourceInput);
  const vaultNumberSet = new Set(
    vaultFacts.map((f) => f.value.replace(/%/g, "").replace(/,/g, "").trim())
  );

  for (const num of outputNumbers) {
    const presentInSource = sourceNumbers.includes(num);
    const presentInVault = vaultNumberSet.has(num);

    if (!presentInSource && !presentInVault) {
      violations.push({
        type: "number",
        term: num,
        details: `Invented number "${num}" was not found in your source input or Evidence Vault.`,
      });
    }
  }

  // 4. Invented technical tools / technologies check (Rule 1)
  const sourceNorm = normalize(sourceInput);
  const vaultNorm = normalize(vaultFacts.map((f) => `${f.label} ${f.note || ""}`).join(" "));

  for (const tool of COMMON_TECH_TOOLS) {
    const toolRegex = new RegExp(`\\b${tool}\\b`, "i");
    if (toolRegex.test(cleanOutput)) {
      const toolInSource = toolRegex.test(sourceNorm);
      const toolInVault = toolRegex.test(vaultNorm);

      if (!toolInSource && !toolInVault) {
        violations.push({
          type: "tool",
          term: tool,
          details: `Invented tool/technology "${tool}" was not present in your input.`,
        });
      }
    }
  }

  // 5. Invented years/dates check
  const yearRegex = /\b(19\d{2}|20\d{2})\b/g;
  let yearMatch: RegExpExecArray | null;
  const seenYears = new Set<string>();
  while ((yearMatch = yearRegex.exec(cleanOutput)) !== null) {
    const year = yearMatch[1];
    if (!seenYears.has(year)) {
      seenYears.add(year);
      if (!sourceInput.includes(year) && !vaultNorm.includes(year)) {
        violations.push({
          type: "date",
          term: year,
          details: `Invented year/date "${year}" was not present in your input.`,
        });
      }
    }
  }

  // 6. Invented employers check
  for (const emp of COMMON_EMPLOYERS) {
    const empRegex = new RegExp(`\\b${emp}\\b`, "i");
    if (empRegex.test(cleanOutput)) {
      const empInSource = empRegex.test(sourceNorm);
      const empInVault = empRegex.test(vaultNorm);
      if (!empInSource && !empInVault) {
        violations.push({
          type: "employer",
          term: emp,
          details: `Invented employer/organization "${emp}" was not present in your input.`,
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
