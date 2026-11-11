"use client";

import { useFormContext, useFieldArray } from "react-hook-form";
import type { CVData } from "@/lib/schema";
import { FieldError } from "./field-error";
import { SectionWrapper, EntryControls } from "./section-wrapper";

export function ConferencesSection() {
  const { register, control } = useFormContext<CVData>();
  const { fields, append, remove, swap } = useFieldArray({
    control,
    name: "conferences",
  });

  const addEntry = () => {
    append({
      id: crypto.randomUUID(),
      title: "",
      role: "attendee",
      event: "",
      location: "",
      date: "",
    });
  };

  return (
    <SectionWrapper
      title="Conferences & Talks (Academic)"
      description="Conferences attended, presentations given, and workshops organized"
      onAdd={addEntry}
      addLabel="Add Conference"
      defaultOpen={false}
    >
      {fields.length === 0 && (
        <p className="text-sm text-neutral-400 italic">No conferences listed yet.</p>
      )}
      {fields.map((field, index) => {
        const prefix = `conferences.${index}` as const;
        return (
          <div key={field.id} className="border border-neutral-200 rounded-md p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-neutral-600">Conference {index + 1}</h3>
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
                  Talk / Presentation Title *
                </label>
                <input
                  id={`${prefix}.title`}
                  {...register(`${prefix}.title`)}
                  className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <FieldError name={`${prefix}.title`} />
              </div>
              <div>
                <label htmlFor={`${prefix}.role`} className="block text-sm font-medium text-neutral-700">
                  Role *
                </label>
                <select
                  id={`${prefix}.role`}
                  {...register(`${prefix}.role`)}
                  className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="presenter">Presenter / Speaker</option>
                  <option value="attendee">Attendee</option>
                  <option value="organiser">Organizer / Committee</option>
                </select>
                <FieldError name={`${prefix}.role`} />
              </div>
              <div>
                <label htmlFor={`${prefix}.event`} className="block text-sm font-medium text-neutral-700">
                  Conference / Event Name
                </label>
                <input
                  id={`${prefix}.event`}
                  {...register(`${prefix}.event`)}
                  className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor={`${prefix}.location`} className="block text-sm font-medium text-neutral-700">
                  Location
                </label>
                <input
                  id={`${prefix}.location`}
                  {...register(`${prefix}.location`)}
                  placeholder="e.g. Paris, France or Online"
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
            </div>
          </div>
        );
      })}
    </SectionWrapper>
  );
}
