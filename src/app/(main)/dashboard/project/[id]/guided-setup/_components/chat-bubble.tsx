"use client";

import { motion } from "framer-motion";
import { Bot } from "lucide-react";

import { cn } from "@/lib/utils";

type Props = {
  role: "bot" | "user";
  text: string;
};

export function ChatBubble({ role, text }: Props) {
  if (role === "bot") {
    return (
      <motion.div
        className="flex items-start gap-2"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border border-border bg-card">
          <Bot className="size-3.5 text-muted-foreground" />
        </div>
        <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-tl-sm border border-border bg-card px-4 py-2.5 text-foreground/80 text-sm">
          {text}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="flex justify-end"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div
        className={cn(
          "max-w-[85%] self-end whitespace-pre-wrap rounded-2xl rounded-tr-sm bg-foreground/8 px-4 py-2.5 text-foreground text-sm",
        )}
      >
        {text}
      </div>
    </motion.div>
  );
}

// Typing indicator — styled as a pill matching the reference component
export function TypingBubble() {
  return (
    <motion.div
      className="flex justify-center py-1"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div
        className={cn(
          "flex items-center gap-3 rounded-full px-4 py-2 shadow-lg",
          "border backdrop-blur-2xl",
          "bg-black/[0.03] dark:bg-white/[0.02]",
          "border-black/[0.06] dark:border-white/[0.05]",
        )}
      >
        {/* Avatar */}
        <div
          className={cn(
            "flex h-7 w-8 items-center justify-center rounded-full",
            "bg-black/[0.05] dark:bg-white/[0.05]",
          )}
        >
          <span className="mb-0.5 font-medium text-foreground/90 text-xs dark:text-white/90">sb</span>
        </div>
        {/* Label + dots */}
        <div className="flex items-center gap-2 text-foreground/60 text-sm dark:text-white/70">
          <span>Thinking</span>
          <div className="ml-1 flex items-center gap-0.5">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="size-1.5 rounded-full bg-foreground/60 dark:bg-white/90"
                style={{ boxShadow: "0 0 4px rgba(139,92,246,0.4)" }}
                initial={{ opacity: 0.3, scale: 0.85 }}
                animate={{ opacity: [0.3, 0.9, 0.3], scale: [0.85, 1.1, 0.85] }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
