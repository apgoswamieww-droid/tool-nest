"use client";

import * as React from "react";
import { getTool } from "@/lib/registry";
import { Link2, ExternalLink, Globe, Shield } from "lucide-react";
import {
  extractUrls,
  extractUniqueUrls,
  formatUrlsAsList,
  formatUrlsAsMarkdown,
  formatUrlsAsHtml,
  formatUrlsAsJson,
  ExtractedUrl,
} from "@/lib/tools/extract-urls";
import { ToolPageLayout } from "@/components/tool/ToolPageLayout";
import { ToolInputPanel } from "@/components/tool/ToolInputPanel";
import { ToolResultPanel } from "@/components/tool/ToolResultPanel";
import { CopyButton } from "@/components/tool/CopyButton";
import { ResetButton } from "@/components/tool/ResetButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const SAMPLE_TEXT = `Check out https://www.example.com for more info.
Also visit http://blog.example.org/post?id=123&sort=date
GitHub: https://github.com/user/repo#readme
Docs: https://docs.example.com/api/v2/users?limit=10&page=1
Old link: http://legacy.example.net/page
Secure: https://shop.example.com/product/42?ref=email&utm_source=newsletter`;

interface ExtractUrlsClientProps {}

export default function ExtractUrlsClient(props: ExtractUrlsClientProps) {
  const tool = getTool("extract-urls")!;
  const [input, setInput] = React.useState(SAMPLE_TEXT);
  const [uniqueOnly, setUniqueOnly] = React.useState(false);
  const [exportFormat, setExportFormat] = React.useState<"list" | "markdown" | "html" | "json">("list");

  const result = React.useMemo(() => {
    if (!input) return { urls: [], uniqueDomains: [], totalCount: 0, httpsCount: 0, httpCount: 0 };
    return uniqueOnly ? extractUniqueUrls(input) : extractUrls(input);
  }, [input, uniqueOnly]);

  const exportedText = React.useMemo(() => {
    switch (exportFormat) {
      case "list":
        return formatUrlsAsList(result.urls);
      case "markdown":
        return formatUrlsAsMarkdown(result.urls);
      case "html":
        return formatUrlsAsHtml(result.urls);
      case "json":
        return formatUrlsAsJson(result.urls);
      default:
        return formatUrlsAsList(result.urls);
    }
  }, [result.urls, exportFormat]);

  const handleReset = () => {
    setInput(SAMPLE_TEXT);
    setUniqueOnly(false);
    setExportFormat("list");
  };

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <ToolInputPanel
          title="Input Text"
          icon={<Link2 className="h-5 w-5" />}
        >
          <div className="space-y-4">
            <div>
              <Label htmlFor="url-input">Text containing URLs</Label>
              <textarea
                id="url-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste text with URLs here…"
                rows={8}
                className="mt-1.5 flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="unique-only"
                checked={uniqueOnly}
                onChange={(e) => setUniqueOnly(e.target.checked)}
                className="h-4 w-4 rounded border-input"
              />
              <Label htmlFor="unique-only" className="text-sm font-normal cursor-pointer">
                Unique URLs only
              </Label>
            </div>

            <ResetButton onClick={handleReset} />
          </div>
        </ToolInputPanel>

        {/* Results */}
        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-primary">{result.totalCount}</p>
                <p className="text-xs text-muted-foreground">URLs Found</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-green-500">{result.httpsCount}</p>
                <p className="text-xs text-muted-foreground">HTTPS</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-orange-500">{result.httpCount}</p>
                <p className="text-xs text-muted-foreground">HTTP</p>
              </CardContent>
            </Card>
          </div>

          {/* Domain list */}
          {result.uniqueDomains.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                  Unique Domains ({result.uniqueDomains.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {result.uniqueDomains.map((domain) => (
                    <Badge key={domain} variant="secondary" className="text-xs">
                      <Globe className="h-3 w-3 mr-1" />
                      {domain}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Exported output */}
          <ToolResultPanel
            title="Extracted URLs"
            icon={<ExternalLink className="h-5 w-5" />}
            isEmpty={result.urls.length === 0}
            empty="No URLs found in the input text."
          >
            <div className="space-y-3">
              {/* Format selector */}
              <div className="flex items-center gap-2">
                <Label className="text-xs">Export as:</Label>
                {(["list", "markdown", "html", "json"] as const).map((fmt) => (
                  <Button
                    key={fmt}
                    variant={exportFormat === fmt ? "default" : "outline"}
                    size="sm"
                    onClick={() => setExportFormat(fmt)}
                    className="h-7 text-xs"
                  >
                    {fmt.charAt(0).toUpperCase() + fmt.slice(1)}
                  </Button>
                ))}
              </div>

              <pre className="max-h-60 overflow-auto rounded-md bg-muted/50 p-4 text-sm font-mono whitespace-pre-wrap">
                {exportedText || "No URLs to export."}
              </pre>

              <CopyButton text={exportedText} label="Copy URLs" />
            </div>
          </ToolResultPanel>
        </div>
      </div>
    </ToolPageLayout>
  );
}
