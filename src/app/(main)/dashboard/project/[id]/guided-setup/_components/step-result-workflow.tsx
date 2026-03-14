import type { GuidedSetupWorkflow } from "@/lib/project-types";

import { Section } from "./result-atoms";

export function WorkflowResult({ data }: { data: GuidedSetupWorkflow }) {
  return (
    <div className="flex flex-col gap-3">
      <Section label="Main Goal" text={data.mainGoal} />
      <Section label="Primary Flow" text={data.mainFlow} />
    </div>
  );
}
