import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticateRequest } from "@/lib/supabase/server-auth";
import { getCVVersion, updateCVVersion, deleteCVVersion } from "@/lib/supabase/store";
import { CVDataSchema } from "@/lib/schema";
import { VaultFactSchema } from "@/lib/vault";

const UpdateCVSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  cvData: CVDataSchema.optional(),
  vaultData: z.array(VaultFactSchema).optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, { params }: RouteParams) {
  const auth = await authenticateRequest(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const version = await getCVVersion(auth.user.id, auth.token, id);

  // Return 404 if not found or if owned by another user (Row Level Security enforcement)
  if (!version) {
    return NextResponse.json({ error: "CV version not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, cv: version });
}

export async function PUT(req: Request, { params }: RouteParams) {
  const auth = await authenticateRequest(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = UpdateCVSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid update payload" },
      { status: 400 }
    );
  }

  const updated = await updateCVVersion(
    auth.user.id,
    auth.token,
    id,
    parsed.data.title,
    parsed.data.cvData,
    parsed.data.vaultData
  );

  if (!updated) {
    return NextResponse.json({ error: "CV version not found or permission denied" }, { status: 404 });
  }

  return NextResponse.json({ success: true, cv: updated });
}

export async function DELETE(req: Request, { params }: RouteParams) {
  const auth = await authenticateRequest(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const deleted = await deleteCVVersion(auth.user.id, auth.token, id);

  if (!deleted) {
    return NextResponse.json({ error: "CV version not found or permission denied" }, { status: 404 });
  }

  return NextResponse.json({ success: true, message: "CV version deleted successfully" });
}
