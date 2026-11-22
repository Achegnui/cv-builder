import type { CVData } from "@/lib/schema";
import type { VaultFact } from "@/lib/vault";

export type MatchStrength = "strong" | "partial" | "gap";

export type FitLabel = "strong fit" | "stretch" | "long shot";

export interface JobRequirementItem {
  id: string;
  category: "skill" | "tool" | "experience" | "education" | "location" | "timezone";
  text: string;
  isPreferred?: boolean; // false = required, true = nice-to-have
}

export interface ExtractedJobPosting {
  title: string;
  company?: string;
  location?: string;
  timezone?: string;
  minYearsExperience?: number;
  requiredSkills: string[];
  preferredSkills: string[];
  toolsAndTechnologies: string[];
  rawPosting: string;
}

export interface RequirementMatch {
  requirement: JobRequirementItem;
  strength: MatchStrength;
  evidence: string; // Plain-language explanation of matched user facts or why it's a gap
  sourceLocation?: string; // e.g. "Experience: Acme Corp", "Skills: Languages", "Vault"
}

export interface TailoredBulletProposal {
  id: string;
  entryType: "experience" | "project";
  entryIndex: number;
  bulletIndex: number;
  originalText: string;
  proposedText: string;
  keywordEmphasized?: string;
  accepted: boolean;
  guardPassed: boolean;
  guardViolationReason?: string;
}

export interface FitCheckResult {
  fitLabel: FitLabel; // "strong fit" | "stretch" | "long shot"
  reasons: string[]; // Specific factors that determined this label
  summary: string; // Plain-language overall assessment
  keyStrengths: string[];
  plainGaps: string[]; // Explicit honest gaps
  honestNextSteps: string[]; // Recommended short courses, target role adjustments, bridge projects
  candidateYearsOfExperience: number;
  requiredYearsOfExperience?: number;
}

export interface CoverLetterOutline {
  openingMissionTie: string;
  gapTransparencyStatement: string;
  concreteEvidenceSection: string[];
  fastLearningProof: string;
  professionalClose: string;
}

export interface SalaryRangeInfo {
  country: string;
  level: "intern" | "junior" | "mid" | "senior" | "lead";
  currency: string;
  available: boolean;
  min?: number;
  max?: number;
  period?: "year" | "month";
  formattedRange: string;
  sourceName: string;
  sourceUrl?: string;
  retrievedDate?: string;
  disclaimer: string;
  noDataReason?: string;
}

export interface JobTailoringState {
  posting: ExtractedJobPosting | null;
  matches: RequirementMatch[];
  tailoredBullets: TailoredBulletProposal[];
  fitCheck: FitCheckResult | null;
  coverLetterOutline: CoverLetterOutline | null;
  salaryInfo: SalaryRangeInfo | null;
}
