"use server";

import { redirect } from "next/navigation";

import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

// ─── Shared schema ────────────────────────────────────────────────────────────

const projectNameSchema = z.string().min(1).max(100).trim();

const CreateProjectSchema = z.object({ name: projectNameSchema });

const WizardProjectSchema = z.object({
  name: projectNameSchema,
  app_type: z.string().optional(),
  is_new_app: z.boolean().optional(),
});

// ─── Private helper ───────────────────────────────────────────────────────────

async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return { supabase, user };
}

// ─── Actions ──────────────────────────────────────────────────────────────────

export async function createProject(formData: FormData) {
  const { name } = CreateProjectSchema.parse({ name: formData.get("name") });
  const { supabase, user } = await getAuthenticatedUser();

  const { data, error } = await supabase.from("projects").insert({ name, owner_id: user.id }).select("id").single();

  if (error) throw new Error(error.message);
  redirect(`/dashboard/canvas/${data.id}`);
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
