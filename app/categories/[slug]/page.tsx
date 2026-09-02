import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ChevronRight, HelpCircle, ExternalLink } from "lucide-react";
import { getCategory, CATEGORY_LIST, CATEGORY_REGISTRY } from "@/lib/categories";
import { getToolsByCategory } from "@/lib/registry";
import { getCategoryMetadata } from "@/lib/seo";
import { ToolGrid } from "@/components/tool/ToolGrid";
import { ToolCard } from "@/components/tool/ToolCard";
import { CategoryCard } from "@/components/tool/CategoryCard";
import { FAQSection } from "@/components/tool/FAQSection";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CategorySlug } from "@/types";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategory(slug as CategorySlug);
  if (!category) return { title: "Category Not Found" };
  return getCategoryMetadata(category);
}

export async function generateStaticParams() {
  return CATEGORY_LIST.map((cat) => ({ slug: cat.slug }));
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = getCategory(slug as CategorySlug);

  if (!category) {
    notFound();
  }

  const Icon = category.icon;
  const tools = getToolsByCategory(category.slug);
  const featuredTools = tools.filter((t) => t.featured);

  // Get related categories for internal linking
  const relatedCategories = (category.relatedCategories || [])
    .map((s) => CATEGORY_REGISTRY[s])
    .filter(Boolean);

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${category.name} — Free Online Tools`,
    description: category.description,
    url: `https://toolnest.io/categories/${category.slug}`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: tools.map((tool, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: tool.name,
        url: `https://toolnest.io/tools/${tool.slug}`,
        description: tool.description,
      })),
    },
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6 flex-wrap" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <ChevronRight className="h-3.5 w-3.5 shrink-0" />
        <Link href="/categories" className="hover:text-foreground transition-colors">Categories</Link>
        <ChevronRight className="h-3.5 w-3.5 shrink-0" />
        <span className="text-foreground font-medium">{category.name}</span>
      </nav>

      {/* Category Header */}
      <div className="flex items-start gap-4 mb-6">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            {category.name}
          </h1>
          <p className="mt-1 text-muted-foreground text-lg">
            {category.description}
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <Badge variant="secondary">{tools.length} tool{tools.length !== 1 ? "s" : ""}</Badge>
            {category.keywords.slice(0, 4).map((kw) => (
              <Badge key={kw} variant="outline" className="text-xs">{kw}</Badge>
            ))}
          </div>
        </div>
      </div>

      {/* SEO Intro Content */}
      <div className="prose prose-neutral dark:prose-invert max-w-none mb-12">
        <p className="text-muted-foreground leading-relaxed text-base">
          {category.intro}
        </p>
      </div>

      {/* Featured Tools (if any) */}
      {featuredTools.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold tracking-tight mb-6">
            Popular {category.name}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredTools.map((tool) => (
              <ToolCard key={tool.slug} tool={tool} showCategory={false} />
            ))}
          </div>
        </section>
      )}

      {/* All Tools */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-6">
          All {category.name}
        </h2>
        <ToolGrid
          tools={tools}
          showCategory={false}
          emptyMessage={`No tools in ${category.name} yet. Check back soon!`}
        />
      </section>

      {/* How-To / Educational Content */}
      <section className="mb-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              How to Use {category.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground leading-relaxed space-y-3">
            <p>
              All {category.name.toLowerCase()} on ToolNest are free, fast, and private.
              Simply select a tool from the grid above, enter your data, and get instant results.
              No sign-up, no data uploads, no waiting.
            </p>
            <p>
              Every tool processes data entirely in your browser using JavaScript.
              Your inputs never leave your device, making ToolNest the safest choice
              for sensitive calculations.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              {tools.slice(0, 6).map((tool) => (
                <Link
                  key={tool.slug}
                  href={`/tools/${tool.slug}`}
                  className="inline-flex items-center gap-1 text-primary hover:underline text-sm"
                >
                  {tool.name}
                  <ExternalLink className="h-3 w-3" />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Related Categories (Internal Links) */}
      {relatedCategories.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold tracking-tight mb-6">
            Related Categories
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {relatedCategories.map((relCat) => {
              const relTools = getToolsByCategory(relCat.slug);
              return (
                <CategoryCard
                  key={relCat.slug}
                  category={relCat}
                  toolCount={relTools.length}
                />
              );
            })}
          </div>
        </section>
      )}

      {/* FAQ */}
      {category.faq && category.faq.length > 0 && (
        <div className="mb-12">
          <FAQSection items={category.faq} />
        </div>
      )}

      {/* All Categories (Footer Navigation) */}
      <Separator className="my-12" />
      <section>
        <h2 className="text-2xl font-bold tracking-tight mb-6">
          All Tool Categories
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {CATEGORY_LIST.filter((c) => c.slug !== category.slug).map((cat) => {
            const CatIcon = cat.icon;
            const catTools = getToolsByCategory(cat.slug);
            return (
              <Link
                key={cat.slug}
                href={`/categories/${cat.slug}`}
                className="flex items-center gap-2 p-3 rounded-lg border bg-card hover:shadow-md hover:border-primary/20 transition-all"
              >
                <CatIcon className="h-4 w-4 text-primary shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{cat.name}</p>
                  <p className="text-xs text-muted-foreground">{catTools.length} tools</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
