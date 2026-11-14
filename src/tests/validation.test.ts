import { describe, it, expect } from "vitest";
import {
  runCVDoctor,
  hasBlockingIssues,
  getBlockingIssues,
  BROKEN_SAMPLE_CV,
  checkDates,
  checkDuplicates,
  checkRepeatedContent,
  checkConflictingClaims,
  checkLabelErrors,
  checkBulletStyles,
  checkPlaceholders,
  checkUnverifiedNumbers,
} from "@/lib/validation";
import { SAMPLE_CV } from "@/lib/schema";
import { SAMPLE_VAULT_FACTS, createVaultFact } from "@/lib/vault";
import { POST } from "@/app/api/export/docx/route";
import { DEFAULT_STYLE_CONFIG } from "@/lib/templates";

describe("Phase 5: CV Doctor & Evidence Vault", () => {
  it("triggers every one of the 8 checks on the deliberately broken sample CV", () => {
    // Run all checks on BROKEN_SAMPLE_CV with an empty vault
    const issues = runCVDoctor(BROKEN_SAMPLE_CV, { vault: [], todayDate: "2026-11" });

    // 1. Date check
    const dateIssues = issues.filter((i) => i.checkId === "dates");
    expect(dateIssues.length).toBeGreaterThan(0);
    expect(dateIssues.some((i) => i.message.includes("in the future"))).toBe(true);

    // 2. Duplicate entries check
    const dupIssues = issues.filter((i) => i.checkId === "duplicates");
    expect(dupIssues.length).toBeGreaterThan(0);
    expect(dupIssues.some((i) => i.message.includes("Broken Fictional Corp"))).toBe(true);

    // 3. Repeated content check
    const repeatIssues = issues.filter((i) => i.checkId === "repeated-content");
    expect(repeatIssues.length).toBeGreaterThan(0);
    expect(repeatIssues.some((i) => i.message.includes("repeats wording already present in your Summary"))).toBe(true);

    // 4. Conflicting claims check
    const conflictIssues = issues.filter((i) => i.checkId === "conflicts");
    expect(conflictIssues.length).toBeGreaterThan(0);
    expect(conflictIssues.some((i) => i.message.includes("Conflicting achievement claims"))).toBe(true);

    // 5. Label errors check
    const labelIssues = issues.filter((i) => i.checkId === "labels");
    expect(labelIssues.length).toBeGreaterThan(0);
    expect(labelIssues.some((i) => i.message.includes("degree classification rather than a numerical GPA"))).toBe(true);

    // 6. Bullet styles check
    const bulletIssues = issues.filter((i) => i.checkId === "bullet-styles");
    expect(bulletIssues.length).toBeGreaterThan(0);
    expect(bulletIssues.some((i) => i.message.includes("Mixed ending punctuation"))).toBe(true);

    // 7. Unfinished placeholders check (blocking)
    const placeholderIssues = issues.filter((i) => i.checkId === "placeholders");
    expect(placeholderIssues.length).toBeGreaterThan(0);
    expect(placeholderIssues.some((i) => i.blockingExport === true)).toBe(true);
    expect(placeholderIssues.some((i) => i.message.includes("[add number]"))).toBe(true);

    // 8. Missing vault numbers check
    const vaultIssues = issues.filter((i) => i.checkId === "unverified-numbers");
    expect(vaultIssues.length).toBeGreaterThan(0);
    expect(vaultIssues.some((i) => i.message.includes("999"))).toBe(true);
  });

  it("produces zero errors and zero warnings on clean sample CV with verified vault facts", () => {
    // Run validation on the clean SAMPLE_CV with its verified facts
    const issues = runCVDoctor(SAMPLE_CV, {
      vault: SAMPLE_VAULT_FACTS,
      todayDate: "2026-11",
    });

    // There should be no blocking errors and no warnings
    const blocking = getBlockingIssues(issues);
    expect(blocking.length).toBe(0);
    expect(hasBlockingIssues(issues)).toBe(false);

    const warnings = issues.filter((i) => i.severity === "warning" || i.severity === "error");
    expect(warnings.length).toBe(0);
  });

  it("flags unverified numbers in text when the vault is empty", () => {
    // When the vault is empty, numbers in SAMPLE_CV (e.g. 12, 5, 8, 45) must be flagged
    const issues = checkUnverifiedNumbers.run(SAMPLE_CV, { vault: [] });
    expect(issues.length).toBeGreaterThanOrEqual(4);

    const numbersFlagged = issues.map((i) => i.message);
    expect(numbersFlagged.some((msg) => msg.includes('"12"'))).toBe(true);
    expect(numbersFlagged.some((msg) => msg.includes('"5"'))).toBe(true);
    expect(numbersFlagged.some((msg) => msg.includes('"8"'))).toBe(true);
    expect(numbersFlagged.some((msg) => msg.includes('"45"'))).toBe(true);
  });

  it("resolves unverified number warning once verified fact is added to vault", () => {
    // Add verified fact for 12 endpoints
    const customVault = [createVaultFact("API Endpoints", "12", "endpoints", "Tests", true)];
    const issues = checkUnverifiedNumbers.run(SAMPLE_CV, { vault: customVault });

    // 12 should no longer be flagged
    const has12Flagged = issues.some((i) => i.message.includes('"12"'));
    expect(has12Flagged).toBe(false);
  });

  it("strictly blocks export when placeholders like [add number] exist", () => {
    const issues = runCVDoctor(BROKEN_SAMPLE_CV, { vault: [] });
    expect(hasBlockingIssues(issues)).toBe(true);

    const blocking = getBlockingIssues(issues);
    expect(blocking.length).toBeGreaterThan(0);
    expect(blocking.every((i) => i.blockingExport)).toBe(true);
  });

  it("export API route rejects CV containing placeholders with HTTP 422 Unprocessable Entity", async () => {
    const request = new Request("http://localhost:3000/api/export/docx", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: BROKEN_SAMPLE_CV,
        style: DEFAULT_STYLE_CONFIG,
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(422);

    const json = await response.json();
    expect(json.error).toMatch(/Export blocked/i);
    expect(json.blockingIssues.length).toBeGreaterThan(0);
  });

  it("export API route succeeds with HTTP 200 for clean CV without placeholders", async () => {
    const request = new Request("http://localhost:3000/api/export/docx", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: SAMPLE_CV,
        style: DEFAULT_STYLE_CONFIG,
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe(
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
  });
});
