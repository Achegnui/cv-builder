/**
 * Fictional sample CV data for testing and demonstration.
 *
 * IMPORTANT: This data is entirely fictional. "Alex Sample" is not a real
 * person. All employers, institutions, and achievements are made up.
 * This is clearly marked as sample data per AGENTS.md rule 5.
 */

import type { CVData } from "./cv";

export const SAMPLE_CV: CVData = {
  profile: {
    fullName: "Alex Sample",
    email: "alex.sample@fictional-email.example",
    phone: "+1 555-000-1234",
    location: "Sampleville, Fictional State",
    linkedIn: "https://linkedin.com/in/alex-sample-fictional",
    website: "https://alexsample.example",
    photoUrl: "",
    dateOfBirth: "1998-03",
    nationality: "Fictional",
  },
  summary: {
    text: "Computer science graduate with project experience in web development and data analysis. Built several full-stack applications during coursework and internships. Looking for entry-level software engineering roles.",
  },
  experience: [
    {
      id: "exp-sample-1",
      employer: "Fictional Software Co.",
      title: "Software Engineering Intern",
      location: "Sampleville, FS",
      startDate: "2024-06",
      endDate: "2024-08",
      isCurrent: false,
      bullets: [
        "Built an internal dashboard using React and Node.js for the support team",
        "Wrote unit tests that covered 12 API endpoints",
        "Participated in daily stand-ups and code reviews with a team of 5",
      ],
    },
    {
      id: "exp-sample-2",
      employer: "Campus IT Help Desk",
      title: "Student Technician",
      location: "Fictional University campus",
      startDate: "2023-09",
      endDate: "2024-05",
      isCurrent: false,
      bullets: [
        "Helped students and staff troubleshoot hardware and software issues",
        "Documented common fixes in a shared knowledge base used by 8 team members",
      ],
    },
  ],
  education: [
    {
      id: "edu-sample-1",
      institution: "Fictional University",
      degree: "Bachelor of Science",
      field: "Computer Science",
      gpa: "3.6/4.0",
      degreeClassification: "",
      startDate: "2021-09",
      endDate: "2025-06",
      isExpected: true,
      bullets: [
        "Relevant coursework: Data Structures, Algorithms, Databases, Web Development, Machine Learning",
        "Dean's list: Fall 2023, Spring 2024",
      ],
    },
  ],
  skillGroups: [
    {
      id: "skill-sample-1",
      category: "Programming Languages",
      skills: ["TypeScript", "Python", "Java", "SQL"],
    },
    {
      id: "skill-sample-2",
      category: "Frameworks and Tools",
      skills: ["React", "Next.js", "Node.js", "Git", "PostgreSQL"],
    },
    {
      id: "skill-sample-3",
      category: "Other",
      skills: ["Technical writing", "Team collaboration", "Problem-solving"],
    },
  ],
  projects: [
    {
      id: "proj-sample-1",
      name: "Campus Event Finder",
      description:
        "A web app that aggregates campus events from multiple sources and shows them on a map. Built as a final-year group project.",
      techStack: ["Next.js", "TypeScript", "PostgreSQL", "Leaflet"],
      links: ["https://github.com/fictional/campus-events"],
      startDate: "2024-09",
      endDate: "2025-04",
    },
    {
      id: "proj-sample-2",
      name: "Budget Tracker CLI",
      description:
        "A command-line tool for tracking personal expenses with category tags and monthly reports.",
      techStack: ["Python", "SQLite"],
      links: [],
      startDate: "2023-11",
      endDate: "2024-01",
    },
  ],
  certifications: [
    {
      id: "cert-sample-1",
      name: "Fictional Cloud Practitioner",
      issuer: "Fictional Cloud Inc.",
      date: "2024-03",
      credentialId: "FCP-00000-SAMPLE",
      credentialUrl: "",
    },
  ],
  awards: [
    {
      id: "award-sample-1",
      title: "Best Group Project — CS Department",
      issuer: "Fictional University CS Department",
      date: "2025-04",
      description:
        "Awarded for the Campus Event Finder project at the annual showcase.",
    },
  ],
  languages: [
    {
      id: "lang-sample-1",
      language: "English",
      proficiency: "native",
    },
    {
      id: "lang-sample-2",
      language: "French",
      proficiency: "intermediate",
    },
  ],
  publications: [
    {
      id: "pub-sample-1",
      title: "A Survey of Campus Event Aggregation Methods",
      authors: "A. Sample, B. Fictional, C. Madeup",
      venue: "Fictional University Undergraduate Research Journal",
      date: "2025-03",
      doi: "",
      url: "",
    },
  ],
  grants: [],
  teaching: [
    {
      id: "teach-sample-1",
      role: "Teaching Assistant",
      course: "Introduction to Programming (CS101)",
      institution: "Fictional University",
      startDate: "2024-01",
      endDate: "2024-05",
      description:
        "Held weekly office hours and graded assignments for a class of 45 students.",
    },
  ],
  conferences: [
    {
      id: "conf-sample-1",
      title: "Fictional Tech Student Conference 2024",
      role: "presenter",
      event: "Annual student research presentations",
      location: "Sampleville Convention Center",
      date: "2024-11",
    },
  ],
};
