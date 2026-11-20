import type { VaultFact } from "@/lib/vault";

export type AIActionType =
  | "improve-bullet"
  | "draft-summary"
  | "group-skills"
  | "explain-warning"
  | "suggest-questions";

export type CoachModeType = "interview" | "outline" | "review";

export interface HonestyGuardConfig {
  bannedWords: string[];
  avoidEmDashes: boolean;
}

export interface GuardViolation {
  type: "number" | "tool" | "employer" | "date" | "banned_word" | "em_dash";
  term: string;
  details: string;
}

export interface GuardResult {
  allowed: boolean;
  cleanOutput?: string;
  reason?: string;
  violations?: GuardViolation[];
}

export interface AIActionRequest {
  action: AIActionType;
  input: string;
  context?: {
    employer?: string;
    jobTitle?: string;
    vaultFacts?: VaultFact[];
    warningMessage?: string;
  };
  config?: Partial<HonestyGuardConfig>;
}

export interface AIActionResponse {
  success: boolean;
  action: AIActionType;
  originalInput: string;
  suggestedOutput?: string;
  error?: string;
  guardViolations?: GuardViolation[];
}

export interface CoachRequest {
  mode: CoachModeType;
  question: string;
  userNotes?: string[];
  userDraft?: string;
  history?: Array<{ role: "user" | "coach"; content: string }>;
}

export interface CoachReviewFeedback {
  clarity: string;
  length: string;
  riskyClaims: string[];
  unansweredParts: string[];
  encouragingTakeaway: string;
}

export interface CoachResponse {
  success: boolean;
  mode: CoachModeType;
  refusedGhostwriting?: boolean;
  refusalReason?: string;
  questionResponse?: string;
  outline?: string[];
  review?: CoachReviewFeedback;
  error?: string;
}
