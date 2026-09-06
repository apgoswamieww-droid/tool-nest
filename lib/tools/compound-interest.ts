/**
 * Compound Interest Calculator.
 * Annual/semi-annual/quarterly/monthly/daily compounding, optional
 * regular contributions, with a yearly growth schedule.
 *
 * A = P × (1 + r/n)^(n·t)  +  contributions via future-value-of-annuity
 * aligned to the compounding period.
 */

export type CompoundingFrequency = "annually" | "semi-annually" | "quarterly" | "monthly" | "daily";

/** Periods per year for each supported frequency. */
export const PERIODS_PER_YEAR: Record<CompoundingFrequency, number> = {
  annually: 1,
  "semi-annually": 2,
  quarterly: 4,
  monthly: 12,
  daily: 365,
};

/** Shared limits — client, validators, and future API must agree. */
export const MAX_PRINCIPAL = 1_000_000_000;
export const MAX_ANNUAL_RATE = 100;
export const MAX_YEARS = 100;
export const MAX_CONTRIBUTION = 10_000_000;

export interface CompoundInput {
  principal: number;
  /** Annual nominal rate in percent. */
  annualRate: number;
  years: number;
  frequency: CompoundingFrequency;
  /** Extra amount added at the END of every period (same as frequency). */
  contributionPerPeriod?: number;
}

export interface YearlyGrowth {
  year: number;
  /** Total balance at the end of the year (contributions included). */
  balance: number;
  /** Principal + all contributions made up to this point. */
  invested: number;
  /** Balance − invested. */
  interestEarned: number;
}

export interface CompoundResult {
  /** Final balance including contributions. */
  finalAmount: number;
  totalPrincipal: number;
  totalContributions: number;
  totalInterest: number;
  /** Effective annual yield in percent (what the nominal rate compounds to). */
  effectiveAnnualRate: number;
  yearlySchedule: YearlyGrowth[];
}

export function calculateCompoundInterest(input: CompoundInput): CompoundResult {
  const { principal, annualRate, years, frequency, contributionPerPeriod = 0 } = input;

  const n = PERIODS_PER_YEAR[frequency];
  const periodRate = annualRate / 100 / n;
  const totalPeriods = Math.round(years * n);

  let balance = principal;
  let invested = principal;
  let interestEarned = 0;

  const yearlySchedule: YearlyGrowth[] = [];

  for (let period = 1; period <= totalPeriods; period++) {
    const interest = balance * periodRate;
    balance += interest;
    interestEarned += interest;
    balance += contributionPerPeriod;
    invested += contributionPerPeriod;

    if (period % n === 0) {
      const year = period / n;
      yearlySchedule.push({
        year,
        balance: round2(balance),
        invested: round2(invested),
        interestEarned: round2(interestEarned),
      });
    }
  }

  // Effective annual rate: EAR = (1 + r/n)^n − 1
  const effectiveAnnualRate =
    (Math.pow(1 + annualRate / 100 / n, n) - 1) * 100;

  return {
    finalAmount: round2(balance),
    totalPrincipal: round2(principal),
    totalContributions: round2(invested - principal),
    totalInterest: round2(interestEarned),
    effectiveAnnualRate: Math.round(effectiveAnnualRate * 100) / 100,
    yearlySchedule,
  };
}

export function validateCompoundInput(input: CompoundInput): string | null {
  if (!Number.isFinite(input.principal) || input.principal < 0) {
    return "Principal cannot be negative.";
  }
  if (input.principal > MAX_PRINCIPAL) {
    return `Principal cannot exceed ${MAX_PRINCIPAL.toLocaleString()}.`;
  }
  if (!Number.isFinite(input.annualRate) || input.annualRate < 0) {
    return "Interest rate cannot be negative.";
  }
  if (input.annualRate > MAX_ANNUAL_RATE) {
    return `Interest rate cannot exceed ${MAX_ANNUAL_RATE}%.`;
  }
  if (!Number.isFinite(input.years) || input.years < 1 || input.years > MAX_YEARS) {
    return `Time period must be between 1 and ${MAX_YEARS} years.`;
  }
  if ((input.contributionPerPeriod ?? 0) < 0) {
    return "Contribution cannot be negative.";
  }
  if ((input.contributionPerPeriod ?? 0) > MAX_CONTRIBUTION) {
    return `Contribution cannot exceed ${MAX_CONTRIBUTION.toLocaleString()} per period.`;
  }
  return null;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
