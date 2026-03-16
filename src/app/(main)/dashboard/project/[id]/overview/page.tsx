import { formatDistanceToNow } from "date-fns";
import { Building2, Sparkles } from "lucide-react";

import { APP_TYPE_MAP, parseProjectMeta } from "@/lib/project-types";
import { getProject } from "@/lib/queries/get-project";
import { getProjectMembers } from "@/lib/queries/get-project-members";
import { createClient } from "@/lib/supabase/server";

import { DangerZone } from "./_components/danger-zone";
import { DescriptionSection } from "./_components/description-section";
import { ProjectHeader } from "./_components/project-header";
import { ReleasesSection } from "./_components/releases-section";
import { RequirementsCard } from "./_components/requirements-card";
import { SprintsSection } from "./_components/sprints-section";
import { TeamSection } from "./_components/team-section";
import { TechStackSection } from "./_components/tech-stack-section";

type Props = {
  params: Promise<{ id: string }>;
};

// ─── Snapshot card ────────────────────────────────────────────────────────────

function SnapshotCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 text-center">
      <p className="text-2xl font-semibold text-foreground">{value}</p>
      <p className="mt-0.5 text-muted-foreground text-xs">{label}</p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function OverviewPage({ params }: Props) {
  const { id } = await params;

  const [project, members, supabase] = await Promise.all([
    getProject(id),
    getProjectMembers(id).catch(() => []),
    createClient(),
  ]);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isOwner = !!user && project?.owner_id === user.id;

  const meta = parseProjectMeta(project?.description ?? null);

  const appType = meta.app_type ? (APP_TYPE_MAP[meta.app_type] ?? null) : null;

  const guidedSetup = meta.guided_setup ?? null;
  const allGuidedSetupComplete =
    !!guidedSetup?.workflow?.completed && !!guidedSetup?.features?.completed && !!guidedSetup?.integrations?.completed;

  return (
    <div className="flex flex-1 flex-col gap-8 overflow-y-auto p-6 max-w-6xl mx-auto w-full">
      {/* 1. Hero */}
      <div className="space-y-4">
        <ProjectHeader projectId={id} name={project?.name ?? "Project"} bio={meta.bio ?? null} />

        {/* Metadata badges */}
        <div className="flex flex-wrap items-center gap-2">
          {appType && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-2.5 py-1 text-xs text-muted-foreground">
              <appType.Icon className="size-3.5" />
              {appType.label}
            </span>
          )}
          {meta.is_new_app !== null && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-2.5 py-1 text-xs text-muted-foreground">
              {meta.is_new_app ? (
                <>
                  <Sparkles className="size-3.5" />
                  Brand new app
                </>
              ) : (
                <>
                  <Building2 className="size-3.5" />
                  Existing app
                </>
              )}
            </span>
          )}
          {project?.created_at && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-2.5 py-1 text-xs text-muted-foreground">
              Created {formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}
            </span>
          )}
          {project?.updated_at && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-2.5 py-1 text-xs text-muted-foreground">
              Updated {formatDistanceToNow(new Date(project.updated_at), { addSuffix: true })}
            </span>
          )}
        </div>
      </div>

      {/* 2. Requirements card */}
      <RequirementsCard projectId={id} guidedSetup={guidedSetup} allComplete={allGuidedSetupComplete} />

      {/* 3. Snapshot row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SnapshotCard
          label="Features"
          value={(guidedSetup?.features?.selected?.length ?? 0) + (guidedSetup?.features?.custom?.length ?? 0)}
        />
        <SnapshotCard label="Integrations" value={guidedSetup?.integrations?.tools?.length ?? 0} />
        <SnapshotCard label="Sprints" value={meta.task_sprints?.length ?? 0} />
        <SnapshotCard label="Team" value={members.length} />
      </div>

      {/* 4. 2-column grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left column */}
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-5">
            <TechStackSection projectId={id} techStack={meta.tech_stack ?? []} />
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <SprintsSection taskSprints={meta.task_sprints ?? []} />
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <ReleasesSection projectId={id} releases={meta.releases ?? []} />
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-5">
            <TeamSection projectId={id} members={members} isOwner={isOwner} />
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <DescriptionSection projectId={id} description={meta.wizard_description ?? null} />
          </div>
        </div>
      </div>

      {/* 5. Danger Zone */}
      {isOwner && (
        <div className="border-t border-border pt-6">
          <DangerZone projectId={id} projectName={project?.name ?? "Project"} />
        </div>
      )}
    </div>
  );
}
