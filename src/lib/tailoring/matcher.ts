import type { CVData } from "@/lib/schema";
import type { VaultFact } from "@/lib/vault";
import { stripInjectionDirectives } from "@/lib/ai/guard";
import { runHonestyGuard } from "@/lib/ai/guard";
import type {
  ExtractedJobPosting,
  JobRequirementItem,
  RequirementMatch,
  FitCheckResult,
  FitLabel,
  TailoredBulletProposal,
  CoverLetterOutline,
} from "./types";

/**
 * Normalizes text for case-insensitive matching
 */
export function norm(text: string): string {
  return text.toLowerCase().replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim();
}

/**
 * Bidirectional synonym and spelling variant groups
 */
export const SYNONYM_GROUPS: string[][] = [
  ["next.js", "nextjs", "next js"],
  ["react", "react.js", "reactjs"],
  ["node.js", "nodejs", "node js"],
  ["vue", "vue.js", "vuejs"],
  ["typescript", "ts"],
  ["javascript", "js", "ecmascript"],
  ["tailwind css", "tailwindcss", "tailwind"],
  ["postgresql", "postgres", "psql"],
  ["customer onboarding", "client onboarding", "user onboarding"],
  ["user experience", "ux", "ui/ux", "ux/ui"],
  ["user interface", "ui", "ui/ux", "ux/ui"],
  ["ci/cd", "continuous integration", "continuous deployment", "ci cd"],
  ["aws", "amazon web services"],
  ["gcp", "google cloud platform", "google cloud"],
  ["azure", "microsoft azure"],
  ["golang", "go language", "go lang"],
  ["kubernetes", "k8s"],
  ["rest api", "rest apis", "restful api", "restful apis"],
  ["automated testing", "unit testing", "test automation", "automated tests", "unit tests"],
  ["responsive design", "mobile responsive", "mobile-first design", "responsive web design"],
];

/**
 * Retrieves all synonyms and spelling variants for a given term
 */
export function getSynonymsForTerm(term: string): string[] {
  const tNorm = norm(term);
  const group = SYNONYM_GROUPS.find((grp) => grp.some((s) => norm(s) === tNorm));
  return group ? group.map(norm) : [tNorm];
}

/**
 * Checks whether target text contains the requirement term or any of its known synonyms
 * using whole-word/phrase boundaries.
 */
export function matchesWithSynonyms(reqText: string, targetText: string): boolean {
  const reqSynonyms = getSynonymsForTerm(reqText);
  const targetPadded = ` ${norm(targetText)} `;
  return reqSynonyms.some((syn) => {
    const s = norm(syn);
    if (!s) return false;
    return targetPadded.includes(` ${s} `);
  });
}

/**
 * Related skill adjacencies for determining partial matches
 */
const SKILL_ADJACENCIES: Record<string, string[]> = {
  "next.js": ["react", "typescript", "javascript", "web"],
  "nextjs": ["react", "typescript", "javascript", "web"],
  "react": ["next.js", "vue", "javascript", "frontend"],
  "typescript": ["javascript", "typed", "node.js"],
  "node.js": ["express", "javascript", "typescript", "backend", "api"],
  "nodejs": ["express", "javascript", "typescript", "backend", "api"],
  "postgresql": ["sql", "mysql", "database", "relational"],
  "postgres": ["sql", "mysql", "database", "relational"],
  "docker": ["containers", "devops", "linux", "ci/cd"],
  "kubernetes": ["docker", "containers", "cloud", "aws", "gcp"],
  "k8s": ["docker", "containers", "cloud", "aws", "gcp"],
  "aws": ["cloud", "gcp", "azure", "devops", "s3", "ec2"],
  "graphql": ["rest", "api", "backend"],
  "tailwind css": ["css", "responsive", "html", "styling"],
  "vitest": ["jest", "testing", "unit tests", "automated tests"],
  "tableau": ["powerbi", "sql", "excel", "charts", "visualizations"],
  "python": ["data analysis", "r", "pandas", "scripting"],
};

/**
 * Calculates candidate's actual years of experience from experience history
 */
