"use client";

import React, { useState } from "react";
import { useAuth } from "@/components/auth/auth-context";
import {
  PRICING_PLANS,
  SUPPORTED_CURRENCIES,
  type Currency,
  type PaymentPlanType,
  formatPrice,
} from "@/lib/payments";

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuth?: () => void;
  onOpenReceipts?: () => void;
}

export function PricingModal({ isOpen, onClose, onOpenAuth, onOpenReceipts }: PricingModalProps) {
  const { user } = useAuth();
  const [currency, setCurrency] = useState<Currency>("USD");
  const [selectedPlan, setSelectedPlan] = useState<PaymentPlanType>("lifetime");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCheckout = async (planType: PaymentPlanType) => {
    setError(null);

    // If user is not logged in, prompt to sign in/create account first
    if (!user) {
      if (onOpenAuth) {
        onOpenAuth();
      } else {
        setError("Please sign in or create an account first to link your export pass.");
      }
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planType,
          currency,
          redirectUrl: `${window.location.origin}/?payment=completed`,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to initiate checkout session");
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Checkout error";
      setError(msg);
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/50">
          <div>
            <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
              <span>💎</span> Unlock Clean Watermark-Free Exports
            </h2>
            <p className="text-xs text-neutral-500">
              One-time payment • No subscriptions • Cards &amp; Mobile Money (MTN / Orange) accepted
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 rounded-md p-1"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="px-6 py-2.5 bg-red-50 border-b border-red-200 text-xs text-red-700">
            {error}
          </div>
        )}

        <div className="p-6 overflow-y-auto space-y-6">
          {/* Currency Switcher */}
          <div className="flex items-center justify-between bg-neutral-100 p-2.5 rounded-lg border border-neutral-200">
            <span className="text-xs font-semibold text-neutral-700">Display Currency:</span>
            <div className="flex gap-1">
              {SUPPORTED_CURRENCIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCurrency(c)}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                    currency === c
                      ? "bg-neutral-900 text-white shadow-sm"
                      : "text-neutral-600 hover:text-neutral-900"
                  }`}
                >
                  {c === "XAF" ? "XAF (FCFA)" : c}
                </button>
              ))}
            </div>
          </div>

          {/* Pricing Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Single Export Pass */}
            <div
              onClick={() => setSelectedPlan("per_export")}
              className={`p-5 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                selectedPlan === "per_export"
                  ? "border-neutral-900 bg-neutral-50/60 shadow-md"
                  : "border-neutral-200 hover:border-neutral-300 bg-white"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-neutral-900">Single Export Pass</h3>
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 bg-neutral-200 text-neutral-800 rounded">
                    1 Export
                  </span>
                </div>
                <div className="text-2xl font-black text-neutral-900 mb-1">
                  {formatPrice(PRICING_PLANS.per_export.prices[currency], currency)}
                </div>
                <p className="text-xs text-neutral-500 mb-4">
                  {PRICING_PLANS.per_export.description}
                </p>

                <ul className="text-xs text-neutral-700 space-y-2 mb-6">
                  {PRICING_PLANS.per_export.features.map((feat, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                disabled={isLoading}
                onClick={(e) => {
                  e.stopPropagation();
                  handleCheckout("per_export");
                }}
                className="w-full py-2.5 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 text-xs font-bold rounded-lg border border-neutral-300 transition-colors disabled:opacity-50"
              >
                {isLoading && selectedPlan === "per_export" ? "Preparing Checkout..." : "Buy Single Pass"}
              </button>
            </div>

            {/* Lifetime Unlimited Pass */}
            <div
              onClick={() => setSelectedPlan("lifetime")}
              className={`p-5 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between relative ${
                selectedPlan === "lifetime"
                  ? "border-neutral-900 bg-neutral-50/60 shadow-md ring-2 ring-neutral-900/10"
                  : "border-neutral-200 hover:border-neutral-300 bg-white"
              }`}
            >
              <div className="absolute -top-3 right-4 px-2.5 py-0.5 bg-amber-500 text-white text-[10px] font-bold uppercase rounded-full shadow-sm tracking-wide">
                Best Value
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-neutral-900">Lifetime Pass</h3>
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 bg-neutral-900 text-white rounded">
                    Unlimited
                  </span>
                </div>
                <div className="text-2xl font-black text-neutral-900 mb-1">
                  {formatPrice(PRICING_PLANS.lifetime.prices[currency], currency)}
                </div>
                <p className="text-xs text-neutral-500 mb-4">
                  {PRICING_PLANS.lifetime.description}
                </p>

                <ul className="text-xs text-neutral-700 space-y-2 mb-6">
                  {PRICING_PLANS.lifetime.features.map((feat, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                disabled={isLoading}
                onClick={(e) => {
                  e.stopPropagation();
                  handleCheckout("lifetime");
                }}
                className="w-full py-2.5 px-4 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold rounded-lg shadow-sm transition-colors disabled:opacity-50"
              >
                {isLoading && selectedPlan === "lifetime" ? "Preparing Checkout..." : "Get Lifetime Pass"}
              </button>
            </div>
          </div>

          {/* Privacy & Honesty Guarantees */}
          <div className="bg-neutral-50 p-3.5 rounded-lg border border-neutral-200 text-[11px] text-neutral-600 space-y-1">
            <div className="font-semibold text-neutral-800">Our Fair Payment Promise:</div>
            <div>• <strong>No Recurring Charges:</strong> All options are strictly one-time payments. No automatic rebilling.</div>
            <div>• <strong>Server Verified:</strong> Payments are cryptographically confirmed with signature verification.</div>
            <div>• <strong>Privacy First:</strong> CV content is never sent to payment gateways or logged to server output.</div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between text-xs text-neutral-500">
          <div>Secured by Flutterwave (Test Sandbox)</div>
          {onOpenReceipts && user && (
            <button
              type="button"
              onClick={onOpenReceipts}
              className="text-neutral-700 hover:text-neutral-900 font-medium underline"
            >
              View Past Receipts 🧾
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
