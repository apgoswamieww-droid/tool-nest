import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes safely with clsx */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Convert a slug to a human-readable title */
export function slugToTitle(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/** Truncate text to a maximum length with ellipsis */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "…";
}

/** Generate a simple URL-friendly slug from a string */
export function toSlug(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Site-wide constants */
export const SITE_NAME = "ToolNest";
export const SITE_DESCRIPTION =
  "Fast, free, privacy-focused collection of online tools and calculators.";
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://toolnest.io";
