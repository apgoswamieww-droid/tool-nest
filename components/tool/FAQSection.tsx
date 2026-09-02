"use client";

import * as React from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  items: FAQItem[];
}

export function FAQSection({ items }: FAQSectionProps) {
  return (
    <div>
      <Separator className="mb-8" />
      <div className="flex items-center gap-2 mb-6">
        <HelpCircle className="h-5 w-5 text-primary" />
        <h2 className="text-2xl font-bold tracking-tight">
          Frequently Asked Questions
        </h2>
      </div>
      <div className="space-y-3">
        {items.map((item, index) => (
          <FAQAccordion key={index} item={item} />
        ))}
      </div>
    </div>
  );
}

function FAQAccordion({ item }: { item: FAQItem }) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="rounded-lg border bg-card">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between p-4 text-left text-sm font-medium hover:bg-muted/50 transition-colors rounded-lg"
        aria-expanded={open}
      >
        <span className="pr-4">{item.question}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>
      {open && (
        <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed border-t">
          <p className="pt-3">{item.answer}</p>
        </div>
      )}
    </div>
  );
}

/**
 * Generate FAQ structured data (JSON-LD) for SEO.
 * Use in the page's <head> or via Next.js metadata.
 */
export function generateFAQSchema(items: FAQItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}
