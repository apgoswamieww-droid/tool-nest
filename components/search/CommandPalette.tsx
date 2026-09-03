"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  ArrowRight,
  Command,
  CornerDownLeft,
  Hash,
  FolderOpen,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { searchTools, getSearchSuggestions, SearchSuggestion } from "@/lib/search";
import { getCategory } from "@/lib/categories";
import { Badge } from "@/components/ui/badge";

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const [query, setQuery] = React.useState("");
  const [suggestions, setSuggestions] = React.useState<SearchSuggestion[]>([]);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Generate suggestions when query changes
  React.useEffect(() => {
    const results = getSearchSuggestions(query);
    setSuggestions(results);
    setSelectedIndex(0);
  }, [query]);

  // Focus input when opened
  React.useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
    }
  }, [open]);

  // Keyboard navigation
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case "Enter":
          e.preventDefault();
          if (suggestions[selectedIndex]) {
            const s = suggestions[selectedIndex];
            if (s.type === "tool") {
              router.push(`/tools/${s.slug}`);
            } else if (s.type === "category") {
              router.push(`/categories/${s.slug}`);
            } else {
              router.push(s.slug);
            }
            onClose();
          } else if (query.trim()) {
            router.push(`/tools?q=${encodeURIComponent(query.trim())}`);
            onClose();
          }
          break;
        case "Escape":
          onClose();
          break;
      }
    },
    [suggestions, selectedIndex, query, router, onClose]
  );

  // Global keyboard shortcut to open
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (!open) {
          // Parent should handle open state
        }
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="absolute top-[15%] left-1/2 -translate-x-1/2 w-full max-w-lg px-4">
        <div
          className="rounded-xl border bg-background shadow-2xl overflow-hidden"
          onKeyDown={handleKeyDown}
        >
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b">
            <Search className="h-5 w-5 text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tools, categories, or actions…"
              className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
              autoComplete="off"
            />
            <kbd className="hidden sm:inline-flex items-center gap-1 rounded border bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div className="max-h-[50vh] overflow-y-auto p-2">
            {suggestions.length > 0 ? (
              <div className="space-y-1">
                {suggestions.map((suggestion, index) => {
                  const isSelected = index === selectedIndex;
                  const Icon = suggestion.icon;

                  return (
                    <Link
                      key={`${suggestion.type}-${suggestion.slug}`}
                      href={
                        suggestion.type === "tool"
                          ? `/tools/${suggestion.slug}`
                          : suggestion.type === "category"
                          ? `/categories/${suggestion.slug}`
                          : suggestion.slug
                      }
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                        isSelected
                          ? "bg-accent text-accent-foreground"
                          : "hover:bg-muted"
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {suggestion.type === "tool" && Icon && (
                          <Icon className="h-4 w-4" />
                        )}
                        {suggestion.type === "category" && Icon && (
                          <Icon className="h-4 w-4" />
                        )}
                        {suggestion.type === "query" && (
                          <Hash className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">
                            {suggestion.label}
                          </span>
                          <Badge variant="outline" className="text-[10px] shrink-0">
                            {suggestion.type === "tool"
                              ? "Tool"
                              : suggestion.type === "category"
                              ? "Category"
                              : "Search"}
                          </Badge>
                        </div>
                        {suggestion.description && (
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {suggestion.description}
                          </p>
                        )}
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    </Link>
                  );
                })}
              </div>
            ) : query.length >= 2 ? (
              <div className="py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No results for &ldquo;{query}&rdquo;
                </p>
                <Link
                  href={`/tools?q=${encodeURIComponent(query)}`}
                  onClick={onClose}
                  className="mt-2 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                >
                  Search all tools
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ) : (
              <div className="py-4 px-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  Quick Links
                </p>
                <div className="space-y-1">
                  <Link
                    href="/tools"
                    onClick={onClose}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted transition-colors"
                  >
                    <Wrench className="h-4 w-4 text-muted-foreground" />
                    Browse All Tools
                  </Link>
                  <Link
                    href="/categories"
                    onClick={onClose}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted transition-colors"
                  >
                    <FolderOpen className="h-4 w-4 text-muted-foreground" />
                    All Categories
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t px-4 py-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="rounded border bg-muted px-1 py-0.5">↑↓</kbd>
                Navigate
              </span>
              <span className="flex items-center gap-1">
                <CornerDownLeft className="h-3 w-3" />
                Select
              </span>
            </div>
            <span className="flex items-center gap-1">
              <kbd className="rounded border bg-muted px-1 py-0.5">ESC</kbd>
              Close
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
