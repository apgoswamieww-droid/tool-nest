import { Zap, Shield, Wrench, ArrowRight, Sparkles, Command } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { SearchBar } from "@/components/tool/SearchBar";
import { ToolGrid } from "@/components/tool/ToolGrid";
import { CategoryCard } from "@/components/tool/CategoryCard";
import { PopularTools } from "@/components/tool/PopularTools";
import { RecentlyAdded } from "@/components/tool/RecentlyAdded";
import { getFeaturedTools, getAllTools } from "@/lib/registry";
import { getPopularTools, getRecentlyAddedTools, getToolCountByCategory } from "@/lib/search";
import { CATEGORY_LIST } from "@/lib/categories";
import { SITE_NAME } from "@/lib/utils";
import {
  generateWebSiteSchema,
  generateOrganizationSchema,
  generateWebApplicationSchema,
  generateBreadcrumbSchema,
} from "@/lib/seo";

export default function HomePage() {
  const featuredTools = getFeaturedTools();
  const popularTools = getPopularTools(6);
  const recentlyAdded = getRecentlyAddedTools(6);
  const totalCount = getAllTools().length;
  const categoryCounts = getToolCountByCategory();

  // JSON-LD structured data
  const webSiteSchema = generateWebSiteSchema();
  const orgSchema = generateOrganizationSchema();
  const webAppSchema = generateWebApplicationSchema();
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "https://toolnest.io" },
  ]);

  return (
    <div className="flex flex-col">
      {/* JSON-LD: WebSite */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }} />
      {/* JSON-LD: Organization */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />
      {/* JSON-LD: WebApplication */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      {/* JSON-LD: BreadcrumbList */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      {/* ═══ Hero — Search-First ═══ */}
      <section className="relative overflow-hidden border-b bg-gradient-to-b from-background via-background to-muted/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="mx-auto max-w-2xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground mb-4">
              <Sparkles className="h-3 w-3" />
              {totalCount} tools • Fast • Free • Private
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight">
              Find the right tool, instantly
            </h1>
            <p className="mt-3 text-base sm:text-lg text-muted-foreground leading-relaxed">
              Free online tools and calculators. No sign-up. No data uploaded. Everything runs in your browser.
            </p>

            {/* Search bar */}
            <div className="mt-6 mx-auto max-w-lg">
              <SearchBar placeholder="Search for a tool…" showSuggestions />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Or press <kbd className="inline-flex items-center gap-0.5 rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px]"><Command className="h-2.5 w-2.5" />K</kbd> to search anywhere
            </p>
          </div>
        </div>
      </section>

      {/* ═══ Category Quick Links ═══ */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Browse by Category</h2>
          <Link href="/categories">
            <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
              View All <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {CATEGORY_LIST.map((cat) => {
            const Icon = cat.icon;
            const count = categoryCounts.find((c) => c.slug === cat.slug)?.count || 0;
            return (
              <Link key={cat.slug} href={`/categories/${cat.slug}`} className="group">
                <div className="flex items-center gap-3 rounded-lg border p-3 transition-all hover:shadow-md hover:border-primary/20 hover:-translate-y-0.5 bg-card">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{cat.name}</p>
                    <p className="text-xs text-muted-foreground">{count} tools</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ═══ Featured Tools Grid ═══ */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 border-t">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Featured Tools</h2>
            <p className="mt-1 text-sm text-muted-foreground">Most-used tools across all categories</p>
          </div>
          <Link href="/tools" className="hidden sm:block">
            <Button variant="outline" size="sm" className="gap-1.5">
              View All <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <ToolGrid tools={featuredTools} />
      </section>

      {/* ═══ Popular + Recently Added ═══ */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 border-t">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <PopularTools tools={popularTools} />
          <RecentlyAdded tools={recentlyAdded} />
        </div>
      </section>

      {/* ═══ Quick Access by Use Case ═══ */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 border-t">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-6 text-center">
          What do you need to do?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              title: "Work with Text",
              description: "Count words, convert case, remove emojis, repeat strings",
              href: "/categories/text-tools",
              tools: ["Word Counter", "Case Converter", "Remove Emojis"],
            },
            {
              title: "Process PDFs",
              description: "Merge, extract text, add QR codes, strip metadata",
              href: "/categories/pdf-tools",
              tools: ["PDF Merger", "CSV to PDF", "PDF Metadata Remover"],
            },
            {
              title: "Calculate Numbers",
              description: "Loans, taxes, construction, finances, student grades",
              href: "/categories/financial-calculators",
              tools: ["EMI Calculator", "FIRE Calculator", "APR Calculator"],
            },
          ].map((item) => (
            <Link key={item.title} href={item.href} className="group">
              <Card className="h-full transition-all hover:shadow-md hover:border-primary/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base group-hover:text-primary transition-colors">
                    {item.title}
                  </CardTitle>
                  <CardDescription className="text-sm">{item.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-1.5">
                    {item.tools.map((t) => (
                      <span key={t} className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        {t}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══ Why ToolNest ═══ */}
      <section className="border-t bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: Zap, title: "Lightning Fast", description: "All tools run instantly in your browser. No waiting, no loading." },
              { icon: Shield, title: "100% Private", description: "Your data never leaves your device. No tracking, no analytics." },
              { icon: Wrench, title: "Always Free", description: "Every tool is free forever. No sign-up, no limits, no catch." },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-sm">{item.title}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
