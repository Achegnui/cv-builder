"use client";

import { useFormContext, useFieldArray } from "react-hook-form";
import type { CVData } from "@/lib/schema";
import { FieldError } from "./field-error";
import { SectionWrapper, EntryControls } from "./section-wrapper";

export function GrantsSection() {
  const { register, control } = useFormContext<CVData>();
  const { fields, append, remove, swap } = useFieldArray({
    control,
    name: "grants",
  });

  const addEntry = () => {
    append({
      id: crypto.randomUUID(),
      title: "",
      funder: "",
      amount: "",
      currency: "",
      startDate: "",
      endDate: "",
      description: "",
    });
  };

  return (
    <SectionWrapper
      title="Grants & Fellowships (Academic)"
      description="Research funding, fellowships, and academic grants"
      onAdd={addEntry}
      addLabel="Add Grant"
      defaultOpen={false}
    >
      {fields.length === 0 && (
        <p className="text-sm text-neutral-400 italic">No grants listed yet.</p>
      )}
      {fields.map((field, index) => {
        const prefix = `grants.${index}` as const;
        return (
          <div key={field.id} className="border border-neutral-200 rounded-md p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-neutral-600">Grant {index + 1}</h3>
              <EntryControls
                index={index}
                total={fields.length}
                onMoveUp={() => swap(index, index - 1)}
                onMoveDown={() => swap(index, index + 1)}
                onRemove={() => remove(index)}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor={`${prefix}.title`} className="block text-sm font-medium text-neutral-700">
                  Grant / Project Title *
                </label>
                <input
                  id={`${prefix}.title`}
                  {...register(`${prefix}.title`)}
                  className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <FieldError name={`${prefix}.title`} />
              </div>
              <div>
                <label htmlFor={`${prefix}.funder`} className="block text-sm font-medium text-neutral-700">
                  Funding Body / Agency
                </label>
                <input
                  id={`${prefix}.funder`}
                  {...register(`${prefix}.funder`)}
                  className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor={`${prefix}.amount`} className="block text-sm font-medium text-neutral-700">
                  Amount
                </label>
                <input
                  id={`${prefix}.amount`}
                  {...register(`${prefix}.amount`)}
                  placeholder="e.g. 50,000"
                  className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor={`${prefix}.currency`} className="block text-sm font-medium text-neutral-700">
                  Currency
                </label>
                <input
                  id={`${prefix}.currency`}
                  {...register(`${prefix}.currency`)}
                  placeholder="e.g. USD, EUR, GBP, XAF"
                  className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor={`${prefix}.startDate`} className="block text-sm font-medium text-neutral-700">
                  Start Date
                </label>
                <input
                  id={`${prefix}.startDate`}
                  {...register(`${prefix}.startDate`)}
                  placeholder="YYYY-MM"
                  className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <FieldError name={`${prefix}.startDate`} />
              </div>
              <div>
                <label htmlFor={`${prefix}.endDate`} className="block text-sm font-medium text-neutral-700">
                  End Date
                </label>
                <input
                  id={`${prefix}.endDate`}
                  {...register(`${prefix}.endDate`)}
                  placeholder="YYYY-MM"
                  className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <FieldError name={`${prefix}.endDate`} />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor={`${prefix}.description`} className="block text-sm font-medium text-neutral-700">
                  Description / Deliverables
                </label>
                <textarea
                  id={`${prefix}.description`}
                  {...register(`${prefix}.description`)}
                  rows={2}
                  className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-y"
                />
              </div>
            </div>
          </div>
        );
      })}
    </SectionWrapper>
  );
}
