import { NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit } from "@/lib/ai/rate-limiter";
import {
  extractJobRequirements,
  matchRequirements,
  generateFitCheck,
  generateTailoredBulletProposals,
  generateCoverLetterOutline,
  getSalaryBenchmark,
} from "@/lib/tailoring";

const TailorRequestSchema = z.object({
  jobPostingText: z.string().min(10, "Job posting text is too short").max(20000),
  cvData: z.any(), // Validated CVData
  vaultFacts: z
    .array(
      z.object({
        id: z.string(),
        label: z.string(),
        value: z.string(),
        unit: z.string().optional(),
        note: z.string().optional(),
        verified: z.boolean(),
        createdAt: z.string(),
      })
    )
    .optional(),
  salaryOptions: z
    .object({
      countryCode: z.string().default("US"),
      level: z.enum(["intern", "junior", "mid", "senior", "lead"]).default("junior"),
      currency: z.string().optional(),
    })
    .optional(),
});

export async function POST(request: Request) {
  try {
    // 1. Sliding window rate limit
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "anonymous-tailor-client";

    const rateLimit = checkRateLimit(ip, 20, 60000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded. Please wait a moment before sending more job tailoring requests.",
          retryAfterMs: rateLimit.resetMs,
        },
        { status: 429 }
      );
    }

    // 2. Validate request payload
    const body = await request.json();
    const parseResult = TailorRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Invalid job tailoring request payload",
          details: parseResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { jobPostingText, cvData, vaultFacts = [], salaryOptions } = parseResult.data;

    // 3. Extract requirements (untrusted text sanitized)
    const posting = extractJobRequirements(jobPostingText);

    // 4. Match requirements to user's CV data and Evidence Vault
    const matches = matchRequirements(posting, cvData, vaultFacts);

    // 5. Generate honest fit check & next steps (factoring in YOE)
    const fitCheck = generateFitCheck(matches, cvData, posting);

    // 6. Generate tailored bullet proposals with Honesty Guard validation
    const tailoredBullets = generateTailoredBulletProposals(cvData, posting, matches, vaultFacts);

    // 7. Generate structured cover letter outline
    const coverLetterOutline = generateCoverLetterOutline(posting, matches, cvData);

    // 8. Generate sourced salary benchmark
    const countryCode = salaryOptions?.countryCode || "US";
    const level = salaryOptions?.level || "junior";
    const currency = salaryOptions?.currency;
    const salaryInfo = getSalaryBenchmark(countryCode, level, currency);

    return NextResponse.json({
      success: true,
      posting,
      matches,
      fitCheck,
      tailoredBullets,
      coverLetterOutline,
      salaryInfo,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Internal error during job tailoring analysis",
      },
      { status: 500 }
    );
  }
}
