"use server";

import { redirect } from "next/navigation";

import { z } from "zod";

import { APP_TYPE_IDS, type ProjectMeta } from "@/lib/project-types";

import { getAuthenticatedUser } from "./auth";

// ─── Shared schema ────────────────────────────────────────────────────────────

const projectNameSchema = z.string().min(1).max(100).trim();

const CreateProjectSchema = z.object({ name: projectNameSchema });

const WizardProjectSchema = z.object({
  name: projectNameSchema,
  app_type: z.enum(APP_TYPE_IDS).optional(),
  is_new_app: z.boolean().optional(),
});

// ─── Actions ──────────────────────────────────────────────────────────────────

export async function createProject(formData: FormData) {
  const { name } = CreateProjectSchema.parse({ name: formData.get("name") });
  const { supabase, user } = await getAuthenticatedUser();

  const { data, error } = await supabase.from("projects").insert({ name, owner_id: user.id }).select("id").single();

  if (error) throw new Error(error.message);
  redirect(`/dashboard/project/${data.id}/overview`);
}

export async function createProjectFromWizard(input: z.infer<typeof WizardProjectSchema>): Promise<{ id: string }> {
  const { name, app_type, is_new_app } = WizardProjectSchema.parse(input);
  const description = JSON.stringify({ app_type: app_type ?? null, is_new_app: is_new_app ?? null });
  const { supabase, user } = await getAuthenticatedUser();

  const { data, error } = await supabase
    .from("projects")
    .insert({ name, description, owner_id: user.id })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  return { id: data.id };
}

export async function updateProjectName(id: string, name: string) {
  const parsed = projectNameSchema.parse(name);
  const { supabase, user } = await getAuthenticatedUser();
  const { error } = await supabase.from("projects").update({ name: parsed }).eq("id", id).eq("owner_id", user.id);
  if (error) throw new Error(error.message);
}

export async function updateProjectMeta(id: string, patch: Partial<ProjectMeta>) {
  const { supabase, user } = await getAuthenticatedUser();

  // Fetch current description to merge patch on top
  const { data } = await supabase.from("projects").select("description").eq("id", id).eq("owner_id", user.id).single();

  let current: Partial<ProjectMeta> = {};
  try {
    if (data?.description) current = JSON.parse(data.description) as Partial<ProjectMeta>;
  } catch {
    // malformed — start fresh
  }

  const merged = { ...current, ...patch };
  const { error } = await supabase
    .from("projects")
    .update({ description: JSON.stringify(merged) })
    .eq("id", id)
    .eq("owner_id", user.id);
  if (error) throw new Error(error.message);
}

export async function deleteProject(id: string) {
  const { supabase, user } = await getAuthenticatedUser();
  const { error } = await supabase.from("projects").delete().eq("id", id).eq("owner_id", user.id);
  if (error) throw new Error(error.message);
  redirect("/dashboard/default");
}
