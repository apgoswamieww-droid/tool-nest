import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tool } from "@/types";
import { getCategory } from "@/lib/categories";
import { PremiumBadge } from "@/components/monetization/PremiumBadge";

interface ToolCardProps {
  tool: Tool;
  showCategory?: boolean;
}

export function ToolCard({ tool, showCategory = true }: ToolCardProps) {
  const Icon = tool.icon;
  const category = getCategory(tool.category);

  return (
    <Link href={`/tools/${tool.slug}`} className="group block">
      <Card className="h-full transition-all hover:shadow-md hover:border-primary/20 hover:-translate-y-0.5">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base">{tool.name}</CardTitle>
                  {tool.tier === "premium" && <PremiumBadge compact />}
                </div>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
          </div>
        </CardHeader>
        <div className="px-6 pb-4">
          <CardDescription className="text-sm leading-relaxed">
            {tool.description}
          </CardDescription>
        </div>
        {showCategory && category && (
          <div className="px-6 pb-4">
            <Badge variant="secondary" className="text-xs">
              {category.name}
            </Badge>
          </div>
        )}
      </Card>
    </Link>
  );
}
