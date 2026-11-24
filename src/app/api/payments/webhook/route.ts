import { NextResponse } from "next/server";
import {
  verifyWebhookSignature,
  isRequestSizeWithinLimit,
  verifyTransactionWithFlutterwave,
  fulfillTransaction,
  getTransactionByTxRef,
  type PaymentMethod,
} from "@/lib/payments";

export async function POST(req: Request) {
  // 1. Enforce payload size limit
  if (!isRequestSizeWithinLimit(req)) {
    return NextResponse.json({ error: "Request payload exceeds size limit" }, { status: 413 });
  }

  // 2. Cryptographic signature verification (verif-hash header)
  const signature = req.headers.get("verif-hash") || req.headers.get("Verif-Hash");
  if (!verifyWebhookSignature(signature)) {
    return NextResponse.json(
      { error: "Unauthorized. Webhook signature is invalid or missing." },
      { status: 401 }
    );
  }

  try {
    const payload = await req.json().catch(() => null);
    if (!payload || !payload.data) {
      return NextResponse.json({ error: "Invalid webhook payload structure" }, { status: 400 });
    }

    const { id, tx_ref, flw_ref, status, amount, currency, payment_type } = payload.data;

    if (!tx_ref) {
      return NextResponse.json({ error: "Missing tx_ref in webhook event" }, { status: 400 });
    }

    // 3. Check existing transaction in database
    const pendingTx = getTransactionByTxRef(tx_ref);
    if (!pendingTx) {
      return NextResponse.json(
        { error: `Transaction with reference "${tx_ref}" does not exist.` },
        { status: 404 }
      );
    }

    // 4. Server-Side independent verification with Flutterwave API
    // Never trust webhook body alone without querying the payment gateway
    const verified = await verifyTransactionWithFlutterwave(id || tx_ref);
    if (!verified.verified || verified.status !== "successful") {
      return NextResponse.json(
        { error: "Transaction verification with Flutterwave API was not successful." },
        { status: 400 }
      );
    }

    // Check payment method
    let method: PaymentMethod = "unknown";
    if (payment_type?.includes("card") || verified.paymentType === "card") {
      method = "card";
    } else if (payment_type?.includes("mobile") || verified.paymentType === "mobilemoney") {
      method = "mobilemoney";
    }

    // 5. Idempotent fulfillment: updates user entitlement and generates receipt
    // If already processed, it safely returns without double-granting access
    const fulfillment = fulfillTransaction({
      txRef: tx_ref,
      flwRef: flw_ref || verified.flwRef,
      paymentMethod: method,
      amount,
      currency: currency as any,
    });

    return NextResponse.json({
      success: true,
      alreadyProcessed: fulfillment.alreadyProcessed,
      message: fulfillment.alreadyProcessed
        ? "Webhook event already processed previously (idempotent)."
        : "Payment confirmed and user entitlement granted successfully.",
      receiptId: fulfillment.receipt?.id,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal webhook processing error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
