"use client";

import React, { useState, useEffect, useCallback } from "react";
import type { Receipt } from "@/lib/payments";

interface ReceiptsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ReceiptsModal({ isOpen, onClose }: ReceiptsModalProps) {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchReceipts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/payments/receipts");
      if (res.ok) {
        const data = await res.json();
        setReceipts(data.receipts || []);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchReceipts();
    }
  }, [isOpen, fetchReceipts]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
          <div>
            <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
              <span>🧾</span> Payment Receipts
            </h2>
            <p className="text-xs text-neutral-500">
              Official records of your clean export pass purchases.
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

        <div className="p-6 overflow-y-auto">
          {isLoading ? (
            <div className="py-8 text-center text-xs text-neutral-500">
              Loading receipts...
            </div>
          ) : receipts.length === 0 ? (
            <div className="py-8 text-center bg-neutral-50 rounded-lg border border-neutral-200 border-dashed text-xs text-neutral-500">
              No purchases found. Once you purchase an export pass, your official receipt will appear here.
            </div>
          ) : (
            <div className="space-y-4">
              {receipts.map((r) => (
                <div
                  key={r.id}
                  className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 text-xs space-y-2"
                >
                  <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
                    <span className="font-mono font-bold text-neutral-900">{r.id}</span>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded text-[10px]">
                      PAID
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-neutral-600 pt-1">
                    <div>
                      <span className="block text-[10px] uppercase font-semibold text-neutral-400">Plan</span>
                      <span className="font-bold text-neutral-800">{r.planName}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase font-semibold text-neutral-400">Amount</span>
                      <span className="font-bold text-neutral-900">
                        {r.currency} {r.amount}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase font-semibold text-neutral-400">Method</span>
                      <span className="capitalize">{r.paymentMethod}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase font-semibold text-neutral-400">Date</span>
                      <span>{new Date(r.issuedAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="pt-2 text-[10px] text-neutral-400 font-mono truncate">
                    Ref: {r.txRef}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
