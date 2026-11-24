import type { Currency, PaymentMethod } from "./types";

export const DEFAULT_TEST_WEBHOOK_HASH = "cv_flw_test_secret_hash_2026";

/**
 * Validates the cryptographic webhook signature from Flutterwave.
 * Flutterwave sends the secret hash in the `verif-hash` HTTP request header.
 */
export function verifyWebhookSignature(headerHash: string | null): boolean {
  if (!headerHash) return false;
  const configuredSecretHash =
    process.env.FLUTTERWAVE_WEBHOOK_SECRET_HASH || DEFAULT_TEST_WEBHOOK_HASH;

  // Constant-time-like comparison
  if (headerHash.length !== configuredSecretHash.length) {
    return false;
  }

  let mismatch = 0;
  for (let i = 0; i < headerHash.length; i++) {
    mismatch |= headerHash.charCodeAt(i) ^ configuredSecretHash.charCodeAt(i);
  }

  return mismatch === 0;
}

/**
 * Checks whether live Flutterwave API keys are configured.
 */
export function isLiveFlutterwaveConfigured(): boolean {
  return Boolean(
    process.env.FLUTTERWAVE_SECRET_KEY &&
    !process.env.FLUTTERWAVE_SECRET_KEY.includes("placeholder")
  );
}

/**
 * Creates a Flutterwave hosted checkout session on the server.
 * In live mode, calls Flutterwave API. In test/mock mode, generates a test checkout link.
 */
export async function createFlutterwaveCheckout(params: {
  txRef: string;
  amount: number;
  currency: Currency;
  customerEmail: string;
  redirectUrl: string;
  title: string;
  description: string;
}): Promise<{ checkoutUrl: string; flwRef?: string }> {
  if (isLiveFlutterwaveConfigured()) {
    const res = await fetch("https://api.flutterwave.com/v3/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
      },
      body: JSON.stringify({
        tx_ref: params.txRef,
        amount: params.amount,
        currency: params.currency,
        redirect_url: params.redirectUrl,
        payment_options: "card,mobilemoney",
        customer: {
          email: params.customerEmail,
        },
        customizations: {
          title: params.title,
          description: params.description,
          logo: "https://cvbuilder.example/icon.png",
        },
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to create Flutterwave checkout session");
    }

    const data = await res.json();
    return {
      checkoutUrl: data.data.link,
    };
  }

  // Simulated Test Sandbox Checkout link
  const checkoutUrl = `/api/payments/test-checkout?tx_ref=${encodeURIComponent(
    params.txRef
  )}&amount=${params.amount}&currency=${params.currency}`;

  return {
    checkoutUrl,
    flwRef: `FLW_MOCK_${Date.now()}`,
  };
}

/**
 * Queries Flutterwave API directly to verify the status, amount, and currency of a transaction.
 * Never trusts the browser or untrusted webhook payloads alone.
 */
export async function verifyTransactionWithFlutterwave(transactionId: number | string): Promise<{
  verified: boolean;
  status: string;
  amount: number;
  currency: string;
  paymentType: PaymentMethod;
  txRef: string;
  flwRef: string;
}> {
  if (isLiveFlutterwaveConfigured()) {
    const res = await fetch(`https://api.flutterwave.com/v3/transactions/${transactionId}/verify`, {
      headers: {
        Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Flutterwave API returned HTTP ${res.status} on verification.`);
    }

    const data = await res.json();
    const item = data.data;

    let paymentType: PaymentMethod = "unknown";
    if (item.payment_type?.includes("card")) paymentType = "card";
    if (item.payment_type?.includes("mobile")) paymentType = "mobilemoney";

    return {
      verified: item.status === "successful",
      status: item.status,
      amount: item.amount,
      currency: item.currency,
      paymentType,
      txRef: item.tx_ref,
      flwRef: item.flw_ref || String(transactionId),
    };
  }

  // Test mode verification simulation
  return {
    verified: true,
    status: "successful",
    amount: 0, // Checked against transaction in store
    currency: "USD",
    paymentType: "card",
    txRef: String(transactionId),
    flwRef: `FLW_TEST_${transactionId}`,
  };
}
