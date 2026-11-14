import type { ValidationRule, ValidationIssue, ValidationContext } from "../types";
import type { CVData } from "@/lib/schema";

export const checkDates: ValidationRule = {
  id: "dates",
  name: "Date Validation & Chronology",
  description: "Checks date order and detects future dates on finished positions",
  run(cv: CVData, context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const today = context.todayDate || new Date().toISOString().slice(0, 7); // "YYYY-MM"

    // Check experience dates
    cv.experience.forEach((exp, idx) => {
      const fieldPrefix = `experience-${idx}`;
      const location = `Work Experience (${exp.employer || `Role #${idx + 1}`})`;

      if (exp.startDate && exp.endDate && exp.startDate > exp.endDate) {
        issues.push({
          id: `date-order-exp-${exp.id}`,
          checkId: "dates",
          severity: "error",
          location,
          fieldId: `${fieldPrefix}-dates`,
          message: `Start date (${exp.startDate}) is after end date (${exp.endDate}).`,
          suggestedFix: "Ensure the start date comes before or is identical to the end date.",
          blockingExport: false,
        });
      }

      if (exp.endDate && !exp.isCurrent && exp.endDate > today) {
        issues.push({
          id: `date-future-exp-${exp.id}`,
          checkId: "dates",
          severity: "warning",
          location,
          fieldId: `${fieldPrefix}-endDate`,
          message: `End date (${exp.endDate}) is in the future, but this role is not marked as current.`,
          suggestedFix: "If you currently work here, check 'I currently work here'. If not, set the actual end date.",
          blockingExport: false,
        });
      }
    });

    // Check education dates
    cv.education.forEach((edu, idx) => {
      const fieldPrefix = `education-${idx}`;
      const location = `Education (${edu.institution || `School #${idx + 1}`})`;

      if (edu.startDate && edu.endDate && edu.startDate > edu.endDate) {
        issues.push({
          id: `date-order-edu-${edu.id}`,
          checkId: "dates",
          severity: "error",
          location,
          fieldId: `${fieldPrefix}-dates`,
          message: `Start date (${edu.startDate}) is after graduation date (${edu.endDate}).`,
          suggestedFix: "Check enrollment and completion dates.",
          blockingExport: false,
        });
      }

      // If finished education (not expected) has a future end date
      if (edu.endDate && !edu.isExpected && edu.endDate > today) {
        issues.push({
          id: `date-future-edu-${edu.id}`,
          checkId: "dates",
          severity: "warning",
          location,
          fieldId: `${fieldPrefix}-endDate`,
          message: `Graduation date (${edu.endDate}) is in the future, but is not marked as expected.`,
          suggestedFix: "Check 'Expected graduation' if you have not finished your studies yet.",
          blockingExport: false,
        });
      }
    });

    return issues;
  },
};
