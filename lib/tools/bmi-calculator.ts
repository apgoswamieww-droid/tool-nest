/**
 * BMI (Body Mass Index) Calculator.
 * Metric and imperial inputs, WHO category classification.
 * BMI = weight (kg) / height² (m²)
 */

/** Shared limits — client, validators, and future API must agree. */
export const MAX_WEIGHT_KG = 500;
export const MAX_HEIGHT_CM = 300;

export type BmiCategory =
  | "Underweight"
  | "Normal weight"
  | "Overweight"
  | "Obese";

export interface BmiInput {
  weightKg: number;
  heightCm: number;
}

export interface BmiResult {
  bmi: number;
  category: BmiCategory;
  /** Healthy weight range for this height (BMI 18.5–24.9), in kg. */
  healthyWeightMinKg: number;
  healthyWeightMaxKg: number;
}

/** WHO adult classification thresholds. */
export function classifyBmi(bmi: number): BmiCategory {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal weight";
  if (bmi < 30) return "Overweight";
  return "Obese";
}

export function calculateBmi(input: BmiInput): BmiResult {
  const { weightKg, heightCm } = input;
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);

  return {
    bmi: Math.round(bmi * 10) / 10,
    category: classifyBmi(bmi),
    healthyWeightMinKg: Math.round(18.5 * heightM * heightM * 10) / 10,
    healthyWeightMaxKg: Math.round(24.9 * heightM * heightM * 10) / 10,
  };
}

export function validateBmiInput(input: BmiInput): string | null {
  if (!Number.isFinite(input.weightKg) || input.weightKg <= 0) {
    return "Weight must be a positive number.";
  }
  if (input.weightKg > MAX_WEIGHT_KG) {
    return `Weight cannot exceed ${MAX_WEIGHT_KG} kg.`;
  }
  if (!Number.isFinite(input.heightCm) || input.heightCm <= 0) {
    return "Height must be a positive number.";
  }
  if (input.heightCm > MAX_HEIGHT_CM) {
    return `Height cannot exceed ${MAX_HEIGHT_CM} cm.`;
  }
  return null;
}

/** Imperial convenience helpers (lb + ft/in) → metric. */
export function lbToKg(lb: number): number {
  return lb * 0.45359237;
}

export function ftInToCm(feet: number, inches: number): number {
  return (feet * 12 + inches) * 2.54;
}
