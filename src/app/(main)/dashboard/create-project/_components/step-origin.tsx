import { Building2, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

import { RecommendationBadge } from "./recommendation-badge";

const CARD_BASE =
  "relative flex items-center gap-4 p-4 rounded-xl border border-foreground/10 bg-card/50 text-left transition-all duration-150 " +
  "hover:border-blue-500/50 hover:bg-blue-500/5 hover:shadow-blue-500/10 hover:shadow-md " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

type Props = {
  recommended: boolean | null;
  recommendedReason?: string;
  recommendationLoading: boolean;
  onSelect: (isNew: boolean) => void;
};

const OPTIONS = [
  {
    value: true,
    icon: Sparkles,
    title: "Brand new app",
    subtitle: "Start from scratch with a clean slate",
  },
  {
    value: false,
    icon: Building2,
    title: "Existing app",
    subtitle: "Document or redesign an existing system",
  },
] as const;

export function StepOrigin({ recommended, recommendedReason, recommendationLoading, onSelect }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h2 className="font-semibold text-foreground text-xl tracking-tight">What&apos;s your starting point?</h2>
        <p className="mt-1.5 text-muted-foreground text-sm">Tell us about your project origin</p>
      </div>

      <div className="flex flex-col gap-3">
        {OPTIONS.map(({ value, icon: Icon, title, subtitle }) => {
          const isRec = recommended === value;
          return (
            <button
              key={String(value)}
              type="button"
              onClick={() => onSelect(value)}
              className={cn(CARD_BASE, isRec && "border-violet-500/40 bg-violet-500/5")}
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-foreground/5">
                <Icon className="size-5 text-foreground/70" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground text-sm">{title}</p>
                <p className="mt-0.5 text-muted-foreground text-xs">{subtitle}</p>
              </div>
              {isRec && (
                <RecommendationBadge loading={recommendationLoading} reason={recommendedReason} className="shrink-0" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
