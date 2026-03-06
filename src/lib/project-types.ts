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

export type ProjectMeta = {
  app_type: AppTypeId | null;
  is_new_app: boolean | null;
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
