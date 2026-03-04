import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

import { RecentProjectsSection } from "./_components/recent-projects-section";

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
      {/* vertical bar */}
      <rect x="57" y="30" width="6" height="30" rx="3" fill="white" />
      {/* horizontal bar */}
      <rect x="42" y="42" width="36" height="6" rx="3" fill="white" />
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
      {[
        { y: 12, method: "#10b981", path: 60 },
        { y: 27, method: "#3b82f6", path: 52 },
        { y: 42, method: "#f59e0b", path: 56 },
        { y: 57, method: "#ef4444", path: 48 },
        { y: 72, method: "#8b5cf6", path: 66 },
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
      <rect x="6" y="34" width="24" height="16" rx="2.5" fill="#1a1a1a" stroke="#3b82f6" strokeWidth="0.8" />
      <rect x="10" y="39" width="16" height="2.5" rx="1" fill="#3b82f6" opacity="0.7" />
      <rect x="10" y="44" width="10" height="2" rx="1" fill="#333" />
      <rect x="44" y="22" width="28" height="14" rx="2.5" fill="#1a1a1a" stroke="#f59e0b" strokeWidth="0.8" />
      <rect x="49" y="26" width="18" height="2.5" rx="1" fill="#f59e0b" opacity="0.7" />
      <rect x="52" y="31" width="12" height="2" rx="1" fill="#333" />
      <rect x="44" y="52" width="26" height="14" rx="2.5" fill="#1a1a1a" stroke="#10b981" strokeWidth="0.8" />
      <rect x="48" y="56" width="18" height="2.5" rx="1" fill="#10b981" opacity="0.7" />
      <rect x="48" y="61" width="12" height="2" rx="1" fill="#333" />
      <ellipse cx="99" cy="30" rx="13" ry="7" fill="#1a1a1a" stroke="#8b5cf6" strokeWidth="0.8" />
      <line x1="86" y1="30" x2="86" y2="42" stroke="#8b5cf6" strokeWidth="0.8" />
      <line x1="112" y1="30" x2="112" y2="42" stroke="#8b5cf6" strokeWidth="0.8" />
      <path d="M86,42 Q99,49 112,42" fill="none" stroke="#8b5cf6" strokeWidth="0.8" />
      <rect x="86" y="57" width="24" height="14" rx="2.5" fill="#1a1a1a" stroke="#ec4899" strokeWidth="0.8" />
      <rect x="90" y="61" width="16" height="2.5" rx="1" fill="#ec4899" opacity="0.7" />
      <rect x="90" y="66" width="10" height="2" rx="1" fill="#333" />
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
  const href =
    template.id === "blank" ? "/dashboard/create-project" : `/dashboard/create-project?template=${template.id}`;

  return (
    <Link
      href={href}
      className="flex flex-shrink-0 flex-col items-start gap-2.5 text-left outline-none"
      style={{ width: 180 }}
    >
      <div
        className={cn(
          "w-full overflow-hidden rounded-xl border transition-all duration-150",
          "border-border hover:border-blue-500/50 hover:shadow-blue-500/10 hover:shadow-lg hover:ring-1 hover:ring-blue-500/20",
        )}
        style={{ aspectRatio: "4/3" }}
      >
        <TemplateThumbnail id={template.id} />
      </div>
      <div className="px-0.5">
        <p className="font-medium text-foreground text-sm leading-tight">{template.name}</p>
        <p className="mt-0.5 text-muted-foreground text-xs leading-tight">{template.description}</p>
      </div>
    </Link>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default async function Page() {
  const supabase = await createClient();

  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, updated_at")
    .order("updated_at", { ascending: false })
    .limit(20);

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
      <RecentProjectsSection projects={projects ?? []} />
    </div>
  );
}
