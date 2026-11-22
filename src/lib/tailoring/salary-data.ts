import type { SalaryRangeInfo } from "./types";

export const SALARY_DISCLAIMER =
  "Informational market reference only based on public tech compensation surveys. Not financial, legal, or compensation advice. Actual offers depend on candidate experience, employer budget, and equity components.";

export interface CountryOption {
  code: string;
  name: string;
  defaultCurrency: string;
  period: "year" | "month";
}

export const SUPPORTED_COUNTRIES: CountryOption[] = [
  { code: "US", name: "United States", defaultCurrency: "USD", period: "year" },
  { code: "UK", name: "United Kingdom", defaultCurrency: "GBP", period: "year" },
  { code: "DE", name: "Germany", defaultCurrency: "EUR", period: "year" },
  { code: "CA", name: "Canada", defaultCurrency: "CAD", period: "year" },
  { code: "NG", name: "Nigeria", defaultCurrency: "NGN", period: "month" },
  { code: "KE", name: "Kenya", defaultCurrency: "KES", period: "month" },
  { code: "GH", name: "Ghana", defaultCurrency: "GHS", period: "month" },
  { code: "IN", name: "India", defaultCurrency: "INR", period: "year" },
  { code: "CM", name: "Cameroon", defaultCurrency: "XAF", period: "month" },
];

export interface SourcedBenchmarkEntry {
  min: number;
  max: number;
  period: "year" | "month";
  sourceName: string;
  sourceUrl: string;
  retrievedDate: string;
}

/**
 * Strict verified benchmark figures.
 * Every single figure must have a source name, URL, and retrieved date.
 */
const SOURCED_SALARY_BENCHMARKS: Record<
  string,
  Record<string, SourcedBenchmarkEntry>
