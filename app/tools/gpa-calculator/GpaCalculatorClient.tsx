"use client";

import * as React from "react";
import { getTool } from "@/lib/registry";
import { GraduationCap, Plus, Trash2 } from "lucide-react";
import {
  calculateGpa,
  validateGpaInput,
  LETTER_GRADES,
  type CourseGrade,
  type GpaScale,
} from "@/lib/tools/gpa-calculator";
import { ToolPageLayout } from "@/components/tool/ToolPageLayout";
import { ToolInputPanel } from "@/components/tool/ToolInputPanel";
import { ToolResultPanel } from "@/components/tool/ToolResultPanel";
import { ResetButton } from "@/components/tool/ResetButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

function newCourse(): CourseGrade {
  return { id: crypto.randomUUID(), course: "", grade: 4, credits: 3 };
}

const INITIAL_COURSES: CourseGrade[] = [
  { id: "c1", course: "Mathematics", grade: 4, credits: 4 },
  { id: "c2", course: "Physics", grade: 3, credits: 3 },
  { id: "c3", course: "Literature", grade: 3.7, credits: 2 },
];

export default function GpaCalculatorClient() {
  const tool = getTool("gpa-calculator")!;
  const [scale, setScale] = React.useState<GpaScale>("4.0");
  const [courses, setCourses] = React.useState<CourseGrade[]>(INITIAL_COURSES);

  const error = validateGpaInput(courses, scale);
  const result = error ? null : calculateGpa(courses, scale);

  const update = (id: string, field: "course" | "grade" | "credits", value: string) =>
    setCourses((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              [field]:
                field === "course" ? value : parseFloat(value) || 0,
            }
          : c
      )
    );

  const isLetterScale = scale === "4.0";
  const gradeMax = scale === "4.0" ? 4 : scale === "10" ? 10 : 100;
  const gradeStep = scale === "percentage" ? 1 : 0.1;

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <ToolInputPanel
          title="Courses & Grades"
          icon={<GraduationCap className="h-5 w-5" />}
          className="lg:col-span-3"
        >
          <div className="space-y-4">
            <div>
              <Label>Grading Scale</Label>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {(
                  [
                    { key: "4.0" as GpaScale, label: "4.0 scale" },
                    { key: "10" as GpaScale, label: "10-point CGPA" },
                    { key: "percentage" as GpaScale, label: "Percentage" },
                  ]
                ).map((s) => (
                  <Button
                    key={s.key}
                    variant={scale === s.key ? "default" : "outline"}
                    size="sm"
                    className="text-xs"
                    onClick={() => setScale(s.key)}
                  >
                    {s.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="hidden sm:grid grid-cols-12 gap-2 text-xs text-muted-foreground px-1">
                <span className="col-span-5">Course</span>
                <span className="col-span-4">Grade {isLetterScale ? "(letter)" : `(0–${gradeMax})`}</span>
                <span className="col-span-2">Credits</span>
                <span className="col-span-1" />
              </div>

              {courses.map((c) => (
                <div key={c.id} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-12 sm:col-span-5">
                    <Input
                      aria-label="Course name"
                      placeholder="Course name"
                      value={c.course}
                      onChange={(e) => update(c.id, "course", e.target.value)}
                    />
                  </div>
                  <div className="col-span-6 sm:col-span-4">
                    {isLetterScale ? (
                      <select
                        aria-label="Letter grade"
                        value={String(c.grade)}
                        onChange={(e) => update(c.id, "grade", e.target.value)}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        {LETTER_GRADES.map((g) => (
                          <option key={g.letter} value={g.points}>
                            {g.letter} ({g.points})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <Input
                        aria-label="Grade"
                        type="number"
                        min={0}
                        max={gradeMax}
                        step={gradeStep}
                        value={c.grade}
                        onChange={(e) => update(c.id, "grade", e.target.value)}
                      />
                    )}
                  </div>
                  <div className="col-span-4 sm:col-span-2">
                    <Input
                      aria-label="Credit hours"
                      type="number"
                      min={0.5}
                      step={0.5}
                      value={c.credits}
                      onChange={(e) => update(c.id, "credits", e.target.value)}
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1 flex justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Remove ${c.course || "course"}`}
                      disabled={courses.length <= 1}
                      onClick={() => setCourses((prev) => prev.filter((x) => x.id !== c.id))}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCourses((prev) => [...prev, newCourse()])}
                disabled={courses.length >= 50}
              >
                <Plus className="h-4 w-4 mr-1" /> Add course
              </Button>
              <ResetButton onClick={() => setCourses(INITIAL_COURSES)} />
            </div>

            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
        </ToolInputPanel>

        <ToolResultPanel
          title="Your GPA"
          icon={<GraduationCap className="h-5 w-5" />}
          isEmpty={!result}
          empty="Add courses with grades and credits."
          className="lg:col-span-2"
        >
          {result && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-6xl font-bold text-primary">{result.gpa}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {scale === "percentage"
                    ? "weighted percentage"
                    : `on a ${scale}-point scale`}{" "}
                  · {result.totalCredits} credits
                </p>
              </div>

              <div className="space-y-1.5">
                {result.rows.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between text-sm rounded-md bg-muted/50 px-3 py-2"
                  >
                    <span className="truncate mr-2">
                      {r.course}
                      {r.letter && (
                        <span className="text-muted-foreground ml-1.5">({r.letter})</span>
                      )}
                    </span>
                    <span className="text-muted-foreground whitespace-nowrap">
                      {r.grade} × {r.credits} = {r.gradePoints}
                    </span>
                  </div>
                ))}
              </div>

              <p className="text-xs text-muted-foreground">
                GPA = Σ(grade × credits) ÷ Σ(credits)
              </p>
            </div>
          )}
        </ToolResultPanel>
      </div>
    </ToolPageLayout>
  );
}
