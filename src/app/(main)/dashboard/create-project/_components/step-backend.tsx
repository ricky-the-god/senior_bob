import type { LucideIcon } from "lucide-react";
import { Braces, Code2, Coffee, LayoutDashboard, Shield, Zap } from "lucide-react";

import type { BackendId } from "@/lib/project-types";

import { WizardOptionCard } from "./wizard-option-card";
import type { RecommendationProps } from "./wizard-types";

const BACKEND_OPTIONS: { id: BackendId; label: string; subtitle: string; Icon: LucideIcon }[] = [
  { id: "nodejs", label: "Node.js", subtitle: "JS / TypeScript", Icon: Braces },
  { id: "python", label: "Python", subtitle: "FastAPI / Django", Icon: Code2 },
  { id: "go", label: "Go", subtitle: "High performance", Icon: Zap },
  { id: "java-spring", label: "Java / Spring", subtitle: "Enterprise", Icon: Coffee },
  { id: "rust", label: "Rust", subtitle: "Systems-level", Icon: Shield },
  { id: "none", label: "No backend", subtitle: "Frontend only", Icon: LayoutDashboard },
];

type Props = RecommendationProps<BackendId> & {
  onSelect: (backend: BackendId) => void;
};

export function StepBackend({ recommended, recommendedReason, recommendationLoading, onSelect }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h2 className="font-semibold text-foreground text-xl tracking-tight">Backend language</h2>
        <p className="mt-1.5 text-muted-foreground text-sm">Primary server-side language / framework</p>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {BACKEND_OPTIONS.map(({ id, label, subtitle, Icon }) => (
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
