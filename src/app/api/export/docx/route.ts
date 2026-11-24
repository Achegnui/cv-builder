import { NextResponse } from "next/server";
import { z } from "zod";
import { CVDataSchema } from "@/lib/schema";
import { generateDocx } from "@/lib/export/docx";
import { DEFAULT_STYLE_CONFIG, type StyleConfig } from "@/lib/templates";
import { getRegionProfile, type RegionProfileId, type UserRegionOverrides } from "@/lib/regions";
import { runCVDoctor, getBlockingIssues } from "@/lib/validation";
import { authenticateRequest } from "@/lib/supabase/server-auth";
import {
  hasCleanExportAccess,
  consumeExportCredit,
  checkRateLimit,
  isRequestSizeWithinLimit,
} from "@/lib/payments";

const StyleConfigSchema = z.object({
  paperSize: z.enum(["a4", "letter"]).default("a4"),
  colorMode: z.enum(["accent", "black"]).default("accent"),
  accentColor: z.string().default("#1e3a8a"),
  fontFamily: z.enum(["sans", "serif", "mono"]).default("sans"),
  spacing: z.enum(["normal", "compact"]).default("normal"),
});

const UserOverridesSchema = z
  .object({
    showPhoto: z.boolean().default(false),
    showDateOfBirth: z.boolean().default(false),
    showNationality: z.boolean().default(false),
    dismissedWarningIds: z.array(z.string()).default([]),
  })
  .optional();

const ExportRequestSchema = z.object({
  data: CVDataSchema,
  style: StyleConfigSchema.optional().default(DEFAULT_STYLE_CONFIG),
  regionProfileId: z
    .enum([
      "us",
      "uk",
      "german",
      "europass",
      "academic",
      "technical",
      "combination",
      "one-page",
    ])
    .optional()
    .default("us"),
  userOverrides: UserOverridesSchema,
});

export async function POST(request: Request) {
  // 1. Enforce payload size limit (max 2 MB)
  if (!isRequestSizeWithinLimit(request)) {
    return NextResponse.json({ error: "Request payload exceeds size limit" }, { status: 413 });
  }

  // 2. Identify user and enforce rate limiting
  const auth = await authenticateRequest(request);
  const rateLimitKey = auth ? `user:${auth.user.id}:docx` : "anon:docx";
  const rateCheck = checkRateLimit(rateLimitKey, 30, 60);

  if (!rateCheck.allowed) {
    return NextResponse.json(
      {
        error: "Too many export requests. Please slow down.",
        resetInSeconds: rateCheck.resetInSeconds,
      },
      {
        status: 429,
        headers: { "Retry-After": String(rateCheck.resetInSeconds) },
      }
    );
  }

  // 3. Determine clean watermark-free export entitlement on the server
  // Never trust the client browser for payment or entitlement status
  let hasWatermark = true;
  if (auth && hasCleanExportAccess(auth.user.id)) {
    // User has a paid pass: consume 1 credit (or maintain lifetime)
    consumeExportCredit(auth.user.id);
    hasWatermark = false;
  }

  try {
    const json = await request.json();
    const parseResult = ExportRequestSchema.safeParse(json);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Invalid request payload",
          details: parseResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { data, style, regionProfileId, userOverrides } = parseResult.data;
    const regionProfile = getRegionProfile(regionProfileId as RegionProfileId);

    // Rule 3: Placeholders block export. Unfinished placeholders must be resolved.
    const validationIssues = runCVDoctor(data, { vault: [] });
    const blockingIssues = getBlockingIssues(validationIssues);
    if (blockingIssues.length > 0) {
      return NextResponse.json(
        {
          error: "Export blocked by unfinished placeholders",
          message:
            "Export is blocked while unfinished placeholders (e.g. [add number]) remain in your CV.",
          blockingIssues,
        },
        { status: 422 }
      );
    }

    // Generate .docx buffer with regional ordering, labels, and server-enforced watermark
    const buffer = await generateDocx(
      data,
      style as StyleConfig,
      regionProfile,
      userOverrides as UserRegionOverrides | undefined,
      { hasWatermark }
    );

    // Sanitize user name for download filename
    const safeName = (data.profile.fullName || "CV")
      .trim()
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .replace(/_+/g, "_");
    const filename = `${safeName}_CV.docx`;

    const uint8Array = new Uint8Array(buffer);

    return new Response(uint8Array, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": uint8Array.byteLength.toString(),
        "X-CV-Watermarked": hasWatermark ? "true" : "false",
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to generate document";
    console.error("DOCX export generation failed:", message);
    return NextResponse.json(
      { error: "Export generation failed", message },
      { status: 500 }
    );
  }
}
