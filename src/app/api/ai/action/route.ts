import { NextResponse } from "next/server";
import { z } from "zod";
import { executeAIAction } from "@/lib/ai/claude";
import { checkRateLimit } from "@/lib/ai/rate-limiter";

const AIActionSchema = z.object({
  action: z.enum([
    "improve-bullet",
    "draft-summary",
    "group-skills",
    "explain-warning",
    "suggest-questions",
  ]),
  input: z.string().min(1, "Input text is required").max(5000),
  context: z
    .object({
      employer: z.string().optional(),
      jobTitle: z.string().optional(),
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
      warningMessage: z.string().optional(),
    })
    .optional(),
  config: z
    .object({
      bannedWords: z.array(z.string()).optional(),
      avoidEmDashes: z.boolean().optional(),
    })
    .optional(),
});

export async function POST(request: Request) {
  try {
    // 1. Rate limiting by IP or header
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "anonymous-client";

    const rateLimit = checkRateLimit(ip, 20, 60000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded. Please wait a moment before sending more AI requests.",
          retryAfterMs: rateLimit.resetMs,
        },
        { status: 429 }
      );
    }

    // 2. Validate request body
    const body = await request.json();
    const parseResult = AIActionSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Invalid request payload",
          details: parseResult.error.format(),
        },
        { status: 400 }
      );
    }

    // 3. Execute AI action with Honesty Guard
    const result = await executeAIAction(parseResult.data);
    return NextResponse.json(result, { status: result.success ? 200 : 422 });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Internal server error during AI action",
      },
      { status: 500 }
    );
  }
}
