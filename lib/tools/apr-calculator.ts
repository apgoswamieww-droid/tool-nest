/**
 * APR (Annual Percentage Rate) Calculator.
 * Calculates APR from fees and interest, and payment schedules.
 */

export interface AprInput {
  loanAmount: number;
  interestRate: number; // annual %
  loanTerm: number; // months
  originationFee?: number;
  closingCosts?: number;
  otherFees?: number;
}

export interface AprResult {
  apr: number;
  monthlyPayment: number;
  totalInterest: number;
  totalCost: number;
  totalFees: number;
  effectiveBorrowingAmount: number;
  feePercentage: number;
  totalPayments: number;
  amortizationSchedule: AmortizationEntry[];
}

export interface AmortizationEntry {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export function calculateApr(input: AprInput): AprResult {
  const {
    loanAmount,
    interestRate,
    loanTerm,
    originationFee = 0,
    closingCosts = 0,
    otherFees = 0,
  } = input;

  const totalFees = originationFee + closingCosts + otherFees;
  const effectiveBorrowing = loanAmount - totalFees;
  const monthlyRate = interestRate / 100 / 12;

  // Monthly payment (standard amortization formula)
  let monthlyPayment: number;
  if (monthlyRate === 0) {
    monthlyPayment = loanAmount / loanTerm;
  } else {
    monthlyPayment =
      (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, loanTerm)) /
      (Math.pow(1 + monthlyRate, loanTerm) - 1);
  }

  // Generate amortization schedule
  const schedule: AmortizationEntry[] = [];
  let balance = loanAmount;
  let totalInterest = 0;

  for (let month = 1; month <= loanTerm; month++) {
    const interest = balance * monthlyRate;
    const principal = monthlyPayment - interest;
    balance = Math.max(0, balance - principal);
    totalInterest += interest;

    schedule.push({
      month,
      payment: Math.round(monthlyPayment * 100) / 100,
      principal: Math.round(principal * 100) / 100,
      interest: Math.round(interest * 100) / 100,
      balance: Math.round(balance * 100) / 100,
    });
  }

  const totalPayments = monthlyPayment * loanTerm;
  const totalCost = totalPayments;

  // Calculate APR using Newton's method
  // APR is the rate that makes PV of all payments = effective borrowing amount
  const apr = calculateAprRate(effectiveBorrowing, monthlyPayment, loanTerm);

  return {
    apr: Math.round(apr * 10000) / 100, // percentage with 2 decimals
    monthlyPayment: Math.round(monthlyPayment * 100) / 100,
    totalInterest: Math.round(totalInterest * 100) / 100,
    totalCost: Math.round(totalCost * 100) / 100,
    totalFees: Math.round(totalFees * 100) / 100,
    effectiveBorrowingAmount: Math.round(effectiveBorrowing * 100) / 100,
    feePercentage: loanAmount > 0 ? Math.round((totalFees / loanAmount) * 10000) / 100 : 0,
    totalPayments: Math.round(totalPayments * 100) / 100,
    amortizationSchedule: schedule,
  };
}

function calculateAprRate(
  presentValue: number,
  payment: number,
  periods: number
): number {
  // Newton's method to find APR from payment
  let rate = 0.1 / 12; // initial guess (10% APR)
  
  for (let i = 0; i < 100; i++) {
    const f = payment * (1 - Math.pow(1 + rate, -periods)) / rate - presentValue;
    const fPrime =
      (payment * ((1 + rate) * Math.pow(1 + rate, -periods) * periods - (1 - Math.pow(1 + rate, -periods)))) /
      (rate * rate);

    if (Math.abs(fPrime) < 1e-10) break;

    const newRate = rate - f / fPrime;
    if (Math.abs(newRate - rate) < 1e-10) break;
    rate = newRate;
  }

  return Math.max(0, rate * 12 * 100); // convert to annual percentage
}

export function validateAprInput(input: AprInput): string | null {
  if (input.loanAmount <= 0) return "Loan amount must be positive.";
  if (input.interestRate < 0) return "Interest rate cannot be negative.";
  if (input.loanTerm <= 0 || input.loanTerm > 600) return "Loan term must be between 1 and 600 months.";
  const totalFees = (input.originationFee || 0) + (input.closingCosts || 0) + (input.otherFees || 0);
  if (totalFees >= input.loanAmount) return "Total fees cannot exceed the loan amount.";
  return null;
}
