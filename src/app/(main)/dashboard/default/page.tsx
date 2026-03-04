"use client";

import { useState } from "react";

import { Clock, Grid3X3, List, MoreVertical } from "lucide-react";

import { cn } from "@/lib/utils";

// ─── Template Types ────────────────────────────────────────────────────────────

type TemplateId = "blank" | "nextjs" | "mobile" | "microservices" | "api" | "system";

interface Template {
  id: TemplateId;
  name: string;
  description: string;
}

const TEMPLATES: Template[] = [
  { id: "blank", name: "Blank", description: "Start from scratch" },
  { id: "nextjs", name: "Next.js App", description: "Full-stack web app" },
  { id: "mobile", name: "Mobile App", description: "iOS / Android" },
  { id: "microservices", name: "Microservices", description: "Distributed services" },
  { id: "api", name: "API Design", description: "REST or GraphQL" },
  { id: "system", name: "System Design", description: "Architecture diagram" },
];

// ─── Template SVG Thumbnails ──────────────────────────────────────────────────

function BlankThumb() {
  return (
    <svg
      role="img"
      aria-label="Blank template"
      viewBox="0 0 120 90"
      xmlns="http://www.w3.org/2000/svg"
      className="h-full w-full"
    >
      <rect width="120" height="90" fill="#0a0a0a" />
      {[16, 26, 36, 46, 56, 66, 76].map((y) => (
        <line key={y} x1="10" y1={y} x2="110" y2={y} stroke="#1f1f1f" strokeWidth="0.5" />
      ))}
      <rect x="55" y="37" width="10" height="16" rx="2" fill="#3b82f6" opacity="0.7" />
      <rect x="50" y="42" width="20" height="6" rx="2" fill="#3b82f6" opacity="0.7" />
    </svg>
  );
}

function NextjsThumb() {
  return (
    <svg
      role="img"
      aria-label="Next.js App template"
      viewBox="0 0 120 90"
      xmlns="http://www.w3.org/2000/svg"
      className="h-full w-full"
    >
      <rect width="120" height="90" fill="#0a0a0a" />
      {/* Browser bar */}
      <rect x="8" y="8" width="104" height="74" rx="4" fill="#111" stroke="#1f1f1f" strokeWidth="0.8" />
      <rect x="8" y="8" width="104" height="14" rx="4" fill="#1a1a1a" />
      <rect x="8" y="17" width="104" height="5" fill="#1a1a1a" />
      <circle cx="18" cy="15" r="2.5" fill="#ef4444" opacity="0.7" />
      <circle cx="26" cy="15" r="2.5" fill="#f59e0b" opacity="0.7" />
      <circle cx="34" cy="15" r="2.5" fill="#10b981" opacity="0.7" />
      {/* URL bar */}
      <rect x="44" y="11" width="52" height="8" rx="2" fill="#222" />
      {/* Content */}
      <rect x="16" y="32" width="60" height="6" rx="1" fill="#e5e5e5" />
      <rect x="16" y="42" width="40" height="3" rx="1" fill="#555" />
      <rect x="16" y="49" width="50" height="3" rx="1" fill="#555" />
      <rect x="16" y="60" width="28" height="8" rx="2" fill="#3b82f6" />
      {/* Right panel */}
      <rect x="80" y="30" width="26" height="36" rx="3" fill="#1a1a1a" stroke="#2a2a2a" strokeWidth="0.5" />
      <rect x="84" y="36" width="18" height="3" rx="1" fill="#333" />
      <rect x="84" y="43" width="14" height="3" rx="1" fill="#333" />
      <rect x="84" y="50" width="16" height="3" rx="1" fill="#333" />
    </svg>
  );
}

