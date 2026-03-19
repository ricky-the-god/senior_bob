"use server";

import { redirect } from "next/navigation";

import { z } from "zod";

import {
  APP_TYPE_IDS,
  BACKEND_IDS,
  type GuidedSetupData,
  INFRA_IDS,
  type ProjectMeta,
  parseProjectMeta,
  USER_SCALE_IDS,
} from "@/lib/project-types";
import { deriveArchitectureDraft, deriveInferredNeeds } from "@/lib/retrieval/derive";

import { getAuthenticatedUser } from "./auth";

// ─── Shared schema ────────────────────────────────────────────────────────────

const projectNameSchema = z.string().min(1).max(100).trim();

const CreateProjectSchema = z.object({ name: projectNameSchema });

const WizardProjectSchema = z.object({
  name: projectNameSchema,
  app_type: z.enum(APP_TYPE_IDS).optional(),
  is_new_app: z.boolean().optional(),
  user_scale: z.enum(USER_SCALE_IDS).optional(),
  infra: z.enum(INFRA_IDS).optional(),
  backend: z.enum(BACKEND_IDS).optional(),
  tech_stack: z.array(z.string().min(1).max(50)).max(20).optional(),
  wizard_description: z.string().max(1000).optional(),
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
  const { name, app_type, is_new_app, user_scale, infra, backend, tech_stack, wizard_description } =
    WizardProjectSchema.parse(input);
  const meta: Partial<ProjectMeta> = {
    app_type: app_type ?? null,
    is_new_app: is_new_app ?? null,
    user_scale: user_scale ?? null,
    infra: infra ?? null,
    backend: backend ?? null,
    tech_stack: tech_stack ?? null,
    wizard_description: wizard_description ?? null,
    bio: null,
    sprints: null,
    releases: null,
  };
  const description = JSON.stringify(meta);
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
  // Validate id before authenticating — fail fast on malformed input
  const { id: pid } = z.object({ id: z.string().uuid() }).parse({ id });
  const { supabase, user } = await getAuthenticatedUser();

  // Fetch current description to merge patch on top
  const { data } = await supabase.from("projects").select("description").eq("id", pid).eq("owner_id", user.id).single();

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
    .eq("id", pid)
    .eq("owner_id", user.id);
  if (error) throw new Error(error.message);
}

// ─── Guided Setup Schemas ─────────────────────────────────────────────────────

const GuidedSetupWorkflowSchema = z.object({
  mainGoal: z.string().min(1).max(2000),
  mainFlow: z.string().min(1).max(2000),
  completed: z.boolean(),
  seniorbobSummary: z.string().max(500).optional(),
});

const GuidedSetupFeaturesSchema = z.object({
  selected: z.array(z.string()).max(20),
  custom: z.array(z.string().max(100)).max(10),
  completed: z.boolean(),
  seniorbobSummary: z.string().max(500).optional(),
});

const GuidedSetupIntegrationsSchema = z.object({
  tools: z.array(z.string().max(50)).max(20),
  constraints: z.string().max(1000),
  stackPreference: z.string().max(500),
  completed: z.boolean(),
  seniorbobSummary: z.string().max(500).optional(),
});

const SaveGuidedSetupStepSchema = z.discriminatedUnion("step", [
  z.object({ step: z.literal("workflow"), data: GuidedSetupWorkflowSchema }),
  z.object({ step: z.literal("features"), data: GuidedSetupFeaturesSchema }),
  z.object({ step: z.literal("integrations"), data: GuidedSetupIntegrationsSchema }),
]);

export async function saveGuidedSetupStep(
  projectId: string,
  input: z.infer<typeof SaveGuidedSetupStepSchema>,
): Promise<void> {
  const { id: pid } = z.object({ id: z.string().uuid() }).parse({ id: projectId });
  const parsed = SaveGuidedSetupStepSchema.parse(input);
  const { supabase, user } = await getAuthenticatedUser();

  const { data } = await supabase.from("projects").select("description").eq("id", pid).eq("owner_id", user.id).single();

  let current: Partial<ProjectMeta> = {};
  try {
    if (data?.description) current = JSON.parse(data.description) as Partial<ProjectMeta>;
  } catch {
    // malformed — start fresh
  }

  const currentSetup: GuidedSetupData = current.guided_setup ?? {};
  const merged: Partial<ProjectMeta> = {
    ...current,
    guided_setup: { ...currentSetup, [parsed.step]: parsed.data },
  };

  let finalMerged = merged;
  if (parsed.step === "integrations") {
    const updatedMeta = parseProjectMeta(JSON.stringify(merged));
    finalMerged = {
      ...merged,
      inferredNeeds: deriveInferredNeeds(updatedMeta),
      architectureDraft: deriveArchitectureDraft(updatedMeta),
    };
  }

  const { error } = await supabase
    .from("projects")
    .update({ description: JSON.stringify(finalMerged) })
    .eq("id", pid)
    .eq("owner_id", user.id);

  if (error) throw new Error(error.message);
}

export async function deleteProject(id: string) {
  const { id: pid } = z.object({ id: z.string().uuid() }).parse({ id });
  const { supabase, user } = await getAuthenticatedUser();
  const { error } = await supabase.from("projects").delete().eq("id", pid).eq("owner_id", user.id);
  if (error) throw new Error(error.message);
  redirect("/dashboard/default");
}
