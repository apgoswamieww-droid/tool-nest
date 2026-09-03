import type { Metadata } from "next";
import { SITE_NAME, SITE_URL, SITE_DESCRIPTION } from "./utils";
import { Tool, Category, CategorySlug } from "@/types";

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

// ─── METADATA GENERATORS ──────────────────────────

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

/** Tool page metadata with canonical URL, OG, Twitter */
export function getToolMetadata(tool: Tool): Metadata {
  const title = `${tool.name} — Free Online Tool`;
  const description = truncateMeta(tool.longDescription || tool.description, 155);
  const url = `${SITE_URL}/tools/${tool.slug}`;
  const category = getCategoryForTool(tool.category);

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
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    keywords: [
      tool.name,
      tool.name.toLowerCase(),
      "free online tool",
      "free calculator",
      "online tool",
      `${tool.name} online`,
      `${tool.name} free`,
      ...tool.tags,
      ...(category?.keywords?.slice(0, 4) || []),
    ],
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

/** Category page metadata with canonical URL */
export function getCategoryMetadata(category: Category): Metadata {
  const title = `${category.name} — Free Online Tools`;
  const description = truncateMeta(category.intro || category.description, 155);
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
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    keywords: [
      category.name,
      `${category.name} online`,
      "free online tools",
      ...category.keywords,
    ],
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

/** Static page metadata (about, privacy, terms) with canonical URL */
export function getStaticPageMetadata(
  pageName: string,
  description: string,
  path?: string
): Metadata {
  const title = `${pageName} | ${SITE_NAME}`;
  const slug = pageName.toLowerCase().replace(/\s+/g, "-");
  const url = `${SITE_URL}${path || `/${slug}`}`;

  return {
    title,
    description: truncateMeta(description, 155),
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description: truncateMeta(description, 155),
      url,
      siteName: SITE_NAME,
      type: "website",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: truncateMeta(description, 155),
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

// ─── STRUCTURED DATA (JSON-LD) ────────────────────

/** WebSite + SearchAction schema for homepage */
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

/** Organization schema for homepage */
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    sameAs: [],
  };
}

/** WebApplication schema for homepage */
export function generateWebApplicationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: `${SITE_NAME} — Free Online Tools`,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web Browser",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };
}

/** SoftwareApplication schema for a tool page */
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

/** BreadcrumbList schema */
export function generateBreadcrumbSchema(
  items: { name: string; url: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/** Generate tool breadcrumbs (Home → Tools → {Tool Name}) */
export function generateToolBreadcrumbs(tool: Tool) {
  return generateBreadcrumbSchema([
    { name: "Home", url: SITE_URL },
    { name: "Tools", url: `${SITE_URL}/tools` },
    { name: tool.name, url: `${SITE_URL}/tools/${tool.slug}` },
  ]);
}

/** Generate category breadcrumbs (Home → Categories → {Category}) */
export function generateCategoryBreadcrumbs(category: Category) {
  return generateBreadcrumbSchema([
    { name: "Home", url: SITE_URL },
    { name: "Categories", url: `${SITE_URL}/categories` },
    {
      name: category.name,
      url: `${SITE_URL}/categories/${category.slug}`,
    },
  ]);
}

/** Generate static page breadcrumbs (Home → {Page Name}) */
export function generateStaticBreadcrumbs(pageName: string, path: string) {
  return generateBreadcrumbSchema([
    { name: "Home", url: SITE_URL },
    { name: pageName, url: `${SITE_URL}${path}` },
  ]);
}

/** FAQ schema from array of {question, answer} */
export function generateFaqSchema(
  items: { question: string; answer: string }[]
) {
  if (!items || items.length === 0) return null;
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

// ─── HELPERS ──────────────────────────────────────

/** Truncate text to max length, adding ellipsis */
export function truncateMeta(text: string, max: number): string {
  if (!text) return "";
  if (text.length <= max) return text;
  return text.slice(0, max - 1).trimEnd() + "…";
}

/** Get category name for a tool's category slug */
function getCategoryForTool(categorySlug: CategorySlug): Category | undefined {
  // Lazy import to avoid circular deps — use dynamic require in production
  try {
    const mod = require("./categories");
    return mod.CATEGORY_REGISTRY?.[categorySlug];
  } catch {
    return undefined;
  }
}
