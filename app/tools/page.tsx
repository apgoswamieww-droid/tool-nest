import type { Metadata } from "next";
import { getAllTools, searchTools } from "@/lib/registry";
import { ToolGrid } from "@/components/tool/ToolGrid";
import { SearchBar } from "@/components/tool/SearchBar";
import { CATEGORY_LIST } from "@/lib/categories";
import { SITE_NAME } from "@/lib/utils";
import { Filter } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: `All Tools — ${SITE_NAME}`,
  description: `Browse all free online tools and calculators available on ${SITE_NAME}.`,
};

interface ToolsPageProps {
  searchParams: Promise<{ q?: string; category?: string }>;
}

export default async function ToolsPage({ searchParams }: ToolsPageProps) {
  const params = await searchParams;
  const query = params.q || "";
  const category = params.category || "";

  const tools = query ? searchTools(query) : getAllTools();
  const filteredTools = category
    ? tools.filter((t) => t.category === category)
    : tools;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          All Tools
        </h1>
        <p className="mt-2 text-muted-foreground text-lg">
          {query
            ? `Search results for "${query}"`
            : `Browse all ${tools.length} free online tools`}
        </p>
      </div>

      {/* Search + Filters */}
      <div className="mb-8 space-y-4">
        <SearchBar
          defaultValue={query}
          placeholder="Search tools by name or keyword…"
          className="max-w-md"
        />
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Link
            href="/tools"
            className={!category ? "" : ""}
          >
            <Badge variant={!category ? "default" : "secondary"} className="cursor-pointer">
              All
            </Badge>
          </Link>
          {CATEGORY_LIST.map((cat) => (
            <Link
              key={cat.slug}
              href={`/tools?category=${cat.slug}${query ? `&q=${query}` : ""}`}
            >
              <Badge
                variant={category === cat.slug ? "default" : "secondary"}
                className="cursor-pointer"
              >
                {cat.name}
              </Badge>
            </Link>
          ))}
        </div>
      </div>

      {/* Results */}
      <ToolGrid
        tools={filteredTools}
        emptyMessage={
          query
            ? `No tools found for "${query}". Try a different search.`
            : "No tools in this category yet."
        }
      />
    </div>
  );
}
