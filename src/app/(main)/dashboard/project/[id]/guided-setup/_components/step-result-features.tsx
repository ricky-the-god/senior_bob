import type { GuidedSetupFeatures } from "@/lib/project-types";

import { Chip } from "./result-atoms";

export function FeaturesResult({ data }: { data: GuidedSetupFeatures }) {
  const all = [...data.selected, ...data.custom];
  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Core Features</p>
        {all.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {all.map((f) => (
              <Chip key={f} label={f} />
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground/60">None</p>
        )}
      </div>
    </div>
  );
}
