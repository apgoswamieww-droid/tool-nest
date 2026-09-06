/**
 * Area Calculator.
 * Rectangle, triangle, circle, trapezoid, and parallelogram —
 * with linear-unit conversion to all supported area units.
 */

export type AreaShape =
  | "rectangle"
  | "triangle"
  | "circle"
  | "trapezoid"
  | "parallelogram";

export type LinearUnit = "mm" | "cm" | "m" | "km" | "in" | "ft" | "yd";

/** Linear units in meters. */
export const LINEAR_UNIT_METERS: Record<LinearUnit, number> = {
  mm: 0.001,
  cm: 0.01,
  m: 1,
  km: 1000,
  in: 0.0254,
  ft: 0.3048,
  yd: 0.9144,
};

export const AREA_UNITS: { key: string; label: string }[] = [
  { key: "mm2", label: "mm²" },
  { key: "cm2", label: "cm²" },
  { key: "m2", label: "m²" },
  { key: "km2", label: "km²" },
  { key: "ha", label: "hectares" },
  { key: "in2", label: "in²" },
  { key: "ft2", label: "ft²" },
  { key: "yd2", label: "yd²" },
  { key: "ac", label: "acres" },
];

export const SHAPE_LABELS: Record<AreaShape, string> = {
  rectangle: "Rectangle (l × w)",
  triangle: "Triangle (½ × b × h)",
  circle: "Circle (π × r²)",
  trapezoid: "Trapezoid (½ × (a+b) × h)",
  parallelogram: "Parallelogram (b × h)",
};

export interface AreaInput {
  shape: AreaShape;
  /** Dimensions in the chosen linear unit. */
  unit: LinearUnit;
  length?: number;
  width?: number;
  base?: number;
  height?: number;
  radius?: number;
  sideA?: number;
  sideB?: number;
}

export interface AreaResult {
  shape: AreaShape;
  /** Area in square meters (canonical). */
  areaM2: number;
  /** Area converted to every supported unit. */
  conversions: { unit: string; label: string; value: number }[];
  formula: string;
}

export function calculateArea(input: AreaInput): AreaResult {
  const f = LINEAR_UNIT_METERS[input.unit];
  const dims = (v?: number) => (v ?? 0) * f;

  let areaM2: number;
  let formula: string;

  switch (input.shape) {
    case "rectangle": {
      const l = dims(input.length);
      const w = dims(input.width);
      areaM2 = l * w;
      formula = `A = l × w = ${fmt(input.length)} × ${fmt(input.width)} ${input.unit}`;
      break;
    }
    case "triangle": {
      const b = dims(input.base);
      const h = dims(input.height);
      areaM2 = 0.5 * b * h;
      formula = `A = ½ × b × h = ½ × ${fmt(input.base)} × ${fmt(input.height)} ${input.unit}`;
      break;
    }
    case "circle": {
      const r = dims(input.radius);
      areaM2 = Math.PI * r * r;
      formula = `A = π × r² = π × ${fmt(input.radius)}² ${input.unit}`;
      break;
    }
    case "trapezoid": {
      const a = dims(input.sideA);
      const b = dims(input.sideB);
      const h = dims(input.height);
      areaM2 = 0.5 * (a + b) * h;
      formula = `A = ½ × (a + b) × h = ½ × (${fmt(input.sideA)} + ${fmt(input.sideB)}) × ${fmt(input.height)} ${input.unit}`;
      break;
    }
    case "parallelogram": {
      const b = dims(input.base);
      const h = dims(input.height);
      areaM2 = b * h;
      formula = `A = b × h = ${fmt(input.base)} × ${fmt(input.height)} ${input.unit}`;
      break;
    }
  }

  // Convert m² to every area unit.
  const conversions = AREA_UNITS.map(({ key, label }) => ({
    unit: key,
    label,
    value: convertM2(areaM2, key),
  }));

  return { shape: input.shape, areaM2, conversions, formula };
}

export function convertM2(areaM2: number, unit: string): number {
  switch (unit) {
    case "mm2": return areaM2 * 1_000_000;
    case "cm2": return areaM2 * 10_000;
    case "m2": return areaM2;
    case "km2": return areaM2 / 1_000_000;
    case "ha": return areaM2 / 10_000;
    case "in2": return areaM2 / (0.0254 * 0.0254);
    case "ft2": return areaM2 / (0.3048 * 0.3048);
    case "yd2": return areaM2 / (0.9144 * 0.9144);
    case "ac": return areaM2 / 4046.8564224;
    default: return areaM2;
  }
}

export function validateAreaInput(input: AreaInput): string | null {
  const positive = (v: number | undefined, name: string) => {
    if (v === undefined || !Number.isFinite(v) || v <= 0) {
      return `Please enter a positive value for ${name}.`;
    }
    return null;
  };

  switch (input.shape) {
    case "rectangle": {
      return positive(input.length, "length") ?? positive(input.width, "width");
    }
    case "triangle":
    case "parallelogram": {
      return positive(input.base, "base") ?? positive(input.height, "height");
    }
    case "circle": {
      return positive(input.radius, "radius");
    }
    case "trapezoid": {
      return (
        positive(input.sideA, "side a") ??
        positive(input.sideB, "side b") ??
        positive(input.height, "height")
      );
    }
  }
}

function fmt(v: number | undefined): string {
  return String(v ?? 0);
}
