import type { VaultFact } from "./types";

export * from "./types";

export const VAULT_STORAGE_KEY = "cv-builder-vault";

/**
 * Sample pre-verified vault facts corresponding to SAMPLE_CV numbers.
 * Allows the clean sample CV to pass validation with 0 unverified number warnings.
 */
export const SAMPLE_VAULT_FACTS: VaultFact[] = [
  {
    id: "vault-1",
    label: "API Endpoints Covered",
    value: "12",
    unit: "endpoints",
    note: "Covered in internal dashboard unit test suite (Sprint 4)",
    verified: true,
    createdAt: "2024-07-15T10:00:00.000Z",
  },
  {
    id: "vault-2",
    label: "Internship Engineering Team Size",
    value: "5",
    unit: "engineers",
    note: "Frontend & backend developers on support dashboard team",
    verified: true,
    createdAt: "2024-06-20T10:00:00.000Z",
  },
  {
    id: "vault-3",
    label: "Help Desk Knowledge Base Users",
    value: "8",
    unit: "team members",
    note: "Campus IT student technician shift team",
    verified: true,
    createdAt: "2023-10-01T10:00:00.000Z",
  },
  {
    id: "vault-4",
    label: "Undergraduate Cumulative GPA",
    value: "3.6",
    unit: "GPA",
    note: "Official university transcript on 4.0 scale",
    verified: true,
    createdAt: "2024-05-30T10:00:00.000Z",
  },
  {
    id: "vault-5",
    label: "CS101 Class Size",
    value: "45",
    unit: "students",
    note: "Department enrollment registrar roster for Spring 2024",
    verified: true,
    createdAt: "2024-02-01T10:00:00.000Z",
  },
];

/**
 * Extracts quantifiable metrics and claims from a sentence/bullet,
 * filtering out dates, years (1900-2099), course numbers like CS101, and pure punctuation.
 */
export function extractClaimNumbers(text: string): string[] {
  if (!text) return [];

  // Match numbers including decimals and percentages, e.g. "12", "3.6", "45", "100%", "2,500"
  // Avoid matches preceded by characters (e.g. CS101) or part of dates (2024-06)
  const regex = /(?<![A-Za-z0-9_-])(?:\$|£|€)?(\d+(?:[.,]\d+)?%?)(?![A-Za-z0-9_-])/g;
  const matches: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const rawVal = match[1];
    // Clean trailing percentage or commas
    const normalized = rawVal.replace(/%/g, "").replace(/,/g, "");

    // Exclude 4-digit years (1950 - 2040)
    const asNum = parseFloat(normalized);
    if (!isNaN(asNum) && asNum >= 1950 && asNum <= 2040 && Number.isInteger(asNum)) {
      continue;
    }

    // Exclude standard GPA scale denominator "4.0" if part of "3.6/4.0"
    if (normalized === "4.0" || normalized === "4") {
      if (text.includes("/4.0") || text.includes("/4")) {
        continue;
      }
    }

    if (!matches.includes(normalized)) {
      matches.push(normalized);
    }
  }

  return matches;
}

/**
 * Checks whether a given number string matches any verified fact in the vault.
 */
export function isNumberVerifiedInVault(numStr: string, vault: VaultFact[]): boolean {
  const target = parseFloat(numStr);
  if (isNaN(target)) return false;

  return vault.some((fact) => {
    if (!fact.verified) return false;
    const factVal = parseFloat(fact.value.replace(/%/g, "").replace(/,/g, ""));
    return !isNaN(factVal) && factVal === target;
  });
}

/**
 * Browser storage helpers for Evidence Vault
 */
export function loadVaultFromStorage(): VaultFact[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(VAULT_STORAGE_KEY);
    if (!stored) return SAMPLE_VAULT_FACTS;
    return JSON.parse(stored) as VaultFact[];
  } catch {
    return SAMPLE_VAULT_FACTS;
  }
}

export function saveVaultToStorage(vault: VaultFact[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(vault));
  } catch {
    // Storage quota or private browsing error
  }
}

export function createVaultFact(
  label: string,
  value: string,
  unit = "",
  note = "",
  verified = true
): VaultFact {
  return {
    id: `vault-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    label: label.trim(),
    value: value.trim(),
    unit: unit.trim(),
    note: note.trim(),
    verified,
    createdAt: new Date().toISOString(),
  };
}
