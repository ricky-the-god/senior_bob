import { createClient } from "@/lib/supabase/server";

import { ProjectSidebar } from "./_components/project-sidebar";

type ProjectMeta = {
  app_type: string | null;
  is_new_app: boolean | null;
};

type Props = {
  params: Promise<{ id: string }>;
};

export default async function CanvasPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("name, description, created_at")
    .eq("id", id)
    .single();

  let meta: ProjectMeta = { app_type: null, is_new_app: null };
  try {
    if (project?.description) {
      meta = JSON.parse(project.description) as ProjectMeta;
    }
  } catch {
    // malformed JSON — use defaults
  }

  return (
    <div className="flex h-full gap-4 overflow-hidden">
      {/* Canvas area — React Flow goes here */}
      <div className="flex flex-1 items-center justify-center rounded-xl border border-border border-dashed bg-muted/10">
        <p className="text-muted-foreground text-xs">Canvas editor coming soon</p>
      </div>

      {/* Contextual project sidebar */}
      {project && <ProjectSidebar project={{ name: project.name, created_at: project.created_at }} meta={meta} />}
    </div>
  );
}
