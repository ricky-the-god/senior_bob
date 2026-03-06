import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

type Props = {
  loading: boolean;
  reason?: string;
  className?: string;
};

export function RecommendationBadge({ loading, reason, className }: Props) {
  if (loading) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full border border-violet-500/20 bg-violet-500/10 px-2 py-0.5 text-violet-400 text-xs",
          className,
        )}
      >
        <motion.span
          className="size-1.5 rounded-full bg-violet-400"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
        />
        AI thinking…
      </span>
    );
  }

  return (
    <span
      title={reason}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 text-violet-400 text-xs",
        className,
      )}
    >
      <Sparkles className="size-3" />
      Recommended
    </span>
  );
}
