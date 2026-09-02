export interface AttendanceInput {
  totalClasses: number;
  classesAttended: number;
  targetPercentage?: number;
}

export interface AttendanceResult {
  currentPercentage: number;
  classesMissed: number;
  isEligible: boolean;
  minimumRequired: number;
  classesNeededForTarget: number;
  maxBunkable: number;
}

export function calculateAttendance(input: AttendanceInput): AttendanceResult {
  const { totalClasses, classesAttended, targetPercentage = 75 } = input;

  const classesMissed = totalClasses - classesAttended;
  const currentPercentage = totalClasses > 0
    ? (classesAttended / totalClasses) * 100
    : 0;

  // Minimum classes needed to reach target
  // If attended/total >= target/100, then attended*100 >= target*total
  // So total <= attended*100/target
  const minimumRequired = targetPercentage > 0
    ? Math.ceil((classesAttended * 100) / targetPercentage)
    : 0;

  const classesNeededForTarget = Math.max(0, minimumRequired - totalClasses);

  // Max classes you can still miss and maintain target
  const maxBunkable = Math.max(
    0,
    Math.floor(classesAttended * (100 / targetPercentage - 1)) - classesMissed
  );

  return {
    currentPercentage: Math.round(currentPercentage * 100) / 100,
    classesMissed,
    isEligible: currentPercentage >= targetPercentage,
    minimumRequired,
    classesNeededForTarget,
    maxBunkable,
  };
}

export function validateAttendanceInput(
  totalClasses: number,
  classesAttended: number
): string | null {
  if (totalClasses < 0) return "Total classes cannot be negative.";
  if (classesAttended < 0) return "Classes attended cannot be negative.";
  if (classesAttended > totalClasses)
    return "Classes attended cannot exceed total classes.";
  if (totalClasses === 0) return "Total classes must be greater than 0.";
  return null;
}
