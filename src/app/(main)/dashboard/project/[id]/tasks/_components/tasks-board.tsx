"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { ChevronDown, ChevronRight, Loader2, Network, Sparkles } from "lucide-react";
import { toast } from "sonner";

import type { ProjectMeta, Task, TaskSprint, TaskStatus } from "@/lib/project-types";
import { cn } from "@/lib/utils";
import { updateProjectMeta } from "@/server/projects";

// ─── Badge helpers ─────────────────────────────────────────────────────────────

const PRIORITY_STYLES: Record<Task["priority"], string> = {
  critical: "bg-red-500/15 text-red-400",
  high: "bg-orange-500/15 text-orange-400",
  medium: "bg-amber-500/15 text-amber-400",
  low: "bg-slate-500/15 text-slate-400",
};

const SIZE_STYLES: Record<Task["size"], string> = {
  xs: "bg-violet-500/15 text-violet-400",
  s: "bg-violet-500/15 text-violet-400",
  m: "bg-violet-500/15 text-violet-400",
  l: "bg-violet-500/15 text-violet-400",
  xl: "bg-violet-500/15 text-violet-400",
};

const SIZE_LABELS: Record<Task["size"], string> = {
  xs: "XS · ~1h",
  s: "S · 2–4h",
  m: "M · 4–8h",
  l: "L · 1–2d",
  xl: "XL · 2–5d",
};

const STATUS_CYCLE: Record<TaskStatus, TaskStatus> = {
  todo: "in-progress",
  "in-progress": "done",
  done: "todo",
};

const STATUS_STYLES: Record<TaskStatus, string> = {
  todo: "bg-foreground/8 text-muted-foreground",
  "in-progress": "bg-amber-500/15 text-amber-400",
  done: "bg-emerald-500/15 text-emerald-400",
};

const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "Todo",
  "in-progress": "In Progress",
  done: "Done",
};

// ─── Task card ─────────────────────────────────────────────────────────────────

function TaskCard({ task, onStatusChange }: { task: Task; onStatusChange: (id: string, status: TaskStatus) => void }) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-card/60 p-3">
      <p className="font-medium text-foreground text-sm leading-snug">{task.title}</p>
      <p className="text-muted-foreground text-xs leading-relaxed">{task.description}</p>
      <div className="flex flex-wrap items-center gap-1.5">
        {/* Priority */}
        <span
          className={cn("rounded px-1.5 py-0.5 font-medium text-[11px] capitalize", PRIORITY_STYLES[task.priority])}
        >
          {task.priority}
        </span>

        {/* Size */}
        <span className={cn("rounded px-1.5 py-0.5 font-medium text-[11px]", SIZE_STYLES[task.size])}>
          {SIZE_LABELS[task.size]}
        </span>

        {/* Component chip */}
        <span className="rounded bg-foreground/8 px-1.5 py-0.5 text-[11px] text-foreground/60">{task.component}</span>

        <div className="flex-1" />

        {/* Status toggle */}
        <button
          type="button"
          onClick={() => onStatusChange(task.id, STATUS_CYCLE[task.status])}
          className={cn(
            "rounded px-1.5 py-0.5 font-medium text-[11px] transition-colors hover:opacity-80",
            STATUS_STYLES[task.status],
          )}
        >
          {STATUS_LABELS[task.status]}
        </button>
      </div>
    </div>
  );
}

// ─── Sprint section ────────────────────────────────────────────────────────────

