import type { MetadataRoute } from "next";
import { SITE_URL, SITE_NAME } from "@/lib/utils";
import { getAllTools } from "@/lib/registry";
import { CATEGORY_LIST } from "@/lib/categories";

/**
 * ═══════════════════════════════════════════════════
 * XML SITEMAP — Auto-generated from tool + category registry
 *
 * Includes:
 *  - Homepage (priority 1.0, daily)
 *  - /tools listing (priority 0.9, daily)
 *  - /categories listing (priority 0.8, weekly)
 *  - Each tool page (priority 0.7, weekly)
 *  - Each category page (priority 0.6, weekly)
 *  - Static pages (priority 0.5, monthly)
 * ═══════════════════════════════════════════════════
 */

export default function sitemap(): MetadataRoute.Sitemap {
  const today = new Date().toISOString().split("T")[0];

  const toolPages = getAllTools().map((tool) => ({
    url: `${SITE_URL}/tools/${tool.slug}`,
    lastModified: today,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const categoryPages = CATEGORY_LIST.map((cat) => ({
    url: `${SITE_URL}/categories/${cat.slug}`,
    lastModified: today,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [
    // Homepage
    {
      url: SITE_URL,
      lastModified: today,
      changeFrequency: "daily",
      priority: 1.0,
    },
    // Tools index
    {
      url: `${SITE_URL}/tools`,
      lastModified: today,
      changeFrequency: "daily",
      priority: 0.9,
    },
    // Categories index
    {
      url: `${SITE_URL}/categories`,
      lastModified: today,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    // All tool pages
    ...toolPages,
    // All category pages
    ...categoryPages,
    // Static pages
    {
      url: `${SITE_URL}/about`,
      lastModified: today,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: today,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: today,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];
}
