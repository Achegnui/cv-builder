"use client";

import { useFormContext } from "react-hook-form";

/**
 * Displays validation error text beneath a form field.
 *
 * Usage:
 *   <input {...register("profile.fullName")} />
 *   <FieldError name="profile.fullName" />
 *
 * The component reads errors from React Hook Form context,
 * which are populated by the Zod resolver.
 */
export function FieldError({ name }: { name: string }) {
  const {
    formState: { errors },
  } = useFormContext();

  // Navigate nested error path like "experience.0.employer"
  const parts = name.split(".");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- navigating dynamic error tree
  let error: any = errors;
  for (const part of parts) {
    if (!error) break;
    error = error[part];
  }

  if (!error?.message) return null;

  return (
    <p className="mt-1 text-sm text-red-600" role="alert">
      {String(error.message)}
    </p>
  );
}
