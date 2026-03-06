import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";

import { RecommendationBadge } from "./recommendation-badge";

const TECH_OPTIONS = [
  "React",
  "Next.js",
  "Vue",
  "Angular",
  "Svelte",
  "Node.js",
  "Python",
  "Go",
  "Rust",
  "Java",
  "TypeScript",
  "GraphQL",
  "REST API",
  "PostgreSQL",
  "MySQL",
  "MongoDB",
  "SQLite",
  "Redis",
  "Kafka",
  "RabbitMQ",
  "Docker",
  "Kubernetes",
  "AWS",
  "GCP",
  "Azure",
  "Terraform",
  "GitHub Actions",
];

type Props = {
  selected: string[];
  recommended: string[];
  recommendedReason?: string;
  recommendationLoading: boolean;
  onChange: (stack: string[]) => void;
  onContinue: () => void;
};

export function StepTechStack({
  selected,
  recommended,
  recommendedReason,
  recommendationLoading,
  onChange,
  onContinue,
}: Props) {
  const toggle = (tech: string) => {
    onChange(selected.includes(tech) ? selected.filter((t) => t !== tech) : [...selected, tech]);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h2 className="font-semibold text-foreground text-xl tracking-tight">Tech stack</h2>
        <p className="mt-1.5 text-muted-foreground text-sm">Select all that apply. AI pre-selected recommendations.</p>
      </div>

      {recommended.length > 0 && (
        <div className="flex items-center gap-2 rounded-lg border border-violet-500/20 bg-violet-500/5 px-3 py-2">
          <RecommendationBadge loading={recommendationLoading} reason={recommendedReason} />
          <span className="text-muted-foreground text-xs">{recommended.join(", ")}</span>
        </div>
      )}
      {recommendationLoading && recommended.length === 0 && (
        <div className="flex items-center gap-2 rounded-lg border border-violet-500/20 bg-violet-500/5 px-3 py-2">
          <RecommendationBadge loading={true} />
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {TECH_OPTIONS.map((tech) => {
          const isSelected = selected.includes(tech);
          const isRec = recommended.includes(tech);
          return (
            <button
              key={tech}
              type="button"
              onClick={() => toggle(tech)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-all duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isSelected
                  ? "border-blue-500/50 bg-blue-500/15 text-blue-300"
                  : isRec
                    ? "border-violet-500/40 bg-violet-500/10 text-violet-300 hover:bg-violet-500/20"
                    : "border-foreground/10 bg-card/50 text-muted-foreground hover:border-foreground/20 hover:text-foreground",
              )}
            >
              {tech}
            </button>
          );
        })}
      </div>

      <motion.button
        type="button"
        onClick={onContinue}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3",
          "bg-foreground text-background font-medium text-sm",
          "transition-all duration-300 hover:opacity-90",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
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
