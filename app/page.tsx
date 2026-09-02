import { Wrench, ArrowRight, Zap, Shield, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SearchBar } from "@/components/tool/SearchBar";
import { ToolGrid } from "@/components/tool/ToolGrid";
import { CategoryCard } from "@/components/tool/CategoryCard";
import { getFeaturedTools } from "@/lib/registry";
import { CATEGORY_LIST } from "@/lib/categories";
import { SITE_NAME } from "@/lib/utils";

export default function HomePage() {
  const featuredTools = getFeaturedTools();

  return (
    <div className="flex flex-col">
      {/* ═══ Hero ═══ */}
      <section className="relative overflow-hidden border-b bg-gradient-to-b from-background via-background to-muted/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground mb-6">
              <Sparkles className="h-3 w-3" />
              Fast • Free • Private
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
              {SITE_NAME}
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-muted-foreground leading-relaxed">
              Your collection of fast, free, and privacy-focused online tools
              and calculators. No sign-up required.
            </p>
            <div className="mt-8 mx-auto max-w-md">
              <SearchBar placeholder="Search for a tool…" />
            </div>
            <div className="mt-6 flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-primary" />
                <span>Instant results</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-primary" />
                <span>No data stored</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Wrench className="h-4 w-4 text-primary" />
                <span>Always free</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Categories ═══ */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Browse by Category
          </h2>
          <p className="mt-2 text-muted-foreground">
            Find the right tool for any task
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CATEGORY_LIST.map((category) => (
            <CategoryCard key={category.slug} category={category} />
          ))}
        </div>
      </section>

      {/* ═══ Featured Tools ═══ */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 border-t">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Featured Tools
            </h2>
            <p className="mt-2 text-muted-foreground">
              Most popular tools used by thousands every day
            </p>
          </div>
          <Link href="/tools" className="hidden sm:block">
            <Button variant="outline" size="sm" className="gap-1.5">
              View All
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <ToolGrid tools={featuredTools} />
        <div className="mt-8 text-center sm:hidden">
          <Link href="/tools">
            <Button variant="outline" className="gap-1.5">
              View All Tools
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ═══ Why ToolNest ═══ */}
      <section className="border-t bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Why {SITE_NAME}?
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                icon: Zap,
                title: "Lightning Fast",
                description:
                  "All tools run instantly in your browser. No waiting, no loading.",
              },
              {
                icon: Shield,
                title: "100% Private",
                description:
                  "Your data never leaves your device. No tracking, no analytics on your inputs.",
              },
              {
                icon: Wrench,
                title: "Always Free",
                description:
                  "Every tool is completely free to use. No sign-up, no limits, no catch.",
              },
            ].map((item) => (
              <Card key={item.title} className="text-center border-0 bg-transparent shadow-none">
                <CardHeader>
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-lg mt-4">{item.title}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {item.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
