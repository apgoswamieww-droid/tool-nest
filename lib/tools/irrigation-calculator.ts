/**
 * Irrigation Calculator.
 * Estimates crop water requirement via the FAO-56 single crop
 * coefficient approach:
 *
 *   ETc = Kc × ET0   (crop evapotranspiration = coefficient × reference)
 *
 * ET0 defaults per season/climate; the user picks crop + growth stage.
 * Output: daily and weekly water need, in liters and cubic meters,
 * plus a crude application-time hint for a given flow rate.
 */

export type CropType =
  | "vegetables"
  | "leafy-greens"
  | "roots-tubers"
  | "cereals"
  | "legumes"
  | "fruit-trees"
  | "grapes"
  | "berries";

export type GrowthStage = "initial" | "development" | "mid-season" | "late";

/** FAO-56 typical single Kc values (field crops, standard conditions). */
export const CROP_COEFFICIENTS: Record<
  CropType,
  Record<GrowthStage, number>
> = {
  vegetables: { initial: 0.7, development: 0.85, "mid-season": 1.05, late: 0.9 },
  "leafy-greens": { initial: 0.7, development: 0.9, "mid-season": 1.0, late: 0.95 },
  "roots-tubers": { initial: 0.5, development: 0.8, "mid-season": 1.1, late: 0.85 },
  cereals: { initial: 0.3, development: 0.75, "mid-season": 1.15, late: 0.55 },
  legumes: { initial: 0.4, development: 0.85, "mid-season": 1.1, late: 0.6 },
  "fruit-trees": { initial: 0.55, development: 0.8, "mid-season": 1.1, late: 0.85 },
  grapes: { initial: 0.3, development: 0.65, "mid-season": 1.1, late: 0.75 },
  berries: { initial: 0.5, development: 0.85, "mid-season": 1.05, late: 0.9 },
};

export const CROP_LABELS: { key: CropType; label: string }[] = [
  { key: "vegetables", label: "Vegetables (tomato, onion…)" },
  { key: "leafy-greens", label: "Leafy greens (lettuce, spinach…)" },
  { key: "roots-tubers", label: "Roots & tubers (potato, carrot…)" },
  { key: "cereals", label: "Cereals (wheat, rice, maize…)" },
  { key: "legumes", label: "Legumes (beans, peas…)" },
  { key: "fruit-trees", label: "Fruit trees (mango, apple…)" },
  { key: "grapes", label: "Grapes" },
  { key: "berries", label: "Berries" },
];

export const STAGE_LABELS: { key: GrowthStage; label: string }[] = [
  { key: "initial", label: "Initial (establishment)" },
  { key: "development", label: "Development (growing)" },
  { key: "mid-season", label: "Mid-season (peak)" },
  { key: "late", label: "Late (ripening)" },
];

/** Shared limits — client, validators, and future API must agree. */
export const MAX_AREA_M2 = 10_000_000;
export const MAX_ET0 = 15;

export interface IrrigationInput {
  crop: CropType;
  stage: GrowthStage;
  fieldArea: number;
  areaUnit: "m2" | "hectare" | "acre";
  /** Reference evapotranspiration, mm/day (local climate). */
  et0MmPerDay: number;
  /** Irrigation efficiency 0–1 (drip ~0.9, sprinkler ~0.75, flood ~0.5). Optional. */
  efficiency?: number;
  /** Pump/system flow rate, liters per hour — enables the runtime hint. Optional. */
  flowLitersPerHour?: number;
}

export interface IrrigationResult {
  /** Crop evapotranspiration, mm/day (== liters/m²/day). */
  etcMmPerDay: number;
  kc: number;
  /** Gross water need (includes efficiency losses). */
  litersPerDay: number;
  litersPerWeek: number;
  cubicMetersPerDay: number;
  cubicMetersPerWeek: number;
  /** Equivalent depth, mm/week. */
  mmPerWeek: number;
  /** Hours to apply one day's water at the given flow (when provided). */
  hoursPerDayAtFlow?: number;
}

const LITERS_PER_MM_PER_M2 = 1; // 1 mm over 1 m² = 1 liter

export function calculateIrrigation(input: IrrigationInput): IrrigationResult {
  const areaM2 = input.fieldArea * AREA_FACTOR[input.areaUnit];
  const kc = CROP_COEFFICIENTS[input.crop][input.stage];
  const efficiency =
    input.efficiency === undefined ? 0.85 : Math.min(1, Math.max(0.1, input.efficiency));

  const etcMmPerDay = kc * input.et0MmPerDay;
  // Net depth over the whole field, liters/day
  const netLitersPerDay = etcMmPerDay * areaM2 * LITERS_PER_MM_PER_M2;
  const grossLitersPerDay = netLitersPerDay / efficiency;

  const result: IrrigationResult = {
    etcMmPerDay: round2(etcMmPerDay),
    kc,
    litersPerDay: Math.round(grossLitersPerDay),
    litersPerWeek: Math.round(grossLitersPerDay * 7),
    cubicMetersPerDay: round2(grossLitersPerDay / 1000),
    cubicMetersPerWeek: round2((grossLitersPerDay * 7) / 1000),
    mmPerWeek: round2(etcMmPerDay * 7),
  };

  if (input.flowLitersPerHour && input.flowLitersPerHour > 0) {
    result.hoursPerDayAtFlow = round2(grossLitersPerDay / input.flowLitersPerHour);
  }

  return result;
}

// Reuse area factors locally (kept in sync with crop-yield-calculator).
const AREA_FACTOR: Record<"m2" | "hectare" | "acre", number> = {
  m2: 1,
  hectare: 10_000,
  acre: 4046.8564224,
};

export function validateIrrigationInput(input: IrrigationInput): string | null {
  if (!Number.isFinite(input.fieldArea) || input.fieldArea <= 0) {
    return "Field area must be a positive number.";
  }
  const areaM2 = input.fieldArea * AREA_FACTOR[input.areaUnit];
  if (areaM2 > MAX_AREA_M2) {
    return "Field area is too large.";
  }
  if (!Number.isFinite(input.et0MmPerDay) || input.et0MmPerDay <= 0) {
    return "Reference ET0 must be a positive number.";
  }
  if (input.et0MmPerDay > MAX_ET0) {
    return `Reference ET0 cannot exceed ${MAX_ET0} mm/day.`;
  }
  const e = input.efficiency;
  if (e !== undefined && (!Number.isFinite(e) || e < 0.1 || e > 1)) {
    return "Efficiency must be between 0.1 and 1.";
  }
  const f = input.flowLitersPerHour;
  if (f !== undefined && (!Number.isFinite(f) || f < 0)) {
    return "Flow rate cannot be negative.";
  }
  return null;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
