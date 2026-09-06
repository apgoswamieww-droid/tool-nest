"use client";

// ──────────────────────────────────────────────────────
// ToolNest — Preferences panel (account page)
//
// Theme (System / Light / Dark) applies instantly via next-themes and
// persists to /api/preferences so it follows the account across
// devices. Interface language is stored server-side too; only English
// ships today, so the control is honest about that.
// ──────────────────────────────────────────────────────

import * as React from "react";
import { useTheme } from "next-themes";
import { Check, Monitor, Moon, Sun } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  fetchPreferences,
  updatePreferences,
} from "@/lib/account/client";

type ThemeChoice = "system" | "light" | "dark";

const THEME_OPTIONS: { value: ThemeChoice; label: string; icon: typeof Monitor }[] = [
  { value: "system", label: "System", icon: Monitor },
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
];

export function PreferencesPanel() {
  const { setTheme } = useTheme();
  const [selected, setSelected] = React.useState<ThemeChoice>("system");
  const [loaded, setLoaded] = React.useState(false);
  const [language, setLanguage] = React.useState("en");
  const [saved, setSaved] = React.useState(false);
  const saveTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    fetchPreferences()
      .then((prefs) => {
        if (cancelled) return;
        const theme = prefs.theme;
        if (theme === "light" || theme === "dark" || theme === "system") {
          setSelected(theme);
        }
        if (prefs.language) setLanguage(prefs.language);
        setLoaded(true);
      })
      .catch(() => {
        if (!cancelled) setLoaded(true); // server values unavailable — keep defaults
      });
    return () => {
      cancelled = true;
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  const apply = (choice: ThemeChoice) => {
    setSelected(choice);
    setTheme(choice);
    setSaved(false);
    void updatePreferences({ theme: choice })
      .then(() => {
        setSaved(true);
        if (saveTimer.current) clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(() => setSaved(false), 2000);
      })
      .catch(() => {
        // Theme still applied locally for this session even if the
        // server write failed.
      });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Preferences</CardTitle>
        <CardDescription>
          Saved to your account — theme follows you across devices and sign-ins.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <p className="mb-2 text-sm font-medium">Theme</p>
          <div className="grid grid-cols-3 gap-2" role="group" aria-label="Theme">
            {THEME_OPTIONS.map((option) => {
              const Icon = option.icon;
              const active = selected === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => apply(option.value)}
                  disabled={!loaded}
                  aria-pressed={active}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-lg border px-3 py-3 text-xs font-medium transition-colors",
                    active
                      ? "border-primary bg-primary/10 text-primary"
                      : "hover:border-primary/40 hover:bg-muted/40"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {option.label}
                  {active && <Check className="h-3 w-3" aria-hidden />}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="mb-1 text-sm font-medium">Interface language</p>
          <select
            value={language}
            onChange={(e) => {
              const value = e.target.value;
              setLanguage(value);
              void updatePreferences({ language: value }).catch(() => {});
            }}
            className="h-9 w-full max-w-xs rounded-md border bg-background px-3 text-sm"
            aria-label="Interface language"
          >
            <option value="en">English</option>
          </select>
          <p className="mt-1.5 text-xs text-muted-foreground">
            Only English is available right now. Your choice is saved for when more
            languages arrive.
          </p>
        </div>

        <p className="text-xs text-muted-foreground" role="status">
          {saved ? "Saved ✓" : "\u00A0"}
        </p>
      </CardContent>
    </Card>
  );
}
