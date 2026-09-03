import type { Metadata } from "next";
import { CATEGORY_LIST } from "@/lib/categories";
import { CATEGORY_REGISTRY } from "@/lib/categories";
import { getToolsByCategory } from "@/lib/registry";
import { CategoryCard } from "@/components/tool/CategoryCard";
import { SITE_NAME, SITE_URL } from "@/lib/utils";
import { generateBreadcrumbSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: `All Categories — ${SITE_NAME}`,
  description: `Browse all ${CATEGORY_LIST.length} tool categories on ${SITE_NAME}. Find the right tools for any task.`,
  alternates: {
    canonical: `${SITE_URL}/categories`,
  },
  openGraph: {
    title: `All Categories — ${SITE_NAME}`,
    description: `Browse all tool categories on ${SITE_NAME}. Find the right tools for any task.`,
    url: `${SITE_URL}/categories`,
    siteName: SITE_NAME,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `All Categories — ${SITE_NAME}`,
    description: `Browse all tool categories on ${SITE_NAME}. Find the right tools for any task.`,
  },
};

export default function CategoriesPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: SITE_URL },
    { name: "Categories", url: `${SITE_URL}/categories` },
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
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
