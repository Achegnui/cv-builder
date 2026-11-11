/**
 * Returns the default (empty) values for a new CV.
 * Used as the initial state for the form when nothing is in storage.
 */

import type { CVData } from "@/lib/schema";

export function getEmptyCVData(): CVData {
  return {
    profile: {
      fullName: "",
      email: "",
      phone: "",
      location: "",
      linkedIn: "",
      website: "",
      photoUrl: "",
      dateOfBirth: "",
      nationality: "",
    },
    summary: { text: "" },
    experience: [],
    education: [],
    skillGroups: [],
    projects: [],
    certifications: [],
    awards: [],
    languages: [],
    publications: [],
    grants: [],
    teaching: [],
    conferences: [],
  };
}
