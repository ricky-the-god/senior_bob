import { useState } from "react";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";

const MAX_CHARS = 1000;

type Props = {
  onContinue: (description: string) => void;
};

export function StepDescription({ onContinue }: Props) {
  const [value, setValue] = useState("");
  const remaining = MAX_CHARS - value.length;
  const isValid = value.trim().length >= 10;

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h2 className="font-semibold text-foreground text-xl tracking-tight">Describe your project</h2>
        <p className="mt-1.5 text-muted-foreground text-sm">
          A few sentences — the AI will use this to pre-fill every step
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value.slice(0, MAX_CHARS))}
          placeholder="e.g. A SaaS platform for freelance designers to manage client projects, invoices, and contracts…"
          rows={5}
          className={cn(
            "w-full resize-none rounded-xl border border-foreground/10 bg-card/50 px-4 py-3",
            "text-foreground text-sm placeholder:text-muted-foreground/40",
            "outline-none transition-all duration-150",
            "focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20",
          )}
        />
        <p className={cn("text-right text-xs", remaining < 50 ? "text-amber-400" : "text-muted-foreground/40")}>
          {remaining} chars left
        </p>
      </div>

      <motion.button
        type="button"
        disabled={!isValid}
        onClick={() => isValid && onContinue(value.trim())}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3",
          "bg-foreground text-background font-medium text-sm",
          "transition-all duration-300 hover:opacity-90",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "disabled:pointer-events-none disabled:opacity-40",
        )}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        Continue
        <ArrowRight className="size-4" />
      </motion.button>
    </div>
  );
}
