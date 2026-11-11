"use client";

import { useFormContext } from "react-hook-form";
import type { CVData } from "@/lib/schema";
import { FieldError } from "./field-error";
import { SectionWrapper } from "./section-wrapper";

export function ProfileSection() {
  const { register } = useFormContext<CVData>();

  return (
    <SectionWrapper title="Profile" description="Your contact and personal details">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="profile.fullName" className="block text-sm font-medium text-neutral-700">
            Full Name *
          </label>
          <input
            id="profile.fullName"
            {...register("profile.fullName")}
            className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <FieldError name="profile.fullName" />
        </div>

        <div>
          <label htmlFor="profile.email" className="block text-sm font-medium text-neutral-700">
            Email
          </label>
          <input
            id="profile.email"
            type="email"
            {...register("profile.email")}
            className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <FieldError name="profile.email" />
        </div>

        <div>
          <label htmlFor="profile.phone" className="block text-sm font-medium text-neutral-700">
            Phone
          </label>
          <input
            id="profile.phone"
            type="tel"
            {...register("profile.phone")}
            className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="profile.location" className="block text-sm font-medium text-neutral-700">
            Location
          </label>
          <input
            id="profile.location"
            {...register("profile.location")}
            className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="profile.linkedIn" className="block text-sm font-medium text-neutral-700">
            LinkedIn URL
          </label>
          <input
            id="profile.linkedIn"
            type="url"
            {...register("profile.linkedIn")}
            placeholder="https://linkedin.com/in/..."
            className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <FieldError name="profile.linkedIn" />
        </div>

        <div>
          <label htmlFor="profile.website" className="block text-sm font-medium text-neutral-700">
            Website URL
          </label>
          <input
            id="profile.website"
            type="url"
            {...register("profile.website")}
            placeholder="https://..."
            className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <FieldError name="profile.website" />
        </div>

        <div>
          <label htmlFor="profile.dateOfBirth" className="block text-sm font-medium text-neutral-700">
            Date of Birth
          </label>
          <input
            id="profile.dateOfBirth"
            {...register("profile.dateOfBirth")}
            placeholder="YYYY-MM"
            className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <FieldError name="profile.dateOfBirth" />
        </div>

        <div>
          <label htmlFor="profile.nationality" className="block text-sm font-medium text-neutral-700">
            Nationality
          </label>
          <input
            id="profile.nationality"
            {...register("profile.nationality")}
            className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>
    </SectionWrapper>
  );
}