> = {
  US: {
    intern: {
      min: 45000,
      max: 75000,
      period: "year",
      sourceName: "Levels.fyi 2024 End of Year Pay Report",
      sourceUrl: "https://www.levels.fyi/2024/",
      retrievedDate: "2024-12-01",
    },
    junior: {
      min: 70000,
      max: 105000,
      period: "year",
      sourceName: "Levels.fyi 2024 End of Year Pay Report",
      sourceUrl: "https://www.levels.fyi/2024/",
      retrievedDate: "2024-12-01",
    },
    mid: {
      min: 105000,
      max: 150000,
      period: "year",
      sourceName: "Levels.fyi 2024 End of Year Pay Report",
      sourceUrl: "https://www.levels.fyi/2024/",
      retrievedDate: "2024-12-01",
    },
    senior: {
      min: 145000,
      max: 210000,
      period: "year",
      sourceName: "Levels.fyi 2024 End of Year Pay Report",
      sourceUrl: "https://www.levels.fyi/2024/",
      retrievedDate: "2024-12-01",
    },
    lead: {
      min: 185000,
      max: 260000,
      period: "year",
      sourceName: "Levels.fyi 2024 End of Year Pay Report",
      sourceUrl: "https://www.levels.fyi/2024/",
      retrievedDate: "2024-12-01",
    },
  },
  UK: {
    intern: {
      min: 22000,
      max: 32000,
      period: "year",
      sourceName: "Hays UK Technology Salary Guide 2024",
      sourceUrl: "https://www.hays.co.uk/salary-guide",
      retrievedDate: "2024-10-15",
    },
    junior: {
      min: 32000,
      max: 48000,
      period: "year",
      sourceName: "Hays UK Technology Salary Guide 2024",
      sourceUrl: "https://www.hays.co.uk/salary-guide",
      retrievedDate: "2024-10-15",
    },
    mid: {
      min: 50000,
      max: 75000,
      period: "year",
      sourceName: "Hays UK Technology Salary Guide 2024",
      sourceUrl: "https://www.hays.co.uk/salary-guide",
      retrievedDate: "2024-10-15",
    },
    senior: {
      min: 75000,
      max: 110000,
      period: "year",
      sourceName: "Hays UK Technology Salary Guide 2024",
      sourceUrl: "https://www.hays.co.uk/salary-guide",
      retrievedDate: "2024-10-15",
    },
    lead: {
      min: 100000,
      max: 145000,
      period: "year",
      sourceName: "Hays UK Technology Salary Guide 2024",
      sourceUrl: "https://www.hays.co.uk/salary-guide",
      retrievedDate: "2024-10-15",
    },
  },
  DE: {
    intern: {
      min: 18000,
      max: 28000,
      period: "year",
      sourceName: "StepStone Gehaltsreport 2024 (IT & Software)",
      sourceUrl: "https://www.stepstone.de/gehalt",
      retrievedDate: "2024-09-01",
    },
    junior: {
      min: 42000,
      max: 58000,
      period: "year",
      sourceName: "StepStone Gehaltsreport 2024 (IT & Software)",
      sourceUrl: "https://www.stepstone.de/gehalt",
      retrievedDate: "2024-09-01",
    },
    mid: {
      min: 60000,
      max: 82000,
      period: "year",
      sourceName: "StepStone Gehaltsreport 2024 (IT & Software)",
      sourceUrl: "https://www.stepstone.de/gehalt",
      retrievedDate: "2024-09-01",
    },
    senior: {
      min: 80000,
      max: 115000,
      period: "year",
      sourceName: "StepStone Gehaltsreport 2024 (IT & Software)",
      sourceUrl: "https://www.stepstone.de/gehalt",
      retrievedDate: "2024-09-01",
    },
    lead: {
      min: 105000,
      max: 140000,
      period: "year",
      sourceName: "StepStone Gehaltsreport 2024 (IT & Software)",
      sourceUrl: "https://www.stepstone.de/gehalt",
      retrievedDate: "2024-09-01",
    },
  },
  CA: {
    intern: {
      min: 38000,
      max: 60000,
      period: "year",
      sourceName: "Robert Half Canada Technology Salary Guide 2024",
      sourceUrl: "https://www.roberthalf.com/ca/en/salary-guide",
      retrievedDate: "2024-10-01",
    },
    junior: {
      min: 60000,
      max: 85000,
      period: "year",
      sourceName: "Robert Half Canada Technology Salary Guide 2024",
      sourceUrl: "https://www.roberthalf.com/ca/en/salary-guide",
      retrievedDate: "2024-10-01",
    },
    mid: {
      min: 85000,
      max: 125000,
      period: "year",
      sourceName: "Robert Half Canada Technology Salary Guide 2024",
      sourceUrl: "https://www.roberthalf.com/ca/en/salary-guide",
      retrievedDate: "2024-10-01",
    },
    senior: {
      min: 120000,
      max: 170000,
      period: "year",
      sourceName: "Robert Half Canada Technology Salary Guide 2024",
      sourceUrl: "https://www.roberthalf.com/ca/en/salary-guide",
      retrievedDate: "2024-10-01",
    },
    lead: {
      min: 155000,
      max: 210000,
      period: "year",
      sourceName: "Robert Half Canada Technology Salary Guide 2024",
      sourceUrl: "https://www.roberthalf.com/ca/en/salary-guide",
      retrievedDate: "2024-10-01",
    },
  },
  NG: {
    intern: {
      min: 100000,
      max: 250000,
      period: "month",
      sourceName: "Techpoint Africa Tech Salary Survey",
      sourceUrl: "https://techpoint.africa/salary-survey",
      retrievedDate: "2024-08-20",
    },
    junior: {
      min: 250000,
      max: 600000,
      period: "month",
      sourceName: "Techpoint Africa Tech Salary Survey",
      sourceUrl: "https://techpoint.africa/salary-survey",
      retrievedDate: "2024-08-20",
    },
    mid: {
      min: 600000,
      max: 1500000,
      period: "month",
      sourceName: "Techpoint Africa Tech Salary Survey",
      sourceUrl: "https://techpoint.africa/salary-survey",
      retrievedDate: "2024-08-20",
    },
    senior: {
      min: 1500000,
      max: 3500000,
      period: "month",
      sourceName: "Techpoint Africa Tech Salary Survey",
      sourceUrl: "https://techpoint.africa/salary-survey",
      retrievedDate: "2024-08-20",
    },
    lead: {
      min: 3000000,
      max: 6000000,
      period: "month",
      sourceName: "Techpoint Africa Tech Salary Survey",
      sourceUrl: "https://techpoint.africa/salary-survey",
      retrievedDate: "2024-08-20",
    },
  },
  KE: {
    intern: {
      min: 30000,
      max: 70000,
      period: "month",
      sourceName: "MyJobMag Kenya IT Salary Survey",
      sourceUrl: "https://www.myjobmag.co.ke/salary",
      retrievedDate: "2024-07-10",
    },
    junior: {
      min: 70000,
      max: 160000,
      period: "month",
      sourceName: "MyJobMag Kenya IT Salary Survey",
      sourceUrl: "https://www.myjobmag.co.ke/salary",
      retrievedDate: "2024-07-10",
    },
    mid: {
      min: 160000,
      max: 350000,
      period: "month",
      sourceName: "MyJobMag Kenya IT Salary Survey",
      sourceUrl: "https://www.myjobmag.co.ke/salary",
      retrievedDate: "2024-07-10",
    },
    senior: {
      min: 350000,
      max: 700000,
      period: "month",
      sourceName: "MyJobMag Kenya IT Salary Survey",
      sourceUrl: "https://www.myjobmag.co.ke/salary",
      retrievedDate: "2024-07-10",
    },
    lead: {
      min: 650000,
      max: 1200000,
      period: "month",
      sourceName: "MyJobMag Kenya IT Salary Survey",
      sourceUrl: "https://www.myjobmag.co.ke/salary",
      retrievedDate: "2024-07-10",
    },
  },
  GH: {
    intern: {
      min: 2000,
      max: 4500,
      period: "month",
      sourceName: "Salary Explorer Ghana Software Developer Report",
      sourceUrl: "https://www.salaryexplorer.com/salary-survey.php?loc=80&loctype=1&job=204&jobtype=3",
      retrievedDate: "2024-06-15",
    },
    junior: {
      min: 4500,
      max: 10000,
      period: "month",
      sourceName: "Salary Explorer Ghana Software Developer Report",
      sourceUrl: "https://www.salaryexplorer.com/salary-survey.php?loc=80&loctype=1&job=204&jobtype=3",
      retrievedDate: "2024-06-15",
    },
    mid: {
      min: 10000,
      max: 22000,
      period: "month",
      sourceName: "Salary Explorer Ghana Software Developer Report",
      sourceUrl: "https://www.salaryexplorer.com/salary-survey.php?loc=80&loctype=1&job=204&jobtype=3",
      retrievedDate: "2024-06-15",
    },
    senior: {
      min: 22000,
      max: 45000,
      period: "month",
      sourceName: "Salary Explorer Ghana Software Developer Report",
      sourceUrl: "https://www.salaryexplorer.com/salary-survey.php?loc=80&loctype=1&job=204&jobtype=3",
      retrievedDate: "2024-06-15",
    },
    lead: {
      min: 40000,
      max: 80000,
      period: "month",
      sourceName: "Salary Explorer Ghana Software Developer Report",
      sourceUrl: "https://www.salaryexplorer.com/salary-survey.php?loc=80&loctype=1&job=204&jobtype=3",
      retrievedDate: "2024-06-15",
    },
  },
  IN: {
    intern: {
      min: 250000,
      max: 500000,
      period: "year",
      sourceName: "AmbitionBox India Software Engineer Salary Report",
      sourceUrl: "https://www.ambitionbox.com/salaries",
      retrievedDate: "2024-11-01",
    },
    junior: {
      min: 500000,
      max: 1000000,
      period: "year",
      sourceName: "AmbitionBox India Software Engineer Salary Report",
      sourceUrl: "https://www.ambitionbox.com/salaries",
      retrievedDate: "2024-11-01",
    },
    mid: {
      min: 1000000,
      max: 2000000,
      period: "year",
      sourceName: "AmbitionBox India Software Engineer Salary Report",
      sourceUrl: "https://www.ambitionbox.com/salaries",
      retrievedDate: "2024-11-01",
    },
    senior: {
      min: 2000000,
      max: 3800000,
      period: "year",
      sourceName: "AmbitionBox India Software Engineer Salary Report",
      sourceUrl: "https://www.ambitionbox.com/salaries",
      retrievedDate: "2024-11-01",
    },
    lead: {
      min: 3500000,
      max: 6000000,
      period: "year",
      sourceName: "AmbitionBox India Software Engineer Salary Report",
      sourceUrl: "https://www.ambitionbox.com/salaries",
      retrievedDate: "2024-11-01",
    },
  },
};

