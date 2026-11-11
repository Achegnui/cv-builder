"use client";

import { useFormContext, useFieldArray } from "react-hook-form";
import type { CVData } from "@/lib/schema";
import { FieldError } from "./field-error";
import { SectionWrapper, EntryControls } from "./section-wrapper";

export function TeachingSection() {
  const { register, control } = useFormContext<CVData>();
  const { fields, append, remove, swap } = useFieldArray({
    control,
    name: "teaching",
  });

  const addEntry = () => {
    append({
      id: crypto.randomUUID(),
      role: "",
      course: "",
      institution: "",
      startDate: "",
      endDate: "",
      description: "",
    });
  };

  return (
    <SectionWrapper
      title="Teaching Experience (Academic)"
      description="Teaching assistantships, courses taught, and lecturing"
      onAdd={addEntry}
      addLabel="Add Teaching Entry"
      defaultOpen={false}
    >
      {fields.length === 0 && (
        <p className="text-sm text-neutral-400 italic">No teaching entries listed yet.</p>
      )}
      {fields.map((field, index) => {
        const prefix = `teaching.${index}` as const;
        return (
          <div key={field.id} className="border border-neutral-200 rounded-md p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-neutral-600">Teaching Entry {index + 1}</h3>
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
                <label htmlFor={`${prefix}.role`} className="block text-sm font-medium text-neutral-700">
                  Role *
                </label>
                <input
                  id={`${prefix}.role`}
                  {...register(`${prefix}.role`)}
                  placeholder="e.g. Teaching Assistant, Instructor"
                  className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <FieldError name={`${prefix}.role`} />
              </div>
              <div>
                <label htmlFor={`${prefix}.course`} className="block text-sm font-medium text-neutral-700">
                  Course Title / Code
                </label>
                <input
                  id={`${prefix}.course`}
                  {...register(`${prefix}.course`)}
                  placeholder="e.g. CS101: Introduction to Programming"
                  className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor={`${prefix}.institution`} className="block text-sm font-medium text-neutral-700">
                  Institution
                </label>
                <input
                  id={`${prefix}.institution`}
                  {...register(`${prefix}.institution`)}
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
                  Responsibilities
                </label>
                <textarea
                  id={`${prefix}.description`}
                  {...register(`${prefix}.description`)}
                  rows={2}
                  className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-y"
                  placeholder="Class size, labs led, office hours, grading responsibilities..."
                />
              </div>
            </div>
          </div>
        );
      })}
    </SectionWrapper>
  );
}
