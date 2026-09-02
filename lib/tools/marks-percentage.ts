/**
 * Marks Percentage Calculator.
 */

export interface MarksInput {
  totalMarks: number;
  obtainedMarks: number;
}

export interface MarksResult {
  percentage: number;
  grade: string;
  gradePoint: string;
  status: "pass" | "fail" | "distinction";
}

export function calculatePercentage(input: MarksInput): MarksResult {
  const { totalMarks, obtainedMarks } = input;
  const percentage = totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0;
  const rounded = Math.round(percentage * 100) / 100;

  let grade: string;
  let gradePoint: string;
  let status: MarksResult["status"];

  if (rounded >= 90) { grade = "A+"; gradePoint = "10"; status = "distinction"; }
  else if (rounded >= 80) { grade = "A"; gradePoint = "9"; status = "distinction"; }
  else if (rounded >= 70) { grade = "B+"; gradePoint = "8"; status = "pass"; }
  else if (rounded >= 60) { grade = "B"; gradePoint = "7"; status = "pass"; }
  else if (rounded >= 50) { grade = "C"; gradePoint = "6"; status = "pass"; }
  else if (rounded >= 40) { grade = "D"; gradePoint = "5"; status = "pass"; }
  else if (rounded >= 33) { grade = "E"; gradePoint = "4"; status = "pass"; }
  else { grade = "F"; gradePoint = "0"; status = "fail"; }

  return { percentage: rounded, grade, gradePoint, status };
}

export function validateMarksInput(input: MarksInput): string | null {
  if (input.totalMarks <= 0) return "Total marks must be positive.";
  if (input.obtainedMarks < 0) return "Obtained marks cannot be negative.";
  if (input.obtainedMarks > input.totalMarks) return "Obtained marks cannot exceed total marks.";
  return null;
}
