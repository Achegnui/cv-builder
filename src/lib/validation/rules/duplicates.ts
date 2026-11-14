import type { ValidationRule, ValidationIssue } from "../types";
import type { CVData } from "@/lib/schema";

export const checkDuplicates: ValidationRule = {
  id: "duplicates",
  name: "Duplicate or Near-Duplicate Entries",
  description: "Detects duplicate organizations or roles that should be merged",
  run(cv: CVData): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Experience entries comparison
    for (let i = 0; i < cv.experience.length; i++) {
      for (let j = i + 1; j < cv.experience.length; j++) {
        const a = cv.experience[i];
        const b = cv.experience[j];

        const normEmpA = a.employer.trim().toLowerCase();
        const normEmpB = b.employer.trim().toLowerCase();

        if (normEmpA && normEmpB && normEmpA === normEmpB) {
          issues.push({
            id: `dup-exp-${a.id}-${b.id}`,
            checkId: "duplicates",
            severity: "warning",
            location: `Work Experience: multiple entries for "${a.employer}"`,
            fieldId: `experience-${j}-employer`,
            message: `Found duplicate or near-duplicate entries for "${a.employer}".`,
            suggestedFix:
              "Is this one role across two periods (merge into one entry) or an accidental duplicate?",
            blockingExport: false,
          });
        }
      }
    }

    // Education entries comparison
    for (let i = 0; i < cv.education.length; i++) {
      for (let j = i + 1; j < cv.education.length; j++) {
        const a = cv.education[i];
        const b = cv.education[j];

        const normInstA = a.institution.trim().toLowerCase();
        const normInstB = b.institution.trim().toLowerCase();
        const normDegA = a.degree.trim().toLowerCase();
        const normDegB = b.degree.trim().toLowerCase();

        if (normInstA && normInstB && normInstA === normInstB && normDegA === normDegB) {
          issues.push({
            id: `dup-edu-${a.id}-${b.id}`,
            checkId: "duplicates",
            severity: "warning",
            location: `Education: duplicate entries for "${a.institution}" (${a.degree})`,
            fieldId: `education-${j}-institution`,
            message: `Found duplicate education entries for "${a.institution}".`,
            suggestedFix: "Remove the duplicate entry or combine coursework/bullets.",
            blockingExport: false,
          });
        }
      }
    }

    return issues;
  },
};
