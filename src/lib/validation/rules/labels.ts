import type { ValidationRule, ValidationIssue } from "../types";
import type { CVData } from "@/lib/schema";

/**
 * Checks for label/field misplacement:
 * - GPA field filled with an honours classification (e.g. "First Class Honours", "2:1", "Merit", "Distinction")
 * - Degree classification field filled with a numerical GPA (e.g. "3.8/4.0")
 */
export const checkLabelErrors: ValidationRule = {
  id: "labels",
  name: "Field & Label Misplacement",
  description: "Detects classification terms placed in GPA fields or vice versa",
  run(cv: CVData): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Common UK/Commonwealth degree classification terms
    const classificationTerms = [
      "first class",
      "first-class",
      "upper second",
      "lower second",
      "2:1",
      "2.1",
      "2:2",
      "2.2",
      "third class",
      "distinction",
      "merit",
      "pass",
      "honours",
      "honors",
    ];

    cv.education.forEach((edu, idx) => {
      const gpa = (edu.gpa || "").trim();
      const classification = (edu.degreeClassification || "").trim();

      // Check if GPA field contains degree classification text
      if (gpa) {
        const lowerGpa = gpa.toLowerCase();
        const foundTerm = classificationTerms.find((term) => lowerGpa.includes(term));
        if (foundTerm) {
          issues.push({
            id: `label-gpa-misplaced-${edu.id}`,
            checkId: "labels",
            severity: "warning",
            location: `Education (${edu.institution || `School #${idx + 1}`}): GPA field`,
            fieldId: `education-${idx}-gpa`,
            message: `The GPA field contains "${gpa}", which appears to be a degree classification rather than a numerical GPA.`,
            suggestedFix:
              'Move this to the "Degree Classification" field (e.g. First Class Honours, 2:1) and leave GPA for numerical scores (e.g. 3.8/4.0).',
            blockingExport: false,
          });
        }
      }

      // Check if degreeClassification field contains a pure numerical score like 3.8/4.0
      if (classification) {
        const isNumericGpa = /^\d(?:\.\d+)?(?:\s*\/\s*\d(?:\.\d+)?)?$/.test(classification);
        if (isNumericGpa) {
          issues.push({
            id: `label-classification-misplaced-${edu.id}`,
            checkId: "labels",
            severity: "warning",
            location: `Education (${edu.institution || `School #${idx + 1}`}): Degree Classification field`,
            fieldId: `education-${idx}-classification`,
            message: `The Degree Classification field contains "${classification}", which appears to be a numerical GPA.`,
            suggestedFix:
              'Move this score to the "GPA" field and use Classification for honours distinctions (e.g. First Class).',
            blockingExport: false,
          });
        }
      }
    });

    return issues;
  },
};
