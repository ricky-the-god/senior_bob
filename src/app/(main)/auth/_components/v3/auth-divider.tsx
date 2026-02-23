"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

interface AuthDividerProps {
  text?: string;
  className?: string;
}

export function AuthDivider({ text = "or", className }: AuthDividerProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.3 }}
      className={cn("relative flex items-center py-6", className)}
    >
      <div className="h-[0.5px] flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
      <span className="mx-4 font-[var(--font-roboto)] text-muted-foreground/60 text-xs uppercase tracking-widest">
        {text}
      </span>
      <div className="h-[0.5px] flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
    </motion.div>
  );
}
