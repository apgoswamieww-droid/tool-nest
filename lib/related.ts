import { Tool, CategorySlug } from "@/types";
import { getAllTools } from "./registry";

/**
 * ═══════════════════════════════════════════════════
 * RELATED-TOOLS ENGINE
 * Scores tool similarity using weighted signals:
 * 1. Same category (weight: 30)
 * 2. Shared tags (weight: 15 per shared tag, max 45)
 * 3. Cross-category relationship (weight: 15)
 * 4. Featured boost (weight: 5)
 * 5. Alphabetical tiebreaker
 *
 * Designed to scale to 100+ tools efficiently.
 * ═══════════════════════════════════════════════════
 */

interface ScoredTool {
  tool: Tool;
  score: number;
  reasons: string[];
}

const WEIGHTS = {
  SAME_CATEGORY: 30,
  SHARED_TAG: 15,
  MAX_TAG_BONUS: 45,
  CROSS_CATEGORY: 15,
  FEATURED_BOOST: 5,
} as const;

/**
 * Get related tools for a given tool with quality scoring.
 * Returns tools sorted by relevance score.
 */
export function getRelatedToolsScored(tool: Tool, limit = 6): Tool[] {
  const allTools = getAllTools();
  const scored: ScoredTool[] = [];

  for (const candidate of allTools) {
    if (candidate.slug === tool.slug) continue;

    const score = scoreSimilarity(tool, candidate);
    if (score.score > 0) {
      scored.push(score);
    }
  }

  // Sort by score descending, then alphabetically as tiebreaker
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.tool.name.localeCompare(b.tool.name);
  });

  return scored.slice(0, limit).map((s) => s.tool);
}

/**
 * Score similarity between two tools.
 */
function scoreSimilarity(source: Tool, candidate: Tool): ScoredTool {
  let score = 0;
  const reasons: string[] = [];

  // 1. Same primary category
  if (source.category === candidate.category) {
    score += WEIGHTS.SAME_CATEGORY;
    reasons.push("same-category");
  }

  // 2. Shared tags (up to 3 tags counted)
  const sharedTags = source.tags.filter((t) => candidate.tags.includes(t));
  const tagBonus = Math.min(sharedTags.length, 3) * WEIGHTS.SHARED_TAG;
  score += tagBonus;
  if (sharedTags.length > 0) {
    reasons.push(`shared-tags:${sharedTags.join(",")}`);
  }

  // 3. Cross-category relationship
  if (
    source.relatedCategories?.includes(candidate.category) ||
    candidate.relatedCategories?.includes(source.category)
  ) {
    score += WEIGHTS.CROSS_CATEGORY;
    reasons.push("cross-category");
  }

  // 4. Featured boost
  if (candidate.featured) {
    score += WEIGHTS.FEATURED_BOOST;
  }

  return { tool: candidate, score, reasons };
}

/**
 * Get related tools for a category page.
 * Combines same-category tools + cross-category tools.
 */
export function getRelatedToolsForCategory(
  categorySlug: CategorySlug,
  limit = 8
): Tool[] {
  const allTools = getAllTools();
  const scored: ScoredTool[] = [];

  for (const tool of allTools) {
    let score = 0;

    if (tool.category === categorySlug) {
      score += 50;
    }

    // Boost featured tools
    if (tool.featured) {
      score += 10;
    }

    // Boost tools with more tags (more discoverable)
    score += Math.min(tool.tags.length, 5) * 2;

    if (score > 0) {
      scored.push({ tool, score, reasons: [] });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.tool);
}

/**
 * Get cross-category suggestions for a category.
 * Returns tools from related categories that might interest users.
 */
export function getCrossCategorySuggestions(
  categorySlug: CategorySlug,
  limit = 4
): { category: CategorySlug; tools: Tool[] }[] {
  const { CATEGORY_REGISTRY } = require("./categories");
  const category = CATEGORY_REGISTRY[categorySlug];
  if (!category?.relatedCategories) return [];

  const allTools = getAllTools();
  const suggestions: { category: CategorySlug; tools: Tool[] }[] = [];

  for (const relatedSlug of category.relatedCategories) {
    const tools = allTools
      .filter((t) => t.category === relatedSlug && t.featured)
      .slice(0, limit);

    if (tools.length > 0) {
      suggestions.push({ category: relatedSlug, tools });
    }
  }

  return suggestions;
}