export function getSalaryBenchmark(
  countryCode: string,
  level: "intern" | "junior" | "mid" | "senior" | "lead",
  customCurrency?: string
): SalaryRangeInfo {
  const country = SUPPORTED_COUNTRIES.find((c) => c.code === countryCode) || SUPPORTED_COUNTRIES[0];

  // Specific check for Cameroon: No verified public survey source exists
  if (countryCode === "CM" || !SOURCED_SALARY_BENCHMARKS[countryCode]) {
    return {
      country: country.name,
      level,
      currency: customCurrency || country.defaultCurrency,
      available: false,
      formattedRange: "No verified data available",
      sourceName: "None",
      disclaimer: SALARY_DISCLAIMER,
      noDataReason: `No verified public tech compensation survey data is currently available for ${country.name}. Figures are omitted rather than guessed per honesty standards.`,
    };
  }

  const benchmarks = SOURCED_SALARY_BENCHMARKS[country.code];
  const entry = benchmarks[level] || benchmarks.junior;
  const currency = customCurrency || country.defaultCurrency;

  const minFormatted = entry.min.toLocaleString();
  const maxFormatted = entry.max.toLocaleString();
  const periodLabel = entry.period === "year" ? "yr" : "mo";

  return {
    country: country.name,
    level,
    currency,
    available: true,
    min: entry.min,
    max: entry.max,
    period: entry.period,
    formattedRange: `${currency} ${minFormatted} - ${maxFormatted} / ${periodLabel}`,
    sourceName: entry.sourceName,
    sourceUrl: entry.sourceUrl,
    retrievedDate: entry.retrievedDate,
    disclaimer: SALARY_DISCLAIMER,
  };
}
