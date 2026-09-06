"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { updatePreferences } from "@/lib/account/client";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <Button variant="ghost" size="icon" className="h-9 w-9" disabled />;
  }

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    // Signed-in users get the choice persisted to their account so it
    // follows them across devices. Best-effort — never blocks the toggle.
    if (session?.user) {
      void updatePreferences({ theme: next }).catch(() => {});
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-9 w-9"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
