"use client";

import Link from "next/link";
import { ChevronRight, ExternalLink } from "lucide-react";
import { Tool } from "@/types";
import { Category } from "@/types";
import { Badge } from "@/components/ui/badge";

interface ToolHeaderProps {
  tool: Tool;
  category?: Category;
}

export function ToolHeader({ tool, category }: ToolHeaderProps) {
  const Icon = tool.icon;

  return (
    <div>
      {/* Breadcrumbs */}
      <nav
        className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6 flex-wrap"
        aria-label="Breadcrumb"
      >
        <Link href="/" className="hover:text-foreground transition-colors">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5 shrink-0" />
        <Link href="/tools" className="hover:text-foreground transition-colors">
          Tools
        </Link>
        {category && (
          <>
            <ChevronRight className="h-3.5 w-3.5 shrink-0" />
            <Link
              href={`/categories/${category.slug}`}
              className="hover:text-foreground transition-colors"
            >
              {category.name}
            </Link>
          </>
        )}
        <ChevronRight className="h-3.5 w-3.5 shrink-0" />
        <span className="text-foreground font-medium">{tool.name}</span>
      </nav>

      {/* Title area */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-7 w-7" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            {tool.name}
          </h1>
          <p className="mt-2 text-muted-foreground text-base sm:text-lg">
            {tool.longDescription || tool.description}
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-3">
            {category && (
              <Link href={`/categories/${category.slug}`}>
                <Badge variant="secondary" className="text-xs cursor-pointer">
                  {category.name}
                </Badge>
              </Link>
            )}
            {tool.tags.slice(0, 4).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
