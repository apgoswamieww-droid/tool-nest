import type { Metadata } from "next";
import { Wrench, Shield, Zap, Heart } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getStaticPageMetadata, generateStaticBreadcrumbs } from "@/lib/seo";
import { SITE_NAME } from "@/lib/utils";

export const metadata: Metadata = getStaticPageMetadata(
  "About",
  `Learn about ${SITE_NAME} — a free, privacy-focused collection of online tools and calculators.`,
  "/about"
);

export default function AboutPage() {
  const breadcrumbSchema = generateStaticBreadcrumbs("About", "/about");

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
        About {SITE_NAME}
      </h1>
      <p className="text-lg text-muted-foreground leading-relaxed mb-8">
        {SITE_NAME} is a collection of fast, free, and privacy-focused online tools
        and calculators. Built for everyone — developers, students, professionals,
        and anyone who needs a quick tool without the hassle of sign-ups or ads.
      </p>

      <div className="grid gap-6 sm:grid-cols-2 mb-12">
        {[
          {
            icon: Zap,
            title: "Fast",
            description: "Everything runs in your browser. No server round-trips for basic tools.",
          },
          {
            icon: Shield,
            title: "Private",
            description: "Your data stays on your device. We don't store, track, or sell anything.",
          },
          {
            icon: Wrench,
            title: "Free",
            description: "Every tool is completely free. No premium tiers, no hidden fees.",
          },
          {
            icon: Heart,
            title: "Open",
            description: "Built with open-source technologies. Contributions welcome.",
          },
        ].map((item) => (
          <Card key={item.title} className="border-0 shadow-sm bg-muted/30">
            <CardHeader>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-2">
                <item.icon className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg">{item.title}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <h2>Our Mission</h2>
        <p>
          The internet is full of tools that bombard you with ads, require sign-ups,
          or quietly collect your data. {SITE_NAME} exists to change that.
        </p>
        <p>
          We believe basic utilities should be accessible to everyone, instantly,
          without compromise on privacy or user experience.
        </p>
      </div>
    </div>
  );
}
