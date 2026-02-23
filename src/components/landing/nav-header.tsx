"use client";

import { useState } from "react";

import Link from "next/link";

import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { persistPreference } from "@/lib/preferences/preferences-storage";
import { usePreferencesStore } from "@/stores/preferences/preferences-provider";

export const NavHeader = () => {
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
    <header className="fixed top-0 right-0 left-0 z-50">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo - minimal */}
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
          <span className="font-mono-tight font-normal text-sm text-zinc-950 dark:text-zinc-50">ultimate_planner</span>
        </Link>

        {/* Center nav - glassmorphism pill */}
        <nav className="glass hidden items-center gap-0.5 rounded-full border border-zinc-950/10 px-1.5 py-1 font-mono-tight text-xs md:flex dark:border-zinc-50/10">
          <Link
            href="#features"
            className="rounded-full px-4 py-1.5 text-zinc-950/60 transition-colors hover:bg-zinc-950/5 hover:text-zinc-950 dark:text-zinc-50/60 dark:hover:bg-zinc-50/5 dark:hover:text-zinc-50"
          >
            Features
          </Link>
          <Link
            href="#how-it-works"
            className="rounded-full px-4 py-1.5 text-zinc-950/60 transition-colors hover:bg-zinc-950/5 hover:text-zinc-950 dark:text-zinc-50/60 dark:hover:bg-zinc-50/5 dark:hover:text-zinc-50"
          >
            Process
          </Link>
          <Link
            href="#use-cases"
            className="rounded-full px-4 py-1.5 text-zinc-950/60 transition-colors hover:bg-zinc-950/5 hover:text-zinc-950 dark:text-zinc-50/60 dark:hover:bg-zinc-50/5 dark:hover:text-zinc-50"
          >
            Use Cases
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
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
          <div className="h-4 w-px bg-zinc-950/10 dark:bg-zinc-50/10" />
          <Button
            variant="ghost"
            size="sm"
            className="font-mono-tight text-xs text-zinc-950/60 hover:bg-zinc-950/5 hover:text-zinc-950 dark:text-zinc-50/60 dark:hover:bg-zinc-50/5 dark:hover:text-zinc-50"
            asChild
          >
            <Link href="/auth/v3/login">Sign in</Link>
          </Button>
          <Button
            size="sm"
            className="rounded-full border border-zinc-950/10 bg-zinc-950/5 font-mono-tight text-xs text-zinc-950 hover:bg-zinc-950/10 dark:border-zinc-50/10 dark:bg-zinc-50/5 dark:text-zinc-50 dark:hover:bg-zinc-50/10"
            asChild
          >
            <Link href="/auth/v3/signup">Get started</Link>
          </Button>
        </div>
      </div>
    </header>
  );
};
