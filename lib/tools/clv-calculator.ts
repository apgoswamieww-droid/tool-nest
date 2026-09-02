/**
 * Customer Lifetime Value (CLV) Calculator.
 * Calculates CLV using multiple methods.
 */

export interface ClvInput {
  avgPurchaseValue: number;
  purchaseFrequency: number; // per year
  customerLifespan: number; // years
  acquisitionCost?: number;
  retentionRate?: number; // percentage
  discountRate?: number; // percentage
  grossMargin?: number; // percentage
}

export interface ClvResult {
  basicClv: number;
  adjustedClv: number;
  clvToCacRatio: number;
  paybackPeriod: number; // months
  monthlyRevenue: number;
  annualRevenue: number;
  isHealthy: boolean;
  assessment: string;
}

export function calculateClv(input: ClvInput): ClvResult {
  const {
    avgPurchaseValue,
    purchaseFrequency,
    customerLifespan,
    acquisitionCost = 0,
    retentionRate = 80,
    discountRate = 10,
    grossMargin = 50,
  } = input;

  // Basic CLV = APV × Frequency × Lifespan
  const basicClv = avgPurchaseValue * purchaseFrequency * customerLifespan;

  // Adjusted CLV using margin and retention
  const annualRevenue = avgPurchaseValue * purchaseFrequency;
  const monthlyRevenue = annualRevenue / 12;
  const margin = grossMargin / 100;
  const retention = retentionRate / 100;
  const discount = discountRate / 100;

  // CLV = (APV × F × Margin × Retention) / (1 + Discount - Retention)
  const adjustedClv =
    retention > 0
      ? (annualRevenue * margin * retention) / (1 + discount - retention)
      : basicClv * (margin);

  const clvToCacRatio = acquisitionCost > 0 ? adjustedClv / acquisitionCost : 0;

  // Payback period in months
  const monthlyProfit = (annualRevenue * margin) / 12;
  const paybackPeriod = monthlyProfit > 0 && acquisitionCost > 0
    ? Math.ceil(acquisitionCost / monthlyProfit)
    : 0;

  const isHealthy = clvToCacRatio >= 3 && adjustedClv > 0;

  let assessment: string;
  if (clvToCacRatio === 0) {
    assessment = "Enter acquisition cost to see CLV:CAC ratio";
  } else if (clvToCacRatio >= 5) {
    assessment = "Excellent — highly profitable customer acquisition";
  } else if (clvToCacRatio >= 3) {
    assessment = "Good — healthy return on acquisition investment";
  } else if (clvToCacRatio >= 1) {
    assessment = "Marginal — barely profitable, optimize acquisition";
  } else {
    assessment = "Unprofitable — losing money on each customer acquired";
  }

  return {
    basicClv: Math.round(basicClv * 100) / 100,
    adjustedClv: Math.round(adjustedClv * 100) / 100,
    clvToCacRatio: Math.round(clvToCacRatio * 100) / 100,
    paybackPeriod,
    monthlyRevenue: Math.round(monthlyRevenue * 100) / 100,
    annualRevenue: Math.round(annualRevenue * 100) / 100,
    isHealthy,
    assessment,
  };
}

export function validateClvInput(input: ClvInput): string | null {
  if (input.avgPurchaseValue < 0) return "Average purchase value cannot be negative.";
  if (input.purchaseFrequency < 0) return "Purchase frequency cannot be negative.";
  if (input.customerLifespan <= 0) return "Customer lifespan must be positive.";
  if (input.retentionRate !== undefined && (input.retentionRate < 0 || input.retentionRate > 100))
    return "Retention rate must be between 0 and 100.";
  if (input.discountRate !== undefined && (input.discountRate < 0 || input.discountRate > 100))
    return "Discount rate must be between 0 and 100.";
  return null;
}
