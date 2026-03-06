import type { LucideIcon } from "lucide-react";
import { Building2, Globe, Rocket, User, Users } from "lucide-react";

import type { UserScaleId } from "@/lib/project-types";

import { WizardOptionCard } from "./wizard-option-card";
import type { RecommendationProps } from "./wizard-types";

const SCALE_OPTIONS: { id: UserScaleId; label: string; subtitle: string; Icon: LucideIcon }[] = [
  { id: "solo", label: "Solo / hobby", subtitle: "Just me", Icon: User },
  { id: "small-team", label: "Small team", subtitle: "2–10 users", Icon: Users },
  { id: "startup", label: "Startup", subtitle: "10K–100K users", Icon: Rocket },
  { id: "scale", label: "Scale-up", subtitle: "100K–1M users", Icon: Building2 },
  { id: "enterprise", label: "Enterprise", subtitle: "1M+ users", Icon: Globe },
];

type Props = RecommendationProps<UserScaleId> & {
  onSelect: (scale: UserScaleId) => void;
};

export function StepUserScale({ recommended, recommendedReason, recommendationLoading, onSelect }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h2 className="font-semibold text-foreground text-xl tracking-tight">Expected scale</h2>
        <p className="mt-1.5 text-muted-foreground text-sm">Who will use this system?</p>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {SCALE_OPTIONS.map(({ id, label, subtitle, Icon }) => (
          <WizardOptionCard
            key={id}
            label={label}
            subtitle={subtitle}
            Icon={Icon}
            isRecommended={recommended === id}
            recommendationLoading={recommendationLoading}
            recommendedReason={recommendedReason}
            onClick={() => onSelect(id)}
          />
        ))}
      </div>
    </div>
  );
}
