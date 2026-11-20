import { NextResponse } from "next/server";
import { z } from "zod";
import { executeCoachRequest } from "@/lib/ai/claude";
import { checkRateLimit } from "@/lib/ai/rate-limiter";

const CoachRequestSchema = z.object({
  mode: z.enum(["interview", "outline", "review"]),
  question: z.string().min(1, "Question is required").max(2000),
  userNotes: z.array(z.string()).optional(),
  userDraft: z.string().optional(),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "coach"]),
        content: z.string(),
      })
    )
    .optional(),
});

export async function POST(request: Request) {
  try {
    // 1. Rate limiting by IP
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "anonymous-coach-client";

    const rateLimit = checkRateLimit(ip, 20, 60000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded. Please wait a moment before sending more coaching requests.",
          retryAfterMs: rateLimit.resetMs,
        },
        { status: 429 }
      );
    }

    // 2. Validate request
    const body = await request.json();
    const parseResult = CoachRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Invalid coach request payload",
          details: parseResult.error.format(),
        },
        { status: 400 }
      );
    }

    // 3. Execute Coach mode (with ghostwriting refusal guard)
    const result = await executeCoachRequest(parseResult.data);
    return NextResponse.json(result);
  } catch (err: unknown) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Internal server error during coaching session",
      },
      { status: 500 }
    );
  }
}
