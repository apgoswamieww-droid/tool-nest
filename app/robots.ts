import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/utils";

/**
 * ═══════════════════════════════════════════════════
 * ROBOTS.TXT — Configured for optimal crawlability
 *
 * - Allow all crawlers full access
 * - Disallow API-like routes and private paths
 * - Point to XML sitemap
 * ═══════════════════════════════════════════════════
 */

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/_next/",
          "/private/",
        ],
      },
      {
        userAgent: "GPTBot",
        disallow: "/",
      },
      {
        userAgent: "ChatGPT-User",
        disallow: "/",
      },
      {
        userAgent: "CCBot",
        disallow: "/",
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
