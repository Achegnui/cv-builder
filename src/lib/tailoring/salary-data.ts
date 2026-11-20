import type { SalaryRangeInfo } from "./types";

export const SALARY_DISCLAIMER =
  "Informational market reference only based on public tech compensation surveys (Levels.fyi, Glassdoor, Hays, Techpoint). Not financial, legal, or compensation advice. Actual offers depend on candidate experience, employer budget, and equity components.";

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
];

/**
 * Standard benchmark salary ranges by country and level
 */
const SALARY_BENCHMARKS: Record<
  string,
  Record<string, { min: number; max: number; period: "year" | "month" }>
> = {
  US: {
    intern: { min: 45000, max: 75000, period: "year" },
    junior: { min: 70000, max: 105000, period: "year" },
    mid: { min: 105000, max: 150000, period: "year" },
    senior: { min: 145000, max: 210000, period: "year" },
    lead: { min: 185000, max: 260000, period: "year" },
  },
  UK: {
    intern: { min: 22000, max: 32000, period: "year" },
    junior: { min: 32000, max: 48000, period: "year" },
    mid: { min: 50000, max: 75000, period: "year" },
    senior: { min: 75000, max: 110000, period: "year" },
    lead: { min: 100000, max: 145000, period: "year" },
  },
  DE: {
    intern: { min: 18000, max: 28000, period: "year" },
    junior: { min: 42000, max: 58000, period: "year" },
    mid: { min: 60000, max: 82000, period: "year" },
    senior: { min: 80000, max: 115000, period: "year" },
    lead: { min: 105000, max: 140000, period: "year" },
  },
  CA: {
    intern: { min: 38000, max: 60000, period: "year" },
    junior: { min: 60000, max: 85000, period: "year" },
    mid: { min: 85000, max: 125000, period: "year" },
    senior: { min: 120000, max: 170000, period: "year" },
    lead: { min: 155000, max: 210000, period: "year" },
  },
  NG: {
    intern: { min: 100000, max: 250000, period: "month" },
    junior: { min: 250000, max: 600000, period: "month" },
    mid: { min: 600000, max: 1500000, period: "month" },
    senior: { min: 1500000, max: 3500000, period: "month" },
    lead: { min: 3000000, max: 6000000, period: "month" },
  },
  KE: {
    intern: { min: 30000, max: 70000, period: "month" },
    junior: { min: 70000, max: 160000, period: "month" },
    mid: { min: 160000, max: 350000, period: "month" },
    senior: { min: 350000, max: 700000, period: "month" },
    lead: { min: 650000, max: 1200000, period: "month" },
  },
  GH: {
    intern: { min: 2000, max: 4500, period: "month" },
    junior: { min: 4500, max: 10000, period: "month" },
    mid: { min: 10000, max: 22000, period: "month" },
    senior: { min: 22000, max: 45000, period: "month" },
    lead: { min: 40000, max: 80000, period: "month" },
  },
  IN: {
    intern: { min: 250000, max: 500000, period: "year" },
    junior: { min: 500000, max: 1000000, period: "year" },
    mid: { min: 1000000, max: 2000000, period: "year" },
    senior: { min: 2000000, max: 3800000, period: "year" },
    lead: { min: 3500000, max: 6000000, period: "year" },
  },
};

export function getSalaryBenchmark(
  countryCode: string,
  level: "intern" | "junior" | "mid" | "senior" | "lead",
  customCurrency?: string
): SalaryRangeInfo {
  const country = SUPPORTED_COUNTRIES.find((c) => c.code === countryCode) || SUPPORTED_COUNTRIES[0];
  const benchmarks = SALARY_BENCHMARKS[country.code] || SALARY_BENCHMARKS.US;
  const range = benchmarks[level] || benchmarks.junior;
  const currency = customCurrency || country.defaultCurrency;

  const minFormatted = range.min.toLocaleString();
  const maxFormatted = range.max.toLocaleString();
  const periodLabel = range.period === "year" ? "yr" : "mo";

  return {
    country: country.name,
    level,
    currency,
    min: range.min,
    max: range.max,
    period: range.period,
    formattedRange: `${currency} ${minFormatted} - ${maxFormatted} / ${periodLabel}`,
    dataSource: "Public Tech Compensation Benchmarks (2024-2025)",
    disclaimer: SALARY_DISCLAIMER,
  };
}
