import type { GuidedSetupIntegrations } from "@/lib/project-types";

import { Chip, Section } from "./result-atoms";

export function IntegrationsResult({ data }: { data: GuidedSetupIntegrations }) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Tools</p>
        {data.tools.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {data.tools.map((t) => (
              <Chip key={t} label={t} />
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground/60">None</p>
        )}
      </div>
      {data.constraints && <Section label="Constraints" text={data.constraints} />}
      {data.stackPreference && <Section label="Stack Preference" text={data.stackPreference} />}
    </div>
  );
}