function SprintSection({
  sprint,
  onStatusChange,
}: {
  sprint: TaskSprint;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
}) {
  const [open, setOpen] = useState(true);
  const doneCount = sprint.tasks.filter((t) => t.status === "done").length;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-4 py-3 text-left hover:bg-foreground/[0.02] transition-colors"
      >
        {open ? (
          <ChevronDown className="size-3.5 flex-shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="size-3.5 flex-shrink-0 text-muted-foreground" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground text-sm">{sprint.name}</span>
            <span className="rounded-full bg-foreground/8 px-2 py-0.5 text-[11px] text-muted-foreground">
              {doneCount}/{sprint.tasks.length}
            </span>
          </div>
          <p className="mt-0.5 text-muted-foreground text-xs leading-relaxed truncate">{sprint.goal}</p>
        </div>
      </button>

      {open && (
        <div className="flex flex-col gap-2 border-border border-t p-3">
          {sprint.tasks.map((task) => (
            <TaskCard key={task.id} task={task} onStatusChange={onStatusChange} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main board ────────────────────────────────────────────────────────────────

type Props = {
  projectId: string;
  taskSprints: TaskSprint[] | null;
  projectMeta: Pick<ProjectMeta, "app_type" | "tech_stack" | "wizard_description" | "infra" | "backend">;
};

export function TasksBoard({ projectId, taskSprints: initialSprints, projectMeta }: Props) {
  const router = useRouter();
  const [sprints, setSprints] = useState<TaskSprint[] | null>(initialSprints);
  const [regenerating, setRegenerating] = useState(false);

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    if (!sprints) return;

    // Optimistic update
    const updated = sprints.map((s) => ({
      ...s,
      tasks: s.tasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)),
    }));
    setSprints(updated);

    try {
      await updateProjectMeta(projectId, { task_sprints: updated });
    } catch {
      // Revert on failure
      setSprints(sprints);
      toast.error("Failed to update task");
    }
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      const res = await fetch("/api/tasks/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          diagram: { nodes: [], edges: [] },
          context: {
            app_type: projectMeta.app_type ?? undefined,
            tech_stack: projectMeta.tech_stack ?? undefined,
            wizard_description: projectMeta.wizard_description ?? undefined,
            infra: projectMeta.infra ?? undefined,
            backend: projectMeta.backend ?? undefined,
          },
        }),
      });
      if (!res.ok) throw new Error("Regeneration failed");
      const data = (await res.json()) as { sprints: TaskSprint[] };
      await updateProjectMeta(projectId, { task_sprints: data.sprints });
      setSprints(data.sprints);
      toast.success("Tasks regenerated");
    } catch {
      toast.error("Failed to regenerate tasks");
    } finally {
      setRegenerating(false);
    }
  };

  // ── Empty state ──────────────────────────────────────────────────────────
  if (!sprints || sprints.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-border bg-card">
          <Network className="size-6 text-foreground/30" />
        </div>
        <div>
          <p className="font-semibold text-foreground text-sm">No tasks yet</p>
          <p className="mt-1 max-w-xs text-muted-foreground text-xs leading-relaxed">
            Build your system design diagram first, then generate an AI-powered engineering backlog.
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push(`/dashboard/project/${projectId}/system-design`)}
          className="mt-1 flex items-center gap-2 rounded-lg border border-border bg-foreground/[0.03] px-4 py-2 text-foreground text-sm transition-colors hover:bg-foreground/8"
        >
          <Network className="size-4" />
          Go to System Design
        </button>
      </div>
    );
  }

  // ── Board ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-semibold text-foreground text-base">Engineering Backlog</h1>
          <p className="mt-0.5 text-muted-foreground text-xs">
            {sprints.reduce((acc, s) => acc + s.tasks.length, 0)} tasks across {sprints.length} sprints
          </p>
        </div>
        <button
          type="button"
          onClick={handleRegenerate}
          disabled={regenerating}
          className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-muted-foreground text-xs transition-colors hover:bg-foreground/8 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          {regenerating ? (
            <>
              <Loader2 className="size-3 animate-spin" />
              <span>Regenerating…</span>
            </>
          ) : (
            <>
              <Sparkles className="size-3" />
              <span>Regenerate</span>
            </>
          )}
        </button>
      </div>

      {/* Sprint accordions */}
      {sprints.map((sprint) => (
        <SprintSection key={sprint.id} sprint={sprint} onStatusChange={handleStatusChange} />
      ))}
    </div>
  );
}