function MobileThumb() {
  return (
    <svg
      role="img"
      aria-label="Mobile App template"
      viewBox="0 0 120 90"
      xmlns="http://www.w3.org/2000/svg"
      className="h-full w-full"
    >
      <rect width="120" height="90" fill="#0a0a0a" />
      {/* Phone */}
      <rect x="35" y="6" width="50" height="78" rx="8" fill="#111" stroke="#2a2a2a" strokeWidth="1" />
      <rect x="35" y="6" width="50" height="78" rx="8" fill="none" stroke="#333" strokeWidth="0.5" />
      {/* Notch */}
      <rect x="50" y="10" width="20" height="5" rx="2.5" fill="#1a1a1a" />
      {/* Screen content */}
      <rect x="40" y="20" width="40" height="6" rx="1.5" fill="#222" />
      <rect x="40" y="30" width="40" height="18" rx="3" fill="#1a1a1a" />
      <rect x="44" y="34" width="20" height="3" rx="1" fill="#3b82f6" opacity="0.8" />
      <rect x="44" y="40" width="16" height="2.5" rx="1" fill="#333" />
      <rect x="40" y="52" width="18" height="12" rx="2" fill="#1a1a1a" />
      <rect x="62" y="52" width="18" height="12" rx="2" fill="#1a1a1a" />
      <rect x="44" y="56" width="10" height="2" rx="1" fill="#555" />
      <rect x="66" y="56" width="10" height="2" rx="1" fill="#555" />
      {/* Home indicator */}
      <rect x="50" y="76" width="20" height="2.5" rx="1.5" fill="#333" />
    </svg>
  );
}

function MicroservicesThumb() {
  return (
    <svg
      role="img"
      aria-label="Microservices template"
      viewBox="0 0 120 90"
      xmlns="http://www.w3.org/2000/svg"
      className="h-full w-full"
    >
      <rect width="120" height="90" fill="#0a0a0a" />
      {/* Central gateway */}
      <rect x="44" y="36" width="32" height="18" rx="3" fill="#1a1a1a" stroke="#3b82f6" strokeWidth="1" />
      <rect x="50" y="41" width="20" height="3" rx="1" fill="#3b82f6" opacity="0.8" />
      <rect x="53" y="47" width="14" height="2" rx="1" fill="#555" />
      {/* Services */}
      <rect x="6" y="8" width="28" height="18" rx="3" fill="#1a1a1a" stroke="#2a2a2a" strokeWidth="0.8" />
      <rect x="10" y="13" width="20" height="3" rx="1" fill="#10b981" opacity="0.7" />
      <rect x="10" y="19" width="14" height="2" rx="1" fill="#333" />

      <rect x="86" y="8" width="28" height="18" rx="3" fill="#1a1a1a" stroke="#2a2a2a" strokeWidth="0.8" />
      <rect x="90" y="13" width="20" height="3" rx="1" fill="#f59e0b" opacity="0.7" />
      <rect x="90" y="19" width="14" height="2" rx="1" fill="#333" />

      <rect x="6" y="64" width="28" height="18" rx="3" fill="#1a1a1a" stroke="#2a2a2a" strokeWidth="0.8" />
      <rect x="10" y="69" width="20" height="3" rx="1" fill="#8b5cf6" opacity="0.7" />
      <rect x="10" y="75" width="14" height="2" rx="1" fill="#333" />

      <rect x="86" y="64" width="28" height="18" rx="3" fill="#1a1a1a" stroke="#2a2a2a" strokeWidth="0.8" />
      <rect x="90" y="69" width="20" height="3" rx="1" fill="#ec4899" opacity="0.7" />
      <rect x="90" y="75" width="14" height="2" rx="1" fill="#333" />
      {/* Connections */}
      <line x1="34" y1="17" x2="44" y2="42" stroke="#3b82f6" strokeWidth="0.6" opacity="0.4" strokeDasharray="2,2" />
      <line x1="86" y1="17" x2="76" y2="42" stroke="#3b82f6" strokeWidth="0.6" opacity="0.4" strokeDasharray="2,2" />
      <line x1="34" y1="73" x2="44" y2="51" stroke="#3b82f6" strokeWidth="0.6" opacity="0.4" strokeDasharray="2,2" />
      <line x1="86" y1="73" x2="76" y2="51" stroke="#3b82f6" strokeWidth="0.6" opacity="0.4" strokeDasharray="2,2" />
    </svg>
  );
}

