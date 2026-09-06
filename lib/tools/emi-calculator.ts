/**
 * EMI (Equated Monthly Installment) Calculator.
 * Computes the fixed monthly payment for a loan using the standard
 * reducing-balance formula, with a full amortization breakdown.
 *
 * Formula: EMI = P × r × (1+r)^n / ((1+r)^n − 1)
 * where P = principal, r = monthly rate (annual/12/100), n = months.
 */

/** Shared limits — the client, validators, and any future API capability
 *  must agree on these. Never diverge. */
export const MAX_PRINCIPAL = 1_000_000_000;
export const MAX_ANNUAL_RATE = 100;
export const MAX_TENURE_MONTHS = 600;

export interface EmiInput {
  /** Loan principal. */
  principal: number;
  /** Annual interest rate in percent (e.g. 8.5). */
  annualRate: number;
  /** Loan tenure in months. */
  tenureMonths: number;
  /** Optional one-time processing fee, added to the total cost view. */
  processingFee?: number;
}

export interface AmortizationEntry {
  month: number;
  payment: number;
  principalPaid: number;
  interestPaid: number;
  balance: number;
}

export interface YearlyEntry {
  year: number;
  principalPaid: number;
  interestPaid: number;
  balance: number;
}

export interface EmiResult {
  /** Fixed monthly installment. */
  emi: number;
  /** The loan principal (echoed so consumers don't need the input). */
  totalPrincipal: number;
  /** Interest paid over the whole tenure. */
  totalInterest: number;
  /** Principal + interest (what the borrower pays in EMIs). */
  totalPayment: number;
  /** Total payment + processing fee. */
  totalCost: number;
  /** Interest as a share of principal, in percent. */
  interestPercentage: number;
  amortizationSchedule: AmortizationEntry[];
  yearlyBreakdown: YearlyEntry[];
}

export function calculateEmi(input: EmiInput): EmiResult {
  const { principal, annualRate, tenureMonths, processingFee = 0 } = input;

  const monthlyRate = annualRate / 100 / 12;

  // Standard reducing-balance EMI; the zero-rate case is a simple split.
  const emi =
    monthlyRate === 0
      ? principal / tenureMonths
      : (principal *
          monthlyRate *
          Math.pow(1 + monthlyRate, tenureMonths)) /
        (Math.pow(1 + monthlyRate, tenureMonths) - 1);

  // Build the schedule at full precision; round only for display.
  // The final installment closes the loan exactly (absorbs rounding drift).
  const schedule: AmortizationEntry[] = [];
  const yearly: YearlyEntry[] = [];
  let balance = principal;
  let totalInterest = 0;

  for (let month = 1; month <= tenureMonths; month++) {
    const interestPaid = balance * monthlyRate;
    let principalPaid = emi - interestPaid;
    let payment = emi;

    if (month === tenureMonths || principalPaid > balance) {
      // Last month (or over-payment edge): pay off exactly what remains.
      principalPaid = balance;
      payment = balance + interestPaid;
    }

    balance = Math.max(0, balance - principalPaid);
    totalInterest += interestPaid;

    schedule.push({
      month,
      payment: round2(payment),
      principalPaid: round2(principalPaid),
      interestPaid: round2(interestPaid),
      balance: round2(balance),
    });

    const year = Math.ceil(month / 12);
    const y = yearly[year - 1] ??= { year, principalPaid: 0, interestPaid: 0, balance: 0 };
    y.principalPaid += principalPaid;
    y.interestPaid += interestPaid;
    y.balance = balance;
  }

  for (const y of yearly) {
    y.principalPaid = round2(y.principalPaid);
    y.interestPaid = round2(y.interestPaid);
    y.balance = round2(y.balance);
  }

  const totalPayment = principal + totalInterest;
  const totalCost = totalPayment + processingFee;

  return {
    emi: round2(emi),
    totalPrincipal: round2(principal),
    totalInterest: round2(totalInterest),
    totalPayment: round2(totalPayment),
    totalCost: round2(totalCost),
    interestPercentage:
      principal > 0 ? round2((totalInterest / principal) * 100) : 0,
    amortizationSchedule: schedule,
    yearlyBreakdown: yearly,
  };
}

export function validateEmiInput(input: EmiInput): string | null {
  if (!Number.isFinite(input.principal) || input.principal <= 0) {
    return "Loan amount must be a positive number.";
  }
  if (input.principal > MAX_PRINCIPAL) {
    return `Loan amount cannot exceed ${MAX_PRINCIPAL.toLocaleString()}.`;
  }
  if (!Number.isFinite(input.annualRate) || input.annualRate < 0) {
    return "Interest rate cannot be negative.";
  }
  if (input.annualRate > MAX_ANNUAL_RATE) {
    return `Interest rate cannot exceed ${MAX_ANNUAL_RATE}%.`;
  }
  if (
    !Number.isFinite(input.tenureMonths) ||
    input.tenureMonths < 1 ||
    input.tenureMonths > MAX_TENURE_MONTHS
  ) {
    return `Loan term must be between 1 and ${MAX_TENURE_MONTHS} months.`;
  }
  if ((input.processingFee ?? 0) < 0) {
    return "Processing fee cannot be negative.";
  }
  return null;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
