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
   * badge (docs/monetization.md). Premium entries stay visible in
   * listings — merchandised with a lock badge, not hidden.
   */
  tier?: ToolTier;
  /**
   * Value bullets shown on the premium gate / marketing surface.
   * Present only on premium tools; describes what the paid version
   * unlocks so the upgrade prompt sells capability, not hype.
   */
  premiumFeatures?: string[];
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
