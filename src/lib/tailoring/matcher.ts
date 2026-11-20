import type { CVData } from "@/lib/schema";
import type { VaultFact } from "@/lib/vault";
import { stripInjectionDirectives } from "@/lib/ai/guard";
import { runHonestyGuard } from "@/lib/ai/guard";
import type {
  ExtractedJobPosting,
  JobRequirementItem,
  RequirementMatch,
  FitCheckResult,
  TailoredBulletProposal,
  CoverLetterOutline,
} from "./types";

/**
 * Normalizes text for case-insensitive matching
 */
function norm(text: string): string {
  return text.toLowerCase().replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim();
}

/**
 * Related skill adjacencies for determining partial matches
 */
const SKILL_ADJACENCIES: Record<string, string[]> = {
  "next.js": ["react", "typescript", "javascript", "web"],
  "react": ["next.js", "vue", "javascript", "frontend"],
  "typescript": ["javascript", "typed", "node.js"],
  "node.js": ["express", "javascript", "typescript", "backend", "api"],
  "postgresql": ["sql", "mysql", "database", "relational"],
  "docker": ["containers", "devops", "linux", "ci/cd"],
  "kubernetes": ["docker", "containers", "cloud", "aws", "gcp"],
  "aws": ["cloud", "gcp", "azure", "devops", "s3", "ec2"],
  "graphql": ["rest", "api", "backend"],
  "tailwind css": ["css", "responsive", "html", "styling"],
  "vitest": ["jest", "testing", "unit tests", "automated tests"],
  "tableau": ["powerbi", "sql", "excel", "charts", "visualizations"],
  "python": ["data analysis", "r", "pandas", "scripting"],
};

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

  // Common tech keywords to scan
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
  ];

  for (const tech of KNOWN_TECH) {
    const techRegex = new RegExp(`\\b${tech.replace(".", "\\.")}\\b`, "i");
    if (techRegex.test(sanitizedText)) {
      toolsAndTechnologies.push(tech);

      // Determine if in preferred section
      const preferredSectionRegex = new RegExp(`(?:preferred|nice-to-have|plus|bonus)[\\s\\S]*?${tech.replace(".", "\\.")}`, "i");
      if (preferredSectionRegex.test(sanitizedText)) {
        preferredSkills.push(tech);
      } else {
        requiredSkills.push(tech);
      }
    }
  }

  // Add default required skills if text had general phrasing
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
 * Classifies each item as strong match, partial match, or honest gap with explicit evidence.
 */
