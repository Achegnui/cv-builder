import type { RegionProfile, RegionProfileId, SectionKey } from "./types";

/**
 * Standard default section labels (in English)
 */
const DEFAULT_SECTION_LABELS: Record<SectionKey, string> = {
  summary: "Professional Summary",
  experience: "Work Experience",
  education: "Education",
  skills: "Skills",
  projects: "Projects",
  certifications: "Certifications",
  awards: "Honors & Awards",
  languages: "Languages",
  publications: "Publications",
  grants: "Grants & Fellowships",
  teaching: "Teaching Experience",
  conferences: "Conferences & Talks",
};

/**
 * All 8 Region & Purpose Profiles in one central, editable data catalog.
 * Every convention is phrased with "commonly" or "often", acknowledging that
 * actual employer preferences vary.
 */
export const REGION_PROFILES: Record<RegionProfileId, RegionProfile> = {
  us: {
    id: "us",
    name: "US Resume",
    subtitle: "United States standard format",
    description: "Concise, outcome-driven resume using US Letter paper with personal details omitted.",
    defaultPaperSize: "letter",
    recommendedPages: 1, // 1-2 pages
    photoConvention: "not_used",
    personalDetailsAllowed: {
      dateOfBirth: false,
      nationality: false,
    },
    sectionOrder: [
      "summary",
      "experience",
      "education",
      "skills",
      "projects",
      "certifications",
      "awards",
      "languages",
      "publications",
      "grants",
      "teaching",
      "conferences",
    ],
    sectionLabels: {
      ...DEFAULT_SECTION_LABELS,
      experience: "Experience",
      summary: "Summary",
    },
    dateFormatNote: "Month YYYY or YYYY-MM is standard in the US.",
    warnings: [
      {
        id: "us-photo",
        field: "photo",
        message: "In the US, photos are commonly left off resumes.",
        why: "Most US employers avoid photos to guard against unconscious bias and comply with Equal Employment Opportunity (EEO) practices.",
        actionToggle: {
          key: "showPhoto",
          label: "Include photo anyway",
        },
      },
      {
        id: "us-personal-details",
        field: "dateOfBirth",
        message: "Date of birth and nationality are often omitted on US resumes.",
        why: "Under US labor laws, employers prefer not to receive age, marital status, or nationality upfront to prevent age discrimination or visa assumptions.",
        actionToggle: {
          key: "showDateOfBirth",
          label: "Include date of birth anyway",
        },
      },
      {
        id: "us-paper-size",
        field: "paperSize",
        message: "US Letter paper size (8.5 × 11 in) is commonly expected in North America.",
        why: "Printers and scanning hardware in the US and Canada are calibrated for US Letter rather than international A4.",
      },
    ],
  },

  uk: {
    id: "uk",
    name: "UK Curriculum Vitae",
    subtitle: "United Kingdom standard format",
    description: "Standard 2-page British CV on A4 paper focusing on chronology and qualifications.",
    defaultPaperSize: "a4",
    recommendedPages: 2,
    photoConvention: "not_used",
    personalDetailsAllowed: {
      dateOfBirth: false,
      nationality: false,
    },
    sectionOrder: [
      "summary",
      "experience",
      "education",
      "skills",
      "projects",
      "certifications",
      "awards",
      "languages",
      "publications",
      "grants",
      "teaching",
      "conferences",
    ],
    sectionLabels: {
      ...DEFAULT_SECTION_LABELS,
      summary: "Personal Profile",
      experience: "Employment History",
      education: "Education & Qualifications",
      skills: "Key Skills",
    },
    dateFormatNote: "Month Year or YYYY-MM is standard in the UK.",
    warnings: [
      {
        id: "uk-photo",
        field: "photo",
        message: "In the UK, photos are commonly omitted from CVs.",
        why: "British hiring practices avoid photos to support diversity and fair recruitment standards, except in performing arts or modeling.",
        actionToggle: {
          key: "showPhoto",
          label: "Include photo anyway",
        },
      },
      {
        id: "uk-personal-details",
        field: "dateOfBirth",
        message: "Date of birth and marital status are often omitted in the UK.",
        why: "The UK Equality Act 2010 discourages age-related details in recruitment unless strictly relevant to the role.",
        actionToggle: {
          key: "showDateOfBirth",
          label: "Include date of birth anyway",
        },
      },
      {
        id: "uk-length",
        field: "length",
        message: "A two-page CV is commonly expected in the UK for experienced candidates.",
        why: "One-page CVs are often viewed as incomplete in the UK, while three pages can be considered overly verbose for non-academic roles.",
      },
    ],
  },

  german: {
    id: "german",
    name: "German Style (Lebenslauf)",
    subtitle: "Germany, Austria, & Switzerland conventions",
    description: "Structured, detailed Lebenslauf on A4 paper where professional photos and personal details are often included.",
    defaultPaperSize: "a4",
    recommendedPages: 2,
    photoConvention: "commonly_expected",
    personalDetailsAllowed: {
      dateOfBirth: true,
      nationality: true,
    },
    sectionOrder: [
      "summary",
      "experience",
      "education",
      "skills",
      "languages",
      "certifications",
      "projects",
      "awards",
      "publications",
      "grants",
      "teaching",
      "conferences",
    ],
    sectionLabels: {
      ...DEFAULT_SECTION_LABELS,
      summary: "Überblick (Summary)",
      experience: "Beruflicher Werdegang (Experience)",
      education: "Ausbildung & Studium (Education)",
      skills: "Kenntnisse & Fähigkeiten (Skills)",
      languages: "Sprachkenntnisse (Languages)",
    },
    dateFormatNote: "MM/YYYY or YYYY-MM in reverse chronological order.",
    warnings: [
      {
        id: "german-photo",
        field: "photo",
        message: "A professional application photo (Bewerbungsfoto) is often expected in Germany.",
        why: "While German anti-discrimination law (AGG) makes photos optional, many traditional hiring managers still value a formal studio portrait.",
        actionToggle: {
          key: "showPhoto",
          label: "Show photo on CV",
        },
      },
      {
        id: "german-dob",
        field: "dateOfBirth",
        message: "Date of birth and nationality are traditionally included in German Lebensläufe.",
        why: "German HR departments traditionally expect birth date and place to verify age against diplomas and background consistency.",
        actionToggle: {
          key: "showDateOfBirth",
          label: "Include date of birth",
        },
      },
    ],
  },

  europass: {
    id: "europass",
    name: "Europass-Style",
    subtitle: "Pan-European standard structure",
    description: "Standardized European format emphasizing multilingual skills and chronological transparency.",
    defaultPaperSize: "a4",
    recommendedPages: 2,
    photoConvention: "optional",
    personalDetailsAllowed: {
      dateOfBirth: true,
      nationality: true,
    },
    sectionOrder: [
      "summary",
      "experience",
      "education",
      "languages",
      "skills",
      "projects",
      "certifications",
      "awards",
      "publications",
      "grants",
      "teaching",
      "conferences",
    ],
    sectionLabels: {
      ...DEFAULT_SECTION_LABELS,
      summary: "Personal Statement",
      experience: "Work Experience",
      education: "Education and Training",
      languages: "Language Skills",
      skills: "Digital Skills & Competences",
    },
    dateFormatNote: "DD/MM/YYYY or YYYY-MM format.",
    warnings: [
      {
        id: "europass-photo",
        field: "photo",
        message: "Passport-style photos are optional but often accepted across continental Europe.",
        why: "Conventions vary significantly between EU member states (e.g. photos are common in France/Germany, but discouraged in Ireland).",
        actionToggle: {
          key: "showPhoto",
          label: "Include photo",
        },
      },
    ],
  },

  academic: {
    id: "academic",
    name: "Academic CV",
    subtitle: "Universities, research, scholarships, & grants",
    description: "Comprehensive scholarly record with no page limit, highlighting publications, research grants, and teaching.",
    defaultPaperSize: "a4",
    recommendedPages: null, // No page limit!
    photoConvention: "not_used",
    personalDetailsAllowed: {
      dateOfBirth: false,
      nationality: false,
    },
    sectionOrder: [
      "summary",
      "education",
      "publications",
      "grants",
      "teaching",
      "experience",
      "conferences",
      "awards",
      "skills",
      "languages",
      "projects",
      "certifications",
    ],
    sectionLabels: {
      ...DEFAULT_SECTION_LABELS,
      summary: "Research Interests",
      education: "Education",
      publications: "Publications",
      grants: "Grants & Fellowships",
      teaching: "Teaching Experience",
      experience: "Research & Academic Appointments",
      conferences: "Conferences & Invited Talks",
    },
    dateFormatNote: "Year or YYYY-MM is customary.",
    warnings: [
      {
        id: "academic-length",
        field: "length",
        message: "Academic CVs commonly have no page limit.",
        why: "Scholarly committees require an exhaustive record of peer-reviewed papers, citations, grants won, and courses taught.",
      },
      {
        id: "academic-education-first",
        message: "Education and publications are positioned prominently before general work experience.",
        why: "Academic appointments prioritize credentials, thesis topics, and publication track records over corporate roles.",
      },
    ],
  },

  technical: {
    id: "technical",
    name: "Technical / Engineering",
    subtitle: "Software, data, DevOps, & engineering roles",
    description: "Prioritizes grouped technical skills and project portfolios with tech stacks and links.",
    defaultPaperSize: "letter",
    recommendedPages: 2,
    photoConvention: "not_used",
    personalDetailsAllowed: {
      dateOfBirth: false,
      nationality: false,
    },
    sectionOrder: [
      "summary",
      "skills",
      "projects",
      "experience",
      "education",
      "certifications",
      "awards",
      "languages",
      "publications",
      "grants",
      "teaching",
      "conferences",
    ],
    sectionLabels: {
      ...DEFAULT_SECTION_LABELS,
      summary: "Technical Profile",
      skills: "Technical Skills",
      projects: "Featured Projects & Open Source",
      experience: "Engineering Experience",
    },
    dateFormatNote: "YYYY-MM format.",
    warnings: [
      {
        id: "tech-skills-first",
        message: "Technical skills and projects are placed above work history.",
        why: "Technical recruiters and hiring managers scan languages, frameworks, and architecture tools before reviewing chronological employment.",
      },
    ],
  },

  combination: {
    id: "combination",
    name: "Combination (Skills-First)",
    subtitle: "Career changers & diverse backgrounds",
    description: "Leads with transferable skill groups before work chronology, ideal for career transitions.",
    defaultPaperSize: "a4",
    recommendedPages: 2,
    photoConvention: "not_used",
    personalDetailsAllowed: {
      dateOfBirth: false,
      nationality: false,
    },
    sectionOrder: [
      "summary",
      "skills",
      "experience",
      "education",
      "projects",
      "certifications",
      "awards",
      "languages",
      "publications",
      "grants",
      "teaching",
      "conferences",
    ],
    sectionLabels: {
      ...DEFAULT_SECTION_LABELS,
      summary: "Executive Summary",
      skills: "Core Competencies & Capabilities",
      experience: "Professional Experience",
    },
    dateFormatNote: "YYYY-MM format.",
    warnings: [
      {
        id: "combination-skills-focus",
        message: "Core competencies are elevated above past employers.",
        why: "Focusing on transferable skills helps bridge industry transitions, career pivots, or gaps between formal positions.",
      },
    ],
  },

  "one-page": {
    id: "one-page",
    name: "One-Page (Strict)",
    subtitle: "Early-career, consulting, & finance",
    description: "Strictly limited to a single sheet with compact spacing; warns if content overflows.",
    defaultPaperSize: "letter",
    recommendedPages: 1,
    photoConvention: "not_used",
    personalDetailsAllowed: {
      dateOfBirth: false,
      nationality: false,
    },
    sectionOrder: [
      "summary",
      "experience",
      "education",
      "skills",
      "projects",
      "certifications",
      "awards",
      "languages",
      "publications",
      "grants",
      "teaching",
      "conferences",
    ],
    sectionLabels: {
      ...DEFAULT_SECTION_LABELS,
      summary: "Summary",
      experience: "Experience",
    },
    dateFormatNote: "YYYY-MM format.",
    warnings: [
      {
        id: "one-page-overflow",
        field: "length",
        message: "One-page format: Keep bullets and sections trimmed to fit onto exactly one sheet.",
        why: "Investment banking, consulting, and certain recruiters reject resumes that spill over by a few lines onto page 2.",
      },
    ],
  },
};

/**
 * Get profile by ID, with fallback to US Resume
 */
export function getRegionProfile(id: RegionProfileId): RegionProfile {
  return REGION_PROFILES[id] || REGION_PROFILES.us;
}

/**
 * List all available profiles
 */
export function getAllRegionProfiles(): RegionProfile[] {
  return Object.values(REGION_PROFILES);
}

/**
 * Get initial default overrides for a given region profile
 */
export function getDefaultRegionOverrides(profile: RegionProfile) {
  return {
    showPhoto: profile.photoConvention === "commonly_expected",
    showDateOfBirth: profile.personalDetailsAllowed.dateOfBirth,
    showNationality: profile.personalDetailsAllowed.nationality,
    dismissedWarningIds: [] as string[],
  };
}
