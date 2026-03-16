"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import { AnimatePresence, motion } from "framer-motion";

import { AuthCard, SignupForm } from "@/app/(main)/auth/_components/v3";
import { AtcShader } from "@/components/ui/atc-shader";
import { Button } from "@/components/ui/button";
import { ShimmerButton } from "@/components/ui/shimmer-button";

import { ProductPreview } from "./product-preview";

export const Hero = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isExpanded ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isExpanded]);

  return (
    <>
      <section className="relative min-h-screen overflow-hidden px-6 pt-24">
        {/* Cosmos background: micro-dot grid */}
        <div className="pointer-events-none absolute inset-0 bg-cosmos-dots" />

        {/* Cosmos radial gradient flare from top */}
        <div className="pointer-events-none absolute inset-0 bg-cosmos-gradient" />

        {/* Ambient glow — centered above content */}
        <div className="-translate-x-1/2 pointer-events-none absolute top-1/3 left-1/2">
          <div className="h-[500px] w-[500px] rounded-full bg-primary/8 blur-[180px]" />
        </div>

        {/* Main content — centered stacked */}
        <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center pt-8 pb-16">
          {/* Text block */}
          <div className="flex flex-col items-center text-center">
            {/* Version badge */}
            <div className="glass mb-8 inline-flex w-fit items-center gap-3 rounded-full border border-zinc-950/10 px-4 py-2 dark:border-zinc-50/10">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-2 animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-primary" />
              </span>
              <span className="font-mono-tight text-xs text-zinc-950/60 dark:text-zinc-50/60">v1.0 Beta</span>
              <span className="text-zinc-950/20 dark:text-zinc-50/20">|</span>
              <span className="font-mono-tight text-xs text-zinc-950/40 dark:text-zinc-50/40">Now available</span>
            </div>

            {/* Main headline */}
            <h1 className="mb-6 font-normal text-5xl text-editorial text-zinc-950 leading-[1.1] tracking-tight md:text-6xl lg:text-7xl dark:text-zinc-50">
              AI can write the code.
              <br />
              <span className="bg-gradient-to-r from-primary to-amber-500 bg-clip-text font-normal text-transparent dark:to-amber-300">
                SeniorBob makes the project buildable.
              </span>
            </h1>

            {/* Subheadline */}
            <p className="mb-10 max-w-2xl text-base text-zinc-950/50 leading-relaxed md:text-lg dark:text-zinc-50/50">
              Turn vague product ideas into clear requirements, system design, and Claude Code-ready context—so AI can
              build with structure, not guesswork.
            </p>

            {/* CTAs */}
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <div className="relative inline-flex">
                {/* Pill backdrop — morphs into the overlay */}
                {!isExpanded && (
                  <motion.div
                    layoutId="hero-expand"
                    style={{ borderRadius: "100px" }}
                    className="absolute inset-0 bg-zinc-950"
                  />
                )}

                {/* Button fades out on expand */}
                <AnimatePresence>
                  {!isExpanded && (
                    <motion.div
                      key="btn"
                      className="relative z-[1]"
                      exit={{ opacity: 0, transition: { duration: 0.12 } }}
                    >
                      <ShimmerButton
                        background="rgba(0,0,0,1)"
                        shimmerColor="#ffffff"
                        shimmerSize="2px"
                        className="h-11 px-6 font-normal text-sm shadow-2xl"
                        shimmerDuration="2.5s"
                        onClick={() => setIsExpanded(true)}
                      >
                        Get started free
                        <svg
                          aria-hidden="true"
                          className="ml-2 size-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                          />
                        </svg>
                      </ShimmerButton>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <Button
                variant="outline"
                size="lg"
                className="h-11 rounded-full border-zinc-950/10 bg-zinc-950/5 px-6 font-normal text-sm text-zinc-950/80 hover:bg-zinc-950/10 hover:text-zinc-950 dark:border-zinc-50/10 dark:bg-zinc-50/5 dark:text-zinc-50/80 dark:hover:bg-zinc-50/10 dark:hover:text-zinc-50"
                asChild
              >
                <Link href="#how-it-works">How it works</Link>
              </Button>
            </div>

            {/* Tech specs */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 font-mono-tight text-[11px] text-zinc-950/30 uppercase tracking-wider dark:text-zinc-50/30">
              <span className="flex items-center gap-2">
                <span className="size-1 rounded-full bg-primary/60" />
                React Flow
              </span>
              <span className="flex items-center gap-2">
                <span className="size-1 rounded-full bg-primary/60" />
                AI Export
              </span>
              <span className="flex items-center gap-2">
                <span className="size-1 rounded-full bg-primary/60" />
                Real-time
              </span>
              <span className="flex items-center gap-2">
                <span className="size-1 rounded-full bg-primary/60" />
                TypeScript
              </span>
            </div>
          </div>

          {/* Product preview */}
          <div className="mt-16 w-full max-w-5xl">
            <ProductPreview />
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="-translate-x-1/2 absolute bottom-8 left-1/2 z-10">
          <div className="flex flex-col items-center gap-2">
            <span className="font-mono-tight text-[10px] text-zinc-950/20 uppercase tracking-widest dark:text-zinc-50/20">
              Scroll
            </span>
            <div className="h-8 w-px bg-gradient-to-b from-zinc-950/20 to-transparent dark:from-zinc-50/20" />
          </div>
        </div>
      </section>

      {/* Full-screen signup overlay */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            key="overlay"
            layoutId="hero-expand"
            style={{ borderRadius: 20 }}
            animate={{ borderRadius: 0 }}
            className="dark fixed inset-0 z-50 flex flex-col items-center justify-center overflow-y-auto bg-zinc-950"
            transition={{ type: "spring", bounce: 0, duration: 0.5 }}
          >
            <AtcShader />

            {/* Close button */}
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="absolute top-6 right-6 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              aria-label="Close"
            >
              <svg aria-hidden="true" className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Signup form fades in after overlay expands */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="relative z-10 flex w-full justify-center px-6 py-12"
            >
              <AuthCard>
                <SignupForm />
              </AuthCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
