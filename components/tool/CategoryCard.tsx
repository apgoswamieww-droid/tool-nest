import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Category } from "@/types";

interface CategoryCardProps {
  category: Category;
  toolCount?: number;
}

export function CategoryCard({ category, toolCount }: CategoryCardProps) {
  const Icon = category.icon;

  return (
    <Link href={`/categories/${category.slug}`} className="group block">
      <Card className="h-full transition-all hover:shadow-md hover:border-primary/20 hover:-translate-y-0.5">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-lg">{category.name}</CardTitle>
                {toolCount !== undefined && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {toolCount} tool{toolCount !== 1 ? "s" : ""}
                  </p>
                )}
              </div>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 mt-1 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
          </div>
        </CardHeader>
        <div className="px-6 pb-4">
          <CardDescription className="text-sm leading-relaxed">
            {category.description}
          </CardDescription>
        </div>
      </Card>
    </Link>
  );
}
