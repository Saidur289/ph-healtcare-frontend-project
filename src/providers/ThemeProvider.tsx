"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ReactNode } from "react";

// light by default (the design); dark mode adds the "dark" class on <html>
// nonce: lets the small theme script pass the Content-Security-Policy
export function ThemeProvider({ children, nonce }: { children: ReactNode; nonce?: string }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange nonce={nonce}>
      {children}
    </NextThemesProvider>
  );
}
