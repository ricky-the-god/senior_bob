import Link from "next/link";
import { notFound } from "next/navigation";

import { ArrowRight } from "lucide-react";

import { parseProjectMeta } from "@/lib/project-types";
import { getProject } from "@/lib/queries/get-project";

import { StepCard } from "./_components/step-card";
import { FeaturesResult } from "./_components/step-result-features";
import { IntegrationsResult } from "./_components/step-result-integrations";
import { WorkflowResult } from "./_components/step-result-workflow";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function GuidedSetupIndexPage({ params }: Props) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();
  const meta = parseProjectMeta(project.description ?? null);
  const setup = meta.guided_setup ?? {};

  const workflowComplete = !!setup.workflow?.completed;
  const featuresComplete = !!setup.features?.completed;
  const integrationsComplete = !!setup.integrations?.completed;
  const allComplete = workflowComplete && featuresComplete && integrationsComplete;

  const workflowState = workflowComplete ? "completed" : setup.workflow ? "in_progress" : "not_started";
  const featuresState = featuresComplete ? "completed" : setup.features ? "in_progress" : "not_started";
  const integrationsState = integrationsComplete ? "completed" : setup.integrations ? "in_progress" : "not_started";

  return (
    <div className="flex flex-1 flex-col overflow-y-auto p-6">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <div className="space-y-1">
          <h1 className="font-semibold text-foreground text-xl">Guided Setup</h1>
          <p className="text-muted-foreground text-sm">
            Answer a few questions to define your project requirements. Complete each step in order.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <StepCard
            stepNumber={1}
            label="Workflow"
            description="Define the main goal and primary user flow."
            state={workflowState}
            href={`/dashboard/project/${id}/guided-setup/workflow`}
          >
            {workflowComplete && setup.workflow && <WorkflowResult data={setup.workflow} />}
          </StepCard>

          <StepCard
            stepNumber={2}
            label="Features"
            description="Select the core features your product needs."
            state={featuresState}
            href={`/dashboard/project/${id}/guided-setup/features`}
            disabled={!workflowComplete}
          >
            {featuresComplete && setup.features && <FeaturesResult data={setup.features} />}
          </StepCard>

          <StepCard
            stepNumber={3}
            label="Integrations"
            description="Identify external tools and technical constraints."
            state={integrationsState}
            href={`/dashboard/project/${id}/guided-setup/integrations`}
            disabled={!featuresComplete}
          >
            {integrationsComplete && setup.integrations && <IntegrationsResult data={setup.integrations} />}
          </StepCard>
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
