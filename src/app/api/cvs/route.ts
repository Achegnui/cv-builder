import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticateRequest } from "@/lib/supabase/server-auth";
import { listUserCVVersions, createCVVersion } from "@/lib/supabase/store";
import { CVDataSchema } from "@/lib/schema";
import { VaultFactSchema } from "@/lib/vault";

const CreateCVSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  cvData: CVDataSchema,
  vaultData: z.array(VaultFactSchema).optional(),
});

export async function GET(req: Request) {
  const auth = await authenticateRequest(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized. Please log in to view saved CVs." }, { status: 401 });
  }

  try {
    const list = await listUserCVVersions(auth.user.id, auth.token);
    return NextResponse.json({ success: true, cvs: list });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to list CV versions";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await authenticateRequest(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized. Please log in to save CVs." }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => null);
    const parsed = CreateCVSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid CV payload" },
        { status: 400 }
      );
    }

    const { title, cvData, vaultData } = parsed.data;
    const newVersion = await createCVVersion(auth.user.id, auth.token, title, cvData, vaultData);

    return NextResponse.json({ success: true, cv: newVersion }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to create CV version";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
