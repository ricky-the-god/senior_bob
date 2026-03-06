import { formatDistanceToNow } from "date-fns";
import { Building2, Sparkles } from "lucide-react";

import { APP_TYPE_MAP, type ProjectMeta } from "@/lib/project-types";
import { getProject } from "@/lib/queries/get-project";

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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function OverviewPage({ params }: Props) {
  const { id } = await params;
  const project = await getProject(id);

  let meta: ProjectMeta = { app_type: null, is_new_app: null };
  try {
    if (project?.description) {
      meta = JSON.parse(project.description) as ProjectMeta;
    }
  } catch {
    // malformed JSON — use defaults
  }

  const appType = meta.app_type ? (APP_TYPE_MAP[meta.app_type] ?? null) : null;

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto">
      {/* Header */}
      <div>
        <h1 className="font-semibold text-foreground text-lg tracking-tight">{project?.name ?? "Project"}</h1>
        <p className="mt-1 text-muted-foreground text-xs">Project details and metadata</p>
      </div>

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
    </div>
  );
}
