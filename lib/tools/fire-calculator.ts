/**
 * FIRE (Financial Independence, Retire Early) Calculator.
 * Calculates FIRE number, years to FIRE, and withdrawal rates.
 */

export interface FireInput {
  currentAge: number;
  retirementAge: number;
  currentSavings: number;
  annualExpenses: number;
  annualIncome: number;
  annualSavingsRate?: number; // override: % of income saved
  expectedReturnRate: number; // annual % (e.g., 7 for 7%)
  inflationRate: number; // annual % (e.g., 3 for 3%)
  safeWithdrawalRate: number; // e.g., 4 for 4% rule
}

export interface FireResult {
  fireNumber: number;
  yearsToFire: number;
  ageAtFire: number;
  realReturnRate: number;
  monthlySavings: number;
  currentSavingsRate: number;
  coastFireNumber: number;
  baristaFireNumber: number;
  isAlreadyFIRE: boolean;
  projectedSavingsAtRetirement: number;
  safeAnnualWithdrawal: number;
  monthlyPassiveIncome: number;
}

/**
 * Calculate FIRE metrics based on inputs.
 */
export function calculateFire(input: FireInput): FireResult {
  const {
    currentAge,
    retirementAge,
    currentSavings,
    annualExpenses,
    annualIncome,
    annualSavingsRate,
    expectedReturnRate,
    inflationRate,
    safeWithdrawalRate,
  } = input;

  // Calculate savings rate
  const annualSavings = annualIncome * ((annualSavingsRate || 0) / 100);
  const actualAnnualSavings = annualSavingsRate
    ? annualSavings
    : Math.max(0, annualIncome - annualExpenses);
  const currentSavingsRate =
    annualIncome > 0 ? (actualAnnualSavings / annualIncome) * 100 : 0;

  // Real return rate (adjusted for inflation)
  const realReturnRate =
    ((1 + expectedReturnRate / 100) / (1 + inflationRate / 100) - 1) * 100;

  // FIRE number = annual expenses / safe withdrawal rate
  const fireNumber = annualExpenses / (safeWithdrawalRate / 100);

  // Years to FIRE using compound growth
  let yearsToFire = 0;
  let projectedSavings = currentSavings;
  const maxYears = 100;
  const monthlyRate = realReturnRate / 100 / 12;
  const monthlySavings = actualAnnualSavings / 12;

  while (projectedSavings < fireNumber && yearsToFire < maxYears) {
    yearsToFire++;
    // Compound monthly for better accuracy
    for (let m = 0; m < 12; m++) {
      projectedSavings = projectedSavings * (1 + monthlyRate) + monthlySavings;
    }
  }

  const ageAtFire = currentAge + yearsToFire;
  const isAlreadyFIRE = currentSavings >= fireNumber;

  // Coast FIRE: current savings that will grow to FIRE number by retirement age
  const yearsToRetirement = Math.max(0, retirementAge - currentAge);
  const coastFireNumber =
    yearsToRetirement > 0
      ? fireNumber / Math.pow(1 + realReturnRate / 100, yearsToRetirement)
      : fireNumber;

  // Barista FIRE: enough savings to cover partial expenses
  // Assuming barista job covers 50% of expenses
  const baristaFireNumber = (annualExpenses * 0.5) / (safeWithdrawalRate / 100);

  const safeAnnualWithdrawal = fireNumber * (safeWithdrawalRate / 100);
  const monthlyPassiveIncome = safeAnnualWithdrawal / 12;

  return {
    fireNumber: Math.round(fireNumber),
    yearsToFire: Math.round(yearsToFire * 10) / 10,
    ageAtFire,
    realReturnRate: Math.round(realReturnRate * 100) / 100,
    monthlySavings: Math.round(monthlySavings),
    currentSavingsRate: Math.round(currentSavingsRate * 10) / 10,
    coastFireNumber: Math.round(coastFireNumber),
    baristaFireNumber: Math.round(baristaFireNumber),
    isAlreadyFIRE,
    projectedSavingsAtRetirement: Math.round(projectedSavings),
    safeAnnualWithdrawal: Math.round(safeAnnualWithdrawal),
    monthlyPassiveIncome: Math.round(monthlyPassiveIncome),
  };
}

export function validateFireInput(input: FireInput): string | null {
  if (input.currentAge < 0 || input.currentAge > 120) return "Age must be between 0 and 120.";
  if (input.retirementAge <= input.currentAge) return "Retirement age must be greater than current age.";
  if (input.currentSavings < 0) return "Current savings cannot be negative.";
  if (input.annualExpenses <= 0) return "Annual expenses must be positive.";
  if (input.annualIncome <= 0) return "Annual income must be positive.";
  if (input.expectedReturnRate < 0 || input.expectedReturnRate > 50) return "Expected return rate seems unrealistic.";
  if (input.inflationRate < 0 || input.inflationRate > 20) return "Inflation rate seems unrealistic.";
  if (input.safeWithdrawalRate <= 0 || input.safeWithdrawalRate > 20) return "Safe withdrawal rate should be between 1% and 10%.";
  return null;
}

export const FIRE_PRESETS = {
  conservative: { expectedReturnRate: 5, inflationRate: 3, safeWithdrawalRate: 3.5 },
  moderate: { expectedReturnRate: 7, inflationRate: 3, safeWithdrawalRate: 4 },
  aggressive: { expectedReturnRate: 10, inflationRate: 3, safeWithdrawalRate: 4.5 },
} as const;
