"use client";

import * as React from "react";
import { FileCode, AlertCircle, CheckCircle } from "lucide-react";
import { getTool } from "@/lib/registry";
import { formatYaml } from "@/lib/tools/yaml-formatter";
import { ToolPageLayout } from "@/components/tool/ToolPageLayout";
import { ToolInputPanel } from "@/components/tool/ToolInputPanel";
import { ToolResultPanel } from "@/components/tool/ToolResultPanel";
import { CopyButton } from "@/components/tool/CopyButton";
import { ResetButton } from "@/components/tool/ResetButton";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const tool = getTool("yaml-formatter")!;

const SAMPLE_YAML = `name: my-project
version: 1.0.0
description: A sample YAML file
author: ToolNest
dependencies:
  react: ^18.0.0
  next: ^14.0.0
  tailwindcss: ^3.4.0
config:
  debug: true
  port: 3000
  database:
    host: localhost
    port: 5432
    name: mydb
tags:
  - javascript
  - react
  - nextjs`;

const FAQ_ITEMS = [
  {
    question: "What is YAML?",
    answer:
      "YAML (YAML Ain't Markup Language) is a human-readable data serialization format commonly used for configuration files, data exchange between languages, and in DevOps tools like Docker and Kubernetes.",
  },
  {
    question: "What does this formatter do?",
    answer:
      "The YAML Formatter takes your YAML input and beautifies it with proper indentation, consistent spacing, and correct formatting. It also validates the syntax and shows errors if the YAML is invalid.",
  },
  {
    question: "Where is YAML commonly used?",
    answer:
      "YAML is widely used in Docker Compose files, Kubernetes manifests, GitHub Actions workflows, Ansible playbooks, Jekyll/Hugo site configurations, and many other tools.",
  },
  {
    question: "Is there a difference between YAML and JSON?",
    answer:
      "Yes. YAML is more human-readable and supports comments, while JSON is more strict and compact. YAML can be converted to JSON and vice versa. Many tools accept both formats.",
  },
];

export default function YamlFormatterPage() {
  const [input, setInput] = React.useState(SAMPLE_YAML);
  const [output, setOutput] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [lineCount, setLineCount] = React.useState(0);

  const handleFormat = React.useCallback(() => {
    const result = formatYaml(input);
    setOutput(result.output);
    setError(result.error);
    setLineCount(result.lineCount);
  }, [input]);

  // Auto-format on load
  React.useEffect(() => {
    handleFormat();
  }, []);

  const handleReset = () => {
    setInput(SAMPLE_YAML);
    setError(null);
    handleFormat();
  };

  return (
    <ToolPageLayout tool={tool} faqItems={FAQ_ITEMS}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <ToolInputPanel
          title="YAML Input"
          icon={<FileCode className="h-5 w-5" />}
        >
          <div className="space-y-4">
            <div>
              <Label htmlFor="yaml-input">Paste your YAML</Label>
              <textarea
                id="yaml-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste YAML here…"
                rows={16}
                className="mt-1.5 flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none font-mono"
                spellCheck={false}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {input.split("\n").length} lines
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button onClick={handleFormat} className="flex-1">
                <FileCode className="h-4 w-4" />
                Format YAML
              </Button>
              <ResetButton onClick={handleReset} />
            </div>
          </div>
        </ToolInputPanel>

        {/* Result Panel */}
        <ToolResultPanel
          title="Formatted Output"
          icon={
            error ? (
              <AlertCircle className="h-5 w-5 text-destructive" />
            ) : (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )
          }
          isEmpty={!output}
          empty="Formatted YAML will appear here."
        >
          <div className="space-y-3">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            {!error && (
              <div className="flex items-center gap-2">
                <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Valid YAML
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {lineCount} lines
                </span>
              </div>
            )}

            <pre className="max-h-96 overflow-auto rounded-md bg-muted/50 p-4 text-sm font-mono whitespace-pre-wrap">
              {output}
            </pre>

            <CopyButton text={output} label="Copy formatted YAML" />
          </div>
        </ToolResultPanel>
      </div>
    </ToolPageLayout>
  );
}
