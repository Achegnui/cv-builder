export type PaymentPlanType = "per_export" | "lifetime";

export type Currency = "USD" | "XAF" | "EUR" | "GBP";

export interface PricingPlan {
  id: PaymentPlanType;
  name: string;
  description: string;
  prices: Record<Currency, number>;
  features: string[];
  isOneTime: true;
}

export type TransactionStatus = "pending" | "successful" | "failed";

export type PaymentMethod = "card" | "mobilemoney" | "unknown";

export interface PaymentTransaction {
  id: string; // Internal UUID
  txRef: string; // Unique transaction reference (e.g. cv_tx_...)
  flwRef?: string; // Flutterwave reference
  userId: string; // Authenticated user ID
  customerEmail: string;
  planType: PaymentPlanType;
  amount: number;
  currency: Currency;
  status: TransactionStatus;
  paymentMethod: PaymentMethod;
  createdAt: string;
  processedAt?: string; // For idempotency
  receiptId?: string;
}

export interface UserEntitlement {
  userId: string;
  isLifetime: boolean;
  exportCredits: number;
  updatedAt: string;
}

export interface Receipt {
  id: string; // Receipt number (e.g. REC-2026-...)
  transactionId: string;
  txRef: string;
  userId: string;
  customerEmail: string;
  planType: PaymentPlanType;
  planName: string;
  amount: number;
  currency: Currency;
  paymentMethod: PaymentMethod;
  issuedAt: string;
}

export interface CheckoutRequest {
  planType: PaymentPlanType;
  currency: Currency;
  redirectUrl?: string;
}

export interface FlutterwaveWebhookPayload {
  event: string;
  data: {
    id: number;
    tx_ref: string;
    flw_ref?: string;
    amount: number;
    currency: string;
    charged_amount?: number;
    status: string;
    payment_type?: string;
    customer?: {
      email?: string;
      name?: string;
    };
  };
}
