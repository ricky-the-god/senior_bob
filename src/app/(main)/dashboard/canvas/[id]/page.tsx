import { createClient } from "@/lib/supabase/server";

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

  const { data: project } = await supabase.from("projects").select("name, description").eq("id", id).single();

  let meta: ProjectMeta = { app_type: null, is_new_app: null };
  try {
    if (project?.description) {
      meta = JSON.parse(project.description) as ProjectMeta;
    }
  } catch {
    // malformed JSON — use defaults
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <p className="font-medium text-foreground text-sm">{project?.name ?? `Canvas ${id}`}</p>
      {meta.app_type && <p className="text-muted-foreground text-xs capitalize">{meta.app_type.replace("-", " ")}</p>}
      <p className="text-muted-foreground text-xs">Canvas editor coming soon</p>
    </div>
  );
}
