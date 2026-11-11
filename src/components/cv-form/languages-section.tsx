"use client";

import { useFormContext, useFieldArray } from "react-hook-form";
import type { CVData } from "@/lib/schema";
import { FieldError } from "./field-error";
import { SectionWrapper, EntryControls } from "./section-wrapper";

export function LanguagesSection() {
  const { register, control } = useFormContext<CVData>();
  const { fields, append, remove, swap } = useFieldArray({
    control,
    name: "languages",
  });

  const addEntry = () => {
    append({
      id: crypto.randomUUID(),
      language: "",
      proficiency: "intermediate",
    });
  };

  return (
    <SectionWrapper
      title="Languages"
      description="Spoken and written languages"
      onAdd={addEntry}
      addLabel="Add Language"
    >
      {fields.length === 0 && (
        <p className="text-sm text-neutral-400 italic">No languages added yet.</p>
      )}
      {fields.map((field, index) => {
        const prefix = `languages.${index}` as const;
        return (
          <div key={field.id} className="border border-neutral-200 rounded-md p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-neutral-600">Language {index + 1}</h3>
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
                <label htmlFor={`${prefix}.language`} className="block text-sm font-medium text-neutral-700">
                  Language *
                </label>
                <input
                  id={`${prefix}.language`}
                  {...register(`${prefix}.language`)}
                  placeholder="e.g. English, French, Spanish"
                  className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <FieldError name={`${prefix}.language`} />
              </div>
              <div>
                <label htmlFor={`${prefix}.proficiency`} className="block text-sm font-medium text-neutral-700">
                  Proficiency *
                </label>
                <select
                  id={`${prefix}.proficiency`}
                  {...register(`${prefix}.proficiency`)}
                  className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="native">Native / Bilingual</option>
                  <option value="fluent">Fluent</option>
                  <option value="advanced">Advanced</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="beginner">Beginner</option>
                </select>
                <FieldError name={`${prefix}.proficiency`} />
              </div>
            </div>
          </div>
        );
      })}
    </SectionWrapper>
  );
}
