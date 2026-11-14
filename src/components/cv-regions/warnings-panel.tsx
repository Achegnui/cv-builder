"use client";

import React, { useState } from "react";
import type { RegionProfile, UserRegionOverrides } from "@/lib/regions";

interface WarningsPanelProps {
  profile: RegionProfile;
  overrides: UserRegionOverrides;
  onUpdateOverrides: (updated: UserRegionOverrides) => void;
}

export function WarningsPanel({
  profile,
  overrides,
  onUpdateOverrides,
}: WarningsPanelProps) {
  const [expandedWhyIds, setExpandedWhyIds] = useState<string[]>([]);

  // Filter out warnings dismissed by user
  const activeWarnings = profile.warnings.filter(
    (w) => !overrides.dismissedWarningIds.includes(w.id)
  );

  const toggleWhy = (id: string) => {
    setExpandedWhyIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const dismissWarning = (id: string) => {
    onUpdateOverrides({
      ...overrides,
      dismissedWarningIds: [...overrides.dismissedWarningIds, id],
    });
  };

  const resetDismissed = () => {
    onUpdateOverrides({
      ...overrides,
      dismissedWarningIds: [],
    });
  };

  const handleToggle = (
    key: "showPhoto" | "showDateOfBirth" | "showNationality"
  ) => {
    onUpdateOverrides({
      ...overrides,
      [key]: !overrides[key],
    });
  };

  if (activeWarnings.length === 0 && overrides.dismissedWarningIds.length === 0) {
    return null;
  }

  return (
    <aside
      className="no-print bg-amber-50/70 border border-amber-200 rounded-lg p-3 sm:p-4 mb-4 text-amber-900 text-xs sm:text-sm space-y-3"
      aria-label="Regional CV conventions and warnings"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-semibold text-amber-800">
          <span>⚠️</span>
          <span>Regional Conventions for {profile.name}</span>
        </div>
        {overrides.dismissedWarningIds.length > 0 && (
          <button
            type="button"
            onClick={resetDismissed}
            className="text-xs text-amber-700 underline hover:text-amber-900"
          >
            Show all dismissed ({overrides.dismissedWarningIds.length})
          </button>
        )}
      </div>

      <div className="space-y-2.5">
        {activeWarnings.map((warning) => {
          const isWhyOpen = expandedWhyIds.includes(warning.id);
          const toggleKey = warning.actionToggle?.key;
          const isToggleActive = toggleKey ? overrides[toggleKey] : false;

          return (
            <div
              key={warning.id}
              className="bg-white/80 border border-amber-200/60 rounded p-2.5 space-y-1.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1 flex-1">
                  <p className="font-medium text-neutral-800">
                    {warning.message}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-0.5">
                    <button
                      type="button"
                      onClick={() => toggleWhy(warning.id)}
                      className="text-xs font-semibold text-blue-700 hover:text-blue-900 hover:underline"
                    >
                      {isWhyOpen ? "Hide why ▴" : "Why is this? ▾"}
                    </button>

                    {warning.actionToggle && (
                      <label className="inline-flex items-center gap-1.5 text-xs text-neutral-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isToggleActive}
                          onChange={() => handleToggle(warning.actionToggle!.key)}
                          className="rounded text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                        />
                        <span>{warning.actionToggle.label}</span>
                      </label>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => dismissWarning(warning.id)}
                  className="text-neutral-400 hover:text-neutral-600 text-xs px-1"
                  title="Dismiss warning"
                  aria-label="Dismiss this warning"
                >
                  ✕
                </button>
              </div>

              {/* Expandable "Why" explanation */}
              {isWhyOpen && (
                <div className="p-2 bg-amber-50 rounded border border-amber-200/50 text-xs text-amber-900/90 leading-relaxed mt-1">
                  <strong>Why: </strong>
                  {warning.why}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
