import Link from "next/link";

import { ArrowRight } from "lucide-react";

import { parseProjectMeta } from "@/lib/project-types";
import { getProject } from "@/lib/queries/get-project";

import { StepCard } from "./_components/step-card";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function GuidedSetupIndexPage({ params }: Props) {
  const { id } = await params;
  const project = await getProject(id);
  const meta = parseProjectMeta(project?.description ?? null);
  const setup = meta.guided_setup ?? {};

  const workflowComplete = !!setup.workflow?.completed;
  const featuresComplete = !!setup.features?.completed;
  const integrationsComplete = !!setup.integrations?.completed;
  const allComplete = workflowComplete && featuresComplete && integrationsComplete;

  return (
    <div className="flex flex-1 flex-col overflow-y-auto p-6">
      <div className="mx-auto w-full max-w-2xl space-y-6">
        <div className="space-y-1">
          <h1 className="font-semibold text-foreground text-xl">Guided Setup</h1>
          <p className="text-muted-foreground text-sm">
            Answer a few questions to define your project requirements. Complete each step in order.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <StepCard
            stepNumber={1}
            label="Workflow"
            description="Define the main goal and primary user flow."
            state={workflowComplete ? "completed" : "active"}
            href={`/dashboard/project/${id}/guided-setup/workflow`}
            ctaLabel={!setup.workflow ? "Start" : "Continue"}
            preview={setup.workflow?.mainGoal}
          />
          <StepCard
            stepNumber={2}
            label="Features"
            description="Select the core features your product needs."
            state={featuresComplete ? "completed" : workflowComplete ? "active" : "locked"}
            href={`/dashboard/project/${id}/guided-setup/features`}
            ctaLabel={!setup.features ? "Start" : "Continue"}
            preview={
              setup.features
                ? `${setup.features.selected.length + setup.features.custom.length} features selected`
                : undefined
            }
          />
          <StepCard
            stepNumber={3}
            label="Integrations"
            description="Identify external tools and technical constraints."
            state={integrationsComplete ? "completed" : featuresComplete ? "active" : "locked"}
            href={`/dashboard/project/${id}/guided-setup/integrations`}
            ctaLabel={!setup.integrations ? "Start" : "Continue"}
            preview={setup.integrations?.tools.slice(0, 3).join(", ")}
          />
        </div>

        {allComplete && (
          <div className="flex items-center justify-between rounded-xl border border-blue-500/20 bg-blue-500/5 p-5">
            <div>
              <p className="font-medium text-foreground text-sm">All steps complete</p>
              <p className="mt-0.5 text-muted-foreground text-xs">
                SeniorBob has everything needed to generate your architecture.
              </p>
            </div>
            <Link
              href={`/dashboard/project/${id}/system-design`}
              className="flex shrink-0 items-center gap-1.5 rounded-lg bg-blue-500 px-3.5 py-2 font-medium text-white text-xs transition-colors hover:bg-blue-600"
            >
              System Design <ArrowRight className="size-3.5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
