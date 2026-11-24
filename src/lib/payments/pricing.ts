import type { Currency, PaymentPlanType, PricingPlan } from "./types";

export const PRICING_PLANS: Record<PaymentPlanType, PricingPlan> = {
  per_export: {
    id: "per_export",
    name: "Single Clean Export Pass",
    description: "One watermark-free Word (.docx) or PDF export for your active CV version.",
    prices: {
      USD: 2.99,
      XAF: 1500,
      EUR: 2.79,
      GBP: 2.49,
    },
    features: [
      "1 clean watermark-free export (Word & PDF)",
      "All regional formats & styling options included",
      "No recurring subscription or auto-renewal",
      "Instant unlock after payment confirmation",
    ],
    isOneTime: true,
  },
  lifetime: {
    id: "lifetime",
    name: "Lifetime Unlimited Pass",
    description: "Unlimited watermark-free Word and PDF exports across all versions forever.",
    prices: {
      USD: 9.99,
      XAF: 5000,
      EUR: 9.49,
      GBP: 8.49,
    },
    features: [
      "Unlimited clean watermark-free exports forever",
      "Save & export unlimited tailored CV versions",
      "Priority customer support & future format updates",
      "One-time payment • Never charges again",
    ],
    isOneTime: true,
  },
};

export const SUPPORTED_CURRENCIES: Currency[] = ["USD", "XAF", "EUR", "GBP"];

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: "$",
  XAF: "FCFA ",
  EUR: "€",
  GBP: "£",
};

/**
 * Format a price with its currency symbol/code
 */
export function formatPrice(amount: number, currency: Currency): string {
  if (currency === "XAF") {
    return `${amount.toLocaleString()} FCFA`;
  }
  const symbol = CURRENCY_SYMBOLS[currency] || `${currency} `;
  return `${symbol}${amount.toFixed(2)}`;
}

/**
 * Returns plan details with validated price for a selected currency
 */
export function getPlanWithPrice(planType: PaymentPlanType, currency: Currency): {
  plan: PricingPlan;
  amount: number;
  formattedPrice: string;
} {
  const plan = PRICING_PLANS[planType] || PRICING_PLANS.per_export;
  const targetCurrency = SUPPORTED_CURRENCIES.includes(currency) ? currency : "USD";
  const amount = plan.prices[targetCurrency];
  const formattedPrice = formatPrice(amount, targetCurrency);

  return { plan, amount, formattedPrice };
}
