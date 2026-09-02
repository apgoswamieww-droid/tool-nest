import type { Metadata } from "next";
import { SITE_NAME, SITE_URL, SITE_DESCRIPTION } from "./utils";
import { Tool } from "@/types";
import { Category } from "@/types";

/**
 * ═══════════════════════════════════════════════════
 * SEO METADATA CONVENTIONS
 *
 * • Homepage: "ToolNest — Free Online Tools & Calculators"
 * • Tool:     "{Tool Name} — Free Online Tool | ToolNest"
 * • Category: "{Category Name} — Free Online Tools | ToolNest"
 * • Static:   "{Page Title} | ToolNest"
 *
 * Description max length: ~155 chars
 * ═══════════════════════════════════════════════════
 */

/** Homepage metadata */
export function getHomeMetadata(): Metadata {
  return {
    title: {
      default: `${SITE_NAME} — Free Online Tools & Calculators`,
      template: `%s | ${SITE_NAME}`,
    },
    description: SITE_DESCRIPTION,
    metadataBase: new URL(SITE_URL),
    openGraph: {
      title: `${SITE_NAME} — Free Online Tools & Calculators`,
      description: SITE_DESCRIPTION,
      url: SITE_URL,
      siteName: SITE_NAME,
      type: "website",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: `${SITE_NAME} — Free Online Tools & Calculators`,
      description: SITE_DESCRIPTION,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

/** Tool page metadata with canonical URL */
export function getToolMetadata(tool: Tool): Metadata {
  const title = `${tool.name} — Free Online Tool`;
  const description = truncateMeta(tool.longDescription || tool.description, 155);
  const url = `${SITE_URL}/tools/${tool.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

/** Category page metadata with canonical URL */
export function getCategoryMetadata(category: Category): Metadata {
  const title = `${category.name} — Free Online Tools`;
  const description = truncateMeta(category.description, 155);
  const url = `${SITE_URL}/categories/${category.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

/** Static page metadata (about, privacy, terms) with canonical URL */
export function getStaticPageMetadata(
  pageName: string,
  description: string
): Metadata {
  const title = pageName;
  const slug = pageName.toLowerCase().replace(/\s+/g, "-");
  const url = `${SITE_URL}/${slug}`;

  return {
    title,
    description: truncateMeta(description, 155),
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

/** Generate WebSite structured data (JSON-LD) for the homepage */
export function generateWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/tools?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

/** Generate SoftwareApplication structured data for a tool */
export function generateToolSchema(tool: Tool) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    description: tool.longDescription || tool.description,
    url: `${SITE_URL}/tools/${tool.slug}`,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web Browser",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };
}

/** Truncate text to max length, adding ellipsis */
function truncateMeta(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 1).trimEnd() + "…";
}
