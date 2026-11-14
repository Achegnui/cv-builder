import type { CVData } from "@/lib/schema";
import type { ValidationIssue, ValidationContext, ValidationRule } from "./types";
import { checkDates } from "./rules/dates";
import { checkDuplicates } from "./rules/duplicates";
import { checkRepeatedContent } from "./rules/repeated-content";
import { checkConflictingClaims } from "./rules/conflicts";
import { checkLabelErrors } from "./rules/labels";
import { checkBulletStyles } from "./rules/bullet-styles";
import { checkPlaceholders } from "./rules/placeholders";
import { checkUnverifiedNumbers } from "./rules/vault-numbers";

/**
 * Standard registry of the 8 validation checks for CV Doctor.
 * Easy to extend by adding new rules to this array.
 */
export const CV_DOCTOR_RULES: ValidationRule[] = [
  checkPlaceholders,        // Placeholders check (blocking)
  checkDates,               // Date chronology & future dates check
  checkDuplicates,          // Duplicate organization & role detection
  checkRepeatedContent,     // Repeated text / bullet redundancy
  checkConflictingClaims,   // Conflicting metrics or achievements
  checkLabelErrors,         // GPA vs Degree Classification label placement
  checkBulletStyles,        // Bullet punctuation consistency
  checkUnverifiedNumbers,   // Evidence Vault unverified number check
];

/**
 * Runs all active CV Doctor rules against a CVData object.
 * Returns issues sorted with errors first, then warnings, then info.
 */
export function runCVDoctor(cv: CVData, context: ValidationContext): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  for (const rule of CV_DOCTOR_RULES) {
    try {
      const ruleIssues = rule.run(cv, context);
      issues.push(...ruleIssues);
    } catch (err) {
      console.error(`Error running validation rule "${rule.name}":`, err);
    }
  }

  // Sort severity: "error" (priority 1) > "warning" (priority 2) > "info" (priority 3)
  const severityRank: Record<string, number> = {
    error: 1,
    warning: 2,
    info: 3,
  };

  return issues.sort((a, b) => {
    const rankDiff = (severityRank[a.severity] || 9) - (severityRank[b.severity] || 9);
    if (rankDiff !== 0) return rankDiff;
    return a.location.localeCompare(b.location);
  });
}

/**
 * Checks whether any validation issues block document export.
 * Per AGENTS.md rule 3, unresolved placeholders block export.
 */
export function hasBlockingIssues(issues: ValidationIssue[]): boolean {
  return issues.some((issue) => issue.blockingExport);
}

/**
 * Convenience helper to filter out only export-blocking issues
 */
export function getBlockingIssues(issues: ValidationIssue[]): ValidationIssue[] {
  return issues.filter((issue) => issue.blockingExport);
}
