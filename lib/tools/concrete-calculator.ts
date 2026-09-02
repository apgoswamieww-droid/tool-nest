/**
 * Concrete Volume Calculator.
 * Calculates volume for slabs, footings, columns, and stairs.
 */

export interface ConcreteInput {
  shape: "slab" | "footing" | "column" | "stair";
  length: number; // feet
  width: number; // feet
  depth: number; // feet (or height for columns)
  wastagePercent: number;
  bagSize: number; // cubic feet per bag (default 0.6)
}

export interface ConcreteResult {
  volumeCubicFeet: number;
  volumeCubicYards: number;
  volumeCubicMeters: number;
  bagsNeeded: number;
  bagsWithWastage: number;
  costEstimate: number;
}

export function calculateConcrete(input: ConcreteInput): ConcreteResult {
  const { length, width, depth, wastagePercent, bagSize } = input;

  const volumeCubicFeet = length * width * depth;
  const volumeCubicYards = volumeCubicFeet / 27;
  const volumeCubicMeters = volumeCubicFeet * 0.0283168;

  const bagsNeeded = Math.ceil(volumeCubicFeet / bagSize);
  const bagsWithWastage = Math.ceil(bagsNeeded * (1 + wastagePercent / 100));

  // Average cost per bag ~$5-6
  const costEstimate = bagsWithWastage * 5.5;

  return {
    volumeCubicFeet: Math.round(volumeCubicFeet * 100) / 100,
    volumeCubicYards: Math.round(volumeCubicYards * 1000) / 1000,
    volumeCubicMeters: Math.round(volumeCubicMeters * 1000) / 1000,
    bagsNeeded,
    bagsWithWastage,
    costEstimate: Math.round(costEstimate * 100) / 100,
  };
}

export function validateConcreteInput(input: ConcreteInput): string | null {
  if (input.length <= 0 || input.width <= 0 || input.depth <= 0)
    return "All dimensions must be positive.";
  if (input.bagSize <= 0) return "Bag size must be positive.";
  return null;
}

export const CONCRETE_SHAPES = [
  { value: "slab", label: "Slab / Floor" },
  { value: "footing", label: "Footing / Foundation" },
  { value: "column", label: "Column / Pillar" },
  { value: "stair", label: "Staircase" },
];
