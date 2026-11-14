import { NextResponse } from "next/server";
import { z } from "zod";
import { CVDataSchema } from "@/lib/schema";
import { generateDocx } from "@/lib/export/docx";
import { DEFAULT_STYLE_CONFIG, type StyleConfig } from "@/lib/templates";
import { getRegionProfile, type RegionProfileId, type UserRegionOverrides } from "@/lib/regions";

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

    // Generate .docx buffer with regional ordering and labels
    const buffer = await generateDocx(
      data,
      style as StyleConfig,
      regionProfile,
      userOverrides as UserRegionOverrides | undefined
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
      },
    });
  } catch (error: unknown) {
    console.error("Failed to generate DOCX export:", error);
    const message = error instanceof Error ? error.message : "Failed to generate document";
    return NextResponse.json(
      { error: "Export generation failed", message },
      { status: 500 }
    );
  }
}
