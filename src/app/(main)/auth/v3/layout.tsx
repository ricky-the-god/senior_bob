"use client";

import { type ReactNode, useState } from "react";

import Link from "next/link";

import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { persistPreference } from "@/lib/preferences/preferences-storage";
import { usePreferencesStore } from "@/stores/preferences/preferences-provider";

export default function AuthLayout({ children }: Readonly<{ children: ReactNode }>) {
  const themeMode = usePreferencesStore((s) => s.themeMode);
  const setThemeMode = usePreferencesStore((s) => s.setThemeMode);
  const [isAnimating, setIsAnimating] = useState(false);

  const toggleTheme = () => {
    setIsAnimating(true);
    setTimeout(() => {
      const nextTheme = themeMode === "dark" ? "light" : "dark";
      setThemeMode(nextTheme);
      persistPreference("theme_mode", nextTheme);
    }, 150);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const isDark = themeMode === "dark";

  return (
    <main className="relative min-h-dvh overflow-hidden bg-background">
      {/* Background grain texture */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.02] dark:opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Radial gradient behind card - light mode */}
      <div
        className="pointer-events-none fixed inset-0 z-0 dark:hidden"
        style={{
          background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(200, 170, 100, 0.2) 0%, transparent 60%)",
        }}
      />
      {/* Radial gradient behind card - dark mode */}
      <div
        className="pointer-events-none fixed inset-0 z-0 hidden dark:block"
        style={{
          background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(140, 110, 50, 0.3) 0%, transparent 60%)",
        }}
      />

      {/* Header - matching landing page style */}
      <header className="fixed top-0 right-0 left-0 z-50">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          {/* Logo - matching landing page */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
              <div className="flex size-8 items-center justify-center rounded-lg border border-zinc-950/10 bg-zinc-950/5 dark:border-zinc-50/10 dark:bg-zinc-50/5">
                <svg
                  aria-hidden="true"
                  className="size-4 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
                  />
                </svg>
              </div>
              <span className="font-mono-tight font-normal text-sm text-zinc-950 dark:text-zinc-50">seniorbob</span>
            </Link>
          </motion.div>

          {/* Theme toggle - matching landing page */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={toggleTheme}
              aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
              className="relative overflow-hidden text-zinc-950/60 hover:bg-zinc-950/5 hover:text-zinc-950 dark:text-zinc-50/60 dark:hover:bg-zinc-50/5 dark:hover:text-zinc-50"
            >
              <Sun
                aria-hidden="true"
                className={`absolute size-4 transition-all duration-300 ${
                  isDark ? (isAnimating ? "rotate-0 scale-0" : "rotate-0 scale-100") : "-rotate-90 scale-0"
                }`}
              />
              <Moon
                aria-hidden="true"
                className={`size-4 transition-all duration-300 ${
                  isDark ? "rotate-90 scale-0" : isAnimating ? "rotate-0 scale-0" : "rotate-0 scale-100"
                }`}
              />
            </Button>
          </motion.div>
        </div>
      </header>

      {/* Main content - centered card */}
      <div className="relative z-10 flex min-h-dvh items-center justify-center px-4 py-20">{children}</div>

      {/* Footer */}
      <footer className="fixed bottom-0 z-50 w-full">
        <div className="flex items-center justify-center px-6 py-5 sm:px-10">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="font-mono-tight text-xs text-zinc-950/40 dark:text-zinc-50/40"
          >
            &copy; {new Date().getFullYear()} seniorbob. All rights reserved.
          </motion.p>
        </div>
      </footer>
    </main>
  );
}
