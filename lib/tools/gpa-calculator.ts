/**
 * GPA Calculator.
 * Weighted GPA = Σ(grade points × credits) / Σ(credits).
 * Supports the 4.0 US scale, 10-point CGPA, and percentage-based systems.
 */

export type GpaScale = "4.0" | "10" | "percentage";

/** Shared limits — client, validators, and future API must agree. */
export const MAX_COURSES = 50;
export const MAX_CREDITS_PER_COURSE = 30;

export interface CourseGrade {
  id: string;
  course: string;
  /** Grade value interpreted per scale (letter picker on 4.0, 0–10, 0–100). */
  grade: number;
  credits: number;
}

export interface GpaResult {
  gpa: number;
  totalCredits: number;
  totalGradePoints: number;
  /** Per-course result rows for the breakdown table. */
  rows: {
    id: string;
    course: string;
    grade: number;
    /** Letter grade shown for 4.0-scale rows. */
    letter: string | null;
    credits: number;
    gradePoints: number;
  }[];
}

export const GPA_SCALES: { key: GpaScale; label: string; max: number }[] = [
  { key: "4.0", label: "4.0 scale (A=4)", max: 4 },
  { key: "10", label: "10-point CGPA", max: 10 },
  { key: "percentage", label: "Percentage (0–100)", max: 100 },
];

/** US letter grades on the 4.0 scale. */
export const LETTER_GRADES: { letter: string; points: number }[] = [
  { letter: "A+", points: 4.0 },
  { letter: "A", points: 4.0 },
  { letter: "A−", points: 3.7 },
  { letter: "B+", points: 3.3 },
  { letter: "B", points: 3.0 },
  { letter: "B−", points: 2.7 },
  { letter: "C+", points: 2.3 },
  { letter: "C", points: 2.0 },
  { letter: "C−", points: 1.7 },
  { letter: "D+", points: 1.3 },
  { letter: "D", points: 1.0 },
  { letter: "F", points: 0 },
];

export function letterFromPoints(points: number): string {
  if (points >= 4) return "A+";
  if (points >= 3.85) return "A";
  if (points >= 3.5) return "A−";
  if (points >= 3.15) return "B+";
  if (points >= 2.85) return "B";
  if (points >= 2.5) return "B−";
  if (points >= 2.15) return "C+";
  if (points >= 1.85) return "C";
  if (points >= 1.5) return "C−";
  if (points >= 1.15) return "D+";
  if (points >= 0.85) return "D";
  return "F";
}

/** Validate one course row against its scale; returns an error message or null. */
export function validateCourse(
  course: CourseGrade,
  scale: GpaScale
): string | null {
  const max = GPA_SCALES.find((s) => s.key === scale)!.max;
  if (!Number.isFinite(course.grade) || course.grade < 0 || course.grade > max) {
    return `"${course.course || "Course"}": grade must be between 0 and ${max}.`;
  }
  if (!Number.isFinite(course.credits) || course.credits <= 0) {
    return `"${course.course || "Course"}": credits must be positive.`;
  }
  if (course.credits > MAX_CREDITS_PER_COURSE) {
    return `"${course.course || "Course"}": credits cannot exceed ${MAX_CREDITS_PER_COURSE}.`;
  }
  return null;
}

export function calculateGpa(courses: CourseGrade[], scale: GpaScale): GpaResult {
  const rows = courses.map((c) => {
    let gradePoints = c.grade * c.credits;
    if (scale === "percentage") {
      // Common percentage → 4.0 mapping for the weighted total is applied
      // at the GPA step; per-row grade points stay in scale terms.
      gradePoints = c.grade * c.credits;
    }
    return {
      id: c.id,
      course: c.course || "Course",
      grade: c.grade,
      letter: scale === "4.0" ? letterFromPoints(c.grade) : null,
      credits: c.credits,
      gradePoints: Math.round(gradePoints * 100) / 100,
    };
  });

  const totalCredits = courses.reduce((s, c) => s + c.credits, 0);

  let gpa: number;
  if (scale === "percentage") {
    // Weighted percentage, then mapped to the 4.0 scale for reference.
    const weightedPct = courses.reduce((s, c) => s + c.grade * c.credits, 0) / totalCredits;
    gpa = Math.round(weightedPct * 100) / 100;
  } else {
    const totalGradePoints = courses.reduce((s, c) => s + c.grade * c.credits, 0);
    gpa = totalCredits > 0 ? Math.round((totalGradePoints / totalCredits) * 100) / 100 : 0;
  }

  return {
    gpa,
    totalCredits: Math.round(totalCredits * 100) / 100,
    totalGradePoints:
      Math.round(courses.reduce((s, c) => s + c.grade * c.credits, 0) * 100) / 100,
    rows,
  };
}

export function validateGpaInput(
  courses: CourseGrade[],
  scale: GpaScale
): string | null {
  if (courses.length === 0) return "Add at least one course.";
  if (courses.length > MAX_COURSES) return `Cannot exceed ${MAX_COURSES} courses.`;
  for (const c of courses) {
    const err = validateCourse(c, scale);
    if (err) return err;
  }
  return null;
}
