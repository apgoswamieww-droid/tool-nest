/**
 * Working Capital Calculator.
 * Calculates net working capital, current ratio, and quick ratio.
 */

export interface WorkingCapitalInput {
  currentAssets: number;
  currentLiabilities: number;
  inventory?: number;
  prepaidExpenses?: number;
}

export interface WorkingCapitalResult {
  netWorkingCapital: number;
  currentRatio: number;
  quickRatio: number;
  workingCapitalRatio: number;
  isHealthy: boolean;
  assessment: string;
  recommendation: string;
}

export function calculateWorkingCapital(input: WorkingCapitalInput): WorkingCapitalResult {
  const { currentAssets, currentLiabilities, inventory = 0, prepaidExpenses = 0 } = input;

  const netWorkingCapital = currentAssets - currentLiabilities;
  const currentRatio = currentLiabilities > 0 ? currentAssets / currentLiabilities : 0;
  const quickAssets = currentAssets - inventory - prepaidExpenses;
  const quickRatio = currentLiabilities > 0 ? quickAssets / currentLiabilities : 0;
  const workingCapitalRatio = currentAssets > 0 ? (currentAssets - currentLiabilities) / currentAssets : 0;

  const isHealthy = currentRatio >= 1.5 && netWorkingCapital > 0;

  let assessment: string;
  let recommendation: string;

  if (currentRatio >= 2) {
    assessment = "Strong liquidity position";
    recommendation = "Your business has excellent short-term financial health. Consider investing excess capital for growth.";
  } else if (currentRatio >= 1.5) {
    assessment = "Healthy liquidity";
    recommendation = "Your business can comfortably meet short-term obligations. Maintain current management practices.";
  } else if (currentRatio >= 1) {
    assessment = "Adequate but tight";
    recommendation = "You can cover obligations but have limited buffer. Consider improving receivables collection or reducing inventory.";
  } else if (currentRatio >= 0.5) {
    assessment = "Liquidity concerns";
    recommendation = "Risk of not meeting short-term obligations. Focus on converting assets to cash and reducing current liabilities.";
  } else {
    assessment = "Critical liquidity risk";
    recommendation = "Urgent action needed. Your business cannot cover short-term debts. Consider restructuring or seeking emergency financing.";
  }

  return {
    netWorkingCapital: Math.round(netWorkingCapital * 100) / 100,
    currentRatio: Math.round(currentRatio * 100) / 100,
    quickRatio: Math.round(quickRatio * 100) / 100,
    workingCapitalRatio: Math.round(workingCapitalRatio * 100) / 100,
    isHealthy,
    assessment,
    recommendation,
  };
}

export function validateWorkingCapitalInput(input: WorkingCapitalInput): string | null {
  if (input.currentAssets < 0) return "Current assets cannot be negative.";
  if (input.currentLiabilities < 0) return "Current liabilities cannot be negative.";
  if (input.inventory && input.inventory > input.currentAssets)
    return "Inventory cannot exceed total current assets.";
  return null;
}
