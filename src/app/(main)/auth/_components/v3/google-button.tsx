"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

function GoogleLogo({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

interface GoogleButtonProps {
  className?: string;
  isLoading?: boolean;
  onClick?: () => void;
}

export function GoogleButton({ className, isLoading, onClick }: GoogleButtonProps) {
  return (
    <motion.button
      type="button"
      disabled={isLoading}
      onClick={onClick}
      className={cn(
        // Base layout
        "relative flex w-full items-center justify-center gap-3 rounded-lg px-4 py-3.5",
        // Ultra-thin border (0.5px)
        "border-[0.5px] border-foreground/20",
        // Background
        "bg-transparent",
        // Typography
        "font-[var(--font-roboto)] font-medium text-foreground text-sm",
        // Hover and focus states
        "transition-all duration-300",
        "hover:border-foreground/40 hover:bg-foreground/5",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        // Disabled
        "disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      {/* Subtle glow on hover */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-lg opacity-0"
        whileHover={{ opacity: 1 }}
        style={{
          background: "radial-gradient(circle at center, var(--ring) 0%, transparent 70%)",
          filter: "blur(20px)",
        }}
        transition={{ duration: 0.3 }}
      />

      {isLoading ? (
        <motion.div
          className="size-5 rounded-full border-2 border-foreground/20 border-t-foreground"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      ) : (
        <GoogleLogo className="size-5" />
      )}
      <span className="relative">Continue with Google</span>
    </motion.button>
  );
}
