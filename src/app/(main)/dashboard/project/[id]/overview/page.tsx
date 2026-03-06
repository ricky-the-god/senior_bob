import { formatDistanceToNow } from "date-fns";
import { Building2, Sparkles } from "lucide-react";

import { APP_TYPE_MAP, type ProjectMeta } from "@/lib/project-types";
import { getProject } from "@/lib/queries/get-project";
import { getProjectMembers } from "@/lib/queries/get-project-members";
import { createClient } from "@/lib/supabase/server";

import { DangerZone } from "./_components/danger-zone";
import { ProjectHeader } from "./_components/project-header";
import { ReleasesSection } from "./_components/releases-section";
import { SprintsSection } from "./_components/sprints-section";
import { TeamSection } from "./_components/team-section";
import { TechStackSection } from "./_components/tech-stack-section";

type Props = {
  params: Promise<{ id: string }>;
};

// ─── Meta row ─────────────────────────────────────────────────────────────────

function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-border border-b py-3 last:border-0">
      <span className="text-muted-foreground text-xs">{label}</span>
      <div className="flex items-center gap-1.5">{children}</div>
    </div>
  );
}

// ─── Section divider ──────────────────────────────────────────────────────────

function Divider() {
  return <div className="border-border border-t" />;
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

  let meta: ProjectMeta = {
    app_type: null,
    is_new_app: null,
    bio: null,
    tech_stack: null,
    sprints: null,
    releases: null,
  };
  try {
    if (project?.description) {
      meta = { ...meta, ...(JSON.parse(project.description) as Partial<ProjectMeta>) };
    }
  } catch {
    // malformed JSON — use defaults
  }

  const appType = meta.app_type ? (APP_TYPE_MAP[meta.app_type] ?? null) : null;

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto">
      {/* Header — editable name + bio */}
      <ProjectHeader projectId={id} name={project?.name ?? "Project"} bio={meta.bio ?? null} />

      {/* Metadata card */}
      <div className="rounded-xl border border-border bg-card px-4">
        {appType &&
          (() => {
            const { label, Icon } = appType;
            return (
              <MetaRow label="Type">
                <Icon className="size-3.5 text-foreground/50" />
                <span className="text-foreground text-xs">{label}</span>
              </MetaRow>
            );
          })()}

        {meta.is_new_app !== null && (
          <MetaRow label="Origin">
            {meta.is_new_app ? (
              <>
                <Sparkles className="size-3.5 text-foreground/50" />
                <span className="text-foreground text-xs">Brand new app</span>
              </>
            ) : (
              <>
                <Building2 className="size-3.5 text-foreground/50" />
                <span className="text-foreground text-xs">Existing app</span>
              </>
            )}
          </MetaRow>
        )}

        {project?.created_at && (
          <MetaRow label="Created">
            <span className="text-foreground text-xs">
              {formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}
            </span>
          </MetaRow>
        )}

        {project?.updated_at && (
          <MetaRow label="Last updated">
            <span className="text-foreground text-xs">
              {formatDistanceToNow(new Date(project.updated_at), { addSuffix: true })}
            </span>
          </MetaRow>
        )}
      </div>

      <Divider />

      {/* Tech Stack */}
      <TechStackSection projectId={id} techStack={meta.tech_stack ?? []} />

      <Divider />

      {/* Sprints */}
      <SprintsSection projectId={id} sprints={meta.sprints ?? []} />

      <Divider />

      {/* Releases */}
      <ReleasesSection projectId={id} releases={meta.releases ?? []} />

      <Divider />

      {/* Team */}
      <TeamSection projectId={id} members={members} isOwner={isOwner} />

      {isOwner && (
        <>
          <Divider />
          <DangerZone projectId={id} projectName={project?.name ?? "Project"} />
        </>
      )}
    </div>
  );
}
