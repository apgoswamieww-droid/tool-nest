/**
 * Crop Yield Calculator.
 * Total production = field area × plant density × yield per plant,
 * with area units (acre/hectare/m²) and output in kg/tonnes.
 */

export type AreaUnit = "acre" | "hectare" | "m2";

/** Area units in square meters. */
export const AREA_UNIT_M2: Record<AreaUnit, number> = {
  acre: 4046.8564224,
  hectare: 10_000,
  m2: 1,
};

export const AREA_UNIT_LABELS: { key: AreaUnit; label: string }[] = [
  { key: "acre", label: "acres" },
  { key: "hectare", label: "hectares" },
  { key: "m2", label: "m²" },
];

/** Shared limits — client, validators, and future API must agree. */
export const MAX_AREA = 1_000_000;
export const MAX_PLANTS_PER_UNIT = 100_000;
export const MAX_YIELD_PER_PLANT_KG = 1_000;

export interface CropYieldInput {
  area: number;
  areaUnit: AreaUnit;
  /** Expected plants per unit of the chosen area. */
  plantsPerUnit: number;
  /** Average harvestable yield per plant, in kg. */
  yieldPerPlantKg: number;
  /** Field efficiency: share of plants that actually make it (0–1). Optional. */
  survivalRate?: number;
}

export interface CropYieldResult {
  /** Total production, kg. */
  totalYieldKg: number;
  totalYieldTonnes: number;
  /** Per-unit-of-area yields for the chosen unit (kg per acre/hectare/m²). */
  yieldPerUnit: number;
  yieldPerHectare: number;
  yieldPerAcre: number;
  totalPlants: number;
  /** Effective area in m² (for the formula display). */
  areaM2: number;
}

export function calculateCropYield(input: CropYieldInput): CropYieldResult {
  const survival = input.survivalRate === undefined ? 1 : Math.min(1, Math.max(0, input.survivalRate));
  const areaM2 = input.area * AREA_UNIT_M2[input.areaUnit];
  const totalPlants = input.area * input.plantsPerUnit * survival;

  const totalYieldKg = totalPlants * input.yieldPerPlantKg;
  // Yield per chosen unit scales linearly with density (already per-unit).
  const yieldPerUnit = input.plantsPerUnit * survival * input.yieldPerPlantKg;
  // Convert the per-unit figure to per-hectare / per-acre equivalents.
  const unitsPerHectare = AREA_UNIT_M2.hectare / AREA_UNIT_M2[input.areaUnit];
  const yieldPerHectare = yieldPerUnit * unitsPerHectare;
  const unitsPerAcre = AREA_UNIT_M2.acre / AREA_UNIT_M2[input.areaUnit];
  const yieldPerAcre = yieldPerUnit * unitsPerAcre;

  return {
    totalYieldKg: round2(totalYieldKg),
    totalYieldTonnes: round2(totalYieldKg / 1000),
    yieldPerUnit: round2(yieldPerUnit),
    yieldPerHectare: round2(yieldPerHectare),
    yieldPerAcre: round2(yieldPerAcre),
    totalPlants: Math.round(totalPlants),
    areaM2: round2(areaM2),
  };
}

export function validateCropYieldInput(input: CropYieldInput): string | null {
  if (!Number.isFinite(input.area) || input.area <= 0) {
    return "Field area must be a positive number.";
  }
  if (input.area > MAX_AREA) {
    return `Field area cannot exceed ${MAX_AREA.toLocaleString()}.`;
  }
  if (!Number.isFinite(input.plantsPerUnit) || input.plantsPerUnit <= 0) {
    return "Plants per unit area must be a positive number.";
  }
  if (input.plantsPerUnit > MAX_PLANTS_PER_UNIT) {
    return `Plants per unit area cannot exceed ${MAX_PLANTS_PER_UNIT.toLocaleString()}.`;
  }
  if (!Number.isFinite(input.yieldPerPlantKg) || input.yieldPerPlantKg <= 0) {
    return "Yield per plant must be a positive number.";
  }
  if (input.yieldPerPlantKg > MAX_YIELD_PER_PLANT_KG) {
    return `Yield per plant cannot exceed ${MAX_YIELD_PER_PLANT_KG} kg.`;
  }
  const s = input.survivalRate;
  if (s !== undefined && (!Number.isFinite(s) || s < 0 || s > 1)) {
    return "Survival rate must be between 0 and 1.";
  }
  return null;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
