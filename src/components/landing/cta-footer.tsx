"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";

export const CTAFooter = () => {
  return (
    <section className="relative px-6 py-32">
      {/* Ambient glow */}
      <div className="-translate-x-1/2 pointer-events-none absolute bottom-0 left-1/2 translate-y-1/2">
        <div className="h-[400px] w-[600px] rounded-full bg-primary/15 blur-[180px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        {/* CTA */}
        <h2 className="mb-6 font-normal text-3xl text-editorial text-zinc-950 leading-tight tracking-tight md:text-4xl lg:text-5xl dark:text-zinc-50">
          Ready to architect?
        </h2>
        <p className="mb-10 text-base text-zinc-950/50 md:text-lg dark:text-zinc-50/50">
          Start designing your system architecture today.
          <br />
          No credit card required.
        </p>

        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <Button
            size="lg"
            className="h-11 rounded-full border border-zinc-950/10 bg-zinc-950 px-6 font-normal text-sm text-zinc-50 hover:bg-zinc-950/90 dark:border-zinc-50/10 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-50/90"
            asChild
          >
            <Link href="/auth/v3/signup">
              Get started free
              <svg aria-hidden="true" className="ml-2 size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="h-11 rounded-full border-zinc-950/10 bg-zinc-950/5 px-6 font-normal text-sm text-zinc-950/80 hover:bg-zinc-950/10 hover:text-zinc-950 dark:border-zinc-50/10 dark:bg-zinc-50/5 dark:text-zinc-50/80 dark:hover:bg-zinc-50/10 dark:hover:text-zinc-50"
            asChild
          >
            <Link href="https://github.com" target="_blank">
              <svg aria-hidden="true" className="mr-2 size-4" fill="currentColor" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clipRule="evenodd"
                />
              </svg>
              View on GitHub
            </Link>
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 mx-auto mt-32 max-w-7xl border-zinc-950/10 border-t pt-12 dark:border-zinc-50/10">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          {/* Logo */}
          <div className="flex items-center gap-3">
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
            <span className="font-mono-tight text-xs text-zinc-950/60 dark:text-zinc-50/60">seniorbob</span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 font-mono-tight text-xs text-zinc-950/40 dark:text-zinc-50/40">
            <Link href="#" className="transition-colors hover:text-zinc-950/80 dark:hover:text-zinc-50/80">
              Privacy
            </Link>
            <Link href="#" className="transition-colors hover:text-zinc-950/80 dark:hover:text-zinc-50/80">
              Terms
            </Link>
            <Link href="#" className="transition-colors hover:text-zinc-950/80 dark:hover:text-zinc-50/80">
              Contact
            </Link>
          </div>

          {/* Copyright */}
          <p className="font-mono-tight text-xs text-zinc-950/30 dark:text-zinc-50/30">
            &copy; {new Date().getFullYear()} SeniorBob
          </p>
        </div>
      </footer>
    </section>
  );
};
