import type { CVData } from "@/lib/schema";
import type { VaultFact } from "@/lib/vault";

export type ValidationSeverity = "error" | "warning" | "info";

export interface ValidationIssue {
  id: string;
  checkId:
    | "dates"
    | "duplicates"
    | "repeated-content"
    | "conflicts"
    | "labels"
    | "bullet-styles"
    | "placeholders"
    | "unverified-numbers";
  severity: ValidationSeverity;
  location: string;
  fieldId?: string;
  message: string;
  suggestedFix: string;
  blockingExport: boolean;
}

export interface ValidationContext {
  vault: VaultFact[];
  todayDate?: string; // YYYY-MM string for testing consistency, defaults to current month
}

export interface ValidationRule {
  id: ValidationIssue["checkId"];
  name: string;
  description: string;
  run: (cv: CVData, context: ValidationContext) => ValidationIssue[];
}
