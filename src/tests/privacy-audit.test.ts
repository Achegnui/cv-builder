/**
 * @file privacy-audit.test.ts
 * Tests for Phase 8c: Privacy, Zero-Logging Enforcement, Canary Leak Detection,
 * and EU Essential Storage Consent Logic.
 *
 * Rules verified:
 * - AGENTS.md Rule 5: "Do not log CV content or AI inputs. Do not send CV content to analytics.
 *   Collect only the data a CV needs. Never store government ID numbers or card details."
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { POST as handleAIAction } from "@/app/api/ai/action/route";
import { POST as handleCoach } from "@/app/api/ai/coach/route";
import { POST as handleTailor } from "@/app/api/ai/tailor/route";
import { POST as handleDocxExport } from "@/app/api/export/docx/route";
import { SAMPLE_CV } from "@/lib/schema";
import { DEFAULT_STYLE_CONFIG } from "@/lib/templates";
import { CONSENT_STORAGE_KEY } from "@/components/privacy";

// Unique canary strings to detect any unintended leaks in server logs
const CANARY_NAME = "CANARY_AMINA_NDONGO_XYZ";
const CANARY_EMPLOYER = "CANARY_SILICON_MOUNTAIN_LABS_DOUALA";
const CANARY_BULLET = "CANARY_Engineered_realtime_mobile_money_switch_handling_95000_txns";
const CANARY_POSTING = "CANARY_JOB_POSTING_Fintech_Platform_Lead_Yaounde_Cameroon";
const CANARY_QUESTION = "CANARY_How_did_you_coordinate_the_14_member_payment_squad";

describe("Phase 8c: Zero-Logging & Privacy Audit", () => {
  let logSpy: ReturnType<typeof vi.spyOn>;
  let infoSpy: ReturnType<typeof vi.spyOn>;
  let warnSpy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
    infoSpy.mockRestore();
    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });

  function getCombinedLogOutput(): string {
    const allCalls = [
      ...logSpy.mock.calls,
      ...infoSpy.mock.calls,
      ...warnSpy.mock.calls,
      ...errorSpy.mock.calls,
    ];
    return allCalls.map((args) => args.map(String).join(" ")).join("\n");
  }

  describe("Server Routes Zero-Log Verification", () => {
    it("does not log CV text or inputs during /api/ai/action execution", async () => {
      const payload = {
        action: "improve-bullet",
        input: CANARY_BULLET,
        context: {
          employer: CANARY_EMPLOYER,
          jobTitle: "Principal Engineer",
        },
      };

      const request = new Request("http://localhost:3000/api/ai/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const response = await handleAIAction(request);
      expect(response.status).toBeLessThan(500);

      const logs = getCombinedLogOutput();
      expect(logs).not.toContain(CANARY_BULLET);
      expect(logs).not.toContain(CANARY_EMPLOYER);
      expect(logs).not.toContain(CANARY_NAME);
    });

    it("does not log user phrases or coaching notes during /api/ai/coach execution", async () => {
      const payload = {
        mode: "interview",
        question: CANARY_QUESTION,
        userNotes: [CANARY_BULLET, "Delivered project in 3 weeks"],
      };

      const request = new Request("http://localhost:3000/api/ai/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const response = await handleCoach(request);
      expect(response.status).toBeLessThan(500);

      const logs = getCombinedLogOutput();
      expect(logs).not.toContain(CANARY_QUESTION);
      expect(logs).not.toContain(CANARY_BULLET);
    });

    it("does not log job posting text or candidate experience during /api/ai/tailor execution", async () => {
      const canaryCV = {
        ...SAMPLE_CV,
        profile: {
          ...SAMPLE_CV.profile,
          fullName: CANARY_NAME,
        },
        experience: [
          {
            id: "work-canary",
            title: "Senior Architect",
            employer: CANARY_EMPLOYER,
            startDate: "2022-01",
            isCurrent: true,
            bullets: [CANARY_BULLET],
          },
        ],
      };

      const payload = {
        jobPostingText: CANARY_POSTING,
        cvData: canaryCV,
      };

      const request = new Request("http://localhost:3000/api/ai/tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const response = await handleTailor(request);
      expect(response.status).toBeLessThan(500);

      const logs = getCombinedLogOutput();
      expect(logs).not.toContain(CANARY_POSTING);
      expect(logs).not.toContain(CANARY_NAME);
      expect(logs).not.toContain(CANARY_EMPLOYER);
      expect(logs).not.toContain(CANARY_BULLET);
    });

    it("does not log CV content during DOCX export generation", async () => {
      const canaryCV = {
        ...SAMPLE_CV,
        profile: {
          ...SAMPLE_CV.profile,
          fullName: CANARY_NAME,
        },
        experience: [
          {
            id: "work-canary-export",
            title: "Lead Engineer",
            employer: CANARY_EMPLOYER,
            startDate: "2021-01",
            endDate: "2023-01",
            isCurrent: false,
            bullets: [CANARY_BULLET],
          },
        ],
      };

      const request = new Request("http://localhost:3000/api/export/docx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: canaryCV,
          style: DEFAULT_STYLE_CONFIG,
        }),
      });

      const response = await handleDocxExport(request);
      expect(response.status).toBe(200);

      const logs = getCombinedLogOutput();
      expect(logs).not.toContain(CANARY_NAME);
      expect(logs).not.toContain(CANARY_EMPLOYER);
      expect(logs).not.toContain(CANARY_BULLET);
    });

    it("does not leak payload data in error paths when export fails validation", async () => {
      const canaryCVWithPlaceholder = {
        ...SAMPLE_CV,
        profile: {
          ...SAMPLE_CV.profile,
          fullName: CANARY_NAME,
        },
        experience: [
          {
            id: "work-placeholder",
            title: "Developer",
            employer: CANARY_EMPLOYER,
            startDate: "2021-01",
            endDate: "2023-01",
            isCurrent: false,
            bullets: ["[add number] metrics for CANARY_BULLET"],
          },
        ],
      };

      const request = new Request("http://localhost:3000/api/export/docx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: canaryCVWithPlaceholder,
          style: DEFAULT_STYLE_CONFIG,
        }),
      });

      const response = await handleDocxExport(request);
      // Placeholders block export with 422
      expect(response.status).toBe(422);

      const logs = getCombinedLogOutput();
      expect(logs).not.toContain(CANARY_NAME);
      expect(logs).not.toContain(CANARY_EMPLOYER);
      expect(logs).not.toContain(CANARY_BULLET);
    });
  });

  describe("EU Consent & Essential Storage Logic", () => {
    it("uses the standardized cookie consent storage key", () => {
      expect(CONSENT_STORAGE_KEY).toBe("cv_builder_cookie_consent");
    });
  });

  describe("Data Minimization Principle", () => {
    it("ensures sample data contains no government IDs, passwords, or credit card numbers", () => {
      const serialized = JSON.stringify(SAMPLE_CV);
      // Verify no sensitive identity fields exist
      expect(serialized).not.toContain("ssn");
      expect(serialized).not.toContain("socialSecurity");
      expect(serialized).not.toContain("passportNumber");
      expect(serialized).not.toContain("nationalId");
      expect(serialized).not.toContain("cardNumber");
      expect(serialized).not.toContain("cvv");
      expect(serialized).not.toContain("password");
    });
  });
});
