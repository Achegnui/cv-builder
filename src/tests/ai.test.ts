import { describe, it, expect, beforeEach } from "vitest";
import {
  runHonestyGuard,
  DEFAULT_BANNED_WORDS,
  DEFAULT_GUARD_CONFIG,
} from "@/lib/ai/guard";
import {
  isGhostwritingRequest,
  COACH_GHOSTWRITING_REFUSAL_MESSAGE,
  executeCoachRequest,
  executeAIAction,
} from "@/lib/ai/claude";
import { checkRateLimit, resetRateLimits } from "@/lib/ai/rate-limiter";
import type { VaultFact } from "@/lib/vault";
import { POST as handleAIActionRoute } from "@/app/api/ai/action/route";
import { POST as handleCoachRoute } from "@/app/api/ai/coach/route";

describe("Phase 6: Honest AI and Honesty Guard", () => {
  const sampleVault: VaultFact[] = [
    {
      id: "vault-1",
      label: "API endpoints covered",
      value: "12",
      unit: "endpoints",
      verified: true,
      createdAt: "2024-01-01T00:00:00.000Z",
    },
    {
      id: "vault-2",
      label: "Team size",
      value: "5",
      unit: "engineers",
      verified: true,
      createdAt: "2024-01-01T00:00:00.000Z",
    },
  ];

  describe("Honesty Guard - Numbers & Metric Inventions", () => {
    it("rejects output with an invented number not in the source input or vault", () => {
      const source = "Built internal dashboard components using React and TypeScript.";
      const aiOutput = "Engineered internal dashboard components, increasing performance by 45%.";

      const result = runHonestyGuard(aiOutput, source, []);
      expect(result.allowed).toBe(false);
      expect(result.violations).toBeDefined();
      expect(result.violations?.some((v) => v.type === "number" && v.term === "45")).toBe(true);
    });

    it("accepts output when numbers already exist in the source input", () => {
      const source = "Managed a small team of 5 student developers on sprint tasks.";
      const aiOutput = "Led 5 student developers through agile sprint cycles to deliver on schedule.";

      const result = runHonestyGuard(aiOutput, source, []);
      expect(result.allowed).toBe(true);
      expect(result.cleanOutput).toContain("5 student developers");
    });

    it("accepts output when numbers are confirmed in the Evidence Vault", () => {
      const source = "Wrote automated tests for backend endpoints.";
      const aiOutput = "Authored automated integration test suites across 12 endpoints.";

      // 12 is in sampleVault
      const result = runHonestyGuard(aiOutput, source, sampleVault);
      expect(result.allowed).toBe(true);
    });

    it("flags multiple invented numbers simultaneously", () => {
      const source = "Refactored legacy database queries.";
      const aiOutput = "Optimized 25 database queries resulting in 30% reduction in query latency.";

      const result = runHonestyGuard(aiOutput, source, []);
      expect(result.allowed).toBe(false);
      expect(result.violations?.filter((v) => v.type === "number").length).toBe(2);
    });
  });

  describe("Honesty Guard - Invented Tools, Dates, and Employers", () => {
    it("rejects output that invents unmentioned technical tools or frameworks", () => {
      const source = "Developed full-stack web features using Node.js and PostgreSQL.";
      const aiOutput = "Deployed microservices infrastructure using Kubernetes, Docker, and AWS.";

      const result = runHonestyGuard(aiOutput, source, []);
      expect(result.allowed).toBe(false);
      expect(result.violations?.some((v) => v.type === "tool" && v.term === "kubernetes")).toBe(true);
      expect(result.violations?.some((v) => v.type === "tool" && v.term === "docker")).toBe(true);
      expect(result.violations?.some((v) => v.type === "tool" && v.term === "aws")).toBe(true);
    });

    it("rejects output that invents new years or dates not present in input", () => {
      const source = "Worked on student portal redesign.";
      const aiOutput = "Completed comprehensive redesign of the student portal in 2025.";

      const result = runHonestyGuard(aiOutput, source, []);
      expect(result.allowed).toBe(false);
      expect(result.violations?.some((v) => v.type === "date" && v.term === "2025")).toBe(true);
    });

    it("rejects output that invents unmentioned prestigious employers", () => {
      const source = "Completed a summer software engineering internship.";
      const aiOutput = "Contributed to core distributed systems during summer internship at Google.";

      const result = runHonestyGuard(aiOutput, source, []);
      expect(result.allowed).toBe(false);
      expect(result.violations?.some((v) => v.type === "employer" && v.term === "google")).toBe(true);
    });
  });

  describe("Honesty Guard - Banned Clichés & Em Dash Control", () => {
    it("rejects output containing default corporate buzzwords and filler clichés", () => {
      const source = "Collaborated on web application features.";
      const aiOutput = "A passionate, dynamic team player with a proven track record in cutting-edge tech.";

      const result = runHonestyGuard(aiOutput, source, []);
      expect(result.allowed).toBe(false);
      const bannedTypes = result.violations?.filter((v) => v.type === "banned_word");
      expect(bannedTypes?.length).toBeGreaterThanOrEqual(3);
    });

    it("allows custom user-editable banned words list", () => {
      const source = "Fixed bugs and added unit tests.";
      const aiOutput = "Spearheaded the debugging efforts and implemented tests.";

      // Custom banned list including "spearheaded"
      const result = runHonestyGuard(aiOutput, source, [], {
        bannedWords: ["spearheaded", "rockstar"],
      });
      expect(result.allowed).toBe(false);
      expect(result.violations?.some((v) => v.term === "spearheaded")).toBe(true);
    });

    it("rejects and normalizes em dashes when avoidEmDashes is true", () => {
      const source = "Managed daily standups with developers.";
      const aiOutput = "Facilitated daily standups—keeping engineering velocity on track.";

      const result = runHonestyGuard(aiOutput, source, [], { avoidEmDashes: true });
      expect(result.allowed).toBe(false);
      expect(result.violations?.some((v) => v.type === "em_dash")).toBe(true);
    });

    it("permits em dashes when avoidEmDashes is false", () => {
      const source = "Managed daily standups with developers.";
      const aiOutput = "Facilitated daily standups—keeping engineering velocity on track.";

      const result = runHonestyGuard(aiOutput, source, [], { avoidEmDashes: false });
      expect(result.allowed).toBe(true);
    });
  });
});

