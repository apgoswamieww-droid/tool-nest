import { ReactNode } from "react";
import { Tool } from "@/types";
import { ToolHeader } from "./ToolHeader";
import { RelatedTools } from "./RelatedTools";
import { FAQSection } from "./FAQSection";
import { getRelatedToolsScored } from "@/lib/related";
import { getCategory } from "@/lib/categories";

interface FAQItem {
  question: string;
  answer: string;
}

interface ToolPageLayoutProps {
  tool: Tool;
  children: ReactNode;
  faqItems?: FAQItem[];
}

export function ToolPageLayout({ tool, children, faqItems }: ToolPageLayoutProps) {
  const category = getCategory(tool.category);
  const relatedTools = getRelatedToolsScored(tool, 6);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header with breadcrumbs */}
      <ToolHeader tool={tool} category={category} />

      {/* Tool content */}
      <div className="mt-8">
        {children}
      </div>

      {/* Related Tools */}
      {relatedTools.length > 0 && (
        <div className="mt-16">
          <RelatedTools tools={relatedTools} />
        </div>
      )}

      {/* FAQ */}
      {faqItems && faqItems.length > 0 && (
        <div className="mt-16">
          <FAQSection items={faqItems} />
        </div>
      )}
    </div>
  );
}
