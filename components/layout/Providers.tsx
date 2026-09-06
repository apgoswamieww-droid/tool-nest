"use client";

import * as React from "react";
import { ThemeProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";
import { PreferencesThemeSync } from "@/components/account/PreferencesThemeSync";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <SessionProvider>
        <PreferencesThemeSync />
        {children}
      </SessionProvider>
    </ThemeProvider>
  );
}
