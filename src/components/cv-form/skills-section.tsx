"use client";

import React from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import type { CVData } from "@/lib/schema";
import { FieldError } from "./field-error";
import { SectionWrapper, EntryControls } from "./section-wrapper";

export function SkillsSection() {
  const { register, control } = useFormContext<CVData>();
  const { fields, append, remove, swap } = useFieldArray({
    control,
    name: "skillGroups",
  });

  const addGroup = () => {
    append({
      id: crypto.randomUUID(),
      category: "",
      skills: [""],
    });
  };

  return (
    <SectionWrapper
      title="Skills"
      description="Group your skills by category"
      onAdd={addGroup}
      addLabel="Add Skill Group"
    >
      {fields.length === 0 && (
        <p className="text-sm text-neutral-400 italic">No skill groups yet.</p>
      )}
      {fields.map((field, index) => (
        <SkillGroupEntry
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

function SkillGroupEntry({
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
  const { control } = useFormContext<CVData>();
  const prefix = `skillGroups.${index}` as const;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- useFieldArray nested path
  const { fields: skillFields, append: appendSkill, remove: removeSkill } = useFieldArray({
    control,
    name: `${prefix}.skills` as any,
  });

  return (
    <div className="border border-neutral-200 rounded-md p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-neutral-600">Group {index + 1}</h3>
        <EntryControls index={index} total={total} onMoveUp={onMoveUp} onMoveDown={onMoveDown} onRemove={onRemove} />
      </div>

      <div>
        <label htmlFor={`${prefix}.category`} className="block text-sm font-medium text-neutral-700">Category *</label>
        <input id={`${prefix}.category`} {...register(`${prefix}.category`)} placeholder='e.g. "Programming Languages"' className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
        <FieldError name={`${prefix}.category`} />
      </div>

      <div>
        <p className="text-sm font-medium text-neutral-700 mb-1">Skills *</p>
        <FieldError name={`${prefix}.skills`} />
        {skillFields.map((sf, sIdx) => (
          <div key={sf.id} className="flex gap-2 mb-2">
            <input
              {...register(`${prefix}.skills.${sIdx}` as `skillGroups.${number}.skills.${number}`)}
              className="flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Skill name"
            />
            <button type="button" onClick={() => removeSkill(sIdx)} className="text-red-400 hover:text-red-600 text-sm" aria-label="Remove skill">✕</button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => appendSkill("" as never)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          + Add skill
        </button>
      </div>
    </div>
  );
}
