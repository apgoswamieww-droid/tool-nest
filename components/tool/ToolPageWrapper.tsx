import { ReactNode } from "react";
import { Metadata } from "next";
import { Tool } from "@/types";
import {
  getToolMetadata,
  generateToolSchema,
  generateToolBreadcrumbs,
  generateFaqSchema,
} from "@/lib/seo";
import { getToolFaq } from "@/lib/tool-metadata";

interface ToolPageWrapperProps {
  tool: Tool;
  faqItems?: { question: string; answer: string }[];
  children: ReactNode;
}

/**
 * Server component that wraps any tool page and provides:
 * - BreadcrumbList JSON-LD
 * - SoftwareApplication JSON-LD
 * - FAQPage JSON-LD (from centralized registry or manual override)
 *
 * Usage in page.tsx (server component):
 * ```tsx
 * import { getTool } from "@/lib/registry";
 * import { ToolPageWrapper, getToolPageMetadata } from "@/components/tool/ToolPageWrapper";
 * import ToolClient from "./ToolClient";
 *
 * const tool = getTool("my-tool")!;
 * export const metadata = getToolPageMetadata(tool);
 *
 * export default function Page() {
 *   return (
 *     <ToolPageWrapper tool={tool}>
 *       <ToolClient />
 *     </ToolPageWrapper>
 *   );
 * }
 * ```
 */
export function ToolPageWrapper({
  tool,
  faqItems,
  children,
}: ToolPageWrapperProps) {
  // Use provided FAQ items, or fall back to centralized registry
  const faq = faqItems && faqItems.length > 0 ? faqItems : getToolFaq(tool.slug);

  const toolSchema = generateToolSchema(tool);
  const breadcrumbSchema = generateToolBreadcrumbs(tool);
  const faqSchema = generateFaqSchema(faq);

  return (
    <>
      {/* JSON-LD: BreadcrumbList */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />

      {/* JSON-LD: SoftwareApplication */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(toolSchema),
        }}
      />

      {/* JSON-LD: FAQPage (from registry or manual) */}
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqSchema),
          }}
        />
      )}

      {children}
    </>
  );
}

/**
 * Generate metadata for a tool page. Export this from page.tsx (server component).
 * ```tsx
 * export const metadata = getToolPageMetadata(tool);
 * ```
 */
export function getToolPageMetadata(tool: Tool): Metadata {
  return getToolMetadata(tool);
}
