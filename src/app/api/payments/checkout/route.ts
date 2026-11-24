import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticateRequest } from "@/lib/supabase/server-auth";
import {
  checkRateLimit,
  isRequestSizeWithinLimit,
  createPendingTransaction,
  createFlutterwaveCheckout,
  getPlanWithPrice,
  SUPPORTED_CURRENCIES,
} from "@/lib/payments";

const CheckoutSchema = z.object({
  planType: z.enum(["per_export", "lifetime"]),
  currency: z.enum(["USD", "XAF", "EUR", "GBP"]).default("USD"),
  redirectUrl: z.string().url().optional(),
});

export async function POST(req: Request) {
  // 1. Enforce payload size limit (max 2 MB)
  if (!isRequestSizeWithinLimit(req)) {
    return NextResponse.json({ error: "Request payload exceeds size limit" }, { status: 413 });
  }

  // 2. Enforce Authentication
  const auth = await authenticateRequest(req);
  if (!auth) {
    return NextResponse.json(
      { error: "Unauthorized. Please log in or create an account to purchase an export pass." },
      { status: 401 }
    );
  }

  // 3. Enforce Rate Limiting (max 5 checkout attempts per minute per user)
  const rateLimitKey = `user:${auth.user.id}:checkout`;
  const rateCheck = checkRateLimit(rateLimitKey, 5, 60);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      {
        error: "Too many checkout requests. Please wait a moment before trying again.",
        resetInSeconds: rateCheck.resetInSeconds,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateCheck.resetInSeconds),
        },
      }
    );
  }

  try {
    const body = await req.json().catch(() => null);
    const parsed = CheckoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid checkout payload" },
        { status: 400 }
      );
    }

    const { planType, currency, redirectUrl } = parsed.data;
    const { plan, amount, formattedPrice } = getPlanWithPrice(planType, currency);

    // 4. Create pending transaction on the server
    const transaction = createPendingTransaction({
      userId: auth.user.id,
      customerEmail: auth.user.email,
      planType,
      amount,
      currency,
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const finalRedirectUrl = redirectUrl || `${appUrl}/?payment=completed&tx_ref=${transaction.txRef}`;

    // 5. Create Flutterwave hosted checkout
    const checkoutResult = await createFlutterwaveCheckout({
      txRef: transaction.txRef,
      amount,
      currency,
      customerEmail: auth.user.email,
      redirectUrl: finalRedirectUrl,
      title: `CV Builder - ${plan.name}`,
      description: `${plan.description} (${formattedPrice} one-time)`,
    });

    return NextResponse.json({
      success: true,
      txRef: transaction.txRef,
      checkoutUrl: checkoutResult.checkoutUrl,
      amount,
      currency,
      formattedPrice,
      planName: plan.name,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to initialize checkout session";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
