/**
 * JSON import/export for CV data backup.
 *
 * Export triggers a browser file download. Import reads a File object,
 * parses JSON, and validates through Zod before returning.
 */

import { CVDataSchema } from "@/lib/schema";
import type { CVData } from "@/lib/schema";

/**
 * Trigger a JSON file download in the browser containing the CV data.
 */
export function exportCVToJSON(data: CVData): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "cv-backup.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Read a JSON file selected by the user and validate it as CVData.
 * Returns the parsed data on success, or throws an error with details.
 */
export async function importCVFromJSON(
  file: File
): Promise<CVData> {
  const text = await file.text();

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("The file is not valid JSON.");
  }

  const result = CVDataSchema.safeParse(parsed);
  if (!result.success) {
    const messages = result.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`The file does not match the CV format:\n${messages}`);
  }

  return result.data;
}