function ApiThumb() {
  return (
    <svg
      role="img"
      aria-label="API Design template"
      viewBox="0 0 120 90"
      xmlns="http://www.w3.org/2000/svg"
      className="h-full w-full"
    >
      <rect width="120" height="90" fill="#0a0a0a" />
      {/* Endpoints */}
      {[
        { y: 12, method: "#10b981", label: "GET", path: 60 },
        { y: 27, method: "#3b82f6", label: "POST", path: 52 },
        { y: 42, method: "#f59e0b", label: "PUT", path: 56 },
        { y: 57, method: "#ef4444", label: "DEL", path: 48 },
        { y: 72, method: "#8b5cf6", label: "GET", path: 66 },
      ].map(({ y, method, path }) => (
        <g key={y}>
          <rect x="8" y={y} width="104" height="11" rx="2" fill="#111" stroke="#1f1f1f" strokeWidth="0.5" />
          <rect x="10" y={y + 2} width="20" height="7" rx="1.5" fill={method} opacity="0.85" />
          <rect x="34" y={y + 3} width={path} height="5" rx="1" fill="#222" />
        </g>
      ))}
    </svg>
  );
}

function SystemThumb() {
  return (
    <svg
      role="img"
      aria-label="System Design template"
      viewBox="0 0 120 90"
      xmlns="http://www.w3.org/2000/svg"
      className="h-full w-full"
    >
      <rect width="120" height="90" fill="#0a0a0a" />
      {/* Client */}
      <rect x="6" y="34" width="24" height="16" rx="2.5" fill="#1a1a1a" stroke="#3b82f6" strokeWidth="0.8" />
      <rect x="10" y="39" width="16" height="2.5" rx="1" fill="#3b82f6" opacity="0.7" />
      <rect x="10" y="44" width="10" height="2" rx="1" fill="#333" />
      {/* Load balancer */}
      <rect x="44" y="22" width="28" height="14" rx="2.5" fill="#1a1a1a" stroke="#f59e0b" strokeWidth="0.8" />
      <rect x="49" y="26" width="18" height="2.5" rx="1" fill="#f59e0b" opacity="0.7" />
      <rect x="52" y="31" width="12" height="2" rx="1" fill="#333" />
      {/* Services */}
      <rect x="44" y="52" width="26" height="14" rx="2.5" fill="#1a1a1a" stroke="#10b981" strokeWidth="0.8" />
      <rect x="48" y="56" width="18" height="2.5" rx="1" fill="#10b981" opacity="0.7" />
      <rect x="48" y="61" width="12" height="2" rx="1" fill="#333" />
      {/* Database */}
      <ellipse cx="99" cy="30" rx="13" ry="7" fill="#1a1a1a" stroke="#8b5cf6" strokeWidth="0.8" />
      <line x1="86" y1="30" x2="86" y2="42" stroke="#8b5cf6" strokeWidth="0.8" />
      <line x1="112" y1="30" x2="112" y2="42" stroke="#8b5cf6" strokeWidth="0.8" />
      <path d="M86,42 Q99,49 112,42" fill="none" stroke="#8b5cf6" strokeWidth="0.8" />
      {/* Cache */}
      <rect x="86" y="57" width="24" height="14" rx="2.5" fill="#1a1a1a" stroke="#ec4899" strokeWidth="0.8" />
      <rect x="90" y="61" width="16" height="2.5" rx="1" fill="#ec4899" opacity="0.7" />
      <rect x="90" y="66" width="10" height="2" rx="1" fill="#333" />
      {/* Arrows */}
      <line x1="30" y1="42" x2="44" y2="32" stroke="#555" strokeWidth="0.7" strokeDasharray="2,2" />
      <line x1="30" y1="42" x2="44" y2="59" stroke="#555" strokeWidth="0.7" strokeDasharray="2,2" />
      <line x1="72" y1="29" x2="86" y2="29" stroke="#555" strokeWidth="0.7" strokeDasharray="2,2" />
      <line x1="70" y1="59" x2="86" y2="61" stroke="#555" strokeWidth="0.7" strokeDasharray="2,2" />
    </svg>
  );
}