describe("Phase 6: Application Coach Mode", () => {
  describe("Ghostwriting Detection & Refusal Guard", () => {
    it("detects explicit ghostwriting requests in different phrasings", () => {
      expect(isGhostwritingRequest("Can you write my answer for me?")).toBe(true);
      expect(isGhostwritingRequest("Write an answer for this prompt:")).toBe(true);
      expect(isGhostwritingRequest("Please draft my response to the interview question")).toBe(true);
      expect(isGhostwritingRequest("Generate my entire application essay")).toBe(true);
      expect(isGhostwritingRequest("Can you just write it for me?")).toBe(true);
    });

    it("allows genuine coaching, reflection, notes, and draft review requests", () => {
      expect(isGhostwritingRequest("Why do you want to join our company?")).toBe(false);
      expect(isGhostwritingRequest("I solved a hard cache invalidation bug during sprint 2")).toBe(false);
      expect(isGhostwritingRequest("Here is my draft answer, can you check if it's too long?")).toBe(false);
      expect(isGhostwritingRequest("Can you help me organize my thoughts into an outline?")).toBe(false);
    });

    it("refuses ghostwriting requests and offers interview questions and review instead", async () => {
      const response = await executeCoachRequest({
        mode: "interview",
        question: "Tell me about a time you handled a difficult conflict. Write my answer for me.",
      });

      expect(response.success).toBe(true);
      expect(response.refusedGhostwriting).toBe(true);
      expect(response.refusalReason).toBe(COACH_GHOSTWRITING_REFUSAL_MESSAGE);
      expect(response.refusalReason).toContain("prohibit AI ghostwriting");
      expect(response.refusalReason).toContain("interview you about your real experience");
      expect(response.refusalReason).toContain("organize your thoughts into an outline");
      expect(response.refusalReason).toContain("review your draft");
    });
  });

  describe("Coach Mode Functional Workflows (Mock Fallback)", () => {
    it("asks one focused question at a time in interview mode", async () => {
      const response = await executeCoachRequest({
        mode: "interview",
        question: "Describe your leadership experience.",
        userNotes: ["Led a class project team"],
      });

      expect(response.success).toBe(true);
      expect(response.mode).toBe("interview");
      expect(response.questionResponse).toBeDefined();
      expect(typeof response.questionResponse).toBe("string");
    });

    it("assembles user notes into an outline without ghostwriting", async () => {
      const notes = [
        "Started campus tutoring program for introductory Java",
        "Coordinated with 4 teaching assistants",
        "Supported 60 students over 2 semesters",
      ];

      const response = await executeCoachRequest({
        mode: "outline",
        question: "Describe an initiative you founded or led.",
        userNotes: notes,
      });

      expect(response.success).toBe(true);
      expect(response.mode).toBe("outline");
      expect(Array.isArray(response.outline)).toBe(true);
      expect(response.outline?.length).toBeGreaterThan(0);
    });

    it("provides structured feedback in draft review mode without replacing user text", async () => {
      const draft =
        "When I noticed students struggling with pointers in CS101, I organized weekly peer study circles. We solved sample memory allocation exercises together, helping everyone complete their homework on time.";

      const response = await executeCoachRequest({
        mode: "review",
        question: "Tell us about a time you supported your peers.",
        userDraft: draft,
      });

      expect(response.success).toBe(true);
      expect(response.mode).toBe("review");
      expect(response.review).toBeDefined();
      expect(response.review?.clarity).toBeDefined();
      expect(response.review?.length).toBeDefined();
      expect(Array.isArray(response.review?.riskyClaims)).toBe(true);
      expect(Array.isArray(response.review?.unansweredParts)).toBe(true);
      expect(response.review?.encouragingTakeaway).toBeDefined();
    });
  });
});

