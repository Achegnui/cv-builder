import type { ValidationRule, ValidationIssue } from "../types";
import type { CVData } from "@/lib/schema";

/**
 * Detects contradictory claims, such as describing the same competition
 * as "3rd place" in one section and "1st place" or "regional finalist" in another.
 */
export const checkConflictingClaims: ValidationRule = {
  id: "conflicts",
  name: "Conflicting Claims Detection",
  description: "Detects inconsistent rankings, metrics, or claims across sections",
  run(cv: CVData): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Rank descriptors to cross-reference
    const rankPatterns = [
      { key: "1st", regex: /\b(?:1st|first\s+place|winner|champion|gold)\b/i },
      { key: "2nd", regex: /\b(?:2nd|second\s+place|runner-?up|silver)\b/i },
      { key: "3rd", regex: /\b(?:3rd|third\s+place|bronze)\b/i },
      { key: "finalist", regex: /\b(?:finalist|semi-?finalist|honorable\s+mention)\b/i },
    ];

    // Collect all claims from awards, experience bullets, and project descriptions
    interface EventClaim {
      text: string;
      location: string;
      fieldId: string;
      rankKey: string;
    }

    const claims: EventClaim[] = [];

    // Awards
    cv.awards.forEach((award, idx) => {
      const fullText = `${award.title} ${award.description}`;
      rankPatterns.forEach((p) => {
        if (p.regex.test(fullText)) {
          claims.push({
            text: fullText,
            location: `Honors & Awards (${award.title})`,
            fieldId: `award-${idx}-title`,
            rankKey: p.key,
          });
        }
      });
    });

    // Experience bullets
    cv.experience.forEach((exp, expIdx) => {
      exp.bullets.forEach((bullet, bulletIdx) => {
        rankPatterns.forEach((p) => {
          if (p.regex.test(bullet)) {
            claims.push({
              text: bullet,
              location: `Work Experience (${exp.employer}): Bullet #${bulletIdx + 1}`,
              fieldId: `experience-${expIdx}-bullet-${bulletIdx}`,
              rankKey: p.key,
            });
          }
        });
      });
    });

    // Projects
    cv.projects.forEach((proj, idx) => {
      rankPatterns.forEach((p) => {
        if (p.regex.test(proj.description)) {
          claims.push({
            text: proj.description,
            location: `Projects (${proj.name})`,
            fieldId: `project-${idx}-desc`,
            rankKey: p.key,
          });
        }
      });
    });

    // Compare claims that refer to the same event or keyword but have conflicting ranks
    // Common event keywords: hackathon, competition, showcase, contest, tournament, challenge
    const eventKeywords = ["hackathon", "competition", "showcase", "contest", "tournament", "challenge"];

    for (let i = 0; i < claims.length; i++) {
      for (let j = i + 1; j < claims.length; j++) {
        const c1 = claims[i];
        const c2 = claims[j];

        if (c1.rankKey !== c2.rankKey) {
          // Check if both mention the same event keyword or matching subject
          const sharedKeyword = eventKeywords.find(
            (kw) => c1.text.toLowerCase().includes(kw) && c2.text.toLowerCase().includes(kw)
          );

          if (sharedKeyword) {
            issues.push({
              id: `conflict-${i}-${j}`,
              checkId: "conflicts",
              severity: "warning",
              location: `${c1.location} vs ${c2.location}`,
              fieldId: c1.fieldId,
              message: `Conflicting achievement claims detected: described as "${c1.rankKey}" in ${c1.location} and "${c2.rankKey}" in ${c2.location}.`,
              suggestedFix:
                "Ensure your achievements match consistently across all sections (e.g. decide whether to state '3rd place' or 'finalist').",
              blockingExport: false,
            });
          }
        }
      }
    }

    return issues;
  },
};
