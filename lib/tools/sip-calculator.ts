/**
 * SIP (Systematic Investment Plan) Calculator.
 * Future value of a monthly annuity with contributions at the END of
 * each month, matching the published FAQ formula exactly:
 *
 *   FV = P × ((1+r)^n − 1) / r
 *
 * where P = monthly investment, r = monthly expected return
 * (annual/12/100), n = months. The final contribution earns no
 * interest. Zero-rate case: FV = P × n.
 */

/** Shared limits — client, validators, and future API must agree. */
export const MAX_MONTHLY_INVESTMENT = 10_000_000;
export const MAX_ANNUAL_RETURN = 60;
export const MAX_YEARS = 60;

export interface SipInput {
  /** Fixed amount invested every month. */
  monthlyInvestment: number;
  /** Expected annual return in percent (e.g. 12). */
  annualReturn: number;
  years: number;
}

export interface SipYearly {
  year: number;
  /** Portfolio value at the end of the year. */
  value: number;
  invested: number;
  gain: number;
}

export interface SipResult {
  /** Final portfolio value. */
  futureValue: number;
  totalInvested: number;
  estimatedReturns: number;
  /** Investment growth multiple: futureValue / invested. */
  growthMultiple: number;
  yearlySchedule: SipYearly[];
}

export function calculateSip(input: SipInput): SipResult {
  const { monthlyInvestment, annualReturn, years } = input;

  const months = Math.round(years * 12);
  const monthlyRate = annualReturn / 100 / 12;

  let value = 0;
  let invested = 0;
  const yearlySchedule: SipYearly[] = [];

  for (let month = 1; month <= months; month++) {
    value = value * (1 + monthlyRate) + monthlyInvestment;
    invested += monthlyInvestment;

    if (month % 12 === 0) {
      const year = month / 12;
      yearlySchedule.push({
        year,
        value: round2(value),
        invested: round2(invested),
        gain: round2(value - invested),
      });
    }
  }

  return {
    futureValue: round2(value),
    totalInvested: round2(invested),
    estimatedReturns: round2(value - invested),
    growthMultiple: invested > 0 ? Math.round((value / invested) * 100) / 100 : 0,
    yearlySchedule,
  };
}

export function validateSipInput(input: SipInput): string | null {
  if (!Number.isFinite(input.monthlyInvestment) || input.monthlyInvestment <= 0) {
    return "Monthly investment must be a positive number.";
  }
  if (input.monthlyInvestment > MAX_MONTHLY_INVESTMENT) {
    return `Monthly investment cannot exceed ${MAX_MONTHLY_INVESTMENT.toLocaleString()}.`;
  }
  if (!Number.isFinite(input.annualReturn) || input.annualReturn < 0) {
    return "Expected return cannot be negative.";
  }
  if (input.annualReturn > MAX_ANNUAL_RETURN) {
    return `Expected return cannot exceed ${MAX_ANNUAL_RETURN}%.`;
  }
  if (!Number.isFinite(input.years) || input.years < 1 || input.years > MAX_YEARS) {
    return `Investment period must be between 1 and ${MAX_YEARS} years.`;
  }
  return null;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
