"use client";

import React from "react";
import { useAIAction } from "@/components/cv-ai/ai-context";

interface AIToolbarProps {
  onOpenTailoring?: () => void;
}

export function AIToolbar({ onOpenTailoring }: AIToolbarProps) {
  const { openCoach, openSettings, isActionLoading } = useAIAction();

  return (
    <div className="no-print bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="text-xl">🤖</span>
        <div>
          <h3 className="text-xs sm:text-sm font-semibold text-blue-950 flex items-center gap-2">
            Honest AI Assistant
            <span className="text-[10px] font-normal uppercase tracking-wider bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded border border-blue-200">
              Zero Hallucinations
            </span>
          </h3>
          <p className="text-[11px] text-blue-800/80">
            Never invents facts, numbers, or tools. Guard-checked before suggestions appear.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {onOpenTailoring && (
          <button
            type="button"
            onClick={onOpenTailoring}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-xs transition-colors"
            title="Tailor your CV to a target job posting with honest gap analysis"
          >
            <span>🎯</span>
            <span>Job Tailoring</span>
          </button>
        )}

        <button
          type="button"
          onClick={openCoach}
          disabled={isActionLoading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white text-blue-700 hover:text-blue-900 border border-blue-300 hover:border-blue-400 rounded-md shadow-xs transition-colors disabled:opacity-50"
          title="Open Coach mode to interview you and review answers without ghostwriting"
        >
          <span>🎓</span>
          <span>Coach Mode</span>
        </button>

        <button
          type="button"
          onClick={openSettings}
          disabled={isActionLoading}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-neutral-700 bg-white hover:bg-neutral-50 border border-neutral-300 rounded-md shadow-xs transition-colors disabled:opacity-50"
          title="Configure banned words and style rules (e.g. avoid em dashes)"
        >
          <span>⚙️</span>
          <span>AI Settings</span>
        </button>
      </div>
    </div>
  );
}
