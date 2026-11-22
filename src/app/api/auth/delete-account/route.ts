import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/supabase/server-auth";
import { deleteUserAccountAndData, AUTH_COOKIE_NAME } from "@/lib/supabase/store";

export async function POST(req: Request) {
  const auth = await authenticateRequest(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Delete all CV data and user credentials permanently
    await deleteUserAccountAndData(auth.user.id, auth.token);

    const response = NextResponse.json({
      success: true,
      message: "Your account and all associated CV data have been permanently deleted.",
    });

    response.cookies.delete(AUTH_COOKIE_NAME);
    return response;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to delete account";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
