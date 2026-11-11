"use client";

import { useFormContext } from "react-hook-form";
import type { CVData } from "@/lib/schema";
import { FieldError } from "./field-error";
import { SectionWrapper } from "./section-wrapper";

export function SummarySection() {
  const { register } = useFormContext<CVData>();

  return (
    <SectionWrapper title="Summary" description="A short professional summary or objective">
      <div>
        <label htmlFor="summary.text" className="block text-sm font-medium text-neutral-700">
          Summary
        </label>
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
