import Link from "next/link";

import { ArrowRight, Lightbulb, Plug, Puzzle, Target } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { GuidedSetupData } from "@/lib/project-types";

interface RequirementsCardProps {
  projectId: string;
  guidedSetup: GuidedSetupData | null;
  allComplete: boolean;
}

function Chip({ label, variant = "primary" }: { label: string; variant?: "primary" | "secondary" }) {
  return variant === "primary" ? (
    <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs text-primary">
      {label}
    </span>
  ) : (
    <span className="inline-flex items-center rounded-full border border-border bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground">
      + {label}
    </span>
  );
}

function SectionRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 flex-shrink-0 rounded-md border border-border bg-card p-1.5">
        <Icon className="size-3.5 text-muted-foreground" />
      </div>
      <div className="min-w-0 space-y-1">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        {children}
      </div>
    </div>
  );
}

export function RequirementsCard({ projectId, guidedSetup, allComplete }: RequirementsCardProps) {
  const hasWorkflow = !!guidedSetup?.workflow;
  const hasFeatures = !!guidedSetup?.features;
  const hasIntegrations = !!guidedSetup?.integrations;
  const hasAnyData = hasWorkflow || hasFeatures || hasIntegrations;

  // Empty state
  if (!hasAnyData) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card/50 p-6">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-lg border border-border bg-card p-2">
              <Lightbulb className="size-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Set up your project requirements</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Answer 3 short questions to define your goal, features, and stack.
              </p>
            </div>
          </div>
          <Button asChild size="sm" variant="outline" className="shrink-0">
            <Link href={`/dashboard/project/${projectId}/guided-setup`}>
              Start Guided Setup <ArrowRight className="ml-1.5 size-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const { workflow, features, integrations } = guidedSetup ?? {};
  const allFeatures = [...(features?.selected ?? [])];
  const customFeatures = features?.custom ?? [];
  const tools = integrations?.tools ?? [];

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-foreground">Requirements</h2>
          {allComplete && (
            <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-500">
              Complete
            </span>
          )}
        </div>
        {!allComplete && (
          <Link
            href={`/dashboard/project/${projectId}/guided-setup`}
            className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Complete setup <ArrowRight className="size-3" />
          </Link>
        )}
      </div>

      <div className="space-y-5">
        {/* Goal */}
        {workflow?.mainGoal && (
          <SectionRow icon={Target} label="What problem does it solve?">
            <p className="text-sm text-foreground">{workflow.mainGoal}</p>
          </SectionRow>
        )}

        {/* User Flow */}
        {workflow?.mainFlow && (
          <SectionRow icon={ArrowRight} label="Main user flow">
            <p className="text-sm leading-relaxed text-muted-foreground">{workflow.mainFlow}</p>
          </SectionRow>
        )}

        {/* Features */}
        {(allFeatures.length > 0 || customFeatures.length > 0) && (
          <SectionRow icon={Puzzle} label="Core features">
            <div className="flex flex-wrap gap-1.5">
              {allFeatures.map((f) => (
                <Chip key={f} label={f} variant="primary" />
              ))}
              {customFeatures.map((f) => (
                <Chip key={f} label={f} variant="secondary" />
              ))}
            </div>
          </SectionRow>
        )}

        {/* Integrations */}
        {tools.length > 0 && (
          <SectionRow icon={Plug} label="Integrations">
            <div className="flex flex-wrap gap-1.5">
              {tools.map((t) => (
                <Chip key={t} label={t} variant="primary" />
              ))}
            </div>
          </SectionRow>
        )}

        {/* Stack & Constraints */}
        {(integrations?.stackPreference || integrations?.constraints) && (
          <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-xs text-muted-foreground space-y-1">
            {integrations.stackPreference && (
              <p>
                <span className="font-medium text-foreground">Stack preference:</span> {integrations.stackPreference}
              </p>
            )}
            {integrations.constraints && (
              <p>
                <span className="font-medium text-foreground">Constraints:</span> {integrations.constraints}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Partial completion banner */}
      {!allComplete && hasAnyData && (
        <div className="mt-5 rounded-lg border border-border bg-muted/20 px-4 py-3">
          <p className="text-xs text-muted-foreground">
            Some steps are still incomplete.{" "}
            <Link
              href={`/dashboard/project/${projectId}/guided-setup`}
              className="font-medium text-foreground underline-offset-2 hover:underline"
            >
              Continue guided setup
            </Link>{" "}
            to fill in the rest.
          </p>
        </div>
      )}
    </div>
  );
}
