import type { ArchitectureDraft, InferredNeeds, ProjectMeta } from "@/lib/project-types";

import { classifyProject } from "./classify";

export function deriveInferredNeeds(meta: ProjectMeta): InferredNeeds {
  const s = classifyProject(meta);
  const features = s.allFeatures;

  return {
    needsAuth: s.hasAuth,
    needsPayments: s.hasPayments,
    needsFileStorage: s.hasFileUpload,
    needsAiIntegration: s.isAiApp,
    needsAsyncJobs: features.some((f) => f.includes("notification") || f.includes("email") || f.includes("report")),
    needsRealtime:
      meta.app_type === "realtime" ||
      features.some((f) => f.includes("realtime") || f.includes("live") || f.includes("websocket")),
    needsSearch: features.some((f) => f.includes("search") || f.includes("filter")),
    needsAdminPanel: features.some((f) => f.includes("admin")),
    needsNotifications: features.some((f) => f.includes("notification") || f.includes("push") || f.includes("alert")),
    needsExternalApi: features.some((f) => f.includes("api") || f.includes("integration")) || s.tools.length > 0,
  };
}

export function deriveArchitectureDraft(meta: ProjectMeta): ArchitectureDraft {
  const s = classifyProject(meta);
  const needs = deriveInferredNeeds(meta);

  const style: ArchitectureDraft["style"] =
    meta.app_type === "microservices" || meta.infra === "microservices"
      ? "microservices"
      : meta.infra === "serverless"
        ? "serverless"
        : "modular-monolith";

  const components: string[] = ["API Layer", "Database"];
  if (needs.needsAuth) components.push("Auth Service");
  if (needs.needsPayments) components.push("Payment Handler");
  if (needs.needsFileStorage) components.push("File Storage");
  if (needs.needsAiIntegration) components.push("LLM Gateway");
  if (needs.needsAsyncJobs) components.push("Background Jobs");
  if (needs.needsRealtime) components.push("WebSocket Gateway");
  if (needs.needsSearch) components.push("Search Index");
  if (needs.needsAdminPanel) components.push("Admin Panel");
  if (needs.needsNotifications) components.push("Notification Service");

  const featureSummary = (
    [
      needs.needsAuth && "auth",
      needs.needsPayments && "payments",
      needs.needsAiIntegration && "AI generation",
      needs.needsFileStorage && "file storage",
      needs.needsRealtime && "real-time",
    ] as (string | false)[]
  )
    .filter(Boolean)
    .join(", ");

  const appLabel = meta.app_type ?? "app";
  const summary = featureSummary ? `A ${style} ${appLabel} with ${featureSummary}.` : `A ${style} ${appLabel}.`;

  return { style, biasMonolith: s.biasMonolith, components, summary };
}
