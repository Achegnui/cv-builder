// Central re-exports for the CV schema layer.
// Import from "@/lib/schema" to get schemas, types, and sample data.

export {
  ProfileSchema,
  SummarySchema,
  ExperienceEntrySchema,
  EducationEntrySchema,
  SkillGroupSchema,
  ProjectEntrySchema,
  CertificationEntrySchema,
  AwardEntrySchema,
  LanguageProficiency,
  LanguageEntrySchema,
  PublicationEntrySchema,
  GrantEntrySchema,
  TeachingEntrySchema,
  ConferenceEntrySchema,
  CVDataSchema,
} from "./cv";

export type {
  Profile,
  Summary,
  ExperienceEntry,
  EducationEntry,
  SkillGroup,
  ProjectEntry,
  CertificationEntry,
  AwardEntry,
  LanguageEntry,
  PublicationEntry,
  GrantEntry,
  TeachingEntry,
  ConferenceEntry,
  CVData,
} from "./cv";

export { SAMPLE_CV } from "./sample-data";
export { getEmptyCVData } from "./defaults";
