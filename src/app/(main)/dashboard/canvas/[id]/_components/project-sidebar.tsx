"use client";

import { useState } from "react";

import { formatDistanceToNow } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  Building2,
  ChevronDown,
  Code2,
  Database,
  GitBranch,
  Info,
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

// ─── Collapsible section (Supabase-style header) ──────────────────────────────

function SidebarSection({
  icon: Icon,
  title,
  children,
  defaultOpen = true,
}: {
  icon: LucideIcon;
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
        className="flex w-full items-center gap-2 px-3 py-2.5 text-left transition-colors hover:bg-foreground/[0.04]"
      >
        <Icon className="size-3.5 flex-shrink-0 text-muted-foreground/50" />
        <span className="flex-1 font-semibold text-[10px] text-muted-foreground/70 uppercase tracking-widest">
          {title}
        </span>
        <ChevronDown
          className={cn(
            "size-3 flex-shrink-0 text-muted-foreground/40 transition-transform duration-150",
            !open && "-rotate-90",
          )}
        />
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
            <div className="pb-2">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Inline meta row — label | value (Supabase table style) ──────────────────

function MetaRow({ label, icon: Icon, value }: { label: string; icon?: LucideIcon; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 px-3 py-1.5">
      <span className="flex-shrink-0 text-[11px] text-muted-foreground/60">{label}</span>
      <div className="flex min-w-0 items-center gap-1.5 text-right">
        {Icon && <Icon className="size-3 flex-shrink-0 text-foreground/40" />}
        <span className="truncate text-[11px] text-foreground">{value}</span>
      </div>
    </div>
  );
}

// ─── Project sidebar ──────────────────────────────────────────────────────────

export function ProjectSidebar({ project, meta }: { project: Project; meta: ProjectMeta }) {
  const appType = meta.app_type ? (APP_TYPE_MAP[meta.app_type] ?? null) : null;

  return (
    <aside className="flex w-56 flex-shrink-0 flex-col overflow-y-auto overflow-x-hidden rounded-xl border border-border bg-card">
      {/* Project name header */}
      <div className="flex items-center gap-2 border-border border-b px-3 py-3">
        <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded bg-foreground/8">
          <LayoutDashboard className="size-3 text-foreground/60" />
        </div>
        <p className="truncate font-medium text-foreground text-xs">{project.name}</p>
      </div>

      {/* Nav sections */}
      <div className="flex flex-col divide-y divide-border/50 py-1">
        {/* ── Project Overview ─────────────────────────────────────────────── */}
        <SidebarSection icon={Info} title="Overview">
          {appType &&
            (() => {
              const { label, Icon } = appType;
              return <MetaRow label="Type" icon={Icon} value={label} />;
            })()}

          {meta.is_new_app !== null && (
            <MetaRow
              label="Origin"
              icon={meta.is_new_app ? Sparkles : Building2}
              value={meta.is_new_app ? "Brand new" : "Existing app"}
            />
          )}

          {project.created_at && (
            <MetaRow label="Created" value={formatDistanceToNow(new Date(project.created_at), { addSuffix: true })} />
          )}
        </SidebarSection>

        {/* ── Schema Visualizer ────────────────────────────────────────────── */}
        <SidebarSection icon={Database} title="Schema Visualizer">
          <div className="mx-3 mt-1 flex flex-col items-center gap-2 rounded-lg border border-foreground/[0.07] border-dashed p-4 text-center">
            <Database className="size-5 text-foreground/20" />
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Connect a schema to visualize your data models
            </p>
          </div>
        </SidebarSection>
      </div>
    </aside>
  );
}
