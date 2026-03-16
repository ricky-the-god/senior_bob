import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  ArchitectureDraft,
  GuidedSetupFeatures,
  GuidedSetupIntegrations,
  GuidedSetupWorkflow,
  InferredNeeds,
} from "./project-types";
import { parseProjectMeta } from "./project-types";
import { classifyProject } from "./retrieval/classify";
import { getPhase1Library, getPhase2Library, getPhase3Library } from "./retrieval/libraries";

export type RetrievalPhase = "guided-setup" | "system-design" | "output-pack";

// Derived from canonical project-types. Omit UI-only flags; `constraints` and `stackPreference`
// are optional here because Zod input schemas from API routes allow undefined for those fields.
type SetupWorkflow = Pick<GuidedSetupWorkflow, "mainGoal" | "mainFlow">;
type SetupFeatures = Pick<GuidedSetupFeatures, "selected" | "custom">;
type SetupIntegrations = Pick<GuidedSetupIntegrations, "tools"> & {
  constraints?: string | null;
  stackPreference?: string | null;
};

export type PartialGuidedSetup = {
  workflow?: SetupWorkflow;
  features?: SetupFeatures;
  integrations?: SetupIntegrations;
};

export type ProjectContext = {
  wizardDescription?: string | null;
  appType?: string | null;
  guidedSetup?: PartialGuidedSetup;
  inferredNeeds?: InferredNeeds | null;
  architectureDraft?: ArchitectureDraft | null;
};

export function buildRequirementsBlock(ctx: ProjectContext): string {
  const lines: string[] = ["## Project Context"];

  if (ctx.wizardDescription) lines.push(`- App Description: ${ctx.wizardDescription}`);
  if (ctx.appType) lines.push(`- App Type: ${ctx.appType}`);

  const setup = ctx.guidedSetup;
  if (setup?.workflow) {
    lines.push(`- Main Goal: ${setup.workflow.mainGoal}`);
    lines.push(`- Primary Flow: ${setup.workflow.mainFlow}`);
  }
  if (setup?.features) {
    const all = [...setup.features.selected, ...setup.features.custom];
    if (all.length) lines.push(`- Features: ${all.join(", ")}`);
  }
  if (setup?.integrations) {
    if (setup.integrations.tools.length) lines.push(`- Integrations: ${setup.integrations.tools.join(", ")}`);
    if (setup.integrations.constraints) lines.push(`- Constraints: ${setup.integrations.constraints}`);
    if (setup.integrations.stackPreference) lines.push(`- Stack Preference: ${setup.integrations.stackPreference}`);
  }
  if (ctx.inferredNeeds) {
    const active = Object.entries(ctx.inferredNeeds)
      .filter(([, v]) => v)
      .map(([k]) => k.replace("needs", "").toLowerCase())
      .join(", ");
    if (active) lines.push(`- Inferred needs: ${active}`);
  }
  if (ctx.architectureDraft) {
    lines.push(`- Architecture recommendation: ${ctx.architectureDraft.summary}`);
    lines.push(`- Components: ${ctx.architectureDraft.components.join(", ")}`);
  }
  return lines.join("\n");
}

/**
 * Fetches guided setup data for a project (with ownership check) and returns a formatted
 * requirements block, or an empty string if the project has no guided setup data.
 */
export async function fetchRequirementsBlock(
  supabase: SupabaseClient,
  projectId: string,
  userId: string,
): Promise<string> {
  const { data } = await supabase
    .from("projects")
    .select("description")
    .eq("id", projectId)
    .eq("owner_id", userId)
    .single();
  if (!data?.description) return "";
  const meta = parseProjectMeta(data.description as string | null);

  const hasContext = meta.wizard_description ?? meta.app_type ?? meta.guided_setup;
  if (!hasContext) return "";

  const block = buildRequirementsBlock({
    wizardDescription: meta.wizard_description,
    appType: meta.app_type,
    guidedSetup: meta.guided_setup ?? undefined,
    inferredNeeds: meta.inferredNeeds,
    architectureDraft: meta.architectureDraft,
  });
  return `${block}\n\nUse the above as ground truth about what the user is building.\n---\n\n`;
}

/**
 * Fetches project context and injects phase-appropriate architectural guidance.
 * Use this instead of `fetchRequirementsBlock` in AI routes.
 */
export async function fetchFullContext(
  supabase: SupabaseClient,
  projectId: string,
  userId: string,
  phase: RetrievalPhase,
): Promise<string> {
  const { data } = await supabase
    .from("projects")
    .select("description")
    .eq("id", projectId)
    .eq("owner_id", userId)
    .single();
  if (!data?.description) return "";

  const meta = parseProjectMeta(data.description as string | null);
  const signals = classifyProject(meta);

  let library = "";
  if (phase === "guided-setup") library = getPhase1Library(signals);
  else if (phase === "system-design") library = getPhase2Library(signals);
  else library = getPhase3Library(signals);

  const requirementsBlock = buildRequirementsBlock({
    wizardDescription: meta.wizard_description,
    appType: meta.app_type,
    guidedSetup: meta.guided_setup ?? undefined,
    inferredNeeds: meta.inferredNeeds,
    architectureDraft: meta.architectureDraft,
  });

  const hasContext = meta.wizard_description ?? meta.app_type ?? meta.guided_setup;
  const reqSection = hasContext
    ? `${requirementsBlock}\n\nUse the above as ground truth about what the user is building.\n---\n\n`
    : "";

  const libSection = library ? `${library}\n---\n\n` : "";

  return `${reqSection}${libSection}`;
}
