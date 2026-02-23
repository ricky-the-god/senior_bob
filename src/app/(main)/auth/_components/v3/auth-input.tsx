"use client";

import * as React from "react";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

interface AuthInputProps extends React.ComponentProps<"input"> {
  label?: string;
  error?: string;
}

const AuthInput = React.forwardRef<HTMLInputElement, AuthInputProps>(
  ({ className, type, label, error, id, name, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    // Use provided id, or name (from react-hook-form), or generate one
    const inputId = id || (name ? `auth-input-${name}` : undefined);

    return (
      <motion.div
        className="relative w-full"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              "mb-2 block font-[var(--font-roboto)] font-medium text-xs uppercase tracking-wide transition-colors duration-200",
              isFocused ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {label}
          </label>
        )}
        <div className="relative">
          {/* Glow effect on focus */}
          <motion.div
            className="-inset-px pointer-events-none absolute rounded-lg"
            initial={false}
            animate={{
              boxShadow: isFocused ? "0 0 0 1px var(--ring), 0 0 20px -5px var(--ring)" : "0 0 0 0.5px var(--border)",
              opacity: isFocused ? 1 : 0.6,
            }}
            transition={{ duration: 0.2 }}
          />
          <input
            id={inputId}
            name={name}
            type={type}
            ref={ref}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            className={cn(
              // Base styles
              "relative w-full rounded-lg bg-transparent px-4 py-3",
              // Typography
              "font-[var(--font-roboto)] text-foreground text-sm placeholder:text-muted-foreground/50",
              // Ultra-thin border (0.5px simulated)
              "border-[0.5px] border-border/50",
              // Background with subtle transparency
              "bg-card/30 backdrop-blur-sm",
              // Focus states (handled by glow)
              "outline-none focus:border-ring/50",
              // Transitions
              "transition-all duration-200",
              // Error state
              error && "border-destructive/50 focus:border-destructive",
              className,
            )}
            {...props}
          />
        </div>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 font-[var(--font-roboto)] text-destructive text-xs"
          >
            {error}
          </motion.p>
        )}
      </motion.div>
    );
  },
);

AuthInput.displayName = "AuthInput";

export { AuthInput };
