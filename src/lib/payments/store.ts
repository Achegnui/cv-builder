import crypto from "crypto";
import type {
  Currency,
  PaymentMethod,
  PaymentPlanType,
  PaymentTransaction,
  Receipt,
  UserEntitlement,
} from "./types";
import { PRICING_PLANS } from "./pricing";

// In-memory payment collections
const transactionsByTxRef: Map<string, PaymentTransaction> = new Map();
const entitlementsByUserId: Map<string, UserEntitlement> = new Map();
const receiptsById: Map<string, Receipt> = new Map();

/**
 * Resets the in-memory payment store (for test suite isolation)
 */
export function resetPaymentStore(): void {
  transactionsByTxRef.clear();
  entitlementsByUserId.clear();
  receiptsById.clear();
}

/**
 * Retrieves the current entitlement for a user.
 * Defaults to free tier (0 credits, lifetime = false).
 */
export function getUserEntitlement(userId: string): UserEntitlement {
  if (!userId) {
    return {
      userId: "",
      isLifetime: false,
      exportCredits: 0,
      updatedAt: new Date().toISOString(),
    };
  }

  const existing = entitlementsByUserId.get(userId);
  if (existing) {
    return existing;
  }

  const defaultEntitlement: UserEntitlement = {
    userId,
    isLifetime: false,
    exportCredits: 0,
    updatedAt: new Date().toISOString(),
  };

  entitlementsByUserId.set(userId, defaultEntitlement);
  return defaultEntitlement;
}

/**
 * Checks if a user has clean export privileges (either lifetime or > 0 credits).
 */
export function hasCleanExportAccess(userId: string): boolean {
  if (!userId) return false;
  const entitlement = getUserEntitlement(userId);
  return entitlement.isLifetime || entitlement.exportCredits > 0;
}

/**
 * Consumes 1 export credit for a user if they do not have lifetime access.
 * Returns true if the user had clean access and credit was consumed (or was lifetime).
 * Returns false if the user had no credits.
 */
export function consumeExportCredit(userId: string): boolean {
  if (!userId) return false;
  const entitlement = getUserEntitlement(userId);

  if (entitlement.isLifetime) {
    return true;
  }

  if (entitlement.exportCredits > 0) {
    entitlement.exportCredits -= 1;
    entitlement.updatedAt = new Date().toISOString();
    entitlementsByUserId.set(userId, entitlement);
    return true;
  }

  return false;
}

/**
 * Creates a new pending payment transaction.
 */
export function createPendingTransaction(params: {
  userId: string;
  customerEmail: string;
  planType: PaymentPlanType;
  amount: number;
  currency: Currency;
  txRef?: string;
}): PaymentTransaction {
  const txRef = params.txRef || `cv_tx_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
  const now = new Date().toISOString();

  const transaction: PaymentTransaction = {
    id: crypto.randomUUID(),
    txRef,
    userId: params.userId,
    customerEmail: params.customerEmail,
    planType: params.planType,
    amount: params.amount,
    currency: params.currency,
    status: "pending",
    paymentMethod: "unknown",
    createdAt: now,
  };

  transactionsByTxRef.set(txRef, transaction);
  return transaction;
}

/**
 * Looks up a transaction by txRef.
 */
export function getTransactionByTxRef(txRef: string): PaymentTransaction | null {
  return transactionsByTxRef.get(txRef) || null;
}

/**
 * Idempotently fulfills a payment transaction.
 * If the transaction has already been processed and marked successful,
 * it returns the existing state without double-crediting.
 */
export function fulfillTransaction(params: {
  txRef: string;
  flwRef?: string;
  paymentMethod?: PaymentMethod;
  amount?: number;
  currency?: Currency;
}): {
  alreadyProcessed: boolean;
  transaction: PaymentTransaction;
  entitlement: UserEntitlement;
  receipt?: Receipt;
} {
  const transaction = transactionsByTxRef.get(params.txRef);
  if (!transaction) {
    throw new Error(`Transaction with reference "${params.txRef}" not found.`);
  }

  // Idempotency check: if already processed and successful, return immediately without duplicate fulfillment
  if (transaction.status === "successful" && transaction.processedAt) {
    const existingEntitlement = getUserEntitlement(transaction.userId);
    const existingReceipt = transaction.receiptId
      ? receiptsById.get(transaction.receiptId)
      : undefined;

    return {
      alreadyProcessed: true,
      transaction,
      entitlement: existingEntitlement,
      receipt: existingReceipt,
    };
  }

  // Fulfill transaction
  const now = new Date().toISOString();
  transaction.status = "successful";
  transaction.processedAt = now;
  if (params.flwRef) transaction.flwRef = params.flwRef;
  if (params.paymentMethod) transaction.paymentMethod = params.paymentMethod;

  // Update user entitlement
  const entitlement = getUserEntitlement(transaction.userId);
  if (transaction.planType === "lifetime") {
    entitlement.isLifetime = true;
  } else if (transaction.planType === "per_export") {
    entitlement.exportCredits += 1;
  }
  entitlement.updatedAt = now;
  entitlementsByUserId.set(transaction.userId, entitlement);

  // Generate Receipt
  const receiptId = `REC-${Date.now().toString().slice(-6)}-${crypto.randomBytes(2).toString("hex").toUpperCase()}`;
  const planName = PRICING_PLANS[transaction.planType]?.name || "Export Pass";

  const receipt: Receipt = {
    id: receiptId,
    transactionId: transaction.id,
    txRef: transaction.txRef,
    userId: transaction.userId,
    customerEmail: transaction.customerEmail,
    planType: transaction.planType,
    planName,
    amount: transaction.amount,
    currency: transaction.currency,
    paymentMethod: transaction.paymentMethod,
    issuedAt: now,
  };

  receiptsById.set(receiptId, receipt);
  transaction.receiptId = receiptId;

  return {
    alreadyProcessed: false,
    transaction,
    entitlement,
    receipt,
  };
}

/**
 * Lists all receipts issued to a specific user.
 */
export function getUserReceipts(userId: string): Receipt[] {
  if (!userId) return [];
  const results: Receipt[] = [];
  for (const receipt of receiptsById.values()) {
    if (receipt.userId === userId) {
      results.push(receipt);
    }
  }
  return results.sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime());
}
