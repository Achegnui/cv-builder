import type { PaperSize } from "@/lib/templates/types";

export type RegionProfileId =
  | "us"
  | "uk"
  | "german"
  | "europass"
  | "academic"
  | "technical"
  | "combination"
  | "one-page";

export type SectionKey =
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "projects"
  | "certifications"
  | "awards"
  | "languages"
  | "publications"
  | "grants"
  | "teaching"
  | "conferences";

export type PhotoConvention = "not_used" | "optional" | "commonly_expected";

export interface RegionWarning {
  id: string;
  field?: "photo" | "dateOfBirth" | "nationality" | "length" | "paperSize";
  message: string;
  why: string;
  actionToggle?: {
    key: "showPhoto" | "showDateOfBirth" | "showNationality";
    label: string;
  };
}

export interface RegionProfile {
  id: RegionProfileId;
  name: string;
  subtitle: string;
  description: string;
  defaultPaperSize: PaperSize;
  recommendedPages: number | null; // null = no limit (academic)
  photoConvention: PhotoConvention;
  personalDetailsAllowed: {
    dateOfBirth: boolean;
    nationality: boolean;
  };
  sectionOrder: SectionKey[];
  sectionLabels: Record<SectionKey, string>;
  dateFormatNote: string;
  warnings: RegionWarning[];
}

export interface UserRegionOverrides {
  showPhoto: boolean;
  showDateOfBirth: boolean;
  showNationality: boolean;
  dismissedWarningIds: string[];
}
