"use client";

import * as React from "react";
import { getTool } from "@/lib/registry";
import { Database, AlertCircle, CheckCircle, Info, FileCode } from "lucide-react";
import { validateSql, formatSql, SqlValidationError } from "@/lib/tools/sql-validator";
import { ToolPageLayout } from "@/components/tool/ToolPageLayout";
import { ToolInputPanel } from "@/components/tool/ToolInputPanel";
import { CopyButton } from "@/components/tool/CopyButton";
import { ResetButton } from "@/components/tool/ResetButton";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const SAMPLE = `SELECT u.name, u.email, COUNT(o.id) AS order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.created_at > '2024-01-01'
GROUP BY u.id
ORDER BY order_count DESC;`;

function ErrorIcon({ severity }: { severity: string }) {
  if (severity === "error") return <AlertCircle className="h-4 w-4 text-destructive shrink-0" />;
  if (severity === "warning") return <AlertCircle className="h-4 w-4 text-yellow-500 shrink-0" />;
  return <Info className="h-4 w-4 text-blue-500 shrink-0" />;
}

interface SqlValidatorClientProps {}

export default function SqlValidatorClient(props: SqlValidatorClientProps) {
  const tool = getTool("sql-validator")!;
  const [input, setInput] = React.useState(SAMPLE);
  const [result, setResult] = React.useState(() => validateSql(SAMPLE));

  const handleValidate = () => setResult(validateSql(input));
  const handleFormat = () => setInput(formatSql(input));

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ToolInputPanel title="SQL Input" icon={<Database className="h-5 w-5" />}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="sql-input">Enter your SQL query</Label>
              <textarea id="sql-input" value={input} onChange={(e) => setInput(e.target.value)}
                placeholder="SELECT * FROM users WHERE id = 1;"
                rows={14}
                className="mt-1.5 flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none font-mono" spellCheck={false} />
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handleValidate} className="flex-1"><Database className="h-4 w-4" /> Validate</Button>
              <Button variant="outline" onClick={handleFormat}><FileCode className="h-4 w-4" /> Format</Button>
              <ResetButton onClick={() => { setInput(SAMPLE); setResult(validateSql(SAMPLE)); }} />
            </div>
          </div>
        </ToolInputPanel>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Badge variant={result.isValid ? "default" : "destructive"} className={cn(result.isValid && "bg-green-500 hover:bg-green-600")}>
              {result.isValid ? <><CheckCircle className="h-3 w-3 mr-1" /> Valid SQL</> : <><AlertCircle className="h-3 w-3 mr-1" /> {result.errors.length} Error{result.errors.length !== 1 ? "s" : ""}</>}
            </Badge>
            {result.warnings.length > 0 && (
              <Badge variant="secondary"><AlertCircle className="h-3 w-3 mr-1" /> {result.warnings.length} Warning{result.warnings.length !== 1 ? "s" : ""}</Badge>
            )}
            {result.statements.length > 0 && (
              <Badge variant="outline">{result.statements.length} Statement{result.statements.length !== 1 ? "s" : ""}</Badge>
            )}
          </div>

          {/* Errors */}
          {result.errors.length > 0 && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 space-y-2">
              <p className="text-sm font-medium text-destructive">Errors</p>
              {result.errors.map((e, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <ErrorIcon severity={e.severity} />
                  <span><span className="font-mono text-xs text-muted-foreground">Line {e.line}, Col {e.column}</span> — {e.message} <span className="text-xs text-muted-foreground">({e.code})</span></span>
                </div>
              ))}
            </div>
          )}

          {/* Warnings */}
          {result.warnings.length > 0 && (
            <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-4 space-y-2">
              <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Warnings & Suggestions</p>
              {result.warnings.map((w, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <ErrorIcon severity={w.severity} />
                  <span><span className="font-mono text-xs text-muted-foreground">Line {w.line}</span> — {w.message} <span className="text-xs text-muted-foreground">({w.code})</span></span>
                </div>
              ))}
            </div>
          )}

          {/* Statements detected */}
          {result.statements.length > 0 && (
            <div className="rounded-lg border bg-card p-4 space-y-2">
              <p className="text-sm font-medium">Detected Statements</p>
              {result.statements.map((s, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <Badge variant="outline" className="text-xs">{s.type}</Badge>
                  <span className="text-muted-foreground">Lines {s.startLine}–{s.endLine}</span>
                </div>
              ))}
            </div>
          )}

          {/* Valid state */}
          {result.isValid && result.errors.length === 0 && (
            <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-4 text-center">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-green-600 dark:text-green-400">Your SQL is valid!</p>
              <p className="text-xs text-muted-foreground mt-1">{result.statements.length} statement(s) detected, no errors found.</p>
            </div>
          )}

          <CopyButton text={input} label="Copy SQL" />
        </div>
      </div>
    </ToolPageLayout>
  );
}
