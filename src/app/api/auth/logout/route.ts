import { NextResponse } from "next/server";
import { logoutSession, AUTH_COOKIE_NAME } from "@/lib/supabase/store";
import { authenticateRequest } from "@/lib/supabase/server-auth";

export async function POST(req: Request) {
  const auth = await authenticateRequest(req);
  if (auth) {
    await logoutSession(auth.token);
  }

  const response = NextResponse.json({ success: true });
  response.cookies.delete(AUTH_COOKIE_NAME);
  return response;
}
