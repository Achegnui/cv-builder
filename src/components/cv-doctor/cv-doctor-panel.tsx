"use client";

import React, { useState } from "react";
import type { ValidationIssue } from "@/lib/validation";

interface CVDoctorPanelProps {
  issues: ValidationIssue[];
  onScrollToField?: (fieldId: string) => void;
}

export function CVDoctorPanel({ issues, onScrollToField }: CVDoctorPanelProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState<"all" | "error" | "warning">("all");

  const errors = issues.filter((i) => i.severity === "error");
  const warnings = issues.filter((i) => i.severity === "warning");
  const hasBlocking = issues.some((i) => i.blockingExport);

  const displayedIssues = issues.filter((issue) => {
    if (filterSeverity === "error") return issue.severity === "error";
    if (filterSeverity === "warning") return issue.severity === "warning";
    return true;
  });

  const handleJump = (fieldId?: string) => {
    if (!fieldId) return;
    if (onScrollToField) {
      onScrollToField(fieldId);
      return;
    }
    const el =
      document.getElementById(fieldId) ||
      document.getElementById(fieldId.replace(/-/g, ".")) ||
      document.querySelector(`[name="${fieldId}"]`) ||
      document.querySelector(`[name="${fieldId.replace(/-/g, ".")}"]`);

    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      (el as HTMLElement).focus();
      el.classList.add("ring-2", "ring-blue-500");
      setTimeout(() => el.classList.remove("ring-2", "ring-blue-500"), 2000);
    }
  };

  return (
    <div
      className={`no-print border rounded-lg shadow-sm transition-all mb-4 ${
        hasBlocking
          ? "border-red-300 bg-red-50/50"
          : issues.length > 0
          ? "border-amber-200 bg-amber-50/40"
          : "border-green-200 bg-green-50/40"
      }`}
    >
      {/* Header bar */}
      <div className="p-3 sm:p-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">
            {hasBlocking ? "🚨" : issues.length > 0 ? "🩺" : "✅"}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm sm:text-base text-neutral-900">
                CV Doctor
              </h3>
              {hasBlocking && (
                <span className="bg-red-600 text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                  Export Blocked
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-600">
              {issues.length === 0
                ? "All 8 CV checks passed. No issues found."
                : `${errors.length} error${errors.length === 1 ? "" : "s"}, ${warnings.length} warning${
                    warnings.length === 1 ? "" : "s"
                  } found.`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {issues.length > 0 && (
            <div className="flex items-center border border-neutral-300 rounded text-xs bg-white overflow-hidden">
              <button
                type="button"
                onClick={() => setFilterSeverity("all")}
                className={`px-2.5 py-1 font-medium ${
                  filterSeverity === "all" ? "bg-neutral-800 text-white" : "text-neutral-700 hover:bg-neutral-100"
                }`}
              >
                All ({issues.length})
              </button>
              {errors.length > 0 && (
                <button
                  type="button"
                  onClick={() => setFilterSeverity("error")}
                  className={`px-2.5 py-1 font-medium ${
                    filterSeverity === "error" ? "bg-red-600 text-white" : "text-red-700 hover:bg-red-50"
                  }`}
                >
                  Errors ({errors.length})
                </button>
              )}
              {warnings.length > 0 && (
                <button
                  type="button"
                  onClick={() => setFilterSeverity("warning")}
                  className={`px-2.5 py-1 font-medium ${
                    filterSeverity === "warning" ? "bg-amber-600 text-white" : "text-amber-800 hover:bg-amber-50"
                  }`}
                >
                  Warnings ({warnings.length})
                </button>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="text-xs font-medium px-2 py-1 bg-white border border-neutral-200 rounded text-neutral-700 hover:bg-neutral-50"
          >
            {isOpen ? "Collapse ▴" : "Expand ▾"}
          </button>
        </div>
      </div>

      {/* Issues list */}
      {isOpen && issues.length > 0 && (
        <div className="p-3 sm:p-4 pt-0 space-y-2.5 border-t border-neutral-200/60 mt-1">
          {hasBlocking && (
            <div className="p-2.5 bg-red-100/80 border border-red-300 rounded text-xs text-red-900 font-medium flex items-center gap-2">
              <span>⚠️</span>
              <span>
                <strong>Document Export is paused:</strong> Per product rules, unfinished placeholders
                (such as <code>[add number]</code>) must be completed or deleted before exporting Word or PDF.
              </span>
            </div>
          )}

          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {displayedIssues.map((issue) => {
              const isError = issue.severity === "error";
              return (
                <div
                  key={issue.id}
                  className={`p-3 rounded-md border text-xs sm:text-sm bg-white ${
                    isError ? "border-red-200 shadow-sm" : "border-amber-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                            isError
                              ? "bg-red-100 text-red-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {isError ? "Error • Blocks Export" : "Warning"}
                        </span>
                        <span className="font-semibold text-neutral-900">
                          {issue.location}
                        </span>
                      </div>
                      <p className="text-neutral-700">{issue.message}</p>
                      <p className="text-neutral-500 italic">
                        <strong>Suggested fix:</strong> {issue.suggestedFix}
                      </p>
                    </div>

                    {issue.fieldId && (
                      <button
                        type="button"
                        onClick={() => handleJump(issue.fieldId)}
                        className="shrink-0 text-xs text-blue-600 hover:text-blue-800 hover:underline font-semibold"
                      >
                        Jump to field →
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