export function matchRequirements(
  posting: ExtractedJobPosting,
  cv: CVData,
  vault: VaultFact[] = []
): RequirementMatch[] {
  const matches: RequirementMatch[] = [];

  // Collect user's skills
  const userSkills = cv.skillGroups.flatMap((g) => g.skills);
  const userSkillsNorm = userSkills.map(norm);

  // Collect user's project descriptions and tools
  const userProjectTerms = cv.projects.flatMap((p) => [
    p.name,
    p.description || "",
    ...(p.techStack || []),
  ]);
  const userProjectTermsNorm = userProjectTerms.map(norm);

  // Collect user's experience bullets
  const userBullets = cv.experience.flatMap((e) => e.bullets);
  const userBulletsNorm = userBullets.map(norm);

  // Collect vault facts
  const userVaultTerms = vault.map((v) => `${v.label} ${v.value} ${v.note || ""}`);
  const userVaultTermsNorm = userVaultTerms.map(norm);

  // All user searchable text
  const allUserTextNorm = [
    ...userSkillsNorm,
    ...userProjectTermsNorm,
    ...userBulletsNorm,
    ...userVaultTermsNorm,
  ].join(" ");

  // 1. Process Required Skills & Tools
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

  // If minimum experience is stated, add experience requirement
  if (posting.minYearsExperience) {
    allRequirements.push({
      id: "req-experience-years",
      category: "experience",
      text: `${posting.minYearsExperience}+ years of professional experience`,
      isPreferred: false,
    });
  }

  // Match each requirement
  for (const req of allRequirements) {
    const reqLower = req.text.toLowerCase();
    const reqNorm = norm(req.text);

    // Special check for years of experience
    if (req.category === "experience") {
      const totalRoles = cv.experience.length;
      if (totalRoles >= (posting.minYearsExperience || 1)) {
        matches.push({
          requirement: req,
          strength: "strong",
          evidence: `Profile documents ${totalRoles} relevant positions/internships matching experience expectations.`,
          sourceLocation: "Experience Section",
        });
      } else {
        matches.push({
          requirement: req,
          strength: "partial",
          evidence: `Profile documents ${totalRoles} position(s). Consider highlighting substantial project coursework and verified vault metrics to offset formal tenure.`,
          sourceLocation: "Experience Section",
        });
      }
      continue;
    }

    // Direct Exact Match in Skills, Projects, Experience, or Vault
    let directEvidence: string | null = null;
    let sourceLoc: string | undefined;

    // Check Skills
    const matchedSkill = userSkills.find((s) => norm(s) === reqNorm || norm(s).includes(reqNorm));
    if (matchedSkill) {
      directEvidence = `Directly listed under your Skills section ("${matchedSkill}").`;
      sourceLoc = "Skills Section";
    }

    // Check Bullets
    if (!directEvidence) {
      const matchedBullet = userBullets.find((b) => norm(b).includes(reqNorm));
      if (matchedBullet) {
        directEvidence = `Demonstrated in work experience: "${matchedBullet}"`;
        sourceLoc = "Experience Bullets";
      }
    }

    // Check Projects
    if (!directEvidence) {
      const matchedProj = cv.projects.find(
        (p) =>
          norm(p.name).includes(reqNorm) ||
          p.techStack?.some((t) => norm(t).includes(reqNorm)) ||
          norm(p.description || "").includes(reqNorm)
      );
      if (matchedProj) {
        directEvidence = `Demonstrated in project "${matchedProj.name}" using [${(matchedProj.techStack || []).join(", ")}].`;
        sourceLoc = "Projects Section";
      }
    }

    // Check Vault
    if (!directEvidence) {
      const matchedVault = vault.find((v) => norm(v.label).includes(reqNorm) || norm(v.note || "").includes(reqNorm));
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

    // Check Partial / Adjacent Skill
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

    // Honest Gap: Not found anywhere
    matches.push({
      requirement: req,
      strength: "gap",
      evidence: `No direct or adjacent mentions of "${req.text}" found in your CV profile or Evidence Vault.`,
    });
  }

  return matches;
}

/**
 * Produces an honest fit check and plain-language next steps.
 * Never sugarcoats or conceals gaps per AGENTS.md Rule 5.
 */
export function generateFitCheck(matches: RequirementMatch[]): FitCheckResult {
  const strongMatches = matches.filter((m) => m.strength === "strong");
  const partialMatches = matches.filter((m) => m.strength === "partial");
  const gapMatches = matches.filter((m) => m.strength === "gap");

  const total = matches.length || 1;
  const score = Math.round(((strongMatches.length * 100) + (partialMatches.length * 50)) / total);

  const keyStrengths = strongMatches.map((m) => `${m.requirement.text} (${m.sourceLocation || "Documented"})`);
  const plainGaps = gapMatches.map((m) => m.requirement.text);

  let summary = "";
  if (score >= 80) {
    summary = "Strong Overall Match. You meet the primary core qualifications with confirmed evidence across your experience and skills.";
  } else if (score >= 50) {
    summary = "Moderate Match with Transparent Gaps. You have foundational skills for the role but lack specific required tools or formal tenure.";
  } else {
    summary = "Significant Skill Gaps. The role requires specialized tools or background not yet documented in your profile.";
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
  if (partialMatches.length > 0) {
    honestNextSteps.push(
      `Strengthen bullet points to highlight transferrable skills from: ${partialMatches.map((m) => m.requirement.text).join(", ")}.`
    );
  }

  return {
    overallFitScore: score,
    summary,
    keyStrengths,
    plainGaps,
    honestNextSteps,
  };
}

/**
 * Generates tailored bullet rewording proposals.
 * Only emphasizes keywords where the user's facts support them.
 * Every proposed bullet is verified with runHonestyGuard to prevent invented metrics.
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
      // Find a matching keyword relevant to this bullet
      const relevantKeyword = strongKeywords.find((kw) => {
        const kwNorm = norm(kw);
        return norm(entry.title).includes(kwNorm) || norm(bullet).includes(kwNorm);
      });

      if (relevantKeyword && !bullet.toLowerCase().startsWith(relevantKeyword.toLowerCase())) {
        // Propose active phrasing emphasizing the verified keyword at the front
        const proposed = bullet.replace(
          /^([A-Z][a-z]+ed)\s+/i,
          `$1 using ${relevantKeyword} to `
        );

        // Run proposed text through Honesty Guard
        const guardCheck = runHonestyGuard(proposed, bullet, vault);

        proposals.push({
          id: `tailored-exp-${expIdx}-${bIdx}`,
          entryType: "experience",
          entryIndex: expIdx,
          bulletIndex: bIdx,
          originalText: bullet,
          proposedText: guardCheck.allowed ? proposed : bullet,
          keywordEmphasized: relevantKeyword,
          accepted: false,
          guardPassed: guardCheck.allowed,
          guardViolationReason: guardCheck.reason,
        });
      }
    });
  });

  return proposals;
}

/**
 * Generates an honest, structured cover letter outline.
 * Follows Coach mode principles: organizes the user's authentic facts without ghostwriting.
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
