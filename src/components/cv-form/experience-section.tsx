"use client";

import React from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import type { CVData } from "@/lib/schema";
import { FieldError } from "./field-error";
import { SectionWrapper, EntryControls } from "./section-wrapper";

export function ExperienceSection() {
  const { register, control } = useFormContext<CVData>();
  const { fields, append, remove, swap } = useFieldArray({
    control,
    name: "experience",
  });

  const addEntry = () => {
    append({
      id: crypto.randomUUID(),
      employer: "",
      title: "",
      location: "",
      startDate: "",
      endDate: "",
      isCurrent: false,
      bullets: [],
    });
  };

  return (
    <SectionWrapper
      title="Experience"
      description="Work experience, internships, and relevant positions"
      onAdd={addEntry}
      addLabel="Add Experience"
    >
      {fields.length === 0 && (
        <p className="text-sm text-neutral-400 italic">No experience entries yet.</p>
      )}
      {fields.map((field, index) => (
        <ExperienceEntry key={field.id} index={index} total={fields.length} onRemove={() => remove(index)} onMoveUp={() => swap(index, index - 1)} onMoveDown={() => swap(index, index + 1)} register={register} />
      ))}
    </SectionWrapper>
  );
}

function ExperienceEntry({
  index,
  total,
  onRemove,
  onMoveUp,
  onMoveDown,
  register,
}: {
  index: number;
  total: number;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  register: ReturnType<typeof useFormContext<CVData>>["register"];
}) {
  const prefix = `experience.${index}` as const;

  return (
    <div className="border border-neutral-200 rounded-md p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-neutral-600">Entry {index + 1}</h3>
        <EntryControls index={index} total={total} onMoveUp={onMoveUp} onMoveDown={onMoveDown} onRemove={onRemove} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor={`${prefix}.employer`} className="block text-sm font-medium text-neutral-700">Employer *</label>
          <input id={`${prefix}.employer`} {...register(`${prefix}.employer`)} className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
          <FieldError name={`${prefix}.employer`} />
        </div>
        <div>
          <label htmlFor={`${prefix}.title`} className="block text-sm font-medium text-neutral-700">Job Title *</label>
          <input id={`${prefix}.title`} {...register(`${prefix}.title`)} className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
          <FieldError name={`${prefix}.title`} />
        </div>
        <div>
          <label htmlFor={`${prefix}.location`} className="block text-sm font-medium text-neutral-700">Location</label>
          <input id={`${prefix}.location`} {...register(`${prefix}.location`)} className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
        </div>
        <div className="flex items-end gap-2">
          <label className="flex items-center gap-2 text-sm text-neutral-700 pb-2">
            <input type="checkbox" {...register(`${prefix}.isCurrent`)} className="rounded" />
            Currently working here
          </label>
        </div>
        <div>
          <label htmlFor={`${prefix}.startDate`} className="block text-sm font-medium text-neutral-700">Start Date *</label>
          <input id={`${prefix}.startDate`} {...register(`${prefix}.startDate`)} placeholder="YYYY-MM" className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
          <FieldError name={`${prefix}.startDate`} />
        </div>
        <div>
          <label htmlFor={`${prefix}.endDate`} className="block text-sm font-medium text-neutral-700">End Date</label>
          <input id={`${prefix}.endDate`} {...register(`${prefix}.endDate`)} placeholder="YYYY-MM" className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
          <FieldError name={`${prefix}.endDate`} />
        </div>
      </div>

      <BulletList prefix={prefix} register={register} />
    </div>
  );
}

/** Editable list of bullet points for an experience or education entry. */
function BulletList({
  prefix,
  register,
}: {
  prefix: string;
  register: ReturnType<typeof useFormContext<CVData>>["register"];
}) {
  const { control } = useFormContext<CVData>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- useFieldArray needs the generic path
  const { fields, append, remove } = useFieldArray({ control, name: `${prefix}.bullets` as any });

  return (
    <div>
      <p className="text-sm font-medium text-neutral-700 mb-1">Bullet Points</p>
      {fields.map((bulletField, bIdx) => (
        <div key={bulletField.id} className="flex gap-2 mb-2">
          <span className="text-neutral-400 pt-2 text-sm">•</span>
          <input
            {...register(`${prefix}.bullets.${bIdx}` as `experience.${number}.bullets.${number}`)}
            className="flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="Describe an achievement or responsibility..."
          />
          <button type="button" onClick={() => remove(bIdx)} className="text-red-400 hover:text-red-600 text-sm" aria-label="Remove bullet">✕</button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => append("" as never)}
        className="text-sm text-blue-600 hover:text-blue-800"
      >
        + Add bullet
      </button>
    </div>
  );
}

export { BulletList };
