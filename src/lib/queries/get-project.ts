import { cache } from "react";

import { createClient } from "@/lib/supabase/server";

// React.cache() deduplicates Supabase calls within the same request
// (e.g. layout.tsx + overview/page.tsx both call getProject with the same id)
export const getProject = cache(async (id: string) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("projects")
    .select("id, name, description, created_at, updated_at, owner_id")
    .eq("id", id)
    .eq("owner_id", user.id)
    .single();
  return data;
});
