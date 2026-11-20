export interface SampleJobPosting {
  id: string;
  title: string;
  company: string;
  description: string;
}

export const SAMPLE_JOB_POSTINGS: SampleJobPosting[] = [
  {
    id: "frontend-dev",
    title: "Junior / Mid-Level Frontend Engineer",
    company: "Starlight Digital",
    description: `About the Role:
We are looking for a Junior to Mid-Level Frontend Engineer to join our growing product team in building fast, accessible web applications.

Required Qualifications:
- 1-2 years of experience building modern web applications with TypeScript, React, and Next.js.
- Strong knowledge of responsive web design and Tailwind CSS.
- Familiarity with writing automated unit and component tests (e.g. Vitest, Jest).
- Solid understanding of web accessibility (WCAG), semantic HTML, and REST APIs.

Preferred Qualifications:
- Experience with Docker and CI/CD pipelines.
- Familiarity with GraphQL or state management solutions.
- Contribution to open source or personal technical projects.

Location & Timezone:
- Remote (US, UK, or EU time zones: UTC-5 to UTC+2).
`,
  },
  {
    id: "fullstack-intern",
    title: "Software Engineering Intern / Graduate",
    company: "Apex Cloud Systems",
    description: `Apex Cloud Systems is hiring a Software Engineering Intern to join our internal developer productivity team.

Key Requirements:
- Coursework or internship experience with Node.js, TypeScript, and SQL databases (PostgreSQL preferred).
- Hands-on experience developing and testing RESTful backend APIs.
- Understanding of version control (Git) and agile team collaboration.
- Strong problem-solving skills and willingness to learn new technologies quickly.

Nice-to-Haves:
- Experience with Kubernetes or cloud providers (AWS, GCP).
- Experience building dashboards or developer tooling.
- Demonstrated passion for software testing and automated QA.

Location:
- Hybrid / Remote. Open to candidates in North America and Western Europe.
`,
  },
  {
    id: "data-analyst",
    title: "Junior Business & Data Analyst",
    company: "Metro Financial Analytics",
    description: `We are seeking a detail-oriented Junior Data Analyst to support our operational reporting workflows.

Requirements:
- Proven experience querying databases using SQL and analyzing structured datasets.
- Proficiency with Python or R for statistical analysis and reporting.
- Experience building charts and data visualizations with Tableau or PowerBI.
- Clear written and verbal communication skills to present findings to non-technical stakeholders.

Preferred Skills:
- Financial modeling or predictive forecasting experience.
- Knowledge of data warehousing (Snowflake, BigQuery).
- Degree in Computer Science, Mathematics, Economics, or related quantitative field.

Location:
- London, UK (or remote within UK time zone).
`,
  },
];
