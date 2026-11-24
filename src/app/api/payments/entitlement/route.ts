import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/supabase/server-auth";
import { getUserEntitlement, hasCleanExportAccess } from "@/lib/payments";

export async function GET(req: Request) {
  const auth = await authenticateRequest(req);
  if (!auth) {
    return NextResponse.json({
      authenticated: false,
      isLifetime: false,
      exportCredits: 0,
      hasCleanExportAccess: false,
    });
  }

  const entitlement = getUserEntitlement(auth.user.id);
  const cleanAccess = hasCleanExportAccess(auth.user.id);

  return NextResponse.json({
    authenticated: true,
    userId: auth.user.id,
    isLifetime: entitlement.isLifetime,
    exportCredits: entitlement.exportCredits,
    hasCleanExportAccess: cleanAccess,
  });
}
