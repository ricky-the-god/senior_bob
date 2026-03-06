import Link from "next/link";

import { Plus } from "lucide-react";

import { createClient } from "@/lib/supabase/server";

import { RecentProjectsSection } from "../default/_components/recent-projects-section";

export default async function AllProjectsPage() {
  const supabase = await createClient();

  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, updated_at")
    .order("updated_at", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-semibold text-foreground text-lg tracking-tight">All Projects</h1>
          <p className="mt-0.5 text-muted-foreground text-xs">
            {projects?.length ?? 0} project{(projects?.length ?? 0) !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/dashboard/create-project"
          className="flex items-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-background text-xs font-medium hover:bg-foreground/90 transition-colors"
        >
          <Plus className="size-3.5" />
          New project
        </Link>
      </div>

      <RecentProjectsSection projects={projects ?? []} title="All projects" />
    </div>
  );
}
