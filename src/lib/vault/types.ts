/**
 * Evidence Vault Types
 *
 * Tracks user-verified facts (numbers, metrics, tools, results) to support
 * truthful CV claims without inventing data.
 */

export interface VaultFact {
  id: string;
  label: string;       // e.g. "API Endpoints Covered", "Team Size", "Knowledge Base Users"
  value: string;       // e.g. "12", "5", "8", "45", "3.6", "40%"
  unit?: string;       // e.g. "endpoints", "engineers", "users", "students", "%", "$"
  note?: string;       // Optional context or evidence source (e.g. "From Jira ticket / Sprint 12")
  verified: boolean;   // User-controlled confirmation flag
  createdAt: string;   // ISO timestamp string
}

export interface UnverifiedNumberFinding {
  number: string;
  location: string;
  surroundingText: string;
}
