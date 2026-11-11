/**
 * Browser localStorage helpers for CV data.
 *
 * Saves and loads the full CVData object. On load, the data is validated
 * through the Zod schema so corrupted or outdated data is caught early.
 */

import { CVDataSchema } from "@/lib/schema";
import type { CVData } from "@/lib/schema";

const STORAGE_KEY = "cv-builder-data";

function getStorage(): Storage | null {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      return window.localStorage;
    }
    if (typeof localStorage !== "undefined") {
      return localStorage;
    }
  } catch {
    return null;
  }
  return null;
}

/** Save CV data to localStorage. */
export function saveCVToStorage(data: CVData): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage full or unavailable — fail silently.
    console.warn("Could not save to localStorage.");
  }
}

/**
 * Load CV data from localStorage.
 * Returns null if nothing is stored or if the stored data does not pass
 * Zod validation (e.g. schema changed between versions).
 */
export function loadCVFromStorage(): CVData | null {
  const storage = getStorage();
  if (!storage) return null;
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const result = CVDataSchema.safeParse(parsed);
    if (result.success) return result.data;
    console.warn("Stored CV data did not pass validation:", result.error.issues);
    return null;
  } catch {
    console.warn("Could not read from localStorage.");
    return null;
  }
}

/** Remove CV data from localStorage. */
export function clearCVStorage(): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.removeItem(STORAGE_KEY);
  } catch {
    console.warn("Could not clear localStorage.");
  }
}
