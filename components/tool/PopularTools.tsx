import Link from "next/link";
import { ArrowRight, TrendingUp } from "lucide-react";
import { Tool } from "@/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCategory } from "@/lib/categories";

interface PopularToolsProps {
  tools: Tool[];
}

export function PopularTools({ tools }: PopularToolsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Most Popular</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {tools.map((tool) => {
          const Icon = tool.icon;
          const category = getCategory(tool.category);

          return (
            <Link key={tool.slug} href={`/tools/${tool.slug}`} className="group">
              <Card className="h-full transition-all hover:shadow-md hover:border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                          {tool.name}
                        </p>
                        {tool.featured && (
                          <Badge variant="secondary" className="text-[10px] shrink-0">
                            Popular
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                        {tool.description}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
