import type { LucideIcon } from "lucide-react";
import { Code2, GitBranch, LayoutDashboard, Network, Settings2, ShoppingCart, Smartphone, Zap } from "lucide-react";

// ─── App type registry (single source of truth) ───────────────────────────────

export const APP_TYPE_IDS = [
  "saas",
  "mobile",
  "microservices",
  "ecommerce",
  "api",
  "internal",
  "data-pipeline",
  "realtime",
] as const;

export type AppTypeId = (typeof APP_TYPE_IDS)[number];

export type Sprint = {
  id: string;
  name: string;
  completed: number;
  total: number;
};

export type Release = {
  id: string;
  version: string;
  date: string;
  status: "planned" | "in-progress" | "released";
};

export const USER_SCALE_IDS = ["solo", "small-team", "startup", "scale", "enterprise"] as const;
export type UserScaleId = (typeof USER_SCALE_IDS)[number];

export const INFRA_IDS = ["serverless", "containers", "microservices", "monolith"] as const;
export type InfraId = (typeof INFRA_IDS)[number];

export const BACKEND_IDS = ["nodejs", "python", "go", "java-spring", "rust", "none"] as const;
export type BackendId = (typeof BACKEND_IDS)[number];

export type TaskPriority = "critical" | "high" | "medium" | "low";
export type TaskSize = "xs" | "s" | "m" | "l" | "xl";
export type TaskStatus = "todo" | "in-progress" | "done";

export type Task = {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  size: TaskSize;
  component: string;
  status: TaskStatus;
  platform: string; // e.g. "Claude Code", "Terminal", "GitHub", "AWS Console"
};

export type TaskSprint = {
  id: string;
  name: string;
  goal: string;
  tasks: Task[];
};

export type GuidedSetupWorkflow = {
  mainGoal: string;
  mainFlow: string;
  completed: boolean;
  seniorbobSummary?: string;
};

export type GuidedSetupFeatures = {
  selected: string[];
  custom: string[];
  completed: boolean;
  seniorbobSummary?: string;
};

export type GuidedSetupIntegrations = {
  tools: string[];
  constraints: string | null;
  stackPreference: string | null;
  completed: boolean;
  seniorbobSummary?: string;
};

export type GuidedSetupData = {
  workflow?: GuidedSetupWorkflow;
  features?: GuidedSetupFeatures;
  integrations?: GuidedSetupIntegrations;
};

export type InferredNeeds = {
  needsAuth: boolean;
  needsPayments: boolean;
  needsFileStorage: boolean;
  needsAsyncJobs: boolean;
  needsRealtime: boolean;
  needsSearch: boolean;
  needsAdminPanel: boolean;
  needsNotifications: boolean;
  needsAiIntegration: boolean;
  needsExternalApi: boolean;
};

export type ArchitectureDraft = {
  style: "monolith" | "modular-monolith" | "microservices" | "serverless";
  biasMonolith: boolean;
  components: string[];
  summary: string;
};

export type OutputFile = {
  filename: string;
  content: string;
  generated_at: string;
};

export type OutputPack = {
  files: OutputFile[];
  generated_at: string;
};

export type ProjectMeta = {
  app_type: AppTypeId | null;
  is_new_app: boolean | null;
  bio: string | null;
  tech_stack: string[] | null;
  sprints: Sprint[] | null;
  releases: Release[] | null;
  user_scale: UserScaleId | null;
  infra: InfraId | null;
  backend: BackendId | null;
  wizard_description: string | null;
  task_sprints: TaskSprint[] | null;
  guided_setup: GuidedSetupData | null;
  output_pack: OutputPack | null;
  inferredNeeds: InferredNeeds | null;
  architectureDraft: ArchitectureDraft | null;
};

export const DEFAULT_PROJECT_META: ProjectMeta = {
  app_type: null,
  is_new_app: null,
  bio: null,
  tech_stack: null,
  sprints: null,
  releases: null,
  user_scale: null,
  infra: null,
  backend: null,
  wizard_description: null,
  task_sprints: null,
  guided_setup: null,
  output_pack: null,
  inferredNeeds: null,
  architectureDraft: null,
};

export function parseProjectMeta(description: string | null): ProjectMeta {
  if (!description) return { ...DEFAULT_PROJECT_META };
  try {
    const raw = JSON.parse(description) as Partial<ProjectMeta>;
    return { ...DEFAULT_PROJECT_META, ...raw };
  } catch {
    return { ...DEFAULT_PROJECT_META };
  }
}

export type WizardRecommendations = {
  app_type: AppTypeId;
  app_type_reason: string;
  is_new_app: boolean;
  is_new_app_reason: string;
  tech_stack: string[];
  tech_stack_reason: string;
  user_scale: UserScaleId;
  user_scale_reason: string;
  infra: InfraId;
  infra_reason: string;
  backend: BackendId;
  backend_reason: string;
  suggested_name: string;
  suggested_name_reason: string;
};

export const APP_TYPES: { id: AppTypeId; label: string; Icon: LucideIcon }[] = [
  { id: "saas", label: "SaaS Platform", Icon: LayoutDashboard },
  { id: "mobile", label: "Mobile App", Icon: Smartphone },
  { id: "microservices", label: "Microservices", Icon: Network },
  { id: "ecommerce", label: "E-commerce", Icon: ShoppingCart },
  { id: "api", label: "API Platform", Icon: Code2 },
  { id: "internal", label: "Internal Tool", Icon: Settings2 },
  { id: "data-pipeline", label: "Data Pipeline", Icon: GitBranch },
  { id: "realtime", label: "Real-time App", Icon: Zap },
];

// Derived from APP_TYPES — no duplication
export const APP_TYPE_MAP: Record<AppTypeId, { label: string; Icon: LucideIcon }> = Object.fromEntries(
  APP_TYPES.map(({ id, label, Icon }) => [id, { label, Icon }]),
) as Record<AppTypeId, { label: string; Icon: LucideIcon }>;

export const DEFAULT_NAMES: Record<AppTypeId, string> = {
  saas: "My SaaS Platform",
  mobile: "My Mobile App",
  microservices: "My Microservices",
  ecommerce: "My E-commerce Store",
  api: "My API Platform",
  internal: "My Internal Tool",
  "data-pipeline": "My Data Pipeline",
  realtime: "My Real-time App",
};
