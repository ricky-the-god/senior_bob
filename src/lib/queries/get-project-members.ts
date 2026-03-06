import { createClient } from "@/lib/supabase/server";

export type ProjectMember = {
  id: string;
  role: "owner" | "member" | "viewer";
  user_id: string;
  email: string;
  name: string | null;
  avatar: string | null;
};

export async function getProjectMembers(projectId: string): Promise<ProjectMember[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("project_members")
    .select("id, role, user_id, user:user_id(email, raw_user_meta_data)")
    .eq("project_id", projectId);

  if (error || !data) return [];

  return data.map((row) => {
    const user = row.user as unknown as {
      email: string;
      raw_user_meta_data?: { full_name?: string; avatar_url?: string };
    } | null;
    return {
      id: row.id,
      role: row.role as ProjectMember["role"],
      user_id: row.user_id,
      email: user?.email ?? "",
      name: user?.raw_user_meta_data?.full_name ?? null,
      avatar: user?.raw_user_meta_data?.avatar_url ?? null,
    };
  });
}