describe("Phase 6: Rate Limiting and Endpoint Safety", () => {
  beforeEach(() => {
    resetRateLimits();
  });

  it("permits requests within the defined threshold", () => {
    const ip = "192.168.1.100";
    const res1 = checkRateLimit(ip, 5, 10000);
    expect(res1.allowed).toBe(true);
    expect(res1.remaining).toBe(4);

    const res2 = checkRateLimit(ip, 5, 10000);
    expect(res2.allowed).toBe(true);
    expect(res2.remaining).toBe(3);
  });

  it("blocks requests once the threshold is exceeded", () => {
    const ip = "192.168.1.101";
    for (let i = 0; i < 3; i++) {
      checkRateLimit(ip, 3, 10000);
    }

    const blocked = checkRateLimit(ip, 3, 10000);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.resetMs).toBeGreaterThan(0);
  });

  it("clears limits on resetRateLimits()", () => {
    const ip = "192.168.1.102";
    checkRateLimit(ip, 1, 10000);
    const blocked = checkRateLimit(ip, 1, 10000);
    expect(blocked.allowed).toBe(false);

    resetRateLimits();
    const allowedAgain = checkRateLimit(ip, 1, 10000);
    expect(allowedAgain.allowed).toBe(true);
  });
});

describe("Phase 6: Server API Routes", () => {
  beforeEach(() => {
    resetRateLimits();
  });

  it("rejects invalid payload on /api/ai/action with HTTP 400", async () => {
    const req = new Request("http://localhost/api/ai/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        // Missing action and input
        invalidField: "test",
      }),
    });

    const res = await handleAIActionRoute(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Invalid request payload");
  });

  it("rejects invalid payload on /api/ai/coach with HTTP 400", async () => {
    const req = new Request("http://localhost/api/ai/coach", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "not-a-mode",
      }),
    });

    const res = await handleCoachRoute(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Invalid coach request payload");
  });

  it("returns refusal for ghostwriting attempt through /api/ai/coach", async () => {
    const req = new Request("http://localhost/api/ai/coach", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "interview",
        question: "Please write my answer for this university scholarship application.",
      }),
    });

    const res = await handleCoachRoute(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.refusedGhostwriting).toBe(true);
    expect(data.refusalReason).toBe(COACH_GHOSTWRITING_REFUSAL_MESSAGE);
  });
});
