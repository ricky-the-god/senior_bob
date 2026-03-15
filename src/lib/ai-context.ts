import type { SupabaseClient } from "@supabase/supabase-js";

import { parseProjectMeta } from "./project-types";

// Intentional subset of GuidedSetupData — omits the UI-only `completed` flag so this type
// is compatible with both the full ProjectMeta (server-fetched) and Zod-parsed API payloads
// (which never include `completed`). GuidedSetupData cannot be used directly here because
// its sub-types require `completed: boolean`.
type SetupWorkflow = { mainGoal: string; mainFlow: string };
type SetupFeatures = { selected: string[]; custom: string[] };
type SetupIntegrations = { tools: string[]; constraints?: string | null; stackPreference?: string | null };

export type PartialGuidedSetup = {
  workflow?: SetupWorkflow;
  features?: SetupFeatures;
  integrations?: SetupIntegrations;
};

export function buildRequirementsBlock(setup: PartialGuidedSetup): string {
  const lines: string[] = ["## Project Requirements"];
  if (setup.workflow) {
    lines.push(`- Main Goal: ${setup.workflow.mainGoal}`);
    lines.push(`- Primary Flow: ${setup.workflow.mainFlow}`);
  }
  if (setup.features) {
    const all = [...setup.features.selected, ...setup.features.custom];
    if (all.length) lines.push(`- Features: ${all.join(", ")}`);
  }
  if (setup.integrations) {
    if (setup.integrations.tools.length) lines.push(`- Integrations: ${setup.integrations.tools.join(", ")}`);
    if (setup.integrations.constraints) lines.push(`- Constraints: ${setup.integrations.constraints}`);
    if (setup.integrations.stackPreference) lines.push(`- Stack Preference: ${setup.integrations.stackPreference}`);
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
  if (!meta.guided_setup) return "";
  return `${buildRequirementsBlock(meta.guided_setup)}\n\nUse these requirements as ground truth when designing the architecture.\n---\n\n`;
}
