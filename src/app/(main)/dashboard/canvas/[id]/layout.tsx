import type { ReactNode } from "react";

import { createClient } from "@/lib/supabase/server";

import { ProjectNav } from "./_components/project-nav";

type Props = {
  children: ReactNode;
  params: Promise<{ id: string }>;
};

export default async function CanvasLayout({ children, params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: project } = await supabase.from("projects").select("name").eq("id", id).single();

  return (
    <div className="flex h-full gap-3 overflow-hidden">
      <ProjectNav id={id} projectName={project?.name ?? "Project"} />
      {children}
    </div>
  );
}
