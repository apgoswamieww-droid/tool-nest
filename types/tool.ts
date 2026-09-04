import { LucideIcon } from "lucide-react";

/** Access tier of a tool. Absent = "free". */
export type ToolTier = "free" | "premium";

/**
 * Represents a single tool in the ToolNest registry.
 * Each tool maps to a page at /tools/{slug}/
 */
export interface Tool {
  /** URL-safe unique identifier, e.g. "text-repeater" */
  slug: string;
  /** Display name, e.g. "Text Repeater" */
  name: string;
  /** One-line description for cards and SEO */
  description: string;
  /** Longer description for the tool's own page */
  longDescription?: string;
  /** Lucide icon name, e.g. "Repeat" */
  icon: LucideIcon;
  /** Primary category slug this tool belongs to */
  category: CategorySlug;
  /** Additional category slugs for cross-listing */
  relatedCategories?: CategorySlug[];
  /** Tags for search and filtering */
  tags: string[];
  /** Featured on homepage */
  featured?: boolean;
  /** Deprecated tools still accessible but not shown in listings */
  deprecated?: boolean;
  /**
   * Access tier (default "free"). Premium tools get gated pages + a
   * badge once the R1 monetization layer lands (docs/monetization.md).
   * The registry declares intent only — nothing filters on this yet,
   * so free listings are unaffected until gating ships.
   */
  tier?: ToolTier;
}

/** All valid category slugs — derived from CATEGORY_REGISTRY */
export type CategorySlug =
  | "text-tools"
  | "developer-tools"
  | "financial-calculators"
  | "student-tools"
  | "pdf-tools"
  | "construction-calculators"
  | "energy-calculators"
  | "qr-barcode-tools"
  | "travel-shipping-tools"
  | "fun-tools"
  | "personal-calculators"
  | "agriculture-tools";
