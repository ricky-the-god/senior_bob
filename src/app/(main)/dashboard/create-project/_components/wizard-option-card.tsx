import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

import { RecommendationBadge } from "./recommendation-badge";

const CARD_BASE =
  "relative flex flex-col items-center gap-2 p-3.5 rounded-xl border border-foreground/10 bg-card/50 transition-all duration-150 " +
  "hover:border-blue-500/50 hover:bg-blue-500/5 hover:shadow-blue-500/10 hover:shadow-md " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

type Props = {
  label: string;
  subtitle?: string;
  Icon: LucideIcon;
  isRecommended: boolean;
  recommendationLoading: boolean;
  recommendedReason?: string;
  onClick: () => void;
};

export function WizardOptionCard({
  label,
  subtitle,
  Icon,
  isRecommended,
  recommendationLoading,
  recommendedReason,
  onClick,
}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(CARD_BASE, isRecommended && "border-violet-500/40 bg-violet-500/5 shadow-md shadow-violet-500/10")}
    >
      {isRecommended && (
        <div className="-top-2.5 absolute left-1/2 -translate-x-1/2">
          <RecommendationBadge loading={recommendationLoading} reason={recommendedReason} />
        </div>
      )}
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-foreground/5">
        <Icon className="size-4 text-foreground/70" />
      </div>
      <span className="font-medium text-foreground text-xs leading-tight">{label}</span>
      {subtitle && <span className="text-[10px] text-muted-foreground">{subtitle}</span>}
    </button>
  );
}
