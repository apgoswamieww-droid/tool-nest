"use client";

// ──────────────────────────────────────────────────────
// ToolNest — PreferencesThemeSync
//
// Mounted in Providers (inside the Session + Theme providers). Once a
// session is established, loads /api/preferences once per signed-in
// user and applies their stored theme, so the account preference wins
// over a stale local-only theme. Renders nothing.
// ──────────────────────────────────────────────────────

import * as React from "react";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { fetchPreferences } from "@/lib/account/client";

export function PreferencesThemeSync() {
  const { data: session, status } = useSession();
  const { setTheme } = useTheme();
  const appliedForRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id) return;
    if (appliedForRef.current === session.user.id) return;
    appliedForRef.current = session.user.id;

    let cancelled = false;
    fetchPreferences()
      .then((prefs) => {
        if (cancelled) return;
        const theme = prefs.theme;
        if (theme === "light" || theme === "dark" || theme === "system") {
          setTheme(theme);
        }
      })
      .catch(() => {
        // Account unavailable — keep the local theme.
      });
    return () => {
      cancelled = true;
    };
  }, [status, session?.user?.id, setTheme]);

  return null;
}
