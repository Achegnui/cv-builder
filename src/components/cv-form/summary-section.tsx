"use client";

import { useFormContext } from "react-hook-form";
import type { CVData } from "@/lib/schema";
import { FieldError } from "./field-error";
import { SectionWrapper } from "./section-wrapper";
import { useAIAction } from "@/components/cv-ai/ai-context";
import type { VaultFact } from "@/lib/vault";

interface SummarySectionProps {
  vault?: VaultFact[];
}

export function SummarySection({ vault = [] }: SummarySectionProps) {
  const { register, setValue, getValues } = useFormContext<CVData>();
  const ai = useAIAction();

  const handleDraftFromVault = () => {
    const currentSummary = getValues("summary.text") || "";
    ai.draftSummary(
      vault,
      currentSummary,
      (summary: string) => setValue("summary.text", summary, { shouldDirty: true }),
    );
  };

  return (
    <SectionWrapper title="Summary" description="A short professional summary or objective">
      <div>
        <div className="flex items-center justify-between mb-1">
          <label htmlFor="summary.text" className="block text-sm font-medium text-neutral-700">
            Summary
          </label>
          <button
            type="button"
            onClick={handleDraftFromVault}
            disabled={ai.isActionLoading || vault.length === 0}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium disabled:opacity-40 disabled:cursor-not-allowed"
            title={vault.length === 0 ? "Add facts to the Evidence Vault first" : "Draft a summary from your verified vault facts"}
          >
            ✨ Draft from Vault
          </button>
        </div>
        <textarea
          id="summary.text"
          {...register("summary.text")}
          rows={4}
          className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-y"
          placeholder="Write a brief professional summary..."
        />
        <FieldError name="summary.text" />
      </div>
    </SectionWrapper>
  );
}
