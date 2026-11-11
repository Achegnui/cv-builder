"use client";

import { useFormContext, useFieldArray } from "react-hook-form";
import type { CVData } from "@/lib/schema";
import { FieldError } from "./field-error";
import { SectionWrapper, EntryControls } from "./section-wrapper";

export function CertificationsSection() {
  const { register, control } = useFormContext<CVData>();
  const { fields, append, remove, swap } = useFieldArray({
    control,
    name: "certifications",
  });

  const addEntry = () => {
    append({
      id: crypto.randomUUID(),
      name: "",
      issuer: "",
      date: "",
      credentialId: "",
      credentialUrl: "",
    });
  };

  return (
    <SectionWrapper
      title="Certifications"
      description="Professional certifications and licenses"
      onAdd={addEntry}
      addLabel="Add Certification"
    >
      {fields.length === 0 && (
        <p className="text-sm text-neutral-400 italic">No certifications yet.</p>
      )}
      {fields.map((field, index) => {
        const prefix = `certifications.${index}` as const;
        return (
          <div key={field.id} className="border border-neutral-200 rounded-md p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-neutral-600">Certification {index + 1}</h3>
              <EntryControls index={index} total={fields.length} onMoveUp={() => swap(index, index - 1)} onMoveDown={() => swap(index, index + 1)} onRemove={() => remove(index)} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor={`${prefix}.name`} className="block text-sm font-medium text-neutral-700">Name *</label>
                <input id={`${prefix}.name`} {...register(`${prefix}.name`)} className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                <FieldError name={`${prefix}.name`} />
              </div>
              <div>
                <label htmlFor={`${prefix}.issuer`} className="block text-sm font-medium text-neutral-700">Issuer</label>
                <input id={`${prefix}.issuer`} {...register(`${prefix}.issuer`)} className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
              </div>
              <div>
                <label htmlFor={`${prefix}.date`} className="block text-sm font-medium text-neutral-700">Date</label>
                <input id={`${prefix}.date`} {...register(`${prefix}.date`)} placeholder="YYYY-MM" className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                <FieldError name={`${prefix}.date`} />
              </div>
              <div>
                <label htmlFor={`${prefix}.credentialId`} className="block text-sm font-medium text-neutral-700">Credential ID</label>
                <input id={`${prefix}.credentialId`} {...register(`${prefix}.credentialId`)} className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor={`${prefix}.credentialUrl`} className="block text-sm font-medium text-neutral-700">Credential URL</label>
                <input id={`${prefix}.credentialUrl`} {...register(`${prefix}.credentialUrl`)} placeholder="https://..." className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                <FieldError name={`${prefix}.credentialUrl`} />
              </div>
            </div>
          </div>
        );
      })}
    </SectionWrapper>
  );
}
