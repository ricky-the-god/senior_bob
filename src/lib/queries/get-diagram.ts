import { cache } from "react";

import { createClient } from "@/lib/supabase/server";

export const getDiagram = cache(async (projectId: string, type: string) => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("diagrams")
    .select("id, data")
    .eq("project_id", projectId)
    .eq("type", type)
    .maybeSingle();
  return data; // null if no diagram yet
});
