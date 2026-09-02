/**
 * Forex Margin Calculator.
 * Calculates margin requirements, pip values, and position sizes.
 */

export interface ForexInput {
  accountBalance: number;
  leverage: number; // e.g., 100 for 1:100
  pair: string;
  lotSize: number; // standard lot = 100,000
  entryPrice: number;
  exitPrice?: number;
  pipValue?: number; // optional override
}

export interface ForexResult {
  marginRequired: number;
  pipValue: number;
  pipDifference: number;
  profitLoss: number;
  marginLevel: number;
  freeMargin: number;
  riskPercentage: number;
  positionSize: number;
}

const STANDARD_LOT = 100000;

export function calculateForexMargin(input: ForexInput): ForexResult {
  const { accountBalance, leverage, lotSize, entryPrice, exitPrice } = input;

  const positionSize = lotSize * STANDARD_LOT;
  const marginRequired = positionSize / leverage;

  // Pip calculation (simplified for most pairs)
  // 1 pip = 0.0001 for most pairs, 0.01 for JPY pairs
  const isJpy = input.pair.toUpperCase().includes("JPY");
  const pipSize = isJpy ? 0.01 : 0.0001;
  const pipValuePerLot = isJpy ? 100 / entryPrice : STANDARD_LOT * pipSize;
  const pipValue = pipValuePerLot * lotSize;

  // Pip difference
  const pipDifference = exitPrice
    ? Math.abs(exitPrice - entryPrice) / pipSize
    : 0;

  // Profit/Loss
  const profitLoss = exitPrice
    ? (exitPrice - entryPrice) * positionSize * (isJpy ? 1 : 1)
    : 0;

  // Adjust for JPY pairs
  const adjustedPnl = isJpy && exitPrice
    ? ((exitPrice - entryPrice) / pipSize) * pipValue
    : profitLoss;

  const marginLevel = marginRequired > 0
    ? ((accountBalance + adjustedPnl) / marginRequired) * 100
    : 0;

  const freeMargin = accountBalance - marginRequired + adjustedPnl;
  const riskPercentage = accountBalance > 0
    ? (Math.abs(adjustedPnl) / accountBalance) * 100
    : 0;

  return {
    marginRequired: Math.round(marginRequired * 100) / 100,
    pipValue: Math.round(pipValue * 100) / 100,
    pipDifference: Math.round(pipDifference * 10) / 10,
    profitLoss: Math.round(adjustedPnl * 100) / 100,
    marginLevel: Math.round(marginLevel * 100) / 100,
    freeMargin: Math.round(freeMargin * 100) / 100,
    riskPercentage: Math.round(riskPercentage * 100) / 100,
    positionSize,
  };
}

export function validateForexInput(input: ForexInput): string | null {
  if (input.accountBalance <= 0) return "Account balance must be positive.";
  if (input.leverage <= 0 || input.leverage > 500) return "Leverage must be between 1 and 500.";
  if (input.lotSize <= 0) return "Lot size must be positive.";
  if (input.entryPrice <= 0) return "Entry price must be positive.";
  return null;
}

export const COMMON_LEVERAGES = [10, 20, 50, 100, 200, 500];
export const COMMON_LOT_SIZES = [
  { label: "Micro (0.01)", value: 0.01 },
  { label: "Mini (0.1)", value: 0.1 },
  { label: "Standard (1.0)", value: 1.0 },
  { label: "Mini (0.5)", value: 0.5 },
];
