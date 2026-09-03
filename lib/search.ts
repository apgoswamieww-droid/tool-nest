/**
 * ═══════════════════════════════════════════════════
 * TOOLNEST SEARCH ENGINE
 * Fast, client-side search with fuzzy matching.
 * Returns results instantly from the tool registry.
 * ═══════════════════════════════════════════════════
 */

import { Tool, CategorySlug } from "@/types";
import { getAllTools, TOOL_REGISTRY } from "./registry";
import { getCategory, CATEGORY_LIST } from "./categories";

export interface SearchResult {
  tool: Tool;
  score: number;
  matchType: "name" | "tag" | "description" | "category";
}

export interface SearchSuggestion {
  type: "tool" | "category" | "query";
  label: string;
  slug: string;
  description?: string;
  icon?: LucideIcon;
}

import { LucideIcon } from "lucide-react";

// ─── Fuzzy Match Score ─────────────────────────────

function fuzzyScore(query: string, text: string): number {
  const q = query.toLowerCase();
  const t = text.toLowerCase();

  // Exact match
  if (t === q) return 100;

  // Starts with query
  if (t.startsWith(q)) return 90;

  // Contains query as whole word
  if (t.includes(` ${q} `) || t.startsWith(`${q} `) || t.endsWith(` ${q}`)) return 80;

  // Contains query
  if (t.includes(q)) return 70;

  // Fuzzy: all query characters present in order
  let qi = 0;
  let consecutive = 0;
  let score = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) {
      qi++;
      consecutive++;
      score += consecutive * 2;
    } else {
      consecutive = 0;
    }
  }

  return qi === q.length ? Math.min(score, 60) : 0;
}

// ─── Main Search Function ──────────────────────────

export function searchTools(query: string, limit = 20): SearchResult[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  const allTools = getAllTools();
  const results: SearchResult[] = [];

  for (const tool of allTools) {
    let bestScore = 0;
    let matchType: SearchResult["matchType"] = "description";

    // Score by name (highest weight)
    const nameScore = fuzzyScore(q, tool.name);
    if (nameScore > bestScore) {
      bestScore = nameScore;
      matchType = "name";
    }

    // Score by tags
    for (const tag of tool.tags) {
      const tagScore = fuzzyScore(q, tag);
      if (tagScore > bestScore) {
        bestScore = tagScore;
        matchType = "tag";
      }
    }

    // Score by description
    const descScore = fuzzyScore(q, tool.description) * 0.8;
    if (descScore > bestScore) {
      bestScore = descScore;
      matchType = "description";
    }

    // Score by category name
    const category = getCategory(tool.category);
    if (category) {
      const catScore = fuzzyScore(q, category.name) * 0.6;
      if (catScore > bestScore) {
        bestScore = catScore;
        matchType = "category";
      }
    }

    // Boost featured tools
    if (tool.featured && bestScore > 0) {
      bestScore += 10;
    }

    if (bestScore > 0) {
      results.push({ tool, score: bestScore, matchType });
    }
  }

  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

// ─── Search Suggestions ────────────────────────────

export function getSearchSuggestions(query: string): SearchSuggestion[] {
  const q = query.toLowerCase().trim();
  if (!q || q.length < 2) return [];

  const suggestions: SearchSuggestion[] = [];
  const seen = new Set<string>();

  // Tool name suggestions
  const toolResults = searchTools(q, 6);
  for (const result of toolResults) {
    if (!seen.has(result.tool.slug)) {
      seen.add(result.tool.slug);
      suggestions.push({
        type: "tool",
        label: result.tool.name,
        slug: result.tool.slug,
        description: result.tool.description,
        icon: result.tool.icon,
      });
    }
  }

  // Category suggestions
  for (const cat of CATEGORY_LIST) {
    if (
      !seen.has(cat.slug) &&
      (cat.name.toLowerCase().includes(q) ||
        cat.description.toLowerCase().includes(q) ||
        cat.keywords?.some((t: string) => t.includes(q)))
    ) {
      seen.add(cat.slug);
      suggestions.push({
        type: "category",
        label: cat.name,
        slug: cat.slug,
        description: cat.description,
        icon: cat.icon,
      });
    }
  }

  // Popular query suggestions
  const popularQueries = [
    "json formatter",
    "pdf merger",
    "emi calculator",
    "word counter",
    "text repeater",
    "barcode generator",
    "bmi calculator",
    "sql validator",
    "csv to pdf",
    "gpa calculator",
  ];

  for (const pq of popularQueries) {
    if (pq.includes(q) && !seen.has(pq)) {
      seen.add(pq);
      suggestions.push({
        type: "query",
        label: pq,
        slug: `/tools?q=${encodeURIComponent(pq)}`,
      });
    }
  }

  return suggestions.slice(0, 8);
}

// ─── Popular Tools (by tag frequency + featured) ───

export function getPopularTools(limit = 8): Tool[] {
  const allTools = getAllTools();

  // Score tools by: featured (+20), tag count (+3 per tag), category breadth
  const scored = allTools.map((tool) => ({
    tool,
    score:
      (tool.featured ? 20 : 0) +
      tool.tags.length * 3 +
      (tool.relatedCategories ? tool.relatedCategories.length * 5 : 0),
  }));

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.tool);
}

// ─── Recently Added Tools ──────────────────────────
// We use registry order as proxy for recency

export function getRecentlyAddedTools(limit = 8): Tool[] {
  // Last tools added to registry = recently added
  const allTools = getAllTools();
  return allTools.slice(-limit).reverse();
}

// ─── Tool Count by Category ────────────────────────

export function getToolCountByCategory(): { slug: CategorySlug; name: string; count: number; icon: LucideIcon }[] {
  return CATEGORY_LIST.map((cat) => ({
    slug: cat.slug,
    name: cat.name,
    count: TOOL_REGISTRY.filter(
      (t) =>
        t.category === cat.slug &&
        !t.deprecated
    ).length,
    icon: cat.icon,
  }));
}
