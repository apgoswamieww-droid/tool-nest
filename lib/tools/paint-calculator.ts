/**
 * Paint Cost Calculator.
 * Estimates paint required, coats, coverage, and total cost.
 */

export interface PaintInput {
  roomWidth: number; // feet
  roomLength: number; // feet
  roomHeight: number; // feet
  doors: number;
  windows: number;
  doorWidth: number; // feet, default 3
  doorHeight: number; // feet, default 7
  windowWidth: number; // feet, default 3
  windowHeight: number; // feet, default 4
  coats: number; // 1 or 2
  coveragePerGallon: number; // sq ft per gallon, default 350
  pricePerGallon: number;
  ceilingPaint: boolean;
}

export interface PaintResult {
  totalArea: number; // sq ft
  doorArea: number;
  windowArea: number;
  paintableArea: number;
  gallonsNeeded: number;
  gallonsWithCoats: number;
  totalCost: number;
  costPerSqFt: number;
  ceilingArea: number;
  ceilingGallons: number;
  ceilingCost: number;
  totalProjectCost: number;
}

const DOOR_DEFAULT_WIDTH = 3;
const DOOR_DEFAULT_HEIGHT = 7;
const WINDOW_DEFAULT_WIDTH = 3;
const WINDOW_DEFAULT_HEIGHT = 4;

export function calculatePaint(input: PaintInput): PaintResult {
  const {
    roomWidth,
    roomLength,
    roomHeight,
    doors,
    windows,
    doorWidth = DOOR_DEFAULT_WIDTH,
    doorHeight = DOOR_DEFAULT_HEIGHT,
    windowWidth = WINDOW_DEFAULT_WIDTH,
    windowHeight = WINDOW_DEFAULT_HEIGHT,
    coats,
    coveragePerGallon,
    pricePerGallon,
    ceilingPaint,
  } = input;

  // Wall area (perimeter × height)
  const perimeter = 2 * (roomWidth + roomLength);
  const totalArea = perimeter * roomHeight;

  // Deductions
  const doorArea = doors * doorWidth * doorHeight;
  const windowArea = windows * windowWidth * windowHeight;
  const deductions = doorArea + windowArea;

  // Paintable wall area
  const paintableArea = Math.max(0, totalArea - deductions);

  // Gallons needed (walls)
  const gallonsNeeded = paintableArea / coveragePerGallon;
  const gallonsWithCoats = Math.ceil(gallonsNeeded * coats);

  // Ceiling
  const ceilingArea = ceilingPaint ? roomWidth * roomLength : 0;
  const ceilingGallons = ceilingPaint
    ? Math.ceil((ceilingArea / coveragePerGallon) * coats)
    : 0;

  // Cost
  const totalCost = gallonsWithCoats * pricePerGallon;
  const ceilingCost = ceilingGallons * pricePerGallon;
  const totalProjectCost = totalCost + ceilingCost;
  const costPerSqFt = paintableArea > 0 ? totalCost / paintableArea : 0;

  return {
    totalArea: Math.round(totalArea),
    doorArea: Math.round(doorArea),
    windowArea: Math.round(windowArea),
    paintableArea: Math.round(paintableArea),
    gallonsNeeded: Math.round(gallonsNeeded * 100) / 100,
    gallonsWithCoats,
    totalCost: Math.round(totalCost * 100) / 100,
    costPerSqFt: Math.round(costPerSqFt * 100) / 100,
    ceilingArea: Math.round(ceilingArea),
    ceilingGallons,
    ceilingCost: Math.round(ceilingCost * 100) / 100,
    totalProjectCost: Math.round(totalProjectCost * 100) / 100,
  };
}

export function validatePaintInput(input: PaintInput): string | null {
  if (input.roomWidth <= 0 || input.roomLength <= 0 || input.roomHeight <= 0)
    return "Room dimensions must be positive.";
  if (input.coats < 1 || input.coats > 4)
    return "Number of coats must be between 1 and 4.";
  if (input.coveragePerGallon <= 0) return "Coverage per gallon must be positive.";
  if (input.pricePerGallon < 0) return "Price per gallon cannot be negative.";
  return null;
}
