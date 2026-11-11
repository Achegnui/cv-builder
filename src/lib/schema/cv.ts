import { z } from "zod";

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

/** Matches YYYY-MM format, e.g. "2024-06". Used for all date fields. */
const dateString = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Date must be in YYYY-MM format")
  .or(z.literal(""));

/** Optional date: either a valid YYYY-MM or empty string. */
const optionalDate = dateString.optional().default("");

/** Generates a unique id for list entries so we can reorder them. */
function generateId(): string {
  return crypto.randomUUID();
}

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------

export const ProfileSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Enter a valid email").or(z.literal("")),
  phone: z.string().optional().default(""),
  location: z.string().optional().default(""),
  linkedIn: z.string().url("Enter a valid URL").or(z.literal("")).optional().default(""),
  website: z.string().url("Enter a valid URL").or(z.literal("")).optional().default(""),
  photoUrl: z.string().url("Enter a valid URL").or(z.literal("")).optional().default(""),
  dateOfBirth: optionalDate,
  nationality: z.string().optional().default(""),
});

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

export const SummarySchema = z.object({
  text: z.string().optional().default(""),
});

// ---------------------------------------------------------------------------
// Experience
// ---------------------------------------------------------------------------

export const ExperienceEntrySchema = z.object({
  id: z.string().default(generateId),
  employer: z.string().min(1, "Employer is required"),
  title: z.string().min(1, "Job title is required"),
  location: z.string().optional().default(""),
  startDate: z
    .string()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Start date must be in YYYY-MM format"),
  endDate: optionalDate,
  isCurrent: z.boolean().default(false),
  bullets: z.array(z.string()).default([]),
});

// ---------------------------------------------------------------------------
// Education
// ---------------------------------------------------------------------------

export const EducationEntrySchema = z.object({
  id: z.string().default(generateId),
  institution: z.string().min(1, "Institution is required"),
  degree: z.string().min(1, "Degree is required"),
  field: z.string().optional().default(""),
  /** GPA as a string — e.g. "3.8/4.0". Separate from degreeClassification. */
  gpa: z.string().optional().default(""),
  /** Degree classification — e.g. "First Class Honours", "2:1". Separate from GPA. */
  degreeClassification: z.string().optional().default(""),
  startDate: z
    .string()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Start date must be in YYYY-MM format"),
  endDate: optionalDate,
  isExpected: z.boolean().default(false),
  bullets: z.array(z.string()).default([]),
});

// ---------------------------------------------------------------------------
// Skills
// ---------------------------------------------------------------------------

export const SkillGroupSchema = z.object({
  id: z.string().default(generateId),
  category: z.string().min(1, "Category name is required"),
  skills: z.array(z.string().min(1, "Skill cannot be empty")).min(1, "Add at least one skill"),
});

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

export const ProjectEntrySchema = z.object({
  id: z.string().default(generateId),
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional().default(""),
  techStack: z.array(z.string()).default([]),
  links: z.array(z.string().url("Enter a valid URL")).default([]),
  startDate: optionalDate,
  endDate: optionalDate,
});

// ---------------------------------------------------------------------------
// Certifications
// ---------------------------------------------------------------------------

export const CertificationEntrySchema = z.object({
  id: z.string().default(generateId),
  name: z.string().min(1, "Certification name is required"),
  issuer: z.string().optional().default(""),
  date: optionalDate,
  credentialId: z.string().optional().default(""),
  credentialUrl: z.string().url("Enter a valid URL").or(z.literal("")).optional().default(""),
});

// ---------------------------------------------------------------------------
// Awards
// ---------------------------------------------------------------------------

export const AwardEntrySchema = z.object({
  id: z.string().default(generateId),
  title: z.string().min(1, "Award title is required"),
  issuer: z.string().optional().default(""),
  date: optionalDate,
  description: z.string().optional().default(""),
});

// ---------------------------------------------------------------------------
// Languages
// ---------------------------------------------------------------------------

export const LanguageProficiency = z.enum([
  "native",
  "fluent",
  "advanced",
  "intermediate",
  "beginner",
]);

