import type { CVData } from "@/lib/schema";

/**
 * Deliberately broken sample CV designed to trigger all 8 CV Doctor checks.
 * Used for automated verification and regression testing.
 * Fictional data per AGENTS.md rule 5.
 */
export const BROKEN_SAMPLE_CV: CVData = {
  profile: {
    fullName: "Jordan Broken-Test",
    email: "jordan.test@fictional.example",
    phone: "+1 555-019-9999",
    location: "Testville, Fictional State",
    linkedIn: "",
    website: "",
    photoUrl: "",
    dateOfBirth: "",
    nationality: "",
  },
  summary: {
    // Repeated content sentence that will also appear in experience bullet
    text: "Experienced engineer who led development of enterprise workflow automation system.",
  },
  experience: [
    {
      id: "broken-exp-1",
      employer: "Broken Fictional Corp", // Duplicate employer with broken-exp-2
      title: "Senior Developer",
      location: "Remote",
      startDate: "2023-01",
      // Check 1: Future end date for a non-current role (assuming current date < 2028-12)
      endDate: "2028-12",
      isCurrent: false,
      bullets: [
        // Check 3: Repeated content verbatim from summary
        "Experienced engineer who led development of enterprise workflow automation system.",
        // Check 6 & Check 7 & Check 8:
        // - Mixed bullet style (ends without period)
        // - Check 7: Unfinished placeholder [add number]
        // - Check 8: Unverified number 999
        "Increased infrastructure performance by [add number]% across 999 servers",
        // Check 6: Ends with period (while above doesn't)
        "Collaborated with cross-functional teams to deliver sprints on schedule.",
      ],
    },
    {
      id: "broken-exp-2",
      // Check 2: Duplicate organization
      employer: "Broken Fictional Corp",
      title: "Junior Developer",
      location: "Remote",
      startDate: "2021-01",
      endDate: "2022-12",
      isCurrent: false,
      bullets: [
        "Maintained legacy codebase and fixed user-reported issues.",
      ],
    },
  ],
  education: [
    {
      id: "broken-edu-1",
      institution: "Broken University",
      degree: "B.S. in Computer Science",
      field: "Computer Science",
      // Check 5: Label error — classification placed in GPA field
      gpa: "First Class Honours",
      degreeClassification: "",
      startDate: "2017-09",
      endDate: "2021-06",
      isExpected: false,
      bullets: [],
    },
  ],
  skillGroups: [
    {
      id: "broken-skills-1",
      category: "Languages",
      skills: ["Python", "TypeScript"],
    },
  ],
  projects: [
    {
      id: "broken-proj-1",
      name: "Smart Hackathon App",
      // Check 4: Claims 1st place winner in Hackathon (conflicts with 3rd place award below)
      description: "1st place winner in National Hackathon showcasing automated tools.",
      techStack: ["React"],
      links: [],
      startDate: "2022-03",
      endDate: "2022-04",
    },
  ],
  certifications: [],
  awards: [
    {
      id: "broken-award-1",
      // Check 4: Claims 3rd place in National Hackathon
      title: "3rd place in National Hackathon",
      issuer: "Hackathon Org",
      date: "2022-04",
      description: "Awarded 3rd place bronze award in national competition.",
    },
  ],
  languages: [],
  publications: [],
  grants: [],
  teaching: [],
  conferences: [],
};
