import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/supabase/server-auth";

export async function GET(req: Request) {
  const auth = await authenticateRequest(req);
  if (!auth) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    user: auth.user,
  });
}
