import { cache } from "react";

import { createClient } from "@/lib/supabase/server";

export const getDiagram = cache(async (projectId: string, type: string) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // Verify the project is owned by the calling user before fetching the diagram
  const { data: project } = await supabase
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .eq("owner_id", user.id)
    .single();
  if (!project) return null;

  const { data } = await supabase
    .from("diagrams")
    .select("id, data")
    .eq("project_id", projectId)
    .eq("type", type)
    .maybeSingle();
  return data; // null if no diagram yet
});
