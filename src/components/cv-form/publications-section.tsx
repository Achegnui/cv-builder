"use client";

import { useFormContext, useFieldArray } from "react-hook-form";
import type { CVData } from "@/lib/schema";
import { FieldError } from "./field-error";
import { SectionWrapper, EntryControls } from "./section-wrapper";

export function PublicationsSection() {
  const { register, control } = useFormContext<CVData>();
  const { fields, append, remove, swap } = useFieldArray({
    control,
    name: "publications",
  });

  const addEntry = () => {
    append({
      id: crypto.randomUUID(),
      title: "",
      authors: "",
      venue: "",
      date: "",
      doi: "",
      url: "",
    });
  };

  return (
    <SectionWrapper
      title="Publications (Academic)"
      description="Peer-reviewed papers, articles, book chapters, and preprints"
      onAdd={addEntry}
      addLabel="Add Publication"
      defaultOpen={false}
    >
      {fields.length === 0 && (
        <p className="text-sm text-neutral-400 italic">No publications listed yet.</p>
      )}
      {fields.map((field, index) => {
        const prefix = `publications.${index}` as const;
        return (
          <div key={field.id} className="border border-neutral-200 rounded-md p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-neutral-600">Publication {index + 1}</h3>
              <EntryControls
                index={index}
                total={fields.length}
                onMoveUp={() => swap(index, index - 1)}
                onMoveDown={() => swap(index, index + 1)}
                onRemove={() => remove(index)}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label htmlFor={`${prefix}.title`} className="block text-sm font-medium text-neutral-700">
                  Paper / Article Title *
                </label>
                <input
                  id={`${prefix}.title`}
                  {...register(`${prefix}.title`)}
                  className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <FieldError name={`${prefix}.title`} />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor={`${prefix}.authors`} className="block text-sm font-medium text-neutral-700">
                  Authors
                </label>
                <input
                  id={`${prefix}.authors`}
                  {...register(`${prefix}.authors`)}
                  placeholder="e.g. A. Sample, B. Cooper, J. Doe"
                  className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor={`${prefix}.venue`} className="block text-sm font-medium text-neutral-700">
                  Journal / Conference / Publisher
                </label>
                <input
                  id={`${prefix}.venue`}
                  {...register(`${prefix}.venue`)}
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
              <div>
                <label htmlFor={`${prefix}.doi`} className="block text-sm font-medium text-neutral-700">
                  DOI
                </label>
                <input
                  id={`${prefix}.doi`}
                  {...register(`${prefix}.doi`)}
                  placeholder="10.1000/182"
                  className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor={`${prefix}.url`} className="block text-sm font-medium text-neutral-700">
                  URL
                </label>
                <input
                  id={`${prefix}.url`}
                  {...register(`${prefix}.url`)}
                  placeholder="https://..."
                  className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <FieldError name={`${prefix}.url`} />
              </div>
            </div>
          </div>
        );
      })}
    </SectionWrapper>
  );
}
