"use client";

import { useFormContext, useFieldArray } from "react-hook-form";
import type { CVData } from "@/lib/schema";
import { FieldError } from "./field-error";
import { SectionWrapper, EntryControls } from "./section-wrapper";

export function ProjectsSection() {
  const { register, control } = useFormContext<CVData>();
  const { fields, append, remove, swap } = useFieldArray({
    control,
    name: "projects",
  });

  const addEntry = () => {
    append({
      id: crypto.randomUUID(),
      name: "",
      description: "",
      techStack: [],
      links: [],
      startDate: "",
      endDate: "",
    });
  };

  return (
    <SectionWrapper
      title="Projects"
      description="Personal, academic, or side projects"
      onAdd={addEntry}
      addLabel="Add Project"
    >
      {fields.length === 0 && (
        <p className="text-sm text-neutral-400 italic">No projects yet.</p>
      )}
      {fields.map((field, index) => (
        <ProjectEntry
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

function ProjectEntry({
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
  const prefix = `projects.${index}` as const;
  const { control } = useFormContext<CVData>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- useFieldArray nested path
  const { fields: techFields, append: appendTech, remove: removeTech } = useFieldArray({
    control,
    name: `${prefix}.techStack` as any,
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- useFieldArray nested path
  const { fields: linkFields, append: appendLink, remove: removeLink } = useFieldArray({
    control,
    name: `${prefix}.links` as any,
  });

  return (
    <div className="border border-neutral-200 rounded-md p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-neutral-600">Project {index + 1}</h3>
        <EntryControls index={index} total={total} onMoveUp={onMoveUp} onMoveDown={onMoveDown} onRemove={onRemove} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <label htmlFor={`${prefix}.name`} className="block text-sm font-medium text-neutral-700">Project Name *</label>
          <input id={`${prefix}.name`} {...register(`${prefix}.name`)} className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
          <FieldError name={`${prefix}.name`} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor={`${prefix}.description`} className="block text-sm font-medium text-neutral-700">Description</label>
          <textarea id={`${prefix}.description`} {...register(`${prefix}.description`)} rows={2} className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-y" />
        </div>
        <div>
          <label htmlFor={`${prefix}.startDate`} className="block text-sm font-medium text-neutral-700">Start Date</label>
          <input id={`${prefix}.startDate`} {...register(`${prefix}.startDate`)} placeholder="YYYY-MM" className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
          <FieldError name={`${prefix}.startDate`} />
        </div>
        <div>
          <label htmlFor={`${prefix}.endDate`} className="block text-sm font-medium text-neutral-700">End Date</label>
          <input id={`${prefix}.endDate`} {...register(`${prefix}.endDate`)} placeholder="YYYY-MM" className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
          <FieldError name={`${prefix}.endDate`} />
        </div>
      </div>

      {/* Tech Stack */}
      <div>
        <p className="text-sm font-medium text-neutral-700 mb-1">Tech Stack</p>
        {techFields.map((tf, tIdx) => (
          <div key={tf.id} className="flex gap-2 mb-2">
            <input
              {...register(`${prefix}.techStack.${tIdx}` as `projects.${number}.techStack.${number}`)}
              className="flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Technology"
            />
            <button type="button" onClick={() => removeTech(tIdx)} className="text-red-400 hover:text-red-600 text-sm" aria-label="Remove tech">✕</button>
          </div>
        ))}
        <button type="button" onClick={() => appendTech("" as never)} className="text-sm text-blue-600 hover:text-blue-800">+ Add tech</button>
      </div>

      {/* Links */}
      <div>
        <p className="text-sm font-medium text-neutral-700 mb-1">Links</p>
        {linkFields.map((lf, lIdx) => (
          <div key={lf.id} className="flex gap-2 mb-2">
            <input
              {...register(`${prefix}.links.${lIdx}` as `projects.${number}.links.${number}`)}
              className="flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="https://..."
            />
            <FieldError name={`${prefix}.links.${lIdx}`} />
            <button type="button" onClick={() => removeLink(lIdx)} className="text-red-400 hover:text-red-600 text-sm" aria-label="Remove link">✕</button>
          </div>
        ))}
        <button type="button" onClick={() => appendLink("" as never)} className="text-sm text-blue-600 hover:text-blue-800">+ Add link</button>
      </div>
    </div>
  );
}
