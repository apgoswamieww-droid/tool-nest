import { Tool } from "@/types";
import { ToolCard } from "./ToolCard";

interface ToolGridProps {
  tools: Tool[];
  showCategory?: boolean;
  emptyMessage?: string;
}

export function ToolGrid({
  tools,
  showCategory = true,
  emptyMessage = "No tools found.",
}: ToolGridProps) {
  if (tools.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-lg text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {tools.map((tool) => (
        <ToolCard key={tool.slug} tool={tool} showCategory={showCategory} />
      ))}
    </div>
  );
}
