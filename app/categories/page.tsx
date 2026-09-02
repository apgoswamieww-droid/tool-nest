import type { Metadata } from "next";
import { CATEGORY_LIST } from "@/lib/categories";
import { CATEGORY_REGISTRY } from "@/lib/categories";
import { getToolsByCategory } from "@/lib/registry";
import { CategoryCard } from "@/components/tool/CategoryCard";
import { SITE_NAME } from "@/lib/utils";

export const metadata: Metadata = {
  title: `All Categories — ${SITE_NAME}`,
  description: `Browse all tool categories on ${SITE_NAME}. Find the right tools for any task.`,
};

export default function CategoriesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          Tool Categories
        </h1>
        <p className="mt-2 text-muted-foreground text-lg">
          Browse our collection of {CATEGORY_LIST.length} categories
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {CATEGORY_LIST.map((category) => {
          const count = getToolsByCategory(category.slug).length;
          return (
            <CategoryCard
              key={category.slug}
              category={category}
              toolCount={count}
            />
          );
        })}
      </div>
    </div>
  );
}
