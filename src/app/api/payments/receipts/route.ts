import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/supabase/server-auth";
import { getUserReceipts } from "@/lib/payments";

export async function GET(req: Request) {
  const auth = await authenticateRequest(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const receipts = getUserReceipts(auth.user.id);
  return NextResponse.json({
    success: true,
    receipts,
  });
}
