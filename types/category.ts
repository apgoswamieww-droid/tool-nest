import { LucideIcon } from "lucide-react";
import { CategorySlug } from "./tool";

/**
 * ═══════════════════════════════════════════════════
 * CATEGORY — Rich SEO-driven category definition
 * Each category is a topical cluster landing page.
 * ═══════════════════════════════════════════════════
 */
export interface Category {
  /** URL-safe unique identifier */
  slug: CategorySlug;
  /** Display name */
  name: string;
  /** One-line description for cards and meta */
  description: string;
  /** Long-form intro paragraph for the category landing page (SEO content) */
  intro: string;
  /** Lucide icon */
  icon: LucideIcon;
  /** Sort order */
  order: number;
  /** Color accent */
  color?: string;
  /** SEO keywords for this category */
  keywords: string[];
  /** Related category slugs for internal linking */
  relatedCategories: CategorySlug[];
  /** FAQ items for the category landing page */
  faq: FAQItem[];
}

export interface FAQItem {
  question: string;
  answer: string;
}

/**
 * Navigation item derived from categories or custom links.
 */
export interface NavItem {
  label: string;
  href: string;
  icon?: LucideIcon;
}
