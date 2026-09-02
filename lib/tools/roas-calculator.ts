/**
 * ROAS (Return on Ad Spend) Calculator.
 * Calculates marketing ROI metrics for ad campaigns.
 */

export interface RoasInput {
  adSpend: number;
  revenue: number;
  totalCosts?: number;
}

export interface RoasResult {
  roas: number;
  roi: number;
  profit: number;
  costPerAcquisition?: number;
  breakevenRoas: number;
  rating: "poor" | "break-even" | "good" | "excellent";
}

export function calculateRoas(input: RoasInput): RoasResult {
  const { adSpend, revenue, totalCosts } = input;

  if (adSpend <= 0) {
    return {
      roas: 0,
      roi: 0,
      profit: revenue,
      breakevenRoas: 1,
      rating: "poor",
    };
  }

  const roas = revenue / adSpend;
  const totalCost = (totalCosts || 0) + adSpend;
  const profit = revenue - totalCost;
  const roi = totalCost > 0 ? (profit / totalCost) * 100 : 0;
  const breakevenRoas = totalCost > 0 ? totalCost / adSpend : 1;

  let rating: RoasResult["rating"] = "poor";
  if (roas >= 5) rating = "excellent";
  else if (roas >= 3) rating = "good";
  else if (roas >= 1) rating = "break-even";

  return {
    roas: Math.round(roas * 100) / 100,
    roi: Math.round(roi * 100) / 100,
    profit: Math.round(profit * 100) / 100,
    breakevenRoas: Math.round(breakevenRoas * 100) / 100,
    rating,
  };
}

export function validateRoasInput(input: RoasInput): string | null {
  if (input.adSpend < 0) return "Ad spend cannot be negative.";
  if (input.revenue < 0) return "Revenue cannot be negative.";
  if (input.adSpend === 0 && input.revenue === 0)
    return "Enter at least one non-zero value.";
  return null;
}

export const ROAS_BENCHMARKS = {
  poor: { min: 0, max: 1, label: "Losing money", color: "text-red-500" },
  "break-even": { min: 1, max: 3, label: "Break-even to marginal", color: "text-yellow-500" },
  good: { min: 3, max: 5, label: "Profitable", color: "text-green-500" },
  excellent: { min: 5, max: Infinity, label: "Excellent", color: "text-green-600" },
};
