import { APP_TYPES, type AppTypeId } from "@/lib/project-types";

import { WizardOptionCard } from "./wizard-option-card";
import type { RecommendationProps } from "./wizard-types";

type Props = RecommendationProps<AppTypeId> & {
  onSelect: (type: AppTypeId) => void;
};

export function StepAppType({ recommended, recommendedReason, recommendationLoading, onSelect }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h2 className="font-semibold text-foreground text-xl tracking-tight">What type of application?</h2>
        <p className="mt-1.5 text-muted-foreground text-sm">Choose the category that best fits your project</p>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {APP_TYPES.map(({ id, label, Icon }) => (
          <WizardOptionCard
            key={id}
            label={label}
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
