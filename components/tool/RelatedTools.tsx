"use client";

import { Tool } from "@/types";
import { ToolCard } from "./ToolCard";
import { Separator } from "@/components/ui/separator";

interface RelatedToolsProps {
  tools: Tool[];
}

export function RelatedTools({ tools }: RelatedToolsProps) {
  if (tools.length === 0) return null;

  return (
    <div>
      <Separator className="mb-8" />
      <h2 className="text-2xl font-bold tracking-tight mb-6">
        Related Tools
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool) => (
          <ToolCard key={tool.slug} tool={tool} showCategory />
        ))}
      </div>
    </div>
  );
}