function TemplateThumbnail({ id }: { id: TemplateId }) {
  switch (id) {
    case "blank":
      return <BlankThumb />;
    case "nextjs":
      return <NextjsThumb />;
    case "mobile":
      return <MobileThumb />;
    case "microservices":
      return <MicroservicesThumb />;
    case "api":
      return <ApiThumb />;
    case "system":
      return <SystemThumb />;
  }
}

// ─── Template Card ─────────────────────────────────────────────────────────────

function TemplateCard({ template }: { template: Template }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      type="button"
      className="flex flex-shrink-0 cursor-pointer flex-col items-start gap-2.5 text-left outline-none"
      style={{ width: 180 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className={cn(
          "w-full overflow-hidden rounded-xl border transition-all duration-150",
          hovered ? "border-blue-500/50 shadow-blue-500/10 shadow-lg ring-1 ring-blue-500/20" : "border-border",
        )}
        style={{ aspectRatio: "4/3" }}
      >
        <TemplateThumbnail id={template.id} />
      </div>
      <div className="px-0.5">
        <p className="font-medium text-foreground text-sm leading-tight">{template.name}</p>
        <p className="mt-0.5 text-muted-foreground text-xs leading-tight">{template.description}</p>
      </div>
    </button>
  );
}

// ─── Recent Project Card ───────────────────────────────────────────────────────

type RecentProject = {
  id: string;
  name: string;
  updatedAt: string;
  templateId: TemplateId;
};

function RecentProjectCard({ project }: { project: RecentProject }) {
  return (
    <div className="group flex cursor-pointer flex-col">
      <div
        className={cn(
          "w-full overflow-hidden rounded-lg border transition-all duration-150",
          "border-border group-hover:border-blue-500/50 group-hover:shadow-blue-500/10 group-hover:shadow-md",
        )}
        style={{ aspectRatio: "4/3" }}
      >
        <TemplateThumbnail id={project.templateId} />
      </div>
      <div className="mt-2 flex items-start justify-between gap-1 px-0.5">
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground text-xs leading-tight">{project.name}</p>
          <div className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
            <Clock className="size-2.5 flex-shrink-0" />
            <span>{project.updatedAt}</span>
          </div>
        </div>
        <button
          type="button"
          className="mt-0.5 flex-shrink-0 rounded p-1 opacity-0 transition-all hover:bg-muted group-hover:opacity-100"
        >
          <MoreVertical className="size-3 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

// Swap this out for real Supabase data once projects are wired up
const RECENT_PROJECTS: RecentProject[] = [];

export default function Page() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  return (
    <div className="flex flex-col gap-12">
      {/* ── Quick start ─────────────────────────────────────────────────────── */}
      <section>
        <h2 className="mb-5 font-medium text-foreground/70 text-sm">Start a new project</h2>

        <div className="flex items-start gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {TEMPLATES.map((t) => (
            <TemplateCard key={t.id} template={t} />
          ))}
        </div>
      </section>

      {/* ── Recent projects ──────────────────────────────────────────────────── */}
      <section>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">Recent projects</h2>
          <div className="flex items-center overflow-hidden rounded-md border border-border">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-1.5 transition-colors",
                viewMode === "grid"
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
              )}
            >
              <Grid3X3 className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={cn(
                "border-border border-l p-1.5 transition-colors",
                viewMode === "list"
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
              )}
            >
              <List className="size-3.5" />
            </button>
          </div>
        </div>

        {RECENT_PROJECTS.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border border-dashed py-16 text-center">
            <p className="text-muted-foreground text-sm">No projects yet — pick a template above to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {RECENT_PROJECTS.map((p) => (
              <RecentProjectCard key={p.id} project={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