export function calculateCandidateExperienceYears(cv: CVData): number {
  if (!cv.experience || cv.experience.length === 0) return 0;

  let totalMonths = 0;
  const now = new Date();

  for (const exp of cv.experience) {
    if (!exp.startDate) continue;
    const startParts = exp.startDate.split("-").map(Number);
    const startYear = startParts[0] || now.getFullYear();
    const startMonth = startParts[1] || 1;

    let endYear: number;
    let endMonth: number;
    if (exp.isCurrent || !exp.endDate) {
      endYear = now.getFullYear();
      endMonth = now.getMonth() + 1;
    } else {
      const endParts = exp.endDate.split("-").map(Number);
      endYear = endParts[0] || startYear;
      endMonth = endParts[1] || 12;
    }

    // Inclusive calendar months (e.g. 2024-06 to 2024-08 is June, July, August: 3 months)
    const months = Math.max(1, (endYear - startYear) * 12 + (endMonth - startMonth) + 1);
    totalMonths += months;
  }

  return Math.round((totalMonths / 12) * 10) / 10;
}

/**
 * Extracts structured requirements from pasted job posting text.
 * Sanitizes untrusted text to remove injection directives before parsing.
 */
export function extractJobRequirements(rawPostingText: string): ExtractedJobPosting {
  const sanitizedText = stripInjectionDirectives(rawPostingText);

  // Extract Job Title
  let title = "Software Engineer";
  const titleMatch =
    sanitizedText.match(/(?:title|role|position|hiring(?:\s+for)?):\s*([^\n\r]+)/i) ||
    sanitizedText.match(/^([A-Z][A-Za-z0-9/,\s-]{5,50})(?:\r?\n|$)/m);
  if (titleMatch && titleMatch[1]) {
    title = titleMatch[1].trim().replace(/^["']|["']$/g, "");
  }

  // Extract Company
  let company: string | undefined;
  const companyMatch =
    sanitizedText.match(/(?:company|at|employer):\s*([A-Za-z0-9\s.,-]+?)(?:\r?\n|$)/i) ||
    sanitizedText.match(/([A-Z][A-Za-z0-9\s]{2,30})\s+(?:is hiring|seeks|is looking for)/i);
  if (companyMatch && companyMatch[1]) {
    company = companyMatch[1].trim();
  }

  // Extract Minimum Years of Experience
  let minYearsExperience: number | undefined;
  const rangeMatch = sanitizedText.match(/(\d+)\s*(?:-|to)\s*\d+\s*(?:years?|yrs?)/i);
  if (rangeMatch && rangeMatch[1]) {
    minYearsExperience = parseInt(rangeMatch[1], 10);
  } else {
    const yoeMatch = sanitizedText.match(/(\d+)\+?\s*(?:years?|yrs?)(?:\s+of)?(?:\s+experience)?/i);
    if (yoeMatch && yoeMatch[1]) {
      minYearsExperience = parseInt(yoeMatch[1], 10);
    }
  }

  // Extract Location and Timezone
  let location: string | undefined;
  const locMatch = sanitizedText.match(/(?:location|workplace):\s*([^\n\r]+)/i);
  if (locMatch && locMatch[1]) {
    location = locMatch[1].trim();
  } else if (/remote/i.test(sanitizedText)) {
    location = "Remote";
  }

  let timezone: string | undefined;
  const tzMatch = sanitizedText.match(/(?:timezone|time\s*zone|hours):\s*([^\n\r]+)/i) ||
    sanitizedText.match(/(UTC[+-]\d+(?:\s*to\s*UTC[+-]\d+)?|[A-Z]{3}(?:-[A-Z]{3})?)/i);
  if (tzMatch && tzMatch[1]) {
    timezone = tzMatch[1].trim();
  }

  // Extract Required and Preferred Skills
  const requiredSkills: string[] = [];
  const preferredSkills: string[] = [];
  const toolsAndTechnologies: string[] = [];

  const KNOWN_TECH = [
    "TypeScript",
    "JavaScript",
    "React",
    "Next.js",
    "Node.js",
    "Tailwind CSS",
    "CSS",
    "HTML",
    "PostgreSQL",
    "SQL",
    "Docker",
    "Kubernetes",
    "AWS",
    "GCP",
    "Azure",
    "Git",
    "GraphQL",
    "REST APIs",
    "Vitest",
    "Jest",
    "Python",
    "Tableau",
    "PowerBI",
    "CI/CD",
    "Linux",
    "Redux",
    "Redis",
    "Customer Onboarding",
    "Client Onboarding",
    "Golang",
    "Rust",
    "Terraform",
    "Ruby on Rails",
  ];

  // 1. Explicit requirements line parsing: "Required: a, b, c" or "Requirements: a, b, c"
  const reqMatch = sanitizedText.match(
    /(?:required(?:\s+qualifications|\s+skills)?|requirements|must\s*have):\s*([^\n\r]+)/i
  );
  if (reqMatch && reqMatch[1]) {
    const rawItems = reqMatch[1].split(/[,;•|]/);
    for (const rawItem of rawItems) {
      const clean = rawItem.trim().replace(/^[-*•\s]+|[.]+$/g, "");
      // Skip experience expressions like "1 year experience"
      if (
        clean &&
        !/\d+\s*(?:years?|yrs?)/i.test(clean) &&
        clean.length >= 2 &&
        clean.length <= 40
      ) {
        requiredSkills.push(clean);
        toolsAndTechnologies.push(clean);
      }
    }
  }

  // 2. Scan KNOWN_TECH with whole-word synonym mapping
  for (const tech of KNOWN_TECH) {
    if (matchesWithSynonyms(tech, sanitizedText)) {
      if (!toolsAndTechnologies.some((t) => matchesWithSynonyms(t, tech))) {
        toolsAndTechnologies.push(tech);
      }

      const preferredSectionRegex = new RegExp(
        `(?:preferred|nice-to-have|plus|bonus)[\\s\\S]*?${tech.replace(".", "\\.")}`,
        "i"
      );
      if (preferredSectionRegex.test(sanitizedText)) {
        if (!preferredSkills.some((s) => matchesWithSynonyms(s, tech))) {
          preferredSkills.push(tech);
        }
      } else {
        if (!requiredSkills.some((s) => matchesWithSynonyms(s, tech))) {
          requiredSkills.push(tech);
        }
      }
    }
  }

  if (requiredSkills.length === 0) {
    if (/frontend/i.test(sanitizedText)) requiredSkills.push("React", "TypeScript", "Responsive Design");
    if (/backend/i.test(sanitizedText)) requiredSkills.push("Node.js", "SQL Databases", "REST APIs");
    if (/data/i.test(sanitizedText)) requiredSkills.push("SQL", "Data Analysis", "Reporting");
  }

  return {
    title,
    company,
    location,
    timezone,
    minYearsExperience,
    requiredSkills: Array.from(new Set(requiredSkills)),
    preferredSkills: Array.from(new Set(preferredSkills)),
    toolsAndTechnologies: Array.from(new Set(toolsAndTechnologies)),
    rawPosting: rawPostingText,
  };
}

/**
 * Cross-references job requirements against the user's CV data and Evidence Vault facts.
 * Incorporates synonym and spelling variant mapping.
 */
export function matchRequirements(
  posting: ExtractedJobPosting,
  cv: CVData,
  vault: VaultFact[] = []
): RequirementMatch[] {
  const matches: RequirementMatch[] = [];

  const userSkills = cv.skillGroups.flatMap((g) => g.skills);
  const userProjectTerms = cv.projects.flatMap((p) => [
    p.name,
    p.description || "",
    ...(p.techStack || []),
  ]);
  const userBullets = cv.experience.flatMap((e) => e.bullets);
  const userVaultTerms = vault.map((v) => `${v.label} ${v.value} ${v.note || ""}`);

  const allUserText = [
    ...userSkills,
    ...userProjectTerms,
    ...userBullets,
    ...userVaultTerms,
  ].join(" ");
  const allUserTextNorm = norm(allUserText);

  const allRequirements: JobRequirementItem[] = [
    ...posting.requiredSkills.map((s, idx) => ({
      id: `req-skill-${idx}`,
      category: "skill" as const,
      text: s,
      isPreferred: false,
    })),
    ...posting.preferredSkills.map((s, idx) => ({
      id: `pref-skill-${idx}`,
      category: "skill" as const,
      text: s,
      isPreferred: true,
    })),
  ];

  if (posting.minYearsExperience) {
    allRequirements.push({
      id: "req-experience-years",
      category: "experience",
      text: `${posting.minYearsExperience}+ years of professional experience`,
      isPreferred: false,
    });
  }

  const actualYOE = calculateCandidateExperienceYears(cv);

  for (const req of allRequirements) {
    const reqLower = req.text.toLowerCase();

    // Special check for years of experience
    if (req.category === "experience") {
      const minRequired = posting.minYearsExperience || 1;
      if (actualYOE >= minRequired) {
        matches.push({
          requirement: req,
          strength: "strong",
          evidence: `Candidate documents ~${actualYOE} years of experience, meeting the ${minRequired}+ years requested.`,
          sourceLocation: "Experience Section",
        });
      } else if (actualYOE >= minRequired * 0.5) {
        matches.push({
          requirement: req,
          strength: "partial",
          evidence: `Candidate documents ~${actualYOE} years of experience vs ${minRequired}+ years requested. Highlight project depth to bridge difference.`,
          sourceLocation: "Experience Section",
        });
      } else {
        matches.push({
          requirement: req,
          strength: "gap",
          evidence: `Candidate documents ~${actualYOE} years of experience, substantially below the ${minRequired}+ years requested.`,
          sourceLocation: "Experience Section",
        });
      }
      continue;
    }

    // Direct Match or Synonym Match in Skills
    let directEvidence: string | null = null;
    let sourceLoc: string | undefined;

    const matchedSkill = userSkills.find((s) => matchesWithSynonyms(req.text, s));
    if (matchedSkill) {
      directEvidence = `Directly matches Skills section: "${matchedSkill}".`;
      sourceLoc = "Skills Section";
    }

    // Check Bullets with Synonyms
    if (!directEvidence) {
      const matchedBullet = userBullets.find((b) => matchesWithSynonyms(req.text, b));
      if (matchedBullet) {
        directEvidence = `Demonstrated in work experience: "${matchedBullet}"`;
        sourceLoc = "Experience Bullets";
      }
    }

    // Check Projects with Synonyms
    if (!directEvidence) {
      const matchedProj = cv.projects.find(
        (p) =>
          matchesWithSynonyms(req.text, p.name) ||
          p.techStack?.some((t) => matchesWithSynonyms(req.text, t)) ||
          matchesWithSynonyms(req.text, p.description || "")
      );
      if (matchedProj) {
        directEvidence = `Demonstrated in project "${matchedProj.name}" [${(matchedProj.techStack || []).join(", ")}].`;
        sourceLoc = "Projects Section";
      }
    }

    // Check Vault with Synonyms
    if (!directEvidence) {
      const matchedVault = vault.find(
        (v) => matchesWithSynonyms(req.text, v.label) || matchesWithSynonyms(req.text, v.note || "")
      );
      if (matchedVault) {
        directEvidence = `Confirmed in Evidence Vault: ${matchedVault.label} (${matchedVault.value} ${matchedVault.unit || ""}).`;
        sourceLoc = "Evidence Vault";
      }
    }

    if (directEvidence) {
      matches.push({
        requirement: req,
        strength: "strong",
        evidence: directEvidence,
        sourceLocation: sourceLoc,
      });
      continue;
    }

    // Check Partial / Adjacent Skills
    const adjacencies = SKILL_ADJACENCIES[reqLower] || [];
    const foundAdjacency = adjacencies.find((adj) => allUserTextNorm.includes(adj));

    if (foundAdjacency) {
      matches.push({
        requirement: req,
        strength: "partial",
        evidence: `Direct experience with "${req.text}" is unstated, but you have relevant foundation in "${foundAdjacency}".`,
        sourceLocation: "Related Experience",
      });
      continue;
    }

    // Honest Gap
    matches.push({
      requirement: req,
      strength: "gap",
      evidence: `No direct or adjacent mentions of "${req.text}" found in your CV profile or Evidence Vault.`,
    });
  }

  return matches;
}

/**
 * Produces an honest fit check with plain labels ("strong fit", "stretch", "long shot")
 * factoring in required vs actual years of experience and core requirement gaps.
 */
export function generateFitCheck(
  matches: RequirementMatch[],
  cv?: CVData,
  posting?: ExtractedJobPosting
): FitCheckResult {
  const actualYOE = cv ? calculateCandidateExperienceYears(cv) : 1;
  const requiredYOE = posting?.minYearsExperience;

  const requiredMatches = matches.filter((m) => !m.requirement.isPreferred);
  const strongRequired = requiredMatches.filter((m) => m.strength === "strong").length;
  const gapRequired = requiredMatches.filter((m) => m.strength === "gap").length;

  const keyStrengths = matches
    .filter((m) => m.strength === "strong")
    .map((m) => `${m.requirement.text} (${m.sourceLocation || "Documented"})`);
  const plainGaps = matches
    .filter((m) => m.strength === "gap")
    .map((m) => m.requirement.text);

  const reasons: string[] = [];

  // 1. Experience factor
  if (requiredYOE !== undefined) {
    if (actualYOE >= requiredYOE || (requiredYOE <= 1 && actualYOE >= 0.8)) {
      reasons.push(
        `Experience Match: Documented ~${actualYOE} years of experience satisfies the ${requiredYOE}+ years requested.`
      );
    } else {
      reasons.push(
        `Experience Deficit: Documented ~${actualYOE} years of experience is below the ${requiredYOE}+ years requested.`
      );
    }
  } else {
    reasons.push(`Experience: Documented ~${actualYOE} years of experience.`);
  }

  // 2. Skill alignment factor
  reasons.push(
    `Skill Alignment: ${strongRequired} of ${requiredMatches.length} core required skills have confirmed evidence.`
  );
  if (gapRequired > 0) {
    reasons.push(`Missing Core Requirements: ${gapRequired} required qualification(s) are completely missing from your profile.`);
  }

  // Determine plain label
  let fitLabel: FitLabel = "stretch";
  let summary = "";

  const isSignificantYOEDeficit =
    requiredYOE !== undefined &&
    (actualYOE < requiredYOE * 0.5 || (requiredYOE >= 5 && actualYOE <= 2));
  const hasSevereSkillGaps = gapRequired >= 3;

  if (isSignificantYOEDeficit || hasSevereSkillGaps) {
    fitLabel = "long shot";
    summary = "Long Shot: Significant gaps exist in required experience tenure or critical mandatory tools.";
  } else if (
    (requiredYOE === undefined || actualYOE >= requiredYOE || requiredYOE <= 1) &&
    gapRequired <= 1 &&
    strongRequired >= Math.max(1, Math.floor(requiredMatches.length * 0.5))
  ) {
    fitLabel = "strong fit";
    summary = "Strong Fit: You meet the primary core qualifications and experience expectations with verified evidence.";
  } else {
    fitLabel = "stretch";
    summary = "Stretch Opportunity: You have good foundational skills, but closing 1–2 specific gaps or bridging tenure is needed.";
  }

  const honestNextSteps: string[] = [];
  if (plainGaps.length > 0) {
    honestNextSteps.push(
      `Complete a focused project or course to gain practical experience with: ${plainGaps.slice(0, 3).join(", ")}.`
    );
    honestNextSteps.push(
      "In application statements, address these gaps transparently by highlighting fast learning agility and related foundations."
    );
  }

  return {
    fitLabel,
    reasons,
    summary,
    keyStrengths,
    plainGaps,
    honestNextSteps,
    candidateYearsOfExperience: actualYOE,
    requiredYearsOfExperience: requiredYOE,
  };
}

/**
 * Generates tailored bullet rewording proposals.
 * Only emphasizes keywords where the user's facts support them.
 * Every proposed bullet is verified with runHonestyGuard.
 */
export function generateTailoredBulletProposals(
  cv: CVData,
  posting: ExtractedJobPosting,
  matches: RequirementMatch[],
  vault: VaultFact[] = []
): TailoredBulletProposal[] {
  const proposals: TailoredBulletProposal[] = [];
  const strongKeywords = matches
    .filter((m) => m.strength === "strong")
    .map((m) => m.requirement.text);

  cv.experience.forEach((entry, expIdx) => {
    entry.bullets.forEach((bullet, bIdx) => {
      // Only emphasize keywords where the candidate's bullet already documents the technology/fact
      const relevantKeyword = strongKeywords.find((kw) => matchesWithSynonyms(kw, bullet));

      if (relevantKeyword) {
        // Formulate a clean active-voice proposal using only the existing facts in the bullet
        let proposed = bullet;
        if (/^built\b/i.test(bullet)) {
          proposed = bullet.replace(/^built\b/i, "Developed");
        } else if (/^wrote\b/i.test(bullet)) {
          proposed = bullet.replace(/^wrote\b/i, "Authored");
        } else if (/^participated\b/i.test(bullet)) {
          proposed = bullet.replace(/^participated in\b/i, "Collaborated on");
        } else if (/^helped\b/i.test(bullet)) {
          proposed = bullet.replace(/^helped\b/i, "Assisted");
        } else {
          proposed = bullet.replace(/^([A-Z][a-z]+ed)\b/i, "Spearheaded");
        }

        const guardCheck = runHonestyGuard(proposed, bullet, vault);

        if (guardCheck.allowed) {
          proposals.push({
            id: `tailored-exp-${expIdx}-${bIdx}`,
            entryType: "experience",
            entryIndex: expIdx,
            bulletIndex: bIdx,
            originalText: bullet,
            proposedText: proposed,
            keywordEmphasized: relevantKeyword,
            accepted: false,
            guardPassed: true,
          });
        }
      }
    });
  });

  return proposals;
}

/**
 * Generates an honest, structured cover letter outline.
 * Follows Coach mode principles: organizes user's authentic facts without ghostwriting.
 */
export function generateCoverLetterOutline(
  posting: ExtractedJobPosting,
  matches: RequirementMatch[],
  cv: CVData
): CoverLetterOutline {
  const strongMatches = matches.filter((m) => m.strength === "strong").map((m) => m.requirement.text);
  const gapMatches = matches.filter((m) => m.strength === "gap").map((m) => m.requirement.text);

  const companyName = posting.company || "your engineering team";
  const roleTitle = posting.title || "the role";

  const openingMissionTie = `Opening: Connect your enthusiasm for ${companyName}'s work on ${roleTitle} to your background in ${strongMatches.slice(0, 2).join(" and ") || "software development"}.`;

  let gapTransparencyStatement = "";
  if (gapMatches.length > 0) {
    gapTransparencyStatement = `Honest Gap Statement: State transparently: "While I have not yet used ${gapMatches.slice(0, 2).join(" or ")} in a production setting, my hands-on background in ${strongMatches[0] || "core engineering"} gives me the foundation to become productive rapidly."`;
  } else {
    gapTransparencyStatement = `Honest Alignment: Note that your background directly aligns with the required competencies.`;
  }

  const concreteEvidenceSection = strongMatches.slice(0, 3).map((strength) => {
    const match = matches.find((m) => m.requirement.text === strength);
    return `Evidence for ${strength}: ${match?.evidence || "Demonstrated in documented project work"}`;
  });

  const fastLearningProof =
    "Fast Learning Proof: Cite an example from your experience where you adopted a new tool or delivered under tight sprint constraints.";

  const professionalClose = `Professional Close: Reiterate your motivation to contribute to ${companyName} and offer to discuss how your demonstrated skills align with team goals.`;

  return {
    openingMissionTie,
    gapTransparencyStatement,
    concreteEvidenceSection,
    fastLearningProof,
    professionalClose,
  };
}
