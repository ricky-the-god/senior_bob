"use server";

import { z } from "zod";

import { getAuthenticatedUser } from "./auth";

const SaveDiagramSchema = z.object({
  projectId: z.string().uuid(),
  type: z.string().min(1).max(50),
});

export async function saveDiagram(projectId: string, type: string, data: object) {
  // Validate inputs before authenticating (fail fast)
  const { projectId: pid, type: diagramType } = SaveDiagramSchema.parse({ projectId, type });

  const { supabase, user } = await getAuthenticatedUser();

  // Verify ownership — defense-in-depth on top of RLS
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id")
    .eq("id", pid)
    .eq("owner_id", user.id)
    .single();

  if (projectError || !project) throw new Error("Project not found or unauthorized");

  const { error } = await supabase
    .from("diagrams")
    .upsert(
      { project_id: pid, type: diagramType, data, updated_at: new Date().toISOString() },
      { onConflict: "project_id,type" },
    );

  if (error) throw new Error(error.message);
}
