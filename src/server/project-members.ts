"use server";

import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const emailSchema = z.string().email();

async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return { supabase, user };
}

export async function addMember(projectId: string, email: string) {
  const parsed = emailSchema.parse(email);
  const { supabase } = await getAuthenticatedUser();

  // Look up the user by email via the admin API is not available client-side.
  // We use a Supabase RPC function "get_user_id_by_email" that must be created.
  // For now, insert optimistically and let DB constraints catch invalid user_ids.
  const { data: userData, error: userError } = await supabase.rpc("get_user_id_by_email", { email: parsed });
  if (userError || !userData) throw new Error("User not found with that email.");

  const { error } = await supabase
    .from("project_members")
    .insert({ project_id: projectId, user_id: userData, role: "member" });
  if (error) throw new Error(error.message);
}

export async function removeMember(memberId: string) {
  const { supabase, user } = await getAuthenticatedUser();

  // Verify requester owns the project via RLS policy
  const { error } = await supabase.from("project_members").delete().eq("id", memberId);
  if (error) throw new Error(error.message);
  void user; // used by getAuthenticatedUser for auth guard
}
