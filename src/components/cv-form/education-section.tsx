"use client";

import { useFormContext, useFieldArray } from "react-hook-form";
import type { CVData } from "@/lib/schema";
import { FieldError } from "./field-error";
import { SectionWrapper, EntryControls } from "./section-wrapper";
import { BulletList } from "./experience-section";

export function EducationSection() {
  const { register, control } = useFormContext<CVData>();
  const { fields, append, remove, swap } = useFieldArray({
    control,
    name: "education",
  });

  const addEntry = () => {
    append({
      id: crypto.randomUUID(),
      institution: "",
      degree: "",
      field: "",
      gpa: "",
      degreeClassification: "",
      startDate: "",
      endDate: "",
      isExpected: false,
      bullets: [],
    });
  };

  return (
    <SectionWrapper
      title="Education"
      description="Degrees, diplomas, and coursework"
      onAdd={addEntry}
      addLabel="Add Education"
    >
      {fields.length === 0 && (
        <p className="text-sm text-neutral-400 italic">No education entries yet.</p>
      )}
      {fields.map((field, index) => (
        <EducationEntry
          key={field.id}
          index={index}
          total={fields.length}
          onRemove={() => remove(index)}
          onMoveUp={() => swap(index, index - 1)}
          onMoveDown={() => swap(index, index + 1)}
          register={register}
        />
      ))}
    </SectionWrapper>
  );
}

function EducationEntry({
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
  const prefix = `education.${index}` as const;

  return (
    <div className="border border-neutral-200 rounded-md p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-neutral-600">Entry {index + 1}</h3>
        <EntryControls index={index} total={total} onMoveUp={onMoveUp} onMoveDown={onMoveDown} onRemove={onRemove} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor={`${prefix}.institution`} className="block text-sm font-medium text-neutral-700">Institution *</label>
          <input id={`${prefix}.institution`} {...register(`${prefix}.institution`)} className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
          <FieldError name={`${prefix}.institution`} />
        </div>
        <div>
          <label htmlFor={`${prefix}.degree`} className="block text-sm font-medium text-neutral-700">Degree *</label>
          <input id={`${prefix}.degree`} {...register(`${prefix}.degree`)} className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
          <FieldError name={`${prefix}.degree`} />
        </div>
        <div>
          <label htmlFor={`${prefix}.field`} className="block text-sm font-medium text-neutral-700">Field of Study</label>
          <input id={`${prefix}.field`} {...register(`${prefix}.field`)} className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
        </div>
        <div>
          <label htmlFor={`${prefix}.gpa`} className="block text-sm font-medium text-neutral-700">
            GPA
          </label>
          <input id={`${prefix}.gpa`} {...register(`${prefix}.gpa`)} placeholder='e.g. 3.8/4.0' className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
          <p className="text-xs text-neutral-400 mt-0.5">Numeric grade point average</p>
        </div>
        <div>
          <label htmlFor={`${prefix}.degreeClassification`} className="block text-sm font-medium text-neutral-700">
            Degree Classification
          </label>
          <input id={`${prefix}.degreeClassification`} {...register(`${prefix}.degreeClassification`)} placeholder='e.g. First Class Honours, 2:1' className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
          <p className="text-xs text-neutral-400 mt-0.5">UK/European classification (separate from GPA)</p>
        </div>
        <div className="flex items-end gap-2">
          <label className="flex items-center gap-2 text-sm text-neutral-700 pb-2">
            <input type="checkbox" {...register(`${prefix}.isExpected`)} className="rounded" />
            Expected (not yet completed)
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
