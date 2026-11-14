import type { ValidationRule, ValidationIssue, ValidationContext } from "../types";
import type { CVData } from "@/lib/schema";
import { extractClaimNumbers, isNumberVerifiedInVault } from "@/lib/vault";

/**
 * Checks for numerical metrics and quantifiable results that are not recorded
 * and verified in the Evidence Vault.
 *
 * Per AGENTS.md rule 4: "Evidence first. Numbers in a CV should come from the Evidence Vault. Flag numbers that are not in it."
 */
export const checkUnverifiedNumbers: ValidationRule = {
  id: "unverified-numbers",
  name: "Evidence Vault Verification",
  description: "Flags quantified numbers and metrics that lack user-verified evidence in the vault",
  run(cv: CVData, context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const vault = context.vault || [];

    const checkTextNumbers = (
      text: string,
      location: string,
      fieldId: string,
      idPrefix: string
    ) => {
      if (!text) return;
      const numbers = extractClaimNumbers(text);

      numbers.forEach((numStr) => {
        const verified = isNumberVerifiedInVault(numStr, vault);
        if (!verified) {
          issues.push({
            id: `${idPrefix}-${numStr.replace(/[^a-zA-Z0-9]/g, "_")}`,
            checkId: "unverified-numbers",
            severity: "warning",
            location,
            fieldId,
            message: `Number "${numStr}" was not found or is unverified in your Evidence Vault.`,
            suggestedFix: `Add "${numStr}" to your Evidence Vault with a note explaining its source, or verify it if already in the vault.`,
            blockingExport: false,
          });
        }
      });
    };

    // Summary
    checkTextNumbers(cv.summary.text, "Professional Summary", "summary-text", "unverified-summary");

    // Experience bullets
    cv.experience.forEach((exp, expIdx) => {
      exp.bullets.forEach((bullet, bulletIdx) => {
        checkTextNumbers(
          bullet,
          `Work Experience (${exp.employer || `Role #${expIdx + 1}`}): Bullet #${bulletIdx + 1}`,
          `experience-${expIdx}-bullet-${bulletIdx}`,
          `unverified-exp-${exp.id}-${bulletIdx}`
        );
      });
    });

    // Education bullets & GPA
    cv.education.forEach((edu, eduIdx) => {
      // Check GPA numeric portion
      if (edu.gpa) {
        checkTextNumbers(
          edu.gpa,
          `Education (${edu.institution || `School #${eduIdx + 1}`}): GPA`,
          `education-${eduIdx}-gpa`,
          `unverified-edu-gpa-${edu.id}`
        );
      }

      edu.bullets.forEach((bullet, bulletIdx) => {
        checkTextNumbers(
          bullet,
          `Education (${edu.institution || `School #${eduIdx + 1}`}): Bullet #${bulletIdx + 1}`,
          `education-${eduIdx}-bullet-${bulletIdx}`,
          `unverified-edu-${edu.id}-${bulletIdx}`
        );
      });
    });

    // Projects
    cv.projects.forEach((proj, projIdx) => {
      checkTextNumbers(
        proj.description,
        `Projects (${proj.name || `Project #${projIdx + 1}`})`,
        `project-${projIdx}-desc`,
        `unverified-proj-${proj.id}`
      );
    });

    // Teaching
    cv.teaching.forEach((teach, teachIdx) => {
      checkTextNumbers(
        teach.description,
        `Teaching (${teach.role || `Teaching #${teachIdx + 1}`})`,
        `teaching-${teachIdx}-desc`,
        `unverified-teach-${teach.id}`
      );
    });

    return issues;
  },
};
