"use client";

import { useState } from "react";

import { formatDistanceToNow } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  Building2,
  ChevronRight,
  Code2,
  Database,
  GitBranch,
  LayoutDashboard,
  Network,
  Settings2,
  ShoppingCart,
  Smartphone,
  Sparkles,
  Zap,
} from "lucide-react";

import { cn } from "@/lib/utils";

// ─── App type registry ────────────────────────────────────────────────────────

const APP_TYPE_MAP: Record<string, { label: string; Icon: LucideIcon }> = {
  saas: { label: "SaaS Platform", Icon: LayoutDashboard },
  mobile: { label: "Mobile App", Icon: Smartphone },
  microservices: { label: "Microservices", Icon: Network },
  ecommerce: { label: "E-commerce", Icon: ShoppingCart },
  api: { label: "API Platform", Icon: Code2 },
  internal: { label: "Internal Tool", Icon: Settings2 },
  "data-pipeline": { label: "Data Pipeline", Icon: GitBranch },
  realtime: { label: "Real-time App", Icon: Zap },
};

// ─── Types ────────────────────────────────────────────────────────────────────

type Project = {
  name: string;
  created_at: string | null;
};

type ProjectMeta = {
  app_type: string | null;
  is_new_app: boolean | null;
};

// ─── Collapsible section ──────────────────────────────────────────────────────

function SidebarSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-1.5 px-3 py-2.5 text-left transition-colors hover:bg-foreground/[0.03]"
      >
        <ChevronRight
          className={cn(
            "size-3 flex-shrink-0 text-muted-foreground/60 transition-transform duration-150",
            open && "rotate-90",
          )}
        />
        <span className="font-medium text-[10px] text-muted-foreground uppercase tracking-widest">{title}</span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Row helper ───────────────────────────────────────────────────────────────

function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] text-muted-foreground/60 uppercase tracking-widest">{label}</span>
      <div className="flex items-center gap-1.5">{children}</div>
    </div>
  );
}

// ─── Project sidebar ──────────────────────────────────────────────────────────

export function ProjectSidebar({ project, meta }: { project: Project; meta: ProjectMeta }) {
  const appType = meta.app_type ? (APP_TYPE_MAP[meta.app_type] ?? null) : null;

  return (
    <aside className="flex w-64 flex-shrink-0 flex-col overflow-y-auto overflow-x-hidden rounded-xl border border-border bg-card/50 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center border-border border-b px-3 py-3">
        <p className="truncate font-medium text-foreground text-xs">{project.name}</p>
      </div>

      {/* Sections */}
      <div className="flex flex-col divide-y divide-border/40">
        {/* ── Project Overview ───────────────────────────────────────────────── */}
        <SidebarSection title="Project Overview">
          <div className="flex flex-col gap-3 pt-1">
            {appType &&
              (() => {
                const { label, Icon } = appType;
                return (
                  <MetaRow label="Type">
                    <Icon className="size-3.5 text-foreground/50" />
                    <span className="text-foreground text-xs">{label}</span>
                  </MetaRow>
                );
              })()}

            {meta.is_new_app !== null && (
              <MetaRow label="Origin">
                {meta.is_new_app ? (
                  <>
                    <Sparkles className="size-3.5 text-foreground/50" />
                    <span className="text-foreground text-xs">Brand new app</span>
                  </>
                ) : (
                  <>
                    <Building2 className="size-3.5 text-foreground/50" />
                    <span className="text-foreground text-xs">Existing app</span>
                  </>
                )}
              </MetaRow>
            )}

            {project.created_at && (
              <MetaRow label="Created">
                <span className="text-foreground text-xs">
                  {formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}
                </span>
              </MetaRow>
            )}
          </div>
        </SidebarSection>

        {/* ── Schema Visualizer ─────────────────────────────────────────────── */}
        <SidebarSection title="Schema Visualizer">
          <div className="flex flex-col items-center gap-2.5 rounded-lg border border-foreground/[0.06] border-dashed p-4 text-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground/[0.04]">
              <Database className="size-4 text-foreground/25" />
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Connect a schema to visualize your data models
            </p>
          </div>
        </SidebarSection>
      </div>
    </aside>
  );
}
