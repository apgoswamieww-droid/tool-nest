"use client";

import * as React from "react";
import { getTool } from "@/lib/registry";
import { Bot, Plus, Trash2, FileCode } from "lucide-react";
import {
  generateRobotsTxt,
  RobotsConfig,
  COMMON_DISALLOW_PATHS,
  COMMON_USER_AGENTS,
} from "@/lib/tools/robots-txt";
import { ToolPageLayout } from "@/components/tool/ToolPageLayout";
import { ToolInputPanel } from "@/components/tool/ToolInputPanel";
import { ToolResultPanel } from "@/components/tool/ToolResultPanel";
import { CopyButton } from "@/components/tool/CopyButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface RobotsTxtGeneratorClientProps {}

export default function RobotsTxtGeneratorClient(props: RobotsTxtGeneratorClientProps) {
  const tool = getTool("robots-txt-generator")!;
  const [config, setConfig] = React.useState<RobotsConfig>({
    rules: [
      { userAgent: ["*"], allow: ["/"], disallow: ["/admin/", "/private/"] },
    ],
    sitemapUrl: "",
    host: "",
  });

  const [newDisallow, setNewDisallow] = React.useState("");
  const [newAllow, setNewAllow] = React.useState("");

  const output = React.useMemo(() => generateRobotsTxt(config), [config]);

  const addDisallow = () => {
    if (!newDisallow.trim()) return;
    setConfig((prev) => ({
      ...prev,
      rules: prev.rules.map((r) => ({
        ...r,
        disallow: [...r.disallow, newDisallow.trim()],
      })),
    }));
    setNewDisallow("");
  };

  const removeDisallow = (index: number) => {
    setConfig((prev) => ({
      ...prev,
      rules: prev.rules.map((r) => ({
        ...r,
        disallow: r.disallow.filter((_, i) => i !== index),
      })),
    }));
  };

  const toggleUserAgent = (agent: string) => {
    setConfig((prev) => ({
      ...prev,
      rules: prev.rules.map((r) => ({
        ...r,
        userAgent: r.userAgent.includes(agent)
          ? r.userAgent.filter((a) => a !== agent)
          : [...r.userAgent, agent],
      })),
    }));
  };

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <ToolInputPanel
          title="Configuration"
          icon={<Bot className="h-5 w-5" />}
        >
          <div className="space-y-5">
            {/* User Agent */}
            <div>
              <Label>User Agent</Label>
              <div className="flex flex-wrap gap-2 mt-1.5">
                {COMMON_USER_AGENTS.map((agent) => (
                  <Badge
                    key={agent}
                    variant={
                      config.rules[0]?.userAgent.includes(agent)
                        ? "default"
                        : "outline"
                    }
                    className="cursor-pointer"
                    onClick={() => toggleUserAgent(agent)}
                  >
                    {agent}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Disallow Paths */}
            <div>
              <Label>Disallow Paths</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {config.rules[0]?.disallow.map((path, i) => (
                  <Badge
                    key={i}
                    variant="secondary"
                    className="gap-1 cursor-pointer"
                    onClick={() => removeDisallow(i)}
                  >
                    {path}
                    <span className="text-xs text-muted-foreground">✕</span>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <Input
                  value={newDisallow}
                  onChange={(e) => setNewDisallow(e.target.value)}
                  placeholder="/path/to/block/"
                  onKeyDown={(e) => e.key === "Enter" && addDisallow()}
                />
                <Button size="sm" onClick={addDisallow}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                <span className="text-xs text-muted-foreground">Quick add:</span>
                {COMMON_DISALLOW_PATHS.slice(0, 4).map((path) => (
                  <button
                    key={path}
                    className="text-xs text-primary hover:underline"
                    onClick={() => {
                      if (!config.rules[0]?.disallow.includes(path)) {
                        setConfig((prev) => ({
                          ...prev,
                          rules: prev.rules.map((r) => ({
                            ...r,
                            disallow: [...r.disallow, path],
                          })),
                        }));
                      }
                    }}
                  >
                    {path}
                  </button>
                ))}
              </div>
            </div>

            {/* Sitemap */}
            <div>
              <Label htmlFor="sitemap">Sitemap URL</Label>
              <Input
                id="sitemap"
                value={config.sitemapUrl || ""}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, sitemapUrl: e.target.value }))
                }
                placeholder="https://example.com/sitemap.xml"
                className="mt-1.5"
              />
            </div>

            {/* Host */}
            <div>
              <Label htmlFor="host">Host (preferred domain)</Label>
              <Input
                id="host"
                value={config.host || ""}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, host: e.target.value }))
                }
                placeholder="https://example.com"
                className="mt-1.5"
              />
            </div>
          </div>
        </ToolInputPanel>

        {/* Result Panel */}
        <ToolResultPanel
          title="Generated robots.txt"
          icon={<FileCode className="h-5 w-5" />}
          isEmpty={!output.trim()}
          empty="Configure your settings to generate a robots.txt file."
        >
          <div className="space-y-3">
            <pre className="max-h-96 overflow-auto rounded-md bg-muted/50 p-4 text-sm font-mono whitespace-pre-wrap">
              {output}
            </pre>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {output.split("\n").length} lines
              </span>
              <CopyButton text={output} label="Copy robots.txt" />
            </div>
          </div>
        </ToolResultPanel>
      </div>
    </ToolPageLayout>
  );
}
