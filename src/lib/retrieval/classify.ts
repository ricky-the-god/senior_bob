import type { AppTypeId, InfraId, ProjectMeta, UserScaleId } from "@/lib/project-types";

export type RetrievalSignals = {
  appType: AppTypeId | null;
  allFeatures: string[];
  tools: string[];
  isNewApp: boolean | null;
  infra: InfraId | null;
  userScale: UserScaleId | null;
  // Derived rule flags
  isAiApp: boolean;
  hasAuth: boolean;
  hasPayments: boolean;
  hasFileUpload: boolean;
  isExistingCodebase: boolean;
  biasMonolith: boolean;
};

export function classifyProject(meta: ProjectMeta): RetrievalSignals {
  const allFeatures = [
    ...(meta.guided_setup?.features?.selected ?? []),
    ...(meta.guided_setup?.features?.custom ?? []),
  ].map((f) => f.toLowerCase());

  const tools = (meta.guided_setup?.integrations?.tools ?? []).map((t) => t.toLowerCase());

  const isAiApp =
    allFeatures.some((f) => f.includes("ai") || f.includes("generat")) ||
    tools.some((t) => t.includes("openai") || t.includes("anthropic") || t.includes("groq"));

  const hasAuth = allFeatures.some((f) => f.includes("auth") || f.includes("login") || f.includes("sign"));

  const hasPayments =
    allFeatures.some((f) => f.includes("payment") || f.includes("stripe") || f.includes("billing")) ||
    tools.some((t) => t.includes("stripe"));

  const hasFileUpload = allFeatures.some((f) => f.includes("upload") || f.includes("file") || f.includes("storage"));

  const isExistingCodebase = meta.is_new_app === false;

  const biasMonolith =
    meta.app_type !== "microservices" && meta.infra !== "microservices" && meta.infra !== "containers";

  return {
    appType: meta.app_type,
    allFeatures,
    tools,
    isNewApp: meta.is_new_app,
    infra: meta.infra,
    userScale: meta.user_scale,
    isAiApp,
    hasAuth,
    hasPayments,
    hasFileUpload,
    isExistingCodebase,
    biasMonolith,
  };
}
