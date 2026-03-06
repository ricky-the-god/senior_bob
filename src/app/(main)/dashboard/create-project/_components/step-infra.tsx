import type { LucideIcon } from "lucide-react";
import { Box, Cloud, Container, Network } from "lucide-react";

import type { InfraId } from "@/lib/project-types";

import { WizardOptionCard } from "./wizard-option-card";
import type { RecommendationProps } from "./wizard-types";

const INFRA_OPTIONS: { id: InfraId; label: string; subtitle: string; Icon: LucideIcon }[] = [
  { id: "serverless", label: "Serverless", subtitle: "Functions on demand", Icon: Cloud },
  { id: "containers", label: "Containers", subtitle: "Docker / K8s", Icon: Container },
  { id: "microservices", label: "Microservices", subtitle: "Independent services", Icon: Network },
  { id: "monolith", label: "Monolith", subtitle: "Single deployable", Icon: Box },
];

type Props = RecommendationProps<InfraId> & {
  onSelect: (infra: InfraId) => void;
};

export function StepInfra({ recommended, recommendedReason, recommendationLoading, onSelect }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h2 className="font-semibold text-foreground text-xl tracking-tight">Infrastructure model</h2>
        <p className="mt-1.5 text-muted-foreground text-sm">How will you deploy this system?</p>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {INFRA_OPTIONS.map(({ id, label, subtitle, Icon }) => (
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
