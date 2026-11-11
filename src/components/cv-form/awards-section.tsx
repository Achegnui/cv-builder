"use client";

import { useFormContext, useFieldArray } from "react-hook-form";
import type { CVData } from "@/lib/schema";
import { FieldError } from "./field-error";
import { SectionWrapper, EntryControls } from "./section-wrapper";

export function AwardsSection() {
  const { register, control } = useFormContext<CVData>();
  const { fields, append, remove, swap } = useFieldArray({
    control,
    name: "awards",
  });

  const addEntry = () => {
    append({
      id: crypto.randomUUID(),
      title: "",
      issuer: "",
      date: "",
      description: "",
    });
  };

  return (
    <SectionWrapper
      title="Honors & Awards"
      description="Scholarships, competition wins, and recognitions"
      onAdd={addEntry}
      addLabel="Add Award"
    >
      {fields.length === 0 && (
        <p className="text-sm text-neutral-400 italic">No awards added yet.</p>
      )}
      {fields.map((field, index) => {
        const prefix = `awards.${index}` as const;
        return (
          <div key={field.id} className="border border-neutral-200 rounded-md p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-neutral-600">Award {index + 1}</h3>
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
                  Award Title *
                </label>
                <input
                  id={`${prefix}.title`}
                  {...register(`${prefix}.title`)}
                  className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <FieldError name={`${prefix}.title`} />
              </div>
              <div>
                <label htmlFor={`${prefix}.issuer`} className="block text-sm font-medium text-neutral-700">
                  Issuer / Organization
                </label>
                <input
                  id={`${prefix}.issuer`}
                  {...register(`${prefix}.issuer`)}
                  className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor={`${prefix}.date`} className="block text-sm font-medium text-neutral-700">
                  Date
                </label>
                <input
                  id={`${prefix}.date`}
                  {...register(`${prefix}.date`)}
                  placeholder="YYYY-MM"
                  className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <FieldError name={`${prefix}.date`} />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor={`${prefix}.description`} className="block text-sm font-medium text-neutral-700">
                  Description
                </label>
                <textarea
                  id={`${prefix}.description`}
                  {...register(`${prefix}.description`)}
                  rows={2}
                  className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-y"
                  placeholder="Context or criteria for the award..."
                />
              </div>
            </div>
          </div>
        );
      })}
    </SectionWrapper>
  );
}
