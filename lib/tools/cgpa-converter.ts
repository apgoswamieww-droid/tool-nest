/**
 * CGPA to Percentage Converter.
 * Supports multiple university scales.
 */

export interface ConversionInput {
  cgpa: number;
  scale: "10" | "4" | "5";
}

export interface ConversionResult {
  percentage: number;
  cgpa: number;
  scale: string;
  formula: string;
  letterGrade: string;
}

export function convertCgpaToPercentage(input: ConversionInput): ConversionResult {
  const { cgpa, scale } = input;

  let percentage: number;
  let formula: string;

  switch (scale) {
    case "10":
      // Standard Indian university formula
      percentage = cgpa * 9.5;
      formula = `Percentage = CGPA × 9.5 = ${cgpa} × 9.5 = ${percentage.toFixed(2)}%`;
      break;
    case "4":
      // US 4.0 scale
      percentage = (cgpa / 4) * 100;
      formula = `Percentage = (CGPA ÷ 4) × 100 = (${cgpa} ÷ 4) × 100 = ${percentage.toFixed(2)}%`;
      break;
    case "5":
      // European ECTS-style
      percentage = (cgpa / 5) * 100;
      formula = `Percentage = (CGPA ÷ 5) × 100 = (${cgpa} ÷ 5) × 100 = ${percentage.toFixed(2)}%`;
      break;
    default:
      percentage = 0;
      formula = "";
  }

  const rounded = Math.round(percentage * 100) / 100;

  let letterGrade: string;
  if (rounded >= 90) letterGrade = "A+";
  else if (rounded >= 80) letterGrade = "A";
  else if (rounded >= 70) letterGrade = "B+";
  else if (rounded >= 60) letterGrade = "B";
  else if (rounded >= 50) letterGrade = "C";
  else if (rounded >= 40) letterGrade = "D";
  else letterGrade = "F";

  return {
    percentage: rounded,
    cgpa,
    scale: `${scale}-point`,
    formula,
    letterGrade,
  };
}

export function validateCgpaInput(input: ConversionInput): string | null {
  const maxScale = parseFloat(input.scale);
  if (input.cgpa < 0) return "CGPA cannot be negative.";
  if (input.cgpa > maxScale) return `CGPA cannot exceed ${maxScale} on a ${input.scale}-point scale.`;
  return null;
}

export function convertPercentageToCgpa(percentage: number, scale: "10" | "4" | "5"): number {
  const maxScale = parseFloat(scale);
  return Math.round((percentage / 100) * maxScale * 100) / 100;
}
