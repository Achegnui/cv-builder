"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import type { HonestyGuardConfig, GuardViolation, AIActionResponse } from "@/lib/ai/types";
import { DEFAULT_GUARD_CONFIG } from "@/lib/ai/guard";
import type { VaultFact } from "@/lib/vault";
import { AIReviewModal } from "./ai-review-modal";
import { AISettingsModal } from "./ai-settings-modal";
import { CoachModal } from "@/components/cv-coach/coach-modal";

interface AIContextType {
  config: HonestyGuardConfig;
  updateConfig: (updated: HonestyGuardConfig) => void;
  openCoach: () => void;
  openSettings: () => void;
  improveBullet: (
    bulletText: string,
    onApply: (improved: string) => void,
    context?: { employer?: string; jobTitle?: string }
  ) => Promise<void>;
  draftSummary: (
    vaultFacts: VaultFact[],
    currentSummary: string,
    onApply: (summary: string) => void
  ) => Promise<void>;
  explainWarning: (warning: string) => Promise<void>;
  isActionLoading: boolean;
}

const AIContext = createContext<AIContextType | null>(null);

export function useAIAction() {
  const ctx = useContext(AIContext);
  if (!ctx) {
    throw new Error("useAIAction must be used within an AIActionProvider");
  }
  return ctx;
}

export function AIActionProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<HonestyGuardConfig>(DEFAULT_GUARD_CONFIG);
  const [isCoachOpen, setIsCoachOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Review Modal State
  const [reviewState, setReviewState] = useState<{
    isOpen: boolean;
    title: string;
    originalText: string;
    suggestedText: string;
    violations?: GuardViolation[];
    onAccept: (text: string) => void;
  }>({
    isOpen: false,
    title: "",
    originalText: "",
    suggestedText: "",
    onAccept: () => {},
  });

  // Load config from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("cv-builder-ai-config");
      if (saved) {
        setConfig(JSON.parse(saved));
      }
    } catch {
      // Ignore load error
    }
  }, []);

  const updateConfig = (updated: HonestyGuardConfig) => {
    setConfig(updated);
    try {
      localStorage.setItem("cv-builder-ai-config", JSON.stringify(updated));
    } catch {
      // Ignore storage error
    }
  };

  const executeAction = async (
    action: "improve-bullet" | "draft-summary" | "explain-warning",
    input: string,
    title: string,
    onApply: (text: string) => void,
    extraContext?: Record<string, unknown>
  ) => {
    if (!input.trim()) return;

    setIsActionLoading(true);
    try {
      const response = await fetch("/api/ai/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          input,
          context: extraContext,
          config,
        }),
      });

      const data: AIActionResponse = await response.json();

      if (data.success && data.suggestedOutput) {
        setReviewState({
          isOpen: true,
          title,
          originalText: input,
          suggestedText: data.suggestedOutput,
          violations: [],
          onAccept: onApply,
        });
      } else {
        // Honesty guard caught a violation or error
        setReviewState({
          isOpen: true,
          title: `${title} (Rejected by Guard)`,
          originalText: input,
          suggestedText: data.suggestedOutput || data.error || "No suggestions available.",
          violations: data.guardViolations || [
            { type: "number", term: "Invalid output", details: data.error || "Action failed honesty check." },
          ],
          onAccept: () => {},
        });
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to execute AI action");
    } finally {
      setIsActionLoading(false);
    }
  };

  const improveBullet = async (
    bulletText: string,
    onApply: (improved: string) => void,
    context?: { employer?: string; jobTitle?: string }
  ) => {
    await executeAction("improve-bullet", bulletText, "AI Bullet Improvement", onApply, context);
  };

  const draftSummary = async (
    vaultFacts: VaultFact[],
    currentSummary: string,
    onApply: (summary: string) => void
  ) => {
    await executeAction(
      "draft-summary",
      currentSummary || "Draft a professional summary using confirmed facts.",
      "Draft Summary from Evidence Vault",
      onApply,
      { vaultFacts }
    );
  };

  const explainWarning = async (warning: string) => {
    await executeAction(
      "explain-warning",
      warning,
      "CV Doctor Advice Explanation",
      () => {},
      { warningMessage: warning }
    );
  };

  return (
    <AIContext.Provider
      value={{
        config,
        updateConfig,
        openCoach: () => setIsCoachOpen(true),
        openSettings: () => setIsSettingsOpen(true),
        improveBullet,
        draftSummary,
        explainWarning,
        isActionLoading,
      }}
    >
      {children}

      {/* Review Modal for Before vs After confirmation */}
      <AIReviewModal
        isOpen={reviewState.isOpen}
        onClose={() => setReviewState((prev) => ({ ...prev, isOpen: false }))}
        title={reviewState.title}
        originalText={reviewState.originalText}
        suggestedText={reviewState.suggestedText}
        violations={reviewState.violations}
        onAccept={reviewState.onAccept}
      />

      {/* Settings Modal */}
      <AISettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onSaveConfig={updateConfig}
      />

      {/* Coach Modal */}
      <CoachModal
        isOpen={isCoachOpen}
        onClose={() => setIsCoachOpen(false)}
      />
    </AIContext.Provider>
  );
}
