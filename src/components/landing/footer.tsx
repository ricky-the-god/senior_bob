"use client";

import Link from "next/link";

import { motion, useReducedMotion } from "framer-motion";

import { TextHoverEffect } from "@/components/ui/text-hover-effect";

const FOOTER_LINKS = [
  {
    label: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Process", href: "#how-it-works" },
      { label: "Use Cases", href: "#use-cases" },
      { label: "Open Canvas", href: "/dashboard" },
    ],
  },
  {
    label: "Resources",
    links: [
      { label: "Documentation", href: "#" },
      { label: "Examples", href: "#" },
      { label: "Changelog", href: "#" },
      { label: "Help & Support", href: "#" },
    ],
  },
  {
    label: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
    ],
  },
] as const;

const SOCIAL_LINKS = [
  {
    label: "GitHub",
    href: "https://github.com",
    icon: (
      <svg aria-hidden="true" className="size-4" fill="currentColor" viewBox="0 0 24 24">
        <path
          fillRule="evenodd"
          d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    label: "X / Twitter",
    href: "https://x.com",
    icon: (
      <svg aria-hidden="true" className="size-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com",
    icon: (
      <svg aria-hidden="true" className="size-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    label: "Email",
    href: "mailto:hello@seniorbob.dev",
    icon: (
      <svg
        aria-hidden="true"
        className="size-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
        />
      </svg>
    ),
  },
] as const;

type FadeInProps = {
  delay?: number;
  className?: string;
  children: React.ReactNode;
};

const FadeIn = ({ delay = 0, className, children }: FadeInProps) => {
  const shouldReduceMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
};

export const Footer = () => {
  return (
    <footer className="relative border-zinc-950/10 border-t dark:border-zinc-50/10">
      <div className="mx-auto max-w-7xl px-6 py-16">
        {/* Top row — brand + columns */}
        <div className="grid grid-cols-2 gap-10 md:grid-cols-[1.5fr_repeat(3,1fr)] md:gap-8">
          {/* Brand column */}
          <FadeIn delay={0} className="col-span-2 md:col-span-1">
            <Link
              href="/"
              className="mb-4 inline-flex items-center gap-3 transition-opacity hover:opacity-80"
              aria-label="SeniorBob home"
            >
              <div className="flex size-7 items-center justify-center rounded-lg border border-zinc-950/10 bg-zinc-950/5 dark:border-zinc-50/10 dark:bg-zinc-50/5">
                <svg
                  aria-hidden="true"
                  className="size-3.5 text-primary"
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
              <span className="font-mono-tight text-sm text-zinc-950 dark:text-zinc-50">seniorbob</span>
            </Link>

            <p className="mb-6 max-w-[220px] font-mono-tight text-xs leading-relaxed text-zinc-950/40 dark:text-zinc-50/40">
              Visual architecture for engineers who think in diagrams.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-3">
              {SOCIAL_LINKS.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  target={item.href.startsWith("http") ? "_blank" : undefined}
                  rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  aria-label={item.label}
                  className="flex size-7 items-center justify-center rounded-md border border-zinc-950/[0.08] bg-transparent text-zinc-950/40 transition-colors hover:border-zinc-950/20 hover:text-zinc-950/80 dark:border-zinc-50/[0.08] dark:text-zinc-50/40 dark:hover:border-zinc-50/20 dark:hover:text-zinc-50/80"
                >
                  {item.icon}
                </Link>
              ))}
            </div>
          </FadeIn>

          {/* Link columns */}
          {FOOTER_LINKS.map((group, groupIndex) => (
            <FadeIn key={group.label} delay={(groupIndex + 1) * 0.06}>
              <p className="mb-4 font-mono-tight text-[11px] text-zinc-950/30 uppercase tracking-wider dark:text-zinc-50/30">
                {group.label}
              </p>
              <ul className="space-y-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="font-mono-tight text-xs text-zinc-950/50 transition-colors hover:text-zinc-950/90 dark:text-zinc-50/50 dark:hover:text-zinc-50/90"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </FadeIn>
          ))}
        </div>

        {/* Brand accent — neon "Seniorbob" text effect */}
        <div aria-hidden="true" className="relative -mx-6 mb-6 hidden h-36 overflow-hidden sm:block">
          <TextHoverEffect text="seniorbob" />
        </div>

        {/* Bottom row */}
        <FadeIn
          delay={0.24}
          className="mt-6 flex flex-col items-center justify-between gap-4 border-zinc-950/[0.08] border-t pt-8 sm:mt-14 sm:flex-row dark:border-zinc-50/[0.08]"
        >
          <p className="font-mono-tight text-[11px] text-zinc-950/25 dark:text-zinc-50/25">
            &copy; {new Date().getFullYear()} SeniorBob. All rights reserved.
          </p>
          <span className="font-mono-tight text-[11px] text-zinc-950/25 dark:text-zinc-50/25">
            Built for engineers who ship.
          </span>
        </FadeIn>
      </div>
    </footer>
  );
};
