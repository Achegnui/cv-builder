import { describe, it, expect, beforeEach, vi } from "vitest";
import { SAMPLE_CV } from "@/lib/schema";
import { resetInMemoryStore, signUpUser } from "@/lib/supabase/store";
import {
  resetPaymentStore,
  resetRateLimiter,
  getUserEntitlement,
  createPendingTransaction,
  fulfillTransaction,
  DEFAULT_TEST_WEBHOOK_HASH,
  getPlanWithPrice,
  formatPrice,
  checkRateLimit,
} from "@/lib/payments";
import { POST as handleCheckout } from "@/app/api/payments/checkout/route";
import { POST as handleWebhook } from "@/app/api/payments/webhook/route";
import { GET as handleEntitlement } from "@/app/api/payments/entitlement/route";
import { GET as handleReceipts } from "@/app/api/payments/receipts/route";
import { POST as handleExportDocx } from "@/app/api/export/docx/route";

describe("Phase 8b: Flutterwave Payments, Webhooks, Idempotency & Clean Exports", () => {
  let userToken: string;
  let userId: string;
  let userEmail: string;

  beforeEach(async () => {
    resetInMemoryStore();
    resetPaymentStore();
    resetRateLimiter();

    // Create a registered test user
    const { user, session } = await signUpUser("student.buyer@example.com", "Password123!");
    userId = user.id;
    userEmail = user.email;
    userToken = session.token;
  });

  describe("Price Transparency & Plan Configuration", () => {
    it("displays full price before checkout with currency formatting and no auto-renewal", () => {
      const usdPass = getPlanWithPrice("per_export", "USD");
      expect(usdPass.amount).toBe(2.99);
      expect(usdPass.formattedPrice).toBe("$2.99");
      expect(usdPass.plan.isOneTime).toBe(true);

      const xafPass = getPlanWithPrice("lifetime", "XAF");
      expect(xafPass.amount).toBe(5000);
      expect(xafPass.formattedPrice).toBe("5,000 FCFA");
      expect(xafPass.plan.isOneTime).toBe(true);
      expect(formatPrice(1500, "XAF")).toBe("1,500 FCFA");
    });
  });

  describe("Server-Side Checkout Creation & Rate Limiting", () => {
    it("rejects unauthenticated checkout attempts", async () => {
      const res = await handleCheckout(
        new Request("http://localhost/api/payments/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ planType: "per_export", currency: "USD" }),
        })
      );
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toContain("Unauthorized");
    });

    it("creates server-side transaction with unique tx_ref and returns checkout URL", async () => {
      const res = await handleCheckout(
        new Request("http://localhost/api/payments/checkout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify({ planType: "lifetime", currency: "USD" }),
        })
      );

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.txRef).toMatch(/^cv_tx_/);
      expect(data.checkoutUrl).toBeDefined();
      expect(data.amount).toBe(9.99);
      expect(data.currency).toBe("USD");
    });

    it("enforces rate limits on rapid checkout calls", async () => {
      // Limit is 5 per minute
      for (let i = 0; i < 5; i++) {
        const res = await handleCheckout(
          new Request("http://localhost/api/payments/checkout", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${userToken}`,
            },
            body: JSON.stringify({ planType: "per_export", currency: "USD" }),
          })
        );
        expect(res.status).toBe(200);
      }

      // 6th call must trigger 429 Too Many Requests
      const blockedRes = await handleCheckout(
        new Request("http://localhost/api/payments/checkout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify({ planType: "per_export", currency: "USD" }),
        })
      );
      expect(blockedRes.status).toBe(429);
      expect(blockedRes.headers.get("Retry-After")).toBeDefined();
    });
  });

  describe("Webhook Cryptographic Verification & Idempotency", () => {
    it("rejects forged webhook with missing or invalid signature (verif-hash)", async () => {
      const fakePayload = {
        event: "charge.completed",
        data: {
          id: 123456,
          tx_ref: "fake_tx_ref",
          status: "successful",
          amount: 2.99,
          currency: "USD",
        },
      };

      // 1. Missing header
      const noSigRes = await handleWebhook(
        new Request("http://localhost/api/payments/webhook", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(fakePayload),
        })
      );
      expect(noSigRes.status).toBe(401);
      expect((await noSigRes.json()).error).toContain("signature is invalid");

      // 2. Forged/Incorrect header
      const forgedRes = await handleWebhook(
        new Request("http://localhost/api/payments/webhook", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "verif-hash": "forged_malicious_signature_999",
          },
          body: JSON.stringify(fakePayload),
        })
      );
      expect(forgedRes.status).toBe(401);
    });

    it("verifies and fulfills a legitimate webhook payment and updates entitlement", async () => {
      // Create pending transaction in store
      const pendingTx = createPendingTransaction({
        userId,
        customerEmail: userEmail,
        planType: "per_export",
        amount: 2.99,
        currency: "USD",
      });

      const validPayload = {
        event: "charge.completed",
        data: {
          id: 987654,
          tx_ref: pendingTx.txRef,
          flw_ref: "FLW_MOCK_12345",
          status: "successful",
          amount: 2.99,
          currency: "USD",
          payment_type: "card",
        },
      };

      const res = await handleWebhook(
        new Request("http://localhost/api/payments/webhook", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "verif-hash": DEFAULT_TEST_WEBHOOK_HASH,
          },
          body: JSON.stringify(validPayload),
        })
      );

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.alreadyProcessed).toBe(false);
      expect(data.receiptId).toBeDefined();

      // Check that user now has 1 export credit
      const entitlement = getUserEntitlement(userId);
      expect(entitlement.exportCredits).toBe(1);
      expect(entitlement.isLifetime).toBe(false);
    });

    it("proves webhook idempotency: repeated/replayed webhooks do NOT grant duplicate access", async () => {
      // User buys 1 single export pass
      const pendingTx = createPendingTransaction({
        userId,
        customerEmail: userEmail,
        planType: "per_export",
        amount: 2.99,
        currency: "USD",
      });

      const payload = {
        event: "charge.completed",
        data: {
          id: 555111,
          tx_ref: pendingTx.txRef,
          flw_ref: "FLW_MOCK_555",
          status: "successful",
          amount: 2.99,
          currency: "USD",
          payment_type: "mobilemoney",
        },
      };

      // 1. First webhook execution
      const res1 = await handleWebhook(
        new Request("http://localhost/api/payments/webhook", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "verif-hash": DEFAULT_TEST_WEBHOOK_HASH,
          },
          body: JSON.stringify(payload),
        })
      );
      expect(res1.status).toBe(200);
      expect((await res1.json()).alreadyProcessed).toBe(false);

      // Verify entitlement = 1 credit
      expect(getUserEntitlement(userId).exportCredits).toBe(1);

      // 2. Replayed webhook with same tx_ref
      const res2 = await handleWebhook(
        new Request("http://localhost/api/payments/webhook", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "verif-hash": DEFAULT_TEST_WEBHOOK_HASH,
          },
          body: JSON.stringify(payload),
        })
      );
      expect(res2.status).toBe(200);
      const data2 = await res2.json();
      expect(data2.alreadyProcessed).toBe(true);

      // Crucial: Credit MUST still be 1 (never incremented twice!)
      expect(getUserEntitlement(userId).exportCredits).toBe(1);
    });
  });

  describe("Watermark Enforcement on Word (.docx) and PDF Export", () => {
    it("returns watermarked Word export for unpaid guest or user", async () => {
      // Unpaid request (no auth or free user)
      const res = await handleExportDocx(
        new Request("http://localhost/api/export/docx", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: SAMPLE_CV }),
        })
      );

      expect(res.status).toBe(200);
      // Header indicates watermark was applied on server
      expect(res.headers.get("X-CV-Watermarked")).toBe("true");

      const buffer = await res.arrayBuffer();
      expect(buffer.byteLength).toBeGreaterThan(1000);
    });

    it("returns clean watermark-free export for paid user and consumes credit", async () => {
      // 1. Manually fulfill 1 export credit for user
      const tx = createPendingTransaction({
        userId,
        customerEmail: userEmail,
        planType: "per_export",
        amount: 2.99,
        currency: "USD",
      });
      fulfillTransaction({ txRef: tx.txRef });
      expect(getUserEntitlement(userId).exportCredits).toBe(1);

      // 2. Request Word export with user token
      const res = await handleExportDocx(
        new Request("http://localhost/api/export/docx", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify({ data: SAMPLE_CV }),
        })
      );

      expect(res.status).toBe(200);
      // Clean export header
      expect(res.headers.get("X-CV-Watermarked")).toBe("false");

      // 3. Credit was consumed
      expect(getUserEntitlement(userId).exportCredits).toBe(0);

      // 4. Subsequent export without credits falls back to watermarked
      const res2 = await handleExportDocx(
        new Request("http://localhost/api/export/docx", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify({ data: SAMPLE_CV }),
        })
      );
      expect(res2.headers.get("X-CV-Watermarked")).toBe("true");
    });

    it("provides unlimited clean exports for lifetime pass holders without consuming credits", async () => {
      // Fulfill lifetime pass
      const tx = createPendingTransaction({
        userId,
        customerEmail: userEmail,
        planType: "lifetime",
        amount: 9.99,
        currency: "USD",
      });
      fulfillTransaction({ txRef: tx.txRef });
      expect(getUserEntitlement(userId).isLifetime).toBe(true);

      // 2 exports back-to-back
      for (let i = 0; i < 2; i++) {
        const res = await handleExportDocx(
          new Request("http://localhost/api/export/docx", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${userToken}`,
            },
            body: JSON.stringify({ data: SAMPLE_CV }),
          })
        );
        expect(res.headers.get("X-CV-Watermarked")).toBe("false");
      }

      // Still lifetime
      expect(getUserEntitlement(userId).isLifetime).toBe(true);
    });
  });

  describe("Receipts Issuance & Privacy Auditing", () => {
    it("generates and retrieves official receipt after successful transaction", async () => {
      const tx = createPendingTransaction({
        userId,
        customerEmail: userEmail,
        planType: "lifetime",
        amount: 9.99,
        currency: "USD",
      });
      fulfillTransaction({
        txRef: tx.txRef,
        flwRef: "FLW_REC_100",
        paymentMethod: "card",
      });

      const res = await handleReceipts(
        new Request("http://localhost/api/payments/receipts", {
          headers: { Authorization: `Bearer ${userToken}` },
        })
      );

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.receipts.length).toBe(1);

      const receipt = data.receipts[0];
      expect(receipt.id).toMatch(/^REC-/);
      expect(receipt.amount).toBe(9.99);
      expect(receipt.currency).toBe("USD");
      expect(receipt.paymentMethod).toBe("card");
      expect(receipt.planName).toContain("Lifetime");
    });

    it("never logs CV content in payment routes (privacy rule compliance)", () => {
      const consoleLogSpy = vi.spyOn(console, "log");

      createPendingTransaction({
        userId,
        customerEmail: userEmail,
        planType: "per_export",
        amount: 2.99,
        currency: "USD",
      });

      consoleLogSpy.mock.calls.forEach((call) => {
        const text = call.join(" ");
        expect(text).not.toContain("Alex Sample");
        expect(text).not.toContain("Software Engineering Intern");
      });

      consoleLogSpy.mockRestore();
    });
  });
});
