"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wrench, Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { cn } from "@/lib/utils";
import { SITE_NAME } from "@/lib/utils";
import { CATEGORY_LIST } from "@/lib/categories";

const NAV_LINKS = [
  { label: "Tools", href: "/tools" },
  { label: "Categories", href: "/categories" },
  { label: "About", href: "/about" },
];

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [categoriesOpen, setCategoriesOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <Wrench className="h-5 w-5 text-primary" />
          <span>{SITE_NAME}</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          <Link href="/tools">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "text-sm",
                pathname === "/tools" && "bg-accent text-accent-foreground"
              )}
            >
              Tools
            </Button>
          </Link>

          {/* Categories Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setCategoriesOpen(true)}
            onMouseLeave={() => setCategoriesOpen(false)}
          >
            <Button
              variant="ghost"
              size="sm"
              className="text-sm gap-1"
            >
              Categories
              <ChevronDown className="h-3 w-3" />
            </Button>
            {categoriesOpen && (
              <div className="absolute top-full left-0 mt-1 w-64 rounded-md border bg-popover p-2 shadow-md z-50">
                {CATEGORY_LIST.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <Link
                      key={cat.slug}
                      href={`/categories/${cat.slug}`}
                      className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent transition-colors"
                    >
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      {cat.name}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          <Link href="/about">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "text-sm",
                pathname === "/about" && "bg-accent text-accent-foreground"
              )}
            >
              About
            </Button>
          </Link>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-9 w-9"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-background px-4 py-4 space-y-2">
          <Link href="/tools" onClick={() => setMobileOpen(false)}>
            <Button variant="ghost" className="w-full justify-start">Tools</Button>
          </Link>
          <div className="pl-2 space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1">
              Categories
            </p>
            {CATEGORY_LIST.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.slug}
                  href={`/categories/${cat.slug}`}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent transition-colors"
                >
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  {cat.name}
                </Link>
              );
            })}
          </div>
          <Link href="/about" onClick={() => setMobileOpen(false)}>
            <Button variant="ghost" className="w-full justify-start">About</Button>
          </Link>
        </div>
      )}
    </header>
  );
}
