"use client";

import React from "react";
import type { GuardViolation } from "@/lib/ai/types";

interface AIReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  originalText: string;
  suggestedText: string;
  violations?: GuardViolation[];
  onAccept: (text: string) => void;
}

export function AIReviewModal({
  isOpen,
  onClose,
  title,
  originalText,
  suggestedText,
  violations = [],
  onAccept,
}: AIReviewModalProps) {
  if (!isOpen) return null;

  const hasViolations = violations.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">✨</span>
            <h3 className="font-semibold text-neutral-900 text-sm sm:text-base">
              {title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-700 text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {/* Guardrail Status Banner */}
        {hasViolations ? (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-800 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <span>⚠️</span>
              <span>Honesty Guard Violation</span>
            </div>
            <p>
              This suggestion cannot be automatically applied because it violated honesty rules:
            </p>
            <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
              {violations.map((v, idx) => (
                <li key={idx}>
                  <strong>{v.type}:</strong> {v.details}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="p-2.5 bg-green-50 border border-green-200 rounded text-xs text-green-800 flex items-center gap-2">
            <span>🛡️</span>
            <span>
              <strong>Honesty Guard Passed:</strong> No invented facts, dates, tools, or banned clichés detected.
            </span>
          </div>
        )}

        {/* Before vs After Comparison */}
        <div className="space-y-3 text-xs">
          <div>
            <span className="block font-semibold text-neutral-500 mb-1">Original Text:</span>
            <div className="p-2.5 bg-neutral-100 rounded text-neutral-700 whitespace-pre-line border border-neutral-200">
              {originalText || "(Empty)"}
            </div>
          </div>

          <div>
            <span className="block font-semibold text-blue-700 mb-1">
              AI Proposed Improvement:
            </span>
            <div className="p-2.5 bg-blue-50/60 rounded text-neutral-900 whitespace-pre-line border border-blue-200 font-medium">
              {suggestedText}
            </div>
          </div>
        </div>

        {/* User confirmation actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-neutral-600 hover:bg-neutral-100 rounded"
          >
            {hasViolations ? "Close" : "Reject"}
          </button>
          {!hasViolations && (
            <button
              type="button"
              onClick={() => {
                onAccept(suggestedText);
                onClose();
              }}
              className="px-4 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Accept Change
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
