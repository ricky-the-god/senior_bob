"use client";

import { useState } from "react";

import Link from "next/link";

import { formatDistanceToNow } from "date-fns";
import { Clock, Grid3X3, List, MoreVertical } from "lucide-react";

import { cn } from "@/lib/utils";

type Project = {
  id: string;
  name: string;
  updated_at: string;
};

function RecentProjectCard({ project }: { project: Project }) {
  return (
    <Link href={`/dashboard/project/${project.id}/overview`} className="group flex flex-col">
      <div
        className={cn(
          "w-full overflow-hidden rounded-lg border transition-all duration-150",
          "border-border bg-muted/30 group-hover:border-blue-500/50 group-hover:shadow-blue-500/10 group-hover:shadow-md",
        )}
        style={{ aspectRatio: "4/3" }}
      >
        {/* Placeholder canvas preview */}
        <svg
          role="img"
          aria-label={`${project.name} canvas preview`}
          viewBox="0 0 120 90"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full"
        >
          <rect width="120" height="90" fill="#0a0a0a" />
          <rect x="10" y="10" width="40" height="25" rx="3" fill="#1a1a1a" stroke="#2a2a2a" strokeWidth="0.8" />
          <rect x="14" y="16" width="22" height="3" rx="1" fill="#333" />
          <rect x="14" y="22" width="16" height="2" rx="1" fill="#252525" />
          <rect x="70" y="15" width="38" height="20" rx="3" fill="#1a1a1a" stroke="#2a2a2a" strokeWidth="0.8" />
          <rect x="74" y="21" width="20" height="3" rx="1" fill="#333" />
          <line
            x1="50"
            y1="22"
            x2="70"
            y2="24"
            stroke="#3b82f6"
            strokeWidth="0.6"
            opacity="0.4"
            strokeDasharray="2,2"
          />
          <rect x="25" y="55" width="70" height="22" rx="3" fill="#1a1a1a" stroke="#2a2a2a" strokeWidth="0.8" />
          <rect x="29" y="61" width="30" height="3" rx="1" fill="#333" />
          <rect x="29" y="67" width="20" height="2" rx="1" fill="#252525" />
        </svg>
      </div>
      <div className="mt-2 flex items-start justify-between gap-1 px-0.5">
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground text-xs leading-tight">{project.name}</p>
          <div className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
            <Clock className="size-2.5 flex-shrink-0" />
            <span>{formatDistanceToNow(new Date(project.updated_at), { addSuffix: true })}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={(e) => e.preventDefault()}
          className="mt-0.5 flex-shrink-0 rounded p-1 opacity-0 transition-all hover:bg-muted group-hover:opacity-100"
        >
          <MoreVertical className="size-3 text-muted-foreground" />
        </button>
      </div>
    </Link>
  );
}

export function RecentProjectsSection({
  projects,
  title = "Recent projects",
}: {
  projects: Project[];
  title?: string;
}) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  return (
    <section>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">{title}</h2>
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

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border border-dashed py-16 text-center">
          <p className="text-muted-foreground text-sm">No projects yet — pick a template above to get started.</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {projects.map((p) => (
            <RecentProjectCard key={p.id} project={p} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-border overflow-hidden rounded-xl border border-border">
          {projects.map((p) => (
            <Link
              key={p.id}
              href={`/dashboard/project/${p.id}/overview`}
              className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-muted/40"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground text-sm">{p.name}</p>
              </div>
              <div className="ml-4 flex flex-shrink-0 items-center gap-1 text-[11px] text-muted-foreground">
                <Clock className="size-3" />
                <span>{formatDistanceToNow(new Date(p.updated_at), { addSuffix: true })}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
