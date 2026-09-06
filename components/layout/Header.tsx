"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Wrench, Menu, X, ChevronDown, Search, Command, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { CommandPalette } from "@/components/search/CommandPalette";
import { cn } from "@/lib/utils";
import { SITE_NAME } from "@/lib/utils";
import { CATEGORY_LIST } from "@/lib/categories";

export function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [categoriesOpen, setCategoriesOpen] = React.useState(false);
  const [paletteOpen, setPaletteOpen] = React.useState(false);

  // Global Cmd+K shortcut
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setPaletteOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
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
            {/* Search trigger (Cmd+K) */}
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:flex items-center gap-2 text-muted-foreground h-8"
              onClick={() => setPaletteOpen(true)}
            >
              <Search className="h-3.5 w-3.5" />
              <span className="text-xs">Search</span>
              <kbd className="ml-1 hidden lg:inline-flex items-center gap-0.5 rounded border bg-muted px-1 py-0.5 text-[10px] font-mono">
                <Command className="h-2.5 w-2.5" />K
              </kbd>
            </Button>

            {/* Account: sign in, or sign out when authenticated */}
            {session?.user && (
              <Link href="/account" title="My account">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  aria-label="My account"
                >
                  <User className="h-4 w-4" />
                </Button>
              </Link>
            )}
            {session?.user ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs"
                onClick={() => void signOut({ callbackUrl: "/" })}
                title={session.user.email ?? "Sign out"}
              >
                Sign out
              </Button>
            ) : (
              <Link href="/login">
                <Button variant="outline" size="sm" className="h-8 text-xs">
                  Sign in
                </Button>
              </Link>
            )}

            <ThemeToggle />

            {/* Mobile search */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-9 w-9"
              onClick={() => setPaletteOpen(true)}
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </Button>

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
            <Button
              variant="outline"
              className="w-full justify-start gap-2 text-muted-foreground"
              onClick={() => { setMobileOpen(false); setPaletteOpen(true); }}
            >
              <Search className="h-4 w-4" />
              Search tools…
            </Button>
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
            {session?.user && (
              <Link href="/account" onClick={() => setMobileOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  My account
                </Button>
              </Link>
            )}
            {session?.user ? (
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => void signOut({ callbackUrl: "/" })}
              >
                Sign out
              </Button>
            ) : (
              <Link href="/login" onClick={() => setMobileOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  Sign in
                </Button>
              </Link>
            )}
          </div>
        )}
      </header>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </>
  );
}
