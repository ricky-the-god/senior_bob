"use client";

import { useCallback, useState } from "react";

import { useRouter } from "next/navigation";

import { ChevronDown, ChevronRight, Clipboard, Loader2, Lock, Network, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { generateAndSaveTasks } from "@/lib/api/tasks";
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

type TaskCardProps = {
  task: Task;
  onStatusChange: (id: string, status: TaskStatus) => void;
};

function TaskCard({ task, onStatusChange }: TaskCardProps) {
  const handleCopy = useCallback(() => {
    const prompt = task.description;

    navigator.clipboard.writeText(prompt).then(
      () => toast.success("Copied to clipboard"),
      () => toast.error("Failed to copy"),
    );
  }, [task]);

  return (
    <div className="group flex flex-col gap-2 rounded-lg border border-border bg-card/60 p-3">
      <div className="flex items-start justify-between gap-2">
        <p className="font-medium text-foreground text-sm leading-snug">{task.title}</p>
        <button
          type="button"
          onClick={handleCopy}
          title="Copy as prompt"
          className="flex-shrink-0 rounded p-0.5 text-muted-foreground opacity-0 transition-opacity hover:bg-foreground/8 hover:text-foreground group-hover:opacity-100"
        >
          <Clipboard className="size-3.5" />
        </button>
      </div>
      <p className="text-muted-foreground text-xs leading-relaxed">{task.description}</p>
      <div className="flex flex-wrap items-center gap-1.5">
        {/* Priority */}
        <span
          className={cn("rounded px-1.5 py-0.5 font-medium text-[11px] capitalize", PRIORITY_STYLES[task.priority])}
        >
          {task.priority}
        </span>

        {/* Component chip */}
        <span className="rounded bg-foreground/8 px-1.5 py-0.5 text-[11px] text-foreground/60">{task.component}</span>

        {/* Platform chip */}
        {task.platform && (
          <span className="rounded bg-indigo-500/10 px-1.5 py-0.5 text-[11px] text-indigo-400">{task.platform}</span>
        )}

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

type SprintSectionProps = {
  sprint: TaskSprint;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  isPreviousComplete: boolean;
  onGenerateTasks: () => Promise<void>;
  generating: boolean;
};

function SprintSection({
  sprint,
  onStatusChange,
  isPreviousComplete,
  onGenerateTasks,
  generating,
}: SprintSectionProps) {
  const [open, setOpen] = useState(true);
  const isStub = sprint.tasks.length === 0;
  const doneCount = sprint.tasks.filter((t) => t.status === "done").length;

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-4 py-3 text-left transition-colors hover:bg-foreground/[0.02]"
      >
        {open ? (
          <ChevronDown className="size-3.5 flex-shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="size-3.5 flex-shrink-0 text-muted-foreground" />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground text-sm">{sprint.name}</span>
            {isStub ? (
              <span className="rounded-full bg-foreground/8 px-2 py-0.5 text-[11px] text-muted-foreground/60">
                {isPreviousComplete ? "Ready" : "Locked"}
              </span>
            ) : (
              <span className="rounded-full bg-foreground/8 px-2 py-0.5 text-[11px] text-muted-foreground">
                {doneCount}/{sprint.tasks.length}
              </span>
            )}
          </div>
          <p className="mt-0.5 truncate text-muted-foreground text-xs leading-relaxed">{sprint.goal}</p>
        </div>
      </button>

      {open && isStub && (
        <div className="flex flex-col items-center gap-3 border-border border-t px-4 py-8 text-center">
          {isPreviousComplete ? (
            <>
              <p className="text-muted-foreground text-xs">The previous sprint is complete — ready to plan ahead.</p>
              <button
                type="button"
                onClick={onGenerateTasks}
                disabled={generating}
                className="flex items-center gap-2 rounded-lg border border-border bg-foreground/[0.03] px-4 py-2 text-foreground text-sm transition-colors hover:bg-foreground/8 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {generating ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Generating…</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="size-3.5" />
                    <span>Generate {sprint.name} Tasks</span>
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <Lock className="size-4 text-foreground/20" />
              <p className="text-muted-foreground text-xs">Complete the previous sprint to unlock</p>
            </>
          )}
        </div>
      )}

      {open && !isStub && (
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
  const [generatingSprintId, setGeneratingSprintId] = useState<string | null>(null);

  const handleStatusChange = useCallback(
    async (taskId: string, newStatus: TaskStatus) => {
      if (!sprints) return;
      const updated = sprints.map((s) => ({
        ...s,
        tasks: s.tasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)),
      }));
      setSprints(updated); // optimistic update
      try {
        await updateProjectMeta(projectId, { task_sprints: updated });
      } catch {
        setSprints(sprints); // revert on failure
        toast.error("Failed to update task");
      }
    },
    [sprints, projectId],
  );

  const handleGenerateSprint = useCallback(
    async (sprintId: string) => {
      if (!sprints) return;
      setGeneratingSprintId(sprintId);
      try {
        const res = await fetch("/api/tasks/generate-sprint", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sprintId,
            existingSprints: sprints,
            context: {
              app_type: projectMeta.app_type ?? undefined,
              tech_stack: projectMeta.tech_stack ?? undefined,
              wizard_description: projectMeta.wizard_description ?? undefined,
              infra: projectMeta.infra ?? undefined,
              backend: projectMeta.backend ?? undefined,
            },
          }),
        });
        if (!res.ok) throw new Error("Failed to generate sprint tasks");
        const data = (await res.json()) as { tasks: Task[] };
        const updated = sprints.map((s) => (s.id === sprintId ? { ...s, tasks: data.tasks } : s));
        setSprints(updated);
        await updateProjectMeta(projectId, { task_sprints: updated });
        toast.success("Sprint tasks generated");
      } catch {
        toast.error("Failed to generate sprint tasks");
      } finally {
        setGeneratingSprintId(null);
      }
    },
    [sprints, projectId, projectMeta],
  );

  const handleRegenerate = useCallback(async () => {
    // Regenerating from the tasks board has no access to live canvas nodes/edges.
    // Tasks are generated from project context only — open System Design for diagram-aware generation.
    toast.warning("Regenerating from project context — for diagram-aware tasks, use System Design");
    setRegenerating(true);
    try {
      const newSprints = await generateAndSaveTasks(projectId, { nodes: [], edges: [] }, projectMeta);
      setSprints(newSprints);
      toast.success("Tasks regenerated");
    } catch {
      toast.error("Failed to regenerate tasks");
    } finally {
      setRegenerating(false);
    }
  }, [projectId, projectMeta]);

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
      {sprints.map((sprint, index) => {
        const previousSprint = index > 0 ? sprints[index - 1] : null;
        const isPreviousComplete =
          index === 0 ||
          (previousSprint !== null &&
            previousSprint.tasks.length > 0 &&
            previousSprint.tasks.every((t) => t.status === "done"));

        return (
          <SprintSection
            key={sprint.id}
            sprint={sprint}
            onStatusChange={handleStatusChange}
            isPreviousComplete={isPreviousComplete}
            onGenerateTasks={() => handleGenerateSprint(sprint.id)}
            generating={generatingSprintId === sprint.id}
          />
        );
      })}
    </div>
  );
}
