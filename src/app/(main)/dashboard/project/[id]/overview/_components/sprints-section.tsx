"use client";

import { useState, useTransition } from "react";

import { Plus, Trash2 } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import type { Sprint } from "@/lib/project-types";
import { updateProjectMeta } from "@/server/projects";

type Props = {
  projectId: string;
  sprints: Sprint[];
};

const EMPTY_FORM = { name: "", completed: "", total: "" };

export function SprintsSection({ projectId, sprints: initial }: Props) {
  const [sprints, setSprints] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [, startTransition] = useTransition();

  function save(next: Sprint[]) {
    setSprints(next);
    startTransition(async () => {
      await updateProjectMeta(projectId, { sprints: next.length ? next : null });
    });
  }

  function addSprint() {
    const name = form.name.trim();
    const total = Math.max(1, parseInt(form.total, 10) || 1);
    const completed = Math.min(total, Math.max(0, parseInt(form.completed, 10) || 0));
    if (!name) return;
    const newSprint: Sprint = { id: crypto.randomUUID(), name, completed, total };
    save([...sprints, newSprint]);
    setForm(EMPTY_FORM);
    setShowForm(false);
  }

  function removeSprint(id: string) {
    save(sprints.filter((s) => s.id !== id));
  }

  return (
    <section className="space-y-3">
      <h2 className="font-medium text-muted-foreground text-xs uppercase tracking-wider">Sprints</h2>

      <div className="space-y-2.5">
        {sprints.map((sprint) => {
          const pct = sprint.total > 0 ? Math.round((sprint.completed / sprint.total) * 100) : 0;
          return (
            <div key={sprint.id} className="group flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="truncate text-foreground text-xs">{sprint.name}</span>
                  <span className="ml-2 shrink-0 text-muted-foreground text-xs">
                    {sprint.completed}/{sprint.total} · {pct}%
                  </span>
                </div>
                <Progress value={pct} className="h-1.5" />
              </div>
              <button
                type="button"
                onClick={() => removeSprint(sprint.id)}
                className="text-muted-foreground/40 opacity-0 transition-all hover:text-destructive group-hover:opacity-100"
                aria-label="Delete sprint"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {showForm ? (
        <div className="space-y-2 rounded-lg border border-border bg-card/50 p-3">
          <input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Sprint name"
            className="w-full border-border border-b bg-transparent pb-1 text-foreground text-xs outline-none focus:border-foreground/30"
          />
          <div className="flex gap-2">
            <input
              type="number"
              min={0}
              value={form.completed}
              onChange={(e) => setForm((f) => ({ ...f, completed: e.target.value }))}
              placeholder="Done"
              className="w-16 border-border border-b bg-transparent pb-1 text-foreground text-xs outline-none focus:border-foreground/30"
            />
            <span className="self-end pb-1 text-muted-foreground text-xs">/</span>
            <input
              type="number"
              min={1}
              value={form.total}
              onChange={(e) => setForm((f) => ({ ...f, total: e.target.value }))}
              placeholder="Total"
              className="w-16 border-border border-b bg-transparent pb-1 text-foreground text-xs outline-none focus:border-foreground/30"
            />
            <span className="self-end pb-1 text-muted-foreground text-xs">tasks</span>
          </div>
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={addSprint}
              className="rounded bg-foreground/8 px-2.5 py-1 text-foreground text-xs transition-colors hover:bg-foreground/12"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setForm(EMPTY_FORM);
              }}
              className="px-2 text-muted-foreground text-xs transition-colors hover:text-foreground"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 text-muted-foreground text-xs transition-colors hover:text-foreground"
        >
          <Plus className="size-3" />
          Add Sprint
        </button>
      )}
    </section>
  );
}
