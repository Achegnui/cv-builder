"use client";

import React, { useEffect, useState, useRef } from "react";
import { useForm, FormProvider, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CVDataSchema,
  type CVData,
  SAMPLE_CV,
  getEmptyCVData,
} from "@/lib/schema";
import { saveCVToStorage, loadCVFromStorage, clearCVStorage } from "@/lib/storage";
import { exportCVToJSON, importCVFromJSON } from "@/lib/json-io";

import { ProfileSection } from "./profile-section";
import { SummarySection } from "./summary-section";
import { ExperienceSection } from "./experience-section";
import { EducationSection } from "./education-section";
import { SkillsSection } from "./skills-section";
import { ProjectsSection } from "./projects-section";
import { CertificationsSection } from "./certifications-section";
import { AwardsSection } from "./awards-section";
import { LanguagesSection } from "./languages-section";
import { PublicationsSection } from "./publications-section";
import { GrantsSection } from "./grants-section";
import { TeachingSection } from "./teaching-section";
import { ConferencesSection } from "./conferences-section";

export function CVForm() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{
    text: string;
    type: "info" | "success" | "error";
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const methods = useForm<CVData>({
    resolver: zodResolver(CVDataSchema) as Resolver<CVData>,
    mode: "onChange",
    defaultValues: getEmptyCVData(),
  });

  const { reset, watch, handleSubmit } = methods;

  // 1. On page open: load saved CV from browser storage (if any)
  useEffect(() => {
    const saved = loadCVFromStorage();
    if (saved) {
      reset(saved);
      setFeedbackMessage({
        text: "Restored your saved CV from browser storage.",
        type: "info",
      });
    }
    setIsLoaded(true);
  }, [reset]);

  // 2. Auto-save to localStorage on form changes
  useEffect(() => {
    if (!isLoaded) return;
    const subscription = watch((value) => {
      // Safe parse to check valid shape before persisting
      const parsed = CVDataSchema.safeParse(value);
      if (parsed.success) {
        saveCVToStorage(parsed.data);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, isLoaded]);

  // Handler: Load fictional sample data
  const handleLoadSample = () => {
    reset(SAMPLE_CV);
    saveCVToStorage(SAMPLE_CV);
    setFeedbackMessage({
      text: "Loaded fictional sample CV. All details are sample data.",
      type: "success",
    });
  };

  // Handler: Clear all data
  const handleClear = () => {
    if (window.confirm("Are you sure you want to clear all CV fields?")) {
      const empty = getEmptyCVData();
      reset(empty);
      clearCVStorage();
      setFeedbackMessage({
        text: "Cleared all CV data.",
        type: "info",
      });
    }
  };

  // Handler: Export JSON backup
  const handleExport = () => {
    const currentValues = methods.getValues();
    const result = CVDataSchema.safeParse(currentValues);
    if (!result.success) {
      setFeedbackMessage({
        text: "Please fix invalid fields before exporting backup.",
        type: "error",
      });
      return;
    }
    exportCVToJSON(result.data);
    setFeedbackMessage({
      text: "Downloaded CV backup JSON.",
      type: "success",
    });
  };

  // Handler: Import JSON backup
  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const importedData = await importCVFromJSON(file);
      reset(importedData);
      saveCVToStorage(importedData);
      setFeedbackMessage({
        text: "Successfully imported CV from JSON backup.",
        type: "success",
      });
    } catch (err: unknown) {
      const errMessage = err instanceof Error ? err.message : "Failed to import JSON";
      setFeedbackMessage({
        text: errMessage,
        type: "error",
      });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center p-12 text-neutral-500">
        Loading CV form...
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(() => {})} className="space-y-6">
        {/* Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white border border-neutral-200 rounded-lg shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleLoadSample}
              className="px-3 py-1.5 text-xs sm:text-sm font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors"
            >
              Load Sample CV
            </button>
            <button
              type="button"
              onClick={handleExport}
              className="px-3 py-1.5 text-xs sm:text-sm font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors"
            >
              Export JSON Backup
            </button>
            <label className="px-3 py-1.5 text-xs sm:text-sm font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors cursor-pointer">
              Import JSON
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleImportFile}
                className="hidden"
              />
            </label>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="px-3 py-1.5 text-xs sm:text-sm font-medium text-red-600 hover:text-red-800 transition-colors"
          >
            Clear All
          </button>
        </div>

        {/* Feedback / Notification Banner */}
        {feedbackMessage && (
          <div
            className={`p-3 rounded-md text-sm whitespace-pre-line flex items-center justify-between ${
              feedbackMessage.type === "error"
                ? "bg-red-50 text-red-800 border border-red-200"
                : feedbackMessage.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-blue-50 text-blue-800 border border-blue-200"
            }`}
          >
            <span>{feedbackMessage.text}</span>
            <button
              type="button"
              onClick={() => setFeedbackMessage(null)}
              className="ml-3 text-xs font-semibold opacity-70 hover:opacity-100"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Form Sections */}
        <div className="space-y-4">
          <ProfileSection />
          <SummarySection />
          <ExperienceSection />
          <EducationSection />
          <SkillsSection />
          <ProjectsSection />
          <CertificationsSection />
          <AwardsSection />
          <LanguagesSection />

          {/* Academic Sections Header */}
          <div className="pt-4 border-t border-neutral-200">
            <h3 className="text-sm font-semibold tracking-wider text-neutral-500 uppercase mb-3">
              Academic & Scholarship Sections (Optional)
            </h3>
            <div className="space-y-4">
              <PublicationsSection />
              <GrantsSection />
              <TeachingSection />
              <ConferencesSection />
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
