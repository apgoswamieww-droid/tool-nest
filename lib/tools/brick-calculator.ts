/**
 * Brick Calculator.
 * Calculates bricks needed for walls, with mortar and wastage.
 */

export interface BrickInput {
  wallLength: number; // feet
  wallHeight: number; // feet
  wallThickness: number; // inches (4.5, 9, etc.)
  brickLength: number; // inches (default 9)
  brickWidth: number; // inches (default 4.5)
  brickHeight: number; // inches (default 3)
  mortarThickness: number; // inches (default 0.5)
  wastagePercent: number; // default 5
}

export interface BrickResult {
  bricksNeeded: number;
  bricksWithWastage: number;
  mortarCubicFeet: number;
  mortarCubicMeters: number;
  wallVolumeCubicFeet: number;
  wallVolumeCubicMeters: number;
  totalBrickVolume: number;
  mortarVolume: number;
  coursesHigh: number;
  bricksPerCourse: number;
}

const FEET_TO_INCHES = 12;

export function calculateBricks(input: BrickInput): BrickResult {
  const {
    wallLength,
    wallHeight,
    wallThickness,
    brickLength,
    brickWidth,
    brickHeight,
    mortarThickness,
    wastagePercent,
  } = input;

  // Wall dimensions in inches
  const wallLengthIn = wallLength * FEET_TO_INCHES;
  const wallHeightIn = wallHeight * FEET_TO_INCHES;
  const wallThicknessIn = wallThickness;

  // Brick + mortar dimensions
  const brickWithMortarL = brickLength + mortarThickness;
  const brickWithMortarH = brickHeight + mortarThickness;
  const brickWithMortarW = brickWidth + mortarThickness;

  // Number of bricks
  const bricksLength = Math.ceil(wallLengthIn / brickWithMortarL);
  const bricksHeight = Math.ceil(wallHeightIn / brickWithMortarH);
  const bricksThickness = Math.ceil(wallThicknessIn / brickWithMortarW);

  const bricksNeeded = bricksLength * bricksHeight * bricksThickness;
  const bricksWithWastage = Math.ceil(bricksNeeded * (1 + wastagePercent / 100));

  // Wall volume in cubic inches
  const wallVolumeIn3 = wallLengthIn * wallHeightIn * wallThicknessIn;
  const wallVolumeCubicFeet = wallVolumeIn3 / (FEET_TO_INCHES * FEET_TO_INCHES * FEET_TO_INCHES);
  const wallVolumeCubicMeters = wallVolumeCubicFeet * 0.0283168;

  // Total brick volume
  const singleBrickVolume = brickLength * brickWidth * brickHeight;
  const totalBrickVolume = (bricksNeeded * singleBrickVolume) / (FEET_TO_INCHES * FEET_TO_INCHES * FEET_TO_INCHES);

  // Mortar volume
  const mortarVolume = wallVolumeCubicFeet - totalBrickVolume;
  const mortarCubicFeet = Math.max(0, mortarVolume);
  const mortarCubicMeters = mortarCubicFeet * 0.0283168;

  return {
    bricksNeeded,
    bricksWithWastage,
    mortarCubicFeet: Math.round(mortarCubicFeet * 100) / 100,
    mortarCubicMeters: Math.round(mortarCubicMeters * 1000) / 1000,
    wallVolumeCubicFeet: Math.round(wallVolumeCubicFeet * 100) / 100,
    wallVolumeCubicMeters: Math.round(wallVolumeCubicMeters * 1000) / 1000,
    totalBrickVolume: Math.round(totalBrickVolume * 100) / 100,
    mortarVolume: Math.round(mortarCubicFeet * 100) / 100,
    coursesHigh: bricksHeight,
    bricksPerCourse: bricksLength * bricksThickness,
  };
}

export function validateBrickInput(input: BrickInput): string | null {
  if (input.wallLength <= 0) return "Wall length must be positive.";
  if (input.wallHeight <= 0) return "Wall height must be positive.";
  if (input.wallThickness <= 0) return "Wall thickness must be positive.";
  if (input.brickLength <= 0 || input.brickWidth <= 0 || input.brickHeight <= 0)
    return "Brick dimensions must be positive.";
  if (input.mortarThickness < 0) return "Mortar thickness cannot be negative.";
  if (input.wastagePercent < 0 || input.wastagePercent > 50)
    return "Wastage should be between 0% and 50%.";
  return null;
}

export const COMMON_BRICK_SIZES = {
  standard: { brickLength: 9, brickWidth: 4.5, brickHeight: 3, label: 'Standard (9" × 4.5" × 3")' },
  modular: { brickLength: 7.5, brickWidth: 3.5, brickHeight: 2.25, label: 'Modular (7.5" × 3.5" × 2.25")' },
  queen: { brickLength: 9.5, brickWidth: 3, brickHeight: 2.75, label: 'Queen (9.5" × 3" × 2.75")' },
};

export const COMMON_WALL_THICKNESSES = [
  { label: 'Half Brick (4.5")', value: 4.5 },
  { label: 'One Brick (9")', value: 9 },
  { label: 'One & Half Brick (13.5")', value: 13.5 },
  { label: 'Two Brick (18")', value: 18 },
];
