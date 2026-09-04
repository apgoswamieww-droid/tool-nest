"use client";

import * as React from "react";
import Link from "next/link";
import { Search, X, ArrowRight, Hash, Wrench, FolderOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getSearchSuggestions, SearchSuggestion } from "@/lib/search";
import { analytics } from "@/lib/analytics";

interface SearchBarProps {
  defaultValue?: string;
  placeholder?: string;
  className?: string;
  showSuggestions?: boolean;
}

export function SearchBar({
  defaultValue = "",
  placeholder = "Search tools…",
  className,
  showSuggestions = true,
}: SearchBarProps) {
  const [query, setQuery] = React.useState(defaultValue);
  const [suggestions, setSuggestions] = React.useState<SearchSuggestion[]>([]);
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(-1);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Generate suggestions
  React.useEffect(() => {
    if (query.length >= 2 && showSuggestions) {
      const results = getSearchSuggestions(query);
      setSuggestions(results);
      setIsOpen(true);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
    setSelectedIndex(-1);
  }, [query, showSuggestions]);

  // Close on outside click
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIndex >= 0 && suggestions[selectedIndex]) {
      const s = suggestions[selectedIndex];

      // Track search result click
      analytics.searchResultClicked(
        s.type,
        s.slug,
        selectedIndex
      );

      if (s.type === "tool") {
        window.location.href = `/tools/${s.slug}`;
      } else if (s.type === "category") {
        window.location.href = `/categories/${s.slug}`;
      } else {
        window.location.href = s.slug;
      }
    } else if (query.trim()) {
      // Track search performed — query length & result count only,
      // never the raw query text (privacy-conscious by design).
      analytics.toolSearched({
        queryLength: query.trim().length,
        resultCount: suggestions.length,
      });
      window.location.href = `/tools?q=${encodeURIComponent(query.trim())}`;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, -1));
        break;
      case "Escape":
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.length >= 2 && setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="pl-9 pr-9 h-11 text-base"
            autoComplete="off"
            role="combobox"
            aria-expanded={isOpen}
            aria-autocomplete="list"
          />
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={() => {
                setQuery("");
                setIsOpen(false);
                inputRef.current?.focus();
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </form>

      {/* Suggestions dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border bg-popover shadow-lg z-50 overflow-hidden">
          <div className="max-h-80 overflow-y-auto p-1">
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
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                    isSelected ? "bg-accent" : "hover:bg-muted"
                  )}
                  onMouseEnter={() => setSelectedIndex(index)}
                  onClick={() => {
                    // Track search result click on mouse navigation
                    analytics.searchResultClicked(
                      suggestion.type,
                      suggestion.slug,
                      index
                    );
                  }}
                >
                  <div
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {Icon && <Icon className="h-3.5 w-3.5" />}
                    {suggestion.type === "query" && (
                      <Hash className="h-3.5 w-3.5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-medium">{suggestion.label}</span>
                    {suggestion.description && (
                      <p className="text-xs text-muted-foreground truncate">
                        {suggestion.description}
                      </p>
                    )}
                  </div>
                  <Badge variant="outline" className="text-[10px] shrink-0">
                    {suggestion.type === "tool"
                      ? "Tool"
                      : suggestion.type === "category"
                      ? "Category"
                      : "Search"}
                  </Badge>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
