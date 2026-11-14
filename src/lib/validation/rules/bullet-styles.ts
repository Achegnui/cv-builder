import type { ValidationRule, ValidationIssue } from "../types";
import type { CVData } from "@/lib/schema";

/**
 * Checks for inconsistent bullet styles:
 * - Mixing bullets that end with periods and bullets that don't within the same entry.
 */
export const checkBulletStyles: ValidationRule = {
  id: "bullet-styles",
  name: "Bullet Style & Punctuation Consistency",
  description: "Detects mixed ending punctuation and inconsistent bullet formatting",
  run(cv: CVData): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    cv.experience.forEach((exp, expIdx) => {
      const bullets = exp.bullets.map((b) => b.trim()).filter(Boolean);
      if (bullets.length < 2) return;

      let withPeriod = 0;
      let withoutPeriod = 0;

      bullets.forEach((b) => {
        if (b.endsWith(".")) {
          withPeriod++;
        } else {
          withoutPeriod++;
        }
      });

      // If both styles are used in the same position
      if (withPeriod > 0 && withoutPeriod > 0) {
        issues.push({
          id: `bullet-punctuation-exp-${exp.id}`,
          checkId: "bullet-styles",
          severity: "warning",
          location: `Work Experience (${exp.employer || `Role #${expIdx + 1}`}): Bullets`,
          fieldId: `experience-${expIdx}-bullets`,
          message: `Mixed ending punctuation in bullets: ${withPeriod} bullet(s) end with a period, while ${withoutPeriod} do not.`,
          suggestedFix:
            "Standardize bullet punctuation: either end every bullet with a period or omit periods consistently across all bullets.",
          blockingExport: false,
        });
      }
    });

    cv.education.forEach((edu, eduIdx) => {
      const bullets = edu.bullets.map((b) => b.trim()).filter(Boolean);
      if (bullets.length < 2) return;

      let withPeriod = 0;
      let withoutPeriod = 0;

      bullets.forEach((b) => {
        if (b.endsWith(".")) {
          withPeriod++;
        } else {
          withoutPeriod++;
        }
      });

      if (withPeriod > 0 && withoutPeriod > 0) {
        issues.push({
          id: `bullet-punctuation-edu-${edu.id}`,
          checkId: "bullet-styles",
          severity: "warning",
          location: `Education (${edu.institution || `School #${eduIdx + 1}`}): Bullets`,
          fieldId: `education-${eduIdx}-bullets`,
          message: `Mixed ending punctuation in bullets: ${withPeriod} bullet(s) end with a period, while ${withoutPeriod} do not.`,
          suggestedFix:
            "Standardize bullet punctuation: choose either periods or no periods consistently.",
          blockingExport: false,
        });
      }
    });

    return issues;
  },
};
