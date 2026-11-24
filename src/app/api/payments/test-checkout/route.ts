import { NextResponse } from "next/server";
import { getTransactionByTxRef, fulfillTransaction } from "@/lib/payments";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const txRef = url.searchParams.get("tx_ref");
  const amount = url.searchParams.get("amount") || "2.99";
  const currency = url.searchParams.get("currency") || "USD";

  if (!txRef) {
    return new Response("Missing tx_ref parameter", { status: 400 });
  }

  const transaction = getTransactionByTxRef(txRef);
  if (!transaction) {
    return new Response(`Transaction ${txRef} not found`, { status: 404 });
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Flutterwave Sandbox Test Checkout</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-neutral-100 flex items-center justify-center min-h-screen p-4 font-sans text-neutral-800">
  <div class="max-w-md w-full bg-white rounded-xl shadow-xl border border-neutral-200 overflow-hidden">
    <div class="bg-amber-500 text-white p-6 text-center">
      <div class="text-xs uppercase tracking-wider font-bold mb-1 opacity-90">Flutterwave Sandbox (Test Mode)</div>
      <h1 class="text-2xl font-black">CV Builder Clean Pass</h1>
      <div class="text-3xl font-bold mt-2">${currency} ${amount}</div>
      <div class="text-xs opacity-90 mt-1">Ref: ${txRef}</div>
    </div>

    <div class="p-6 space-y-4">
      <p class="text-xs text-neutral-600 text-center">
        This is a simulated test checkout environment for development and testing. Choose a test payment method to simulate instant fulfillment:
      </p>

      <form method="POST" action="/api/payments/test-checkout" class="space-y-3">
        <input type="hidden" name="tx_ref" value="${txRef}" />

        <button type="submit" name="method" value="card"
          class="w-full py-3 px-4 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-sm rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2">
          <span>💳</span> Pay with Test Card (Instant Confirmation)
        </button>

        <button type="submit" name="method" value="mobilemoney"
          class="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2">
          <span>📱</span> Pay with Test Mobile Money (MTN / Orange)
        </button>
      </form>

      <div class="text-center pt-2">
        <a href="/?payment=cancelled" class="text-xs text-neutral-500 hover:text-neutral-800 underline">
          Cancel & Return to CV Builder
        </a>
      </div>
    </div>
  </div>
</body>
</html>`;

  return new Response(html, {
    headers: { "Content-Type": "text/html" },
  });
}

export async function POST(req: Request) {
  const formData = await req.formData();
  const txRef = formData.get("tx_ref") as string;
  const method = (formData.get("method") as string) === "mobilemoney" ? "mobilemoney" : "card";

  if (!txRef) {
    return new Response("Missing tx_ref", { status: 400 });
  }

  const transaction = getTransactionByTxRef(txRef);
  if (!transaction) {
    return new Response("Transaction not found", { status: 404 });
  }

  // Fulfill test transaction idempotently
  fulfillTransaction({
    txRef,
    flwRef: `FLW_SIM_${Date.now()}`,
    paymentMethod: method,
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return NextResponse.redirect(`${appUrl}/?payment=completed&tx_ref=${encodeURIComponent(txRef)}`, {
    status: 303,
  });
}