export const LanguageEntrySchema = z.object({
  id: z.string().default(generateId),
  language: z.string().min(1, "Language is required"),
  proficiency: LanguageProficiency,
});

// ---------------------------------------------------------------------------
// Academic: Publications
// ---------------------------------------------------------------------------

export const PublicationEntrySchema = z.object({
  id: z.string().default(generateId),
  title: z.string().min(1, "Publication title is required"),
  authors: z.string().optional().default(""),
  venue: z.string().optional().default(""),
  date: optionalDate,
  doi: z.string().optional().default(""),
  url: z.string().url("Enter a valid URL").or(z.literal("")).optional().default(""),
});

// ---------------------------------------------------------------------------
// Academic: Grants
// ---------------------------------------------------------------------------

export const GrantEntrySchema = z.object({
  id: z.string().default(generateId),
  title: z.string().min(1, "Grant title is required"),
  funder: z.string().optional().default(""),
  amount: z.string().optional().default(""),
  currency: z.string().optional().default(""),
  startDate: optionalDate,
  endDate: optionalDate,
  description: z.string().optional().default(""),
});

// ---------------------------------------------------------------------------
// Academic: Teaching
// ---------------------------------------------------------------------------

export const TeachingEntrySchema = z.object({
  id: z.string().default(generateId),
  role: z.string().min(1, "Role is required"),
  course: z.string().optional().default(""),
  institution: z.string().optional().default(""),
  startDate: optionalDate,
  endDate: optionalDate,
  description: z.string().optional().default(""),
});

// ---------------------------------------------------------------------------
// Academic: Conferences
// ---------------------------------------------------------------------------

export const ConferenceEntrySchema = z.object({
  id: z.string().default(generateId),
  title: z.string().min(1, "Conference title is required"),
  role: z.enum(["presenter", "attendee", "organiser"]).default("attendee"),
  event: z.string().optional().default(""),
  location: z.string().optional().default(""),
  date: optionalDate,
});

// ---------------------------------------------------------------------------
// Top-level CV Data
// ---------------------------------------------------------------------------

export const CVDataSchema = z.object({
  profile: ProfileSchema,
  summary: SummarySchema,
  experience: z.array(ExperienceEntrySchema).default([]),
  education: z.array(EducationEntrySchema).default([]),
  skillGroups: z.array(SkillGroupSchema).default([]),
  projects: z.array(ProjectEntrySchema).default([]),
  certifications: z.array(CertificationEntrySchema).default([]),
  awards: z.array(AwardEntrySchema).default([]),
  languages: z.array(LanguageEntrySchema).default([]),
  publications: z.array(PublicationEntrySchema).default([]),
  grants: z.array(GrantEntrySchema).default([]),
  teaching: z.array(TeachingEntrySchema).default([]),
  conferences: z.array(ConferenceEntrySchema).default([]),
});

// ---------------------------------------------------------------------------
// Inferred TypeScript types
// ---------------------------------------------------------------------------

export type Profile = z.infer<typeof ProfileSchema>;
export type Summary = z.infer<typeof SummarySchema>;
export type ExperienceEntry = z.infer<typeof ExperienceEntrySchema>;
export type EducationEntry = z.infer<typeof EducationEntrySchema>;
export type SkillGroup = z.infer<typeof SkillGroupSchema>;
export type ProjectEntry = z.infer<typeof ProjectEntrySchema>;
export type CertificationEntry = z.infer<typeof CertificationEntrySchema>;
export type AwardEntry = z.infer<typeof AwardEntrySchema>;
export type LanguageEntry = z.infer<typeof LanguageEntrySchema>;
export type PublicationEntry = z.infer<typeof PublicationEntrySchema>;
export type GrantEntry = z.infer<typeof GrantEntrySchema>;
export type TeachingEntry = z.infer<typeof TeachingEntrySchema>;
export type ConferenceEntry = z.infer<typeof ConferenceEntrySchema>;
export type CVData = z.infer<typeof CVDataSchema>;
