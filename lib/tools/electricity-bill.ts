/**
 * Electricity Bill Calculator.
 * Estimates electricity cost based on appliance usage and rate tiers.
 */

export interface ApplianceEntry {
  name: string;
  wattage: number;
  hoursPerDay: number;
  quantity: number;
}

export interface ElectricityInput {
  appliances: ApplianceEntry[];
  ratePerKwh: number;
  currency: string;
}

export interface ElectricityResult {
  totalWatts: number;
  totalKwhPerDay: number;
  totalKwhPerMonth: number;
  dailyCost: number;
  monthlyCost: number;
  yearlyCost: number;
  applianceBreakdown: ApplianceBreakdown[];
  mostExpensive: string;
  energyRating: "excellent" | "good" | "average" | "high" | "very-high";
}

export interface ApplianceBreakdown {
  name: string;
  watts: number;
  kwhPerMonth: number;
  costPerMonth: number;
  percentage: number;
}

const DAYS_PER_MONTH = 30;
const DAYS_PER_YEAR = 365;

export function calculateElectricity(input: ElectricityInput): ElectricityResult {
  const { appliances, ratePerKwh } = input;

  const breakdown: ApplianceBreakdown[] = [];
  let totalKwhPerDay = 0;

  for (const app of appliances) {
    const watts = app.wattage * app.quantity;
    const kwhPerDay = (watts * app.hoursPerDay) / 1000;
    const kwhPerMonth = kwhPerDay * DAYS_PER_MONTH;
    const costPerMonth = kwhPerMonth * ratePerKwh;

    breakdown.push({
      name: app.name,
      watts,
      kwhPerMonth: Math.round(kwhPerMonth * 100) / 100,
      costPerMonth: Math.round(costPerMonth * 100) / 100,
      percentage: 0,
    });

    totalKwhPerDay += kwhPerDay;
  }

  const totalKwhPerMonth = totalKwhPerDay * DAYS_PER_MONTH;
  const dailyCost = totalKwhPerDay * ratePerKwh;
  const monthlyCost = totalKwhPerMonth * ratePerKwh;
  const yearlyCost = monthlyCost * 12;

  // Calculate percentages
  for (const item of breakdown) {
    item.percentage = monthlyCost > 0
      ? Math.round((item.costPerMonth / monthlyCost) * 10000) / 100
      : 0;
  }

  // Sort by cost descending
  breakdown.sort((a, b) => b.costPerMonth - a.costPerMonth);

  const mostExpensive = breakdown[0]?.name || "N/A";

  // Energy rating based on monthly consumption
  let energyRating: ElectricityResult["energyRating"];
  if (totalKwhPerMonth < 100) energyRating = "excellent";
  else if (totalKwhPerMonth < 250) energyRating = "good";
  else if (totalKwhPerMonth < 500) energyRating = "average";
  else if (totalKwhPerMonth < 1000) energyRating = "high";
  else energyRating = "very-high";

  return {
    totalWatts: Math.round(appliances.reduce((s, a) => s + a.wattage * a.quantity, 0)),
    totalKwhPerDay: Math.round(totalKwhPerDay * 100) / 100,
    totalKwhPerMonth: Math.round(totalKwhPerMonth * 100) / 100,
    dailyCost: Math.round(dailyCost * 100) / 100,
    monthlyCost: Math.round(monthlyCost * 100) / 100,
    yearlyCost: Math.round(yearlyCost * 100) / 100,
    applianceBreakdown: breakdown,
    mostExpensive,
    energyRating,
  };
}

export function validateElectricityInput(input: ElectricityInput): string | null {
  if (input.appliances.length === 0) return "Add at least one appliance.";
  if (input.ratePerKwh <= 0) return "Rate per kWh must be positive.";
  for (const app of input.appliances) {
    if (app.wattage < 0) return `${app.name}: wattage cannot be negative.`;
    if (app.hoursPerDay < 0 || app.hoursPerDay > 24)
      return `${app.name}: hours per day must be between 0 and 24.`;
    if (app.quantity <= 0) return `${app.name}: quantity must be positive.`;
  }
  return null;
}

export const COMMON_APPLIANCES: ApplianceEntry[] = [
  { name: "LED Light Bulb", wattage: 10, hoursPerDay: 8, quantity: 5 },
  { name: "Ceiling Fan", wattage: 75, hoursPerDay: 10, quantity: 2 },
  { name: "Refrigerator", wattage: 150, hoursPerDay: 24, quantity: 1 },
  { name: "Television", wattage: 100, hoursPerDay: 5, quantity: 1 },
  { name: "Air Conditioner", wattage: 1500, hoursPerDay: 8, quantity: 1 },
  { name: "Washing Machine", wattage: 500, hoursPerDay: 1, quantity: 1 },
  { name: "Laptop", wattage: 65, hoursPerDay: 8, quantity: 1 },
  { name: "Wi-Fi Router", wattage: 15, hoursPerDay: 24, quantity: 1 },
];
